import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Submission } from "../models/submission.model.js";
import { Problem } from "../models/problem.model.js";
import { getTestCases } from "./problem.controller.js";

export const submitProblem = async(req, res)=>{

    const {problemId} = req.params;
    const { code, language } = req.body;

    try {
        const testcases = await getTestCases(problemId);
        // console.log("Test cases retrieved successfully", testcases);

        // Here you would typically run the code against the test cases and determine if it passed or failed.

        const result = await runCodeAgainstTestCases(code, testcases);

        const submission = await Submission.create({
            userId: req.user.userId,
            problemId,
            language,
            code,
            status: result.status,
            verdict: result.verdict,
            submissionTime: new Date(),
        });

        if(!submission) {
            throw new ApiError(500, "Failed to create submission");
        }

        return res.status(201).json(new ApiResponse(true, "Problem submitted successfully", submission));
    } catch (error) {
        console.error("Error submitting the problem", error);
        throw new ApiError(500, `Failed to submit the problem: ${error.message}`)
    }

};

export const runCodeAgainstTestCases = async (code, testcases) => {
    // sending a sample response for now, you would replace this with actual logic to run the code against the test cases
    return {
        status: "accepted",
        verdict: "All test cases passed"
    };
};