import dotenv from "dotenv";
dotenv.config();

import connectDB from "../config/db.js";
import { Worker } from 'bullmq';
import axios from 'axios';
import { Submission } from '../models/submission.model.js';
import { getProblemMetaData, getTestCasesByProblemId, getSampleTestCasesByProblemId } from '../controllers/problem.controller.js';
import { pollBatchResults } from '../utils/judge0.js';

const JUDGE0_URL = process.env.JUDGE0_URL;
const JUDGE0_KEY = process.env.JUDGE0_KEY;
const LANG_MAP = { cpp: 54, python: 71, javascript: 63, java: 62 };

await connectDB();

const worker = new Worker('submissionQueue', async (job) => {
    const { type, submissionId, runId, code, language, problemId } = job.data;
    const isRun = type === 'run';

    try {
        const metaData = await getProblemMetaData(problemId);

        // Run → sample (visible) test cases only
        // Submit → all test cases (sample + hidden)
        const testCases = isRun
            ? await getSampleTestCasesByProblemId(problemId)
            : await getTestCasesByProblemId(problemId);

        // ── Language validation ───────────────────────────────────────────────
        if (!metaData.languagesAllowed.includes(language)) {
            const result = {
                ...(isRun ? { runId } : { submissionId }),
                status: 'Compilation Error',
                verdict: {
                    passedCount: 0,
                    totalCount: testCases.length,
                    runtime: 0,
                    memory: 0,
                    error: `Language ${language} is not allowed for this problem.`,
                    failedCase: null,
                    cases: testCases.map(tc => ({
                        input: tc.input,
                        expectedOutput: tc.output,
                        actualOutput: '',
                        passed: false,
                        time: 0,
                        memory: 0,
                        stderr: null,
                        compileOutput: `Language ${language} is not allowed for this problem.`,
                    })),
                },
            };
            if (!isRun) await Submission.findByIdAndUpdate(submissionId, result);
            return result;
        }

        const language_id = LANG_MAP[language];
        if (!language_id) {
            const result = {
                ...(isRun ? { runId } : { submissionId }),
                status: 'Compilation Error',
                verdict: {
                    passedCount: 0,
                    totalCount: testCases.length,
                    runtime: 0,
                    memory: 0,
                    error: `Language ${language} is not supported by Judge0.`,
                    failedCase: null,
                    cases: [],
                },
            };
            if (!isRun) await Submission.findByIdAndUpdate(submissionId, result);
            return result;
        }

        // ── Build and send Judge0 batch ───────────────────────────────────────
        const cpu_time_limit = metaData.timeLimit / 1000;
        const memory_limit = metaData.memoryLimit * 1024;

        const submissions = testCases.map((tc) => ({
            source_code: code,
            language_id,
            stdin: tc.input,
            expected_output: tc.output,
            cpu_time_limit,
            memory_limit,
        }));

        const headers = { 'Content-Type': 'application/json' };
        const response = await axios.post(
            `${JUDGE0_URL}/submissions/batch?base64_encoded=false`,
            { submissions },
            { headers }
        );

        const tokens = response.data.map((res) => res.token);
        const results = await pollBatchResults(tokens, JUDGE0_URL, JUDGE0_KEY);

        // ── Aggregate results ─────────────────────────────────────────────────
        let passedCount = 0;
        let timeUsed = 0;
        let memoryUsed = 0;
        let errorMessage = null;
        let failedTestCase = null;
        let status = 'Accepted';

        // Per-case breakdown (used by the Run UI for coloured tabs)
        const cases = results.map((res, index) => {
            const passed = res.status.id === 3;

            timeUsed = Math.max(timeUsed, Number(res.time) || 0);
            memoryUsed = Math.max(memoryUsed, Number(res.memory) || 0);

            if (passed) {
                passedCount += 1;
            } else {
                // Capture the first failure for the aggregate failedCase
                if (!failedTestCase) {
                    status = res.status.description;
                    errorMessage = res.compile_output || res.stderr || res.stdout || 'Unknown error';
                    failedTestCase = {
                        input: testCases[index]?.input,
                        expectedOutput: testCases[index]?.output,
                        actualOutput: res.stdout,
                    };
                }
            }

            return {
                input: testCases[index]?.input ?? '',
                expectedOutput: testCases[index]?.output ?? '',
                actualOutput: res.stdout ?? '',
                passed,
                time: Number(res.time) || 0,
                memory: Number(res.memory) || 0,
                stderr: res.stderr ?? null,
                compileOutput: res.compile_output ?? null,
            };
        });

        const result = {
            ...(isRun ? { runId } : { submissionId }),
            status,
            verdict: {
                passedCount,
                totalCount: testCases.length,
                runtime: timeUsed,
                memory: memoryUsed,
                error: errorMessage,
                failedCase: failedTestCase,
                cases, // Per-case detail (not persisted in DB for submit)
            },
        };

        // ── Persist only for real submissions ─────────────────────────────────
        if (!isRun) {
            await Submission.findByIdAndUpdate(submissionId, {
                status: result.status,
                verdict: {
                    passedCount: result.verdict.passedCount,
                    totalCount: result.verdict.totalCount,
                    runtime: result.verdict.runtime,
                    memory: result.verdict.memory,
                    error: result.verdict.error,
                    failedCase: result.verdict.failedCase,
                    // cases[] intentionally not stored in DB
                },
            });
        }

        return result;
    } catch (error) {
        const fallback = {
            ...(isRun ? { runId } : { submissionId }),
            status: 'Internal Error',
            verdict: {
                passedCount: 0,
                totalCount: 0,
                runtime: 0,
                memory: 0,
                error: error.message || 'Unknown worker error',
                failedCase: null,
                cases: [],
            },
        };

        if (!isRun && submissionId) {
            await Submission.findByIdAndUpdate(submissionId, fallback).catch(() => {});
        }

        return fallback;
    }
}, {
    connection: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT, 10),
        password: process.env.REDIS_PASS,
    },
});

worker.on('failed', (job, err) => {
    console.error(`Job ${job.id} failed:`, err);
});

console.log("Worker initialized successfully.");