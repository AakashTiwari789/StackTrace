import dotenv from "dotenv";
dotenv.config();
import connectDB from "../config/db.js";
import { Worker } from 'bullmq';
import axios from 'axios';
import { Submission } from '../models/submission.model.js';
import { getProblemMetaData, getTestCasesByProblemId } from '../controllers/problem.controller.js';
import { pollBatchResults } from '../utils/judge0.js';

// Configuration
const JUDGE0_URL = process.env.JUDGE0_URL;
const JUDGE0_KEY = process.env.JUDGE0_KEY;
const LANG_MAP = { cpp: 54, python: 71, javascript: 63, java: 62 };

// establish DB connection
await connectDB();

const worker = new Worker('submissions', async job => {
    const { submissionId, code, language, problemId } = job.data;

    try {
        // get meta data of the problem and test cases from the database using problemId
        const testCases = await getTestCasesByProblemId(problemId);

        const metaData = await getProblemMetaData(problemId);

        if (!metaData.languagesAllowed.includes(language)) {
            console.warn(`Language ${language} is not allowed for problem ${problemId}. Marking submission ${submissionId} as rejected.`);
            await Submission.findByIdAndUpdate(submissionId, { status: 'rejected' });
            return;
        }

        const language_id = LANG_MAP[language];
        if (!language_id) {
            console.warn(`Language ${language} is not supported by Judge0. Marking submission ${submissionId} as rejected.`);
            await Submission.findByIdAndUpdate(submissionId, { status: 'rejected' });
            return;
        }

        const cpu_time_limit = metaData.timeLimit / 1000; // Convert ms to seconds
        const memory_limit = metaData.memoryLimit * 1024; // Convert MB to KB

        // Prepare Batch
        const submissions = testCases.map(tc => ({
            source_code: code,
            language_id,
            stdin: tc.input,
            // expected_output: tc.output,
            cpu_time_limit,
            memory_limit
        }));

        // console.log(`Submissions`, submissions);

        // Post Batch Request
        const headers = { 'Content-Type': 'application/json' };
        // if (JUDGE0_KEY) headers['X-RapidAPI-Key'] = JUDGE0_KEY;

        // console.log("Submissions Payload:", JSON.stringify(submissions, null, 2));
        // console.log("Sending request to:", `${JUDGE0_URL}/submissions/batch`);

        const response = await axios.post(`${JUDGE0_URL}/submissions/batch?base64_encoded=false`,
            { submissions },
            { headers }
        );
        const data = response.data;

        // console.log(`Received batch response for submission ${submissionId}, tokens: ${data.map(res => res.token).join(',')}`);

        const tokens = data.map(res => res.token);

        // Poll Results
        const results = await pollBatchResults(tokens, JUDGE0_URL, JUDGE0_KEY);
        // console.log(`Final results for submission ${submissionId}:`);
        // console.log(results);

        // 4. Analyze Results
        let passedCount = 0;

        let timeUsed, memoryUsed, errorMessage, failedTestCase, status = 'Accepted';
        results.forEach((res, index) => {
            timeUsed = Math.max(timeUsed || 0, res.time);
            memoryUsed = Math.max(memoryUsed || 0, res.memory);

            if (res.status.id === 3) passedCount++;
            else {
                status = res.status.description;
                errorMessage = res.compile_output || res.stderr || res.stdout || 'Unknown error';
                failedTestCase = {
                    input: testCases[index].input,
                    expectedOutput: testCases[index].output,
                    actualOutput: res.stdout,
                }
            }
        });


        await Submission.findByIdAndUpdate(submissionId, {
            status,
            'verdict.passedCount': passedCount,
            'verdict.totalCount': testCases.length,
            'verdict.runtime': timeUsed,
            'verdict.memory': memoryUsed,
            'verdict.error': errorMessage,
            'verdict.failedCase': failedTestCase
        });
    } catch (error) {
        console.error(`Error processing submission ${submissionId}:`, error.message);
    }

}, {
    connection: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
        password: process.env.REDIS_PASS
    }
});