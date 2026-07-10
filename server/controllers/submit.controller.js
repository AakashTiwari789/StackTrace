import crypto from 'crypto';
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Submission } from "../models/submission.model.js";
import { Problem } from "../models/problem.model.js";
import { submissionQueue } from "../config/queues.js";

// ── Submit ────────────────────────────────────────────────────────────────────
// Runs code against ALL test cases (visible + hidden) and persists the result.
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
            type: 'submit',
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
        throw new ApiError(500, `Failed to submit the problem: ${error.message}`);
    }
};

// ── Run ───────────────────────────────────────────────────────────────────────
// Runs code against VISIBLE (sample) test cases only. No DB write.
export const runCode = async (req, res) => {
    const { problemId } = req.params;
    const { code, language } = req.body;

    if (!code || !language) throw new ApiError(400, "code and language are required");

    try {
        const problem = await Problem.findById(problemId)
            .select('languagesAllowed sampleTestCases');

        if (!problem) throw new ApiError(404, "Problem not found");

        if (!problem.languagesAllowed.includes(language)) {
            throw new ApiError(400, `Language "${language}" is not allowed for this problem`);
        }

        if (!problem.sampleTestCases?.length) {
            throw new ApiError(400, "This problem has no visible test cases to run against");
        }

        const runId = crypto.randomUUID();

        await submissionQueue.add('judge', {
            type: 'run',
            runId,
            code,
            language,
            problemId: problemId.toString(),
        });

        return res.status(202).json(
            new ApiResponse(202, { runId }, "Queued for run")
        );
    } catch (error) {
        console.error("Error running code", error);
        if (error instanceof ApiError) throw error;
        throw new ApiError(500, `Failed to run code: ${error.message}`);
    }
};

// ── Get my submissions ────────────────────────────────────────────────────────
// Returns the authenticated user's past submissions for a given problem.
export const getMySubmissions = async (req, res) => {
    const { problemId } = req.params;
    const { limit = 20 } = req.query;

    try {
        const submissions = await Submission.find({
            userId: req.user.userId,
            problemId,
        })
            .select('language code status verdict submissionTime createdAt')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit, 10));

        return res.status(200).json(
            new ApiResponse(200, { submissions }, 'Submissions fetched successfully')
        );
    } catch (error) {
        console.error('Error fetching submissions', error);
        throw new ApiError(500, `Failed to fetch submissions: ${error.message}`);
    }
};
