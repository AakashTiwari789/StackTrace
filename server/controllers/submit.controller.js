import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Submission } from "../models/submission.model.js";
import { Problem } from "../models/problem.model.js";
import { getTestCases, getTestCasesByProblemId } from "./problem.controller.js";
import { submissionQueue } from "../config/queues.js";

export const submitProblem = async (req, res) => {
    const { problemId } = req.params;
    const { code, language } = req.body;

    if (!code || !language) throw new ApiError(400, "code and language required");

    try {
        const submission = await Submission.create({
            userId: req.user.userId,
            problemId,
            language,
            code,
            status: 'Pending',
        });

        await submissionQueue.add('judge', {
            submissionId: submission._id.toString(),
            code,
            language,
            problemId: problemId.toString(),    
        });

        return res.status(202).json(
            new ApiResponse(202, { submissionId: submission._id }, "Queued for judging")
        );
    } catch (error) {
        console.error("Error submitting the problem", error);
        throw new ApiError(500, `Failed to submit the problem: ${error.message}`)
    }

};
