import axios from 'axios';

// Helper to wait
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const pollBatchResults = async (tokens, url, apiKey = null) => {
    const headers = { 'Content-Type': 'application/json' };
    if (apiKey && apiKey.trim() !== "") {
        headers['X-RapidAPI-Key'] = apiKey;
    }

    while (true) {
        const { data } = await axios.get(`${url}/submissions/batch`, {
            params: { tokens: tokens.join(','), fields: 'status,stdout,compile_output,stderr,time,memory' },
            headers
        });

        console.table(data.submissions.map((res, idx) => ({
            token: tokens[idx],
            status: res.status.description,
            stdout: res.stdout ? res.stdout.substring(0, 30) + '...' : null,
            compile_output: res.compile_output ? res.compile_output.substring(0, 30) + '...' : null,
            stderr: res.stderr ? res.stderr.substring(0, 30) + '...' : null,
            time: res.time,
            memory: res.memory
        })));

        // Check if all submissions have finished (status.id > 2)
        const allFinished = data.submissions.every(s => s.status.id > 2);

        if (allFinished) return data.submissions;

        await delay(2000); // Wait 2 second before polling again
    }
};