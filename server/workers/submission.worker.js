import dotenv from "dotenv";
dotenv.config();

import connectDB from "../config/db.js";
import { Worker } from 'bullmq';
import axios from 'axios';
import { Submission } from '../models/submission.model.js';
import { getProblemMetaData, getTestCasesByProblemId } from '../controllers/problem.controller.js';
import { pollBatchResults } from '../utils/judge0.js';

const JUDGE0_URL = process.env.JUDGE0_URL;
const JUDGE0_KEY = process.env.JUDGE0_KEY;
const LANG_MAP = { cpp: 54, python: 71, javascript: 63, java: 62 };

await connectDB();

new Worker('submissionQueue', async (job) => {
    const { submissionId, code, language, problemId } = job.data;

    // console.log(`Processing submission ${submissionId} for problem ${problemId} in language ${language}`);

    try {
        const testCases = await getTestCasesByProblemId(problemId);
        const metaData = await getProblemMetaData(problemId);

        if (!metaData.languagesAllowed.includes(language)) {
            const result = {
                submissionId,
                status: 'Compilation Error',
                verdict: {
                    passedCount: 0,
                    totalCount: testCases.length,
                    runtime: 0,
                    memory: 0,
                    error: `Language ${language} is not allowed for this problem.`,
                    failedCase: null
                }
            };

            await Submission.findByIdAndUpdate(submissionId, result);
            return result;
        }

        const language_id = LANG_MAP[language];
        if (!language_id) {
            const result = {
                submissionId,
                status: 'Compilation Error',
                verdict: {
                    passedCount: 0,
                    totalCount: testCases.length,
                    runtime: 0,
                    memory: 0,
                    error: `Language ${language} is not supported by Judge0.`,
                    failedCase: null
                }
            };

            await Submission.findByIdAndUpdate(submissionId, result);
            return result;
        }

        const cpu_time_limit = metaData.timeLimit / 1000;
        const memory_limit = metaData.memoryLimit * 1024;

        const submissions = testCases.map((tc) => ({
            source_code: code,
            language_id,
            stdin: tc.input,
            expected_output: tc.output,
            cpu_time_limit,
            memory_limit
        }));

        const headers = { 'Content-Type': 'application/json' };
        const response = await axios.post(
            `${JUDGE0_URL}/submissions/batch?base64_encoded=false`,
            { submissions },
            { headers }
        );

        // console.log(`Submitted batch for submissionId ${submissionId}. Tokens: ${response.data.map(r => r.token).join(', ')}`);

        const tokens = response.data.map((res) => res.token);
        const results = await pollBatchResults(tokens, JUDGE0_URL, JUDGE0_KEY);

        let passedCount = 0;
        let timeUsed = 0;
        let memoryUsed = 0;
        let errorMessage = null;
        let failedTestCase = null;
        let status = 'Accepted';

        results.forEach((res, index) => {
            timeUsed = Math.max(timeUsed || 0, Number(res.time) || 0);
            memoryUsed = Math.max(memoryUsed || 0, Number(res.memory) || 0);

            if (res.status.id === 3) {
                passedCount += 1;
            } else {
                status = res.status.description;
                errorMessage = res.compile_output || res.stderr || res.stdout || 'Unknown error';
                failedTestCase = {
                    input: testCases[index]?.input,
                    expectedOutput: testCases[index]?.output,
                    actualOutput: res.stdout
                };
            }
        });

        const result = {
            submissionId,
            status,
            verdict: {
                passedCount,
                totalCount: testCases.length,
                runtime: timeUsed,
                memory: memoryUsed,
                error: errorMessage,
                failedCase: failedTestCase
            }
        };

        await Submission.findByIdAndUpdate(submissionId, result);
        return result;
    } catch (error) {
        const fallback = {
            submissionId,
            status: 'Internal Error',
            verdict: {
                passedCount: 0,
                totalCount: 0,
                runtime: 0,
                memory: 0,
                error: error.message || 'Unknown worker error',
                failedCase: null
            }
        };

        await Submission.findByIdAndUpdate(submissionId, fallback);
        return fallback;
    }
}, {
    connection: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT, 10),
        password: process.env.REDIS_PASS
    }
});