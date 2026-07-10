"use client";
import React, { useState, useEffect, use } from 'react';
import { Group, Panel, Separator } from "react-resizable-panels";
import Editor from "@monaco-editor/react";
import apiFetch from '@/services/api';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { io } from 'socket.io-client';
import { useTheme } from '@/components/ThemeProvider';

// ─────────────────────────────────────────────────────────────────────────────
// Top-level page
// ─────────────────────────────────────────────────────────────────────────────
const ProblemPage = ({ params }) => {
    const [problem, setProblem]           = useState(null);
    const [loading, setLoading]           = useState(true);
    const [error, setError]               = useState(null);

    // Submit state
    const [submissionResult, setSubmissionResult] = useState(null);
    const [isSubmitting, setIsSubmitting]         = useState(false);

    // Run state
    const [runResult, setRunResult]   = useState(null);
    const [isRunning, setIsRunning]   = useState(false);

    // Left panel tab
    const [leftTab, setLeftTab] = useState('description'); // 'description' | 'submissions'

    const { slug } = use(params);

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                setLoading(true);
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/problem/${slug}`,
                    { method: "GET", headers: { "Content-Type": "application/json" } }
                );
                const data = await response.json();
                if (response.ok) {
                    setProblem(data.data.problem);
                } else {
                    setError(data.message || "Failed to fetch problem");
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProblem();
    }, [slug]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <h2 className="text-xl font-semibold">Loading problem...</h2>
        </div>
    );
    if (error) return (
        <div className="min-h-screen flex items-center justify-center">
            <h2 className="text-xl text-red-500">{error}</h2>
        </div>
    );
    if (!problem) return (
        <div className="min-h-screen flex items-center justify-center">
            <h2 className="text-xl">Problem not found</h2>
        </div>
    );

    return (
        <Group direction="horizontal" className="h-screen bg-neutral-300 dark:bg-neutral-900">
            {/* Left panel — Description / Submissions tabs */}
            <Panel defaultSize={35} minSize={20} className='p-1'>
                <LeftPanel
                    problem={problem}
                    leftTab={leftTab}
                    setLeftTab={setLeftTab}
                    submissionResult={submissionResult}
                    isSubmitting={isSubmitting}
                />
            </Panel>

            <Separator className="w-1 bg-neutral-500 dark:bg-neutral-700 hover:bg-blue-500 cursor-col-resize transition-colors" />

            {/* Right panel — Editor + bottom test/run panel */}
            <Panel defaultSize={65} minSize={25} className='p-1'>
                <Group orientation="vertical" className="h-full gap-1">
                    <Panel defaultSize={65} minSize={35}>
                        <CodeEditor
                            problem={problem}
                            // Submit
                            setSubmissionResult={setSubmissionResult}
                            isSubmitting={isSubmitting}
                            setIsSubmitting={setIsSubmitting}
                            setLeftTab={setLeftTab}
                            // Run
                            setRunResult={setRunResult}
                            isRunning={isRunning}
                            setIsRunning={setIsRunning}
                        />
                    </Panel>

                    <Separator className='h-1  bg-neutral-500 dark:bg-neutral-700 hover:bg-blue-500 cursor-row-resize transition-colors' />

                    <Panel defaultSize={35} minSize={15}>
                        <TestCasePanel
                            testCases={problem.sampleTestCases}
                            runResult={runResult}
                            isRunning={isRunning}
                            isSubmitting={isSubmitting}
                        />
                    </Panel>
                </Group>
            </Panel>
        </Group>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Left panel — tabbed: Description | Submissions
// ─────────────────────────────────────────────────────────────────────────────
const LeftPanel = ({ problem, leftTab, setLeftTab, submissionResult, isSubmitting }) => {
    const TABS = ['description', 'submissions'];

    return (
        <div className='h-full flex flex-col bg-white dark:bg-neutral-800 rounded-lg shadow-md overflow-hidden'>
            {/* Tab bar */}
            <div className='flex border-b border-gray-200 dark:border-neutral-700 flex-shrink-0'>
                {TABS.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setLeftTab(tab)}
                        className={`px-5 py-3 text-sm font-medium capitalize transition-colors ${
                            leftTab === tab
                                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                        }`}
                    >
                        {tab}
                        {tab === 'submissions' && (submissionResult || isSubmitting) && (
                            <span className={`ml-2 w-2 h-2 rounded-full inline-block ${
                                isSubmitting
                                    ? 'bg-yellow-400 animate-pulse'
                                    : submissionResult?.status === 'Accepted'
                                        ? 'bg-emerald-500'
                                        : 'bg-red-500'
                            }`} />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            <div className='flex-1 overflow-y-auto p-4 text-left'>
                {leftTab === 'description' ? (
                    <DescriptionTab problem={problem} />
                ) : (
                    <SubmissionsTab submissionResult={submissionResult} isSubmitting={isSubmitting} />
                )}
            </div>
        </div>
    );
};

// ── Description tab ───────────────────────────────────────────────────────────
const DescriptionTab = ({ problem }) => (
    <>
        <h2 className='text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-200'>
            {problem.order}. {problem?.title}
        </h2>
        <span className={`px-2 py-1 text-sm font-medium rounded ${
            problem.difficulty === 'Easy'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : problem.difficulty === 'Medium'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        }`}>
            {problem.difficulty}
        </span>

        <div className='text-gray-700 dark:text-gray-300 my-4'>
            <h3 className='font-semibold'>Statement:</h3>
            <MarkdownRenderer content={problem?.statement || ""} />
        </div>
        <div className='text-gray-700 dark:text-gray-300 mb-4'>
            <h3 className='font-semibold'>Input Format:</h3>
            <MarkdownRenderer content={problem?.inputFormat || ""} />
        </div>
        <div className='text-gray-700 dark:text-gray-300 mb-4'>
            <h3 className='font-semibold'>Output Format:</h3>
            <MarkdownRenderer content={problem?.outputFormat || ""} />
        </div>
        <div className='text-gray-700 dark:text-gray-300 mb-4'>
            <h3 className='font-semibold'>Constraints:</h3>
            <MarkdownRenderer content={problem?.constraints || ""} />
        </div>
        <div className='text-gray-700 dark:text-gray-300 mb-4'>
            <h3 className='font-semibold mb-2'>Sample Test Cases:</h3>
            {problem?.sampleTestCases.map((tc, i) => (
                <div key={i} className='mb-3 p-3 bg-gray-50 dark:bg-neutral-900 rounded-lg text-sm font-mono'>
                    <p className='text-gray-500 dark:text-gray-400 text-xs mb-1'>Example {i + 1}</p>
                    <p><span className='font-semibold text-gray-700 dark:text-gray-300'>Input: </span>{tc.input}</p>
                    <p><span className='font-semibold text-gray-700 dark:text-gray-300'>Output: </span>{tc.output}</p>
                    {tc.explanation && (
                        <p className='mt-1 text-gray-500 dark:text-gray-400 text-xs not-italic font-sans'>{tc.explanation}</p>
                    )}
                </div>
            ))}
        </div>
    </>
);

// ── Submissions tab ───────────────────────────────────────────────────────────
const SubmissionsTab = ({ submissionResult, isSubmitting }) => {
    if (isSubmitting && !submissionResult) {
        return (
            <div className='flex flex-col items-center justify-center h-64 gap-4 text-gray-500 dark:text-gray-400'>
                <div className='w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin' />
                <p className='text-sm'>Judging your submission…</p>
            </div>
        );
    }

    if (!submissionResult) {
        return (
            <div className='flex flex-col items-center justify-center h-64 text-gray-400 dark:text-gray-600 gap-2'>
                <p className='text-4xl'>📋</p>
                <p className='text-sm'>Submit your code to see results here.</p>
            </div>
        );
    }

    const { status, verdict } = submissionResult;
    const accepted = status === 'Accepted';

    return (
        <div className='space-y-4'>
            {/* Status header */}
            <div className={`p-4 rounded-xl ${
                accepted
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}>
                <p className={`text-2xl font-bold ${accepted ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {accepted ? '✅' : '❌'} {status}
                </p>
                <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
                    {verdict?.passedCount} / {verdict?.totalCount} test cases passed
                </p>
            </div>

            {/* Stats */}
            <div className='flex gap-4 text-sm'>
                <div className='bg-gray-100 dark:bg-neutral-700 rounded-lg px-4 py-2'>
                    <p className='text-xs text-gray-400 dark:text-gray-500'>Runtime</p>
                    <p className='font-semibold text-gray-800 dark:text-gray-200'>
                        {verdict?.runtime ? `${(verdict.runtime * 1000).toFixed(0)} ms` : 'N/A'}
                    </p>
                </div>
                <div className='bg-gray-100 dark:bg-neutral-700 rounded-lg px-4 py-2'>
                    <p className='text-xs text-gray-400 dark:text-gray-500'>Memory</p>
                    <p className='font-semibold text-gray-800 dark:text-gray-200'>
                        {verdict?.memory ? `${(verdict.memory / 1024).toFixed(1)} MB` : 'N/A'}
                    </p>
                </div>
            </div>

            {/* Failed case */}
            {!accepted && verdict?.failedCase && (
                <div className='space-y-3'>
                    <h4 className='text-sm font-semibold text-gray-700 dark:text-gray-300'>Failed Test Case</h4>
                    {[
                        { label: 'Input', value: verdict.failedCase.input },
                        { label: 'Expected Output', value: verdict.failedCase.expectedOutput },
                        { label: 'Your Output', value: verdict.failedCase.actualOutput },
                    ].map(({ label, value }) => (
                        <div key={label}>
                            <p className='text-xs text-gray-400 dark:text-gray-500 mb-1'>{label}</p>
                            <pre className='text-xs font-mono bg-gray-100 dark:bg-neutral-900 p-3 rounded-lg whitespace-pre-wrap text-gray-800 dark:text-gray-200 overflow-x-auto'>
                                {value || '(empty)'}
                            </pre>
                        </div>
                    ))}
                </div>
            )}

            {/* Compile / runtime error */}
            {verdict?.error && (
                <div>
                    <p className='text-xs text-gray-400 dark:text-gray-500 mb-1'>Error</p>
                    <pre className='text-xs font-mono bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded-lg whitespace-pre-wrap overflow-x-auto'>
                        {verdict.error}
                    </pre>
                </div>
            )}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Code editor with Run + Submit buttons
// ─────────────────────────────────────────────────────────────────────────────
const CodeEditor = ({
    problem,
    setSubmissionResult, isSubmitting, setIsSubmitting, setLeftTab,
    setRunResult, isRunning, setIsRunning,
}) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const WS_URL = process.env.NEXT_PUBLIC_API_BASE_URL_WS || 'http://localhost:5000';

    const templates = {
        cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n\n    return 0;\n}`,
        python: `def solve():\n    pass\n\nif __name__ == "__main__":\n    solve()`,
        javascript: `function solve() {\n    \n}\nsolve();`,
        java: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n\n    }\n}`,
    };

    const [language, setLanguage] = useState("cpp");
    const [code, setCode]         = useState(templates.cpp);

    const handleLanguageChange = (e) => {
        const lang = e.target.value;
        setLanguage(lang);
        setCode(templates[lang]);
    };

    // ── Run handler ───────────────────────────────────────────────────────────
    const handleRun = async () => {
        setIsRunning(true);
        setRunResult(null);
        try {
            const resp = await apiFetch(`submit/${problem._id}/run`, {
                method: 'POST',
                body: JSON.stringify({ code, language }),
            });
            const { runId } = resp.data;

            const socket = io(WS_URL);
            socket.emit('join', `run:${runId}`);
            socket.on('runResult', (data) => {
                setRunResult(data);
                setIsRunning(false);
                socket.disconnect();
            });
        } catch (err) {
            console.error('Run error:', err);
            setIsRunning(false);
        }
    };

    // ── Submit handler ────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        setIsSubmitting(true);
        setSubmissionResult(null);
        setLeftTab('submissions'); // Auto-switch left panel
        try {
            const resp = await apiFetch(`submit/${problem._id}/submit`, {
                method: 'POST',
                body: JSON.stringify({ code, language }),
            });
            const { submissionId } = resp.data;

            const socket = io(WS_URL);
            socket.emit('join', `submission:${submissionId}`);
            socket.on('submissionResult', (data) => {
                setSubmissionResult(data);
                setIsSubmitting(false);
                socket.disconnect();
            });
        } catch (err) {
            console.error('Submit error:', err);
            setIsSubmitting(false);
        }
    };

    const busy = isRunning || isSubmitting;

    return (
        <div className="h-full flex flex-col bg-neutral-100  dark:bg-neutral-900 rounded-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-700">
                <select
                    value={language}
                    onChange={handleLanguageChange}
                    disabled={busy}
                    className="px-3 py-1 rounded bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white border border-neutral-600 outline-none text-sm disabled:opacity-50"
                >
                    <option value="cpp">C++</option>
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="java">Java</option>
                </select>

                <div className="flex gap-2">
                    {/* Run button */}
                    <button
                        onClick={handleRun}
                        disabled={busy}
                        className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                            busy
                                ? 'bg-emerald-700 text-white/60 cursor-not-allowed'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        }`}
                    >
                        {isRunning ? (
                            <span className="flex items-center gap-1.5">
                                <span className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                                Running…
                            </span>
                        ) : 'Run ▶'}
                    </button>

                    {/* Submit button */}
                    <button
                        onClick={handleSubmit}
                        disabled={busy}
                        className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                            busy
                                ? 'bg-blue-700 text-white/60 cursor-not-allowed'
                                : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-1.5">
                                <span className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                                Judging…
                            </span>
                        ) : 'Submit'}
                    </button>
                </div>
            </div>

            {/* Monaco */}
            <div className="flex-1">
                <Editor
                    height="100%"
                    language={language}
                    theme={isDark ? 'vs-dark' : 'light'}
                    value={code}
                    onChange={(val) => setCode(val || "")}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        automaticLayout: true,
                        scrollBeyondLastLine: false,
                        padding: { top: 16 },
                        tabSize: 4,
                        scrollbar: { vertical: 'auto', horizontal: 'auto' },
                    }}
                />
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Bottom panel — test cases (idle) / per-case run results (after Run)
// ─────────────────────────────────────────────────────────────────────────────
const TestCasePanel = ({ testCases, runResult, isRunning, isSubmitting }) => {
    const [activeTab, setActiveTab] = useState(0);

    // Auto-focus first case tab when run result arrives
    useEffect(() => {
        if (runResult) setActiveTab(0);
    }, [runResult]);

    const cases = runResult?.verdict?.cases ?? null;

    return (
        <div className="h-full flex flex-col bg-white dark:bg-neutral-800 rounded-lg shadow-md overflow-hidden">
            {/* Tab bar */}
            <div className="flex border-b border-neutral-200 dark:border-neutral-700 overflow-x-auto flex-shrink-0">
                {testCases.map((_, i) => {
                    const caseResult = cases?.[i];
                    return (
                        <button
                            key={i}
                            onClick={() => setActiveTab(i)}
                            className={`px-4 py-2 text-sm font-medium whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                                activeTab === i
                                    ? 'border-b-2 border-blue-500 text-blue-500'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                        >
                            Case {i + 1}
                            {caseResult && (
                                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                    caseResult.passed ? 'bg-emerald-500' : 'bg-red-500'
                                }`} />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4">
                {/* Running spinner — shown while isRunning */}
                {isRunning && (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-500 dark:text-gray-400">
                        <div className="w-7 h-7 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm">Running on sample test cases…</p>
                    </div>
                )}

                {/* Submit in-progress — show minimal message */}
                {!isRunning && isSubmitting && (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400 dark:text-gray-600">
                        <div className="w-7 h-7 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm">Judging submission…</p>
                    </div>
                )}

                {/* Idle or after Run */}
                {!isRunning && !isSubmitting && (() => {
                    const tc       = testCases[activeTab];
                    const caseRes  = cases?.[activeTab];

                    if (!caseRes) {
                        // Idle — show sample input/expected output
                        return (
                            <div className="space-y-3 text-sm">
                                <div>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Input</p>
                                    <pre className="bg-gray-50 dark:bg-neutral-900 text-gray-800 dark:text-gray-200 p-3 rounded-lg font-mono whitespace-pre-wrap">{tc?.input}</pre>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Expected Output</p>
                                    <pre className="bg-gray-50 dark:bg-neutral-900 text-gray-800 dark:text-gray-200 p-3 rounded-lg font-mono whitespace-pre-wrap">{tc?.output}</pre>
                                </div>
                            </div>
                        );
                    }

                    // After Run — show full per-case result
                    return (
                        <div className="space-y-3 text-sm">
                            {/* Pass / Fail badge */}
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                                caseRes.passed
                                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                            }`}>
                                {caseRes.passed ? '✅ Passed' : '❌ Failed'}
                                {caseRes.time > 0 && (
                                    <span className="text-gray-400 dark:text-gray-500 font-normal">
                                        · {(caseRes.time * 1000).toFixed(0)} ms
                                        {caseRes.memory > 0 && ` · ${(caseRes.memory / 1024).toFixed(1)} MB`}
                                    </span>
                                )}
                            </div>

                            {/* Input */}
                            <div>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Input</p>
                                <pre className="bg-gray-50 dark:bg-neutral-900 text-gray-800 dark:text-gray-200 p-3 rounded-lg font-mono text-xs whitespace-pre-wrap">{caseRes.input || '(empty)'}</pre>
                            </div>

                            {/* Expected output */}
                            <div>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Expected Output</p>
                                <pre className="bg-gray-50 dark:bg-neutral-900 text-gray-800 dark:text-gray-200 p-3 rounded-lg font-mono text-xs whitespace-pre-wrap">{caseRes.expectedOutput || '(empty)'}</pre>
                            </div>

                            {/* Your output */}
                            <div>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Your Output</p>
                                <pre className={`p-3 rounded-lg font-mono text-xs whitespace-pre-wrap ${
                                    caseRes.passed
                                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300'
                                        : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                                }`}>
                                    {caseRes.actualOutput || '(empty)'}
                                </pre>
                            </div>

                            {/* Stderr / Compile error */}
                            {(caseRes.stderr || caseRes.compileOutput) && (
                                <div>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Error</p>
                                    <pre className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded-lg font-mono text-xs whitespace-pre-wrap">
                                        {caseRes.compileOutput || caseRes.stderr}
                                    </pre>
                                </div>
                            )}
                        </div>
                    );
                })()}
            </div>
        </div>
    );
};

export default ProblemPage;