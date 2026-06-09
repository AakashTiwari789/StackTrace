import mongoose from "mongoose";
import { Problem } from "../models/problem.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Counter } from "../models/counter.model.js";

export const createNewProblem = async (req, res) => {
    console.log("Received request to create problem with data:", req.body);
    let { title, slug, difficulty, tags, statement, inputFormat, outputFormat, constraints, sampleTestCases, testCases, timeLimit, memoryLimit, isPublished, isPremium, languagesAllowed
    } = req.body;

    title = title?.trim();
    slug = slug?.trim();

    if (!title || !slug || !difficulty || !statement) {
        throw new ApiError(400, "Title, slug, difficulty, and statement are required");
    }

    const problemCreatingSession = await mongoose.startSession();
    try {
        const existingProblem = await Problem.findOne({ $or: [{ title }, { slug }] });
        if (existingProblem) {
            throw new ApiError(400, "A problem with the same title or slug already exists");
        }

        problemCreatingSession.startTransaction();

        const counter = await Counter.findOneAndUpdate(
            { name: "problem_order" },
            { $inc: { value: 1 } },
            {
                upsert: true,
                returnDocument: "after",
                session: problemCreatingSession
            }
        );

        if (!counter) {
            throw new ApiError(500, "Failed to generate problem order");
        }
        const problem = new Problem(
            {
                title,
                slug,
                difficulty,
                tags,
                statement,
                inputFormat,
                outputFormat,
                constraints,
                sampleTestCases,
                testCases,
                timeLimit,
                memoryLimit,
                isPublished: isPublished || false, // Default to false if not provided
                createdBy: req.user.userId,
                isPremium: isPremium || false, // Default to false if not provided
                languagesAllowed: languagesAllowed || ["cpp", "java", "python", "javascript"], // Default to all languages if not provided
                order: counter.value
            },
        );

        await problem.save({ session: problemCreatingSession });

        await problemCreatingSession.commitTransaction();

        res.status(201).json(new ApiResponse(
            201,
            { problem },
            "Problem created successfully"
        ));
    } catch (error) {
        await problemCreatingSession.abortTransaction();
        console.error("Error creating problem:", error);
        throw new ApiError(500, `Failed to create problem: ${error.message}`);
    } finally {
        problemCreatingSession.endSession();
    }
};

export const updateProblem = async (req, res) => {
    const { problemId } = req.params;
    let { title, slug, difficulty, tags, statement, inputFormat, outputFormat, constraints, sampleTestCases, testCases, timeLimit, memoryLimit, isPublished, isPremium, languagesAllowed } = req.body;

    title = title?.trim();
    slug = slug?.trim();

    if (!title || !slug || !difficulty || !statement) {
        throw new ApiError(400, "Title, slug, difficulty, and statement are required");
    }

    let problem = await Problem.findById(problemId);
    if (!problem) {
        throw new ApiError(404, "Problem not found");
    }

    const existingProblem = await Problem.findOne({
        $or: [{ title }, { slug }],
        _id: { $ne: problemId } // Exclude the current problem from the search
    });
    if (existingProblem) {
        throw new ApiError(400, "A problem with the same title or slug already exists");
    }

    try {
        problem = await Problem.findByIdAndUpdate(
            problemId,
            {
                title,
                slug,
                difficulty,
                tags,
                statement,
                inputFormat,
                outputFormat,
                constraints,
                sampleTestCases,
                testCases,
                timeLimit,
                memoryLimit,
                isPublished,
                isPremium,
                languagesAllowed
            },
            { returnDocument: "after", }
        );

        res.status(200).json(new ApiResponse(
            200,
            { problem },
            "Problem updated successfully"
        ));
    } catch (error) {
        console.error("Error updating problem:", error);
        throw new ApiError(500, `Failed to update problem: ${error.message}`);
    }
};

export const getAllProblems = async (req, res) => {
    try {
        const problems = await Problem.find().select("title slug difficulty tags isPublished order acceptanceRate isPremium createdBy");
        res.status(200).json(new ApiResponse(
            200,
            { problems },
            "Problems fetched successfully"
        ));
    } catch (error) {
        console.error("Error fetching problems:", error);
        throw new ApiError(500, `Failed to fetch problems: ${error.message}`);
    }
};

export const getProblemBySlug = async (req, res) => {
    const { slug } = req.params;

    try {
        const problem = await Problem.findOne({ slug }).select("-__v -createdAt -updatedAt -testCases");

        if (!problem) {
            throw new ApiError(404, "Problem not found");
        }

        res.status(200).json(new ApiResponse(
            200,
            { problem },
            "Problem fetched successfully"
        ));
    } catch (error) {
        console.error("Error fetching problem by slug:", error);
        throw new ApiError(500, `Failed to fetch problem: ${error.message}`);
    }
};

export const togglePublishProblem = async (req, res) => {
    const { problemId } = req.params;

    try {
        const problem = await Problem.findById(problemId).select("isPublished");
        if (!problem) {
            throw new ApiError(404, "Problem not found");
        }

        problem.isPublished = !problem.isPublished;
        await problem.save();

        res.status(200).json(new ApiResponse(
            200,
            { isPublished: problem.isPublished },
            `Problem ${problem.isPublished ? "published" : "unpublished"} successfully`
        ));
    } catch (error) {
        console.error("Error toggling publish status of problem:", error);
        throw new ApiError(500, `Failed to toggle publish status: ${error.message}`);
    }
};

export const togglePremiumProblem = async (req, res) => {
    const { problemId } = req.params;

    try {
        const problem = await Problem.findById(problemId).select("isPremium");
        if (!problem) {
            throw new ApiError(404, "Problem not found");
        }
        problem.isPremium = !problem.isPremium;
        await problem.save();

        res.status(200).json(new ApiResponse(
            200,
            { isPremium: problem.isPremium },
            `Problem ${problem.isPremium ? "marked as premium" : "marked as free"} successfully`
        ));
    } catch (error) {
        console.error("Error toggling premium status of problem:", error);
        throw new ApiError(500, `Failed to toggle premium status: ${error.message}`);
    }
}

export const getTestCases = async (req, res) => {
    const { slug } = req.params;
    try {
        const problem = await Problem.findOne({ slug }).select("_id");
        if (!problem) {
            throw new ApiError(404, "Problem not found");
        }

        const problemId = problem._id;
        const testCases = await getTestCasesByProblemId(problemId);
        res.status(200).json(new ApiResponse(
            200,
            { testCases },
            "Test cases fetched successfully"
        ));
    } catch (error) {
        console.error("Error fetching problem test cases:", error);
        throw new ApiError(500, `Failed to fetch test cases: ${error.message}`);
    }
};

export const getTestCasesByProblemId = async (problemId) => {
    try {
        const problem = await Problem.findById(problemId);
        if (!problem) {
            throw new ApiError(404, "Problem not found");
        }

        return problem.testCases;
    } catch (error) {
        console.error("Error fetching problem test cases:", error);
        throw new ApiError(500, `Failed to fetch test cases: ${error.message}`);
    }
};


export const getProblemMetaData = async (problemId) => {
    try {
        const problem = await Problem.findById(problemId).select("timeLimit memoryLimit languagesAllowed");
        if (!problem) {
            throw new ApiError(404, "Problem not found");
        }

        return {
            timeLimit: problem.timeLimit,
            memoryLimit: problem.memoryLimit,
            languagesAllowed: problem.languagesAllowed
        };
    } catch (error) {
        console.error("Error fetching problem metadata:", error);
        throw new ApiError(500, `Failed to fetch problem metadata: ${error.message}`);
    }
};