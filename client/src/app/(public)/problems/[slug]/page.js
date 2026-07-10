"use client";
import React, { useState, useEffect, useCallback, use } from 'react';
import { Group, Panel, Separator } from "react-resizable-panels";
import Editor from "@monaco-editor/react";
import apiFetch from '@/services/api';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { io } from 'socket.io-client';
import { useTheme } from '@/components/ThemeProvider';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_COLOR = {
    'Accepted': 'text-emerald-600 dark:text-emerald-400',
    'Wrong Answer': 'text-red-500 dark:text-red-400',
    'Time Limit Exceeded': 'text-yellow-600 dark:text-yellow-400',
    'Compilation Error': 'text-orange-600 dark:text-orange-400',
    'Runtime Error (SIGSEGV)': 'text-red-500 dark:text-red-400',
    'Runtime Error (SIGXFSZ)': 'text-red-500 dark:text-red-400',
    'Runtime Error (SIGFPE)': 'text-red-500 dark:text-red-400',
    'Runtime Error (SIGABRT)': 'text-red-500 dark:text-red-400',
    'Runtime Error (NZEC)': 'text-red-500 dark:text-red-400',
    'Runtime Error (Other)': 'text-red-500 dark:text-red-400',
    'Internal Error': 'text-gray-500 dark:text-gray-400',
    'Exec Format Error': 'text-red-500 dark:text-red-400',
    'Pending': 'text-blue-500 dark:text-blue-400',
};

const LANG_LABEL = { cpp: 'C++', python: 'Python', javascript: 'JavaScript', java: 'Java' };

const fmt = {
    date: (d) => new Date(d).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    }),
    runtime: (v) => v ? `${(v * 1000).toFixed(0)} ms` : 'N/A',
    memory: (v) => v ? `${(v / 1024).toFixed(1)} MB` : 'N/A',
};

// ─────────────────────────────────────────────────────────────────────────────
// Top-level page
// ─────────────────────────────────────────────────────────────────────────────
const TEMPLATES = {
    cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n\n    return 0;\n}`,
    python: `def solve():\n    pass\n\nif __name__ == "__main__":\n    solve()`,
    javascript: `function solve() {\n    \n}\nsolve();`,
    java: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n\n    }\n}`,
};

const ProblemPage = ({ params }) => {
    const [problem, setProblem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ── Editor state lifted so past submissions can "Move to Editor" ──
    const [language, setLanguage] = useState('cpp');
    const [code, setCode] = useState(TEMPLATES.cpp);

    // ── Submit / Run state ────────────────────────────────────────────
    const [submissionResult, setSubmissionResult] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [runResult, setRunResult] = useState(null);
    const [isRunning, setIsRunning] = useState(false);

    // ── Left panel tabs: 'description' | 'submissions' | 'result' ────
    const [leftTab, setLeftTab] = useState('description');

    // ── Past submissions list ─────────────────────────────────────────
    const [pastSubmissions, setPastSubmissions] = useState([]);
    const [subsLoading, setSubsLoading] = useState(false);

    const { slug } = use(params);

    // Fetch problem
    useEffect(() => {
        const fetchProblem = async () => {
            try {
                setLoading(true);
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/problem/${slug}`,
                    { method: 'GET', headers: { 'Content-Type': 'application/json' } }
                );
                const data = await response.json();
                if (response.ok) setProblem(data.data.problem);
                else setError(data.message || 'Failed to fetch problem');
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProblem();
    }, [slug]);

    // Fetch past submissions (called when tab becomes active or after a new submit)
    const fetchPastSubmissions = useCallback(async (problemId) => {
        if (!problemId) return;
        setSubsLoading(true);
        try {
            const resp = await apiFetch(`submit/${problemId}/submissions`);
            setPastSubmissions(resp.data?.submissions ?? []);
        } catch {
            setPastSubmissions([]);
        } finally {
            setSubsLoading(false);
        }
    }, []);

    // Refresh list when switching to submissions tab or after a new submit completes
    useEffect(() => {
        if (leftTab === 'submissions' && problem?._id) {
            fetchPastSubmissions(problem._id);
        }
    }, [leftTab, problem?._id, fetchPastSubmissions]);

    // After a new submission result arrives, refresh the history list too
    useEffect(() => {
        if (submissionResult && problem?._id) {
            fetchPastSubmissions(problem._id);
        }
    }, [submissionResult, problem?._id, fetchPastSubmissions]);

    // "Move to editor" callback — called from SubmissionsTab
    const loadCodeToEditor = useCallback((lang, submittedCode) => {
        setLanguage(lang);
        setCode(submittedCode);
        setLeftTab('description'); // switch back to description so editor is prominent
    }, []);

    if (loading) return (
        <div className="min-h-screen overflow-y-auto flex items-center justify-center">
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
            {/* Left panel */}
            <Panel defaultSize={35} minSize={20} className='p-1 h-screen overflow-auto'>
                <LeftPanel
                    problem={problem}
                    leftTab={leftTab}
                    setLeftTab={setLeftTab}
                    submissionResult={submissionResult}
                    isSubmitting={isSubmitting}
                    pastSubmissions={pastSubmissions}
                    subsLoading={subsLoading}
                    loadCodeToEditor={loadCodeToEditor}
                />
            </Panel>

            <Separator className="w-1 bg-neutral-500 dark:bg-neutral-700 hover:bg-blue-500 cursor-col-resize transition-colors" />

            {/* Right panel — Editor + bottom test panel */}
            <Panel defaultSize={65} minSize={25} className='p-1'>
                <Group orientation="vertical" className="h-full gap-1">
                    <Panel defaultSize={65} minSize={35}>
                        <CodeEditor
                            problem={problem}
                            language={language}
                            setLanguage={setLanguage}
                            code={code}
                            setCode={setCode}
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

                    <Separator className='h-1 bg-neutral-500 dark:bg-neutral-700 hover:bg-blue-500 cursor-row-resize transition-colors' />

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
// Left panel — tabs: Description | Submissions | Result
// ─────────────────────────────────────────────────────────────────────────────
const LeftPanel = ({
    problem, leftTab, setLeftTab,
    submissionResult, isSubmitting,
    pastSubmissions, subsLoading, loadCodeToEditor,
}) => {
    const TABS = ['description', 'submissions', 'result'];

    const tabDot = (tab) => {
        if (tab === 'result' && (submissionResult || isSubmitting)) {
            return (
                <span className={`ml-1.5 w-2 h-2 rounded-full inline-block flex-shrink-0 ${isSubmitting
                    ? 'bg-yellow-400 animate-pulse'
                    : submissionResult?.status === 'Accepted'
                        ? 'bg-emerald-500'
                        : 'bg-red-500'
                    }`} />
            );
        }
        return null;
    };

    return (
        <div className='h-full flex flex-col bg-white dark:bg-neutral-800 rounded-lg shadow-md overflow-hidden'>
            {/* Tab bar */}
            <div className='flex border-b border-gray-200 dark:border-neutral-700 flex-shrink-0 overflow-x-auto'>
                {TABS.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setLeftTab(tab)}
                        className={`px-4 py-3 text-sm font-medium capitalize transition-colors whitespace-nowrap flex items-center ${leftTab === tab
                            ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}
                    >
                        {tab}
                        {tabDot(tab)}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            <div className='flex-1 overflow-y-auto p-4 text-left'>
                {leftTab === 'description' && <DescriptionTab problem={problem} />}
                {leftTab === 'submissions' && (
                    <SubmissionsTab
                        submissions={pastSubmissions}
                        loading={subsLoading}
                        loadCodeToEditor={loadCodeToEditor}
                    />
                )}
                {leftTab === 'result' && (
                    <ResultTab submissionResult={submissionResult} isSubmitting={isSubmitting} />
                )}
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Description tab
// ─────────────────────────────────────────────────────────────────────────────
const DescriptionTab = ({ problem }) => (
    <>
        <h2 className='text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-200'>
            {problem.order}. {problem?.title}
        </h2>
        <span className={`px-2 py-1 text-sm font-medium rounded ${problem.difficulty === 'Easy'
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
            : problem.difficulty === 'Medium'
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            }`}>
            {problem.difficulty}
        </span>

        <div className='text-gray-700 dark:text-gray-300 my-4'>
            <h3 className='font-semibold'>Statement:</h3>
            <MarkdownRenderer content={problem?.statement || ''} />
        </div>
        <div className='text-gray-700 dark:text-gray-300 mb-4'>
            <h3 className='font-semibold'>Input Format:</h3>
            <MarkdownRenderer content={problem?.inputFormat || ''} />
        </div>
        <div className='text-gray-700 dark:text-gray-300 mb-4'>
            <h3 className='font-semibold'>Output Format:</h3>
            <MarkdownRenderer content={problem?.outputFormat || ''} />
        </div>
        <div className='text-gray-700 dark:text-gray-300 mb-4'>
            <h3 className='font-semibold'>Constraints:</h3>
            <MarkdownRenderer content={problem?.constraints || ''} />
        </div>
        <div className='text-gray-700 dark:text-gray-300 mb-4'>
            <h3 className='font-semibold mb-2'>Sample Test Cases:</h3>
            {problem?.sampleTestCases.map((tc, i) => (
                <div key={i} className='mb-3 p-3 bg-gray-50 dark:bg-neutral-900 rounded-lg text-sm font-mono'>
                    <p className='text-gray-500 dark:text-gray-400 text-xs mb-1'>Example {i + 1}</p>
                    <p><span className='font-semibold text-gray-700 dark:text-gray-300'>Input: </span>{tc.input}</p>
                    <p><span className='font-semibold text-gray-700 dark:text-gray-300'>Output: </span>{tc.output}</p>
                    {tc.explanation && (
                        <p className='mt-1 text-gray-500 dark:text-gray-400 text-xs font-sans'>{tc.explanation}</p>
                    )}
                </div>
            ))}
        </div>
    </>
);

// ─────────────────────────────────────────────────────────────────────────────
// Submissions tab — history list with copy / view / move-to-editor
// ─────────────────────────────────────────────────────────────────────────────
const SubmissionsTab = ({ submissions, loading, loadCodeToEditor }) => {
    const [expandedId, setExpandedId] = useState(null);
    const [copiedId, setCopiedId] = useState(null);

    const copyCode = async (id, code) => {
        try {
            await navigator.clipboard.writeText(code);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch {
            // fallback — ignore
        }
    };

    if (loading) {
        return (
            <div className='flex flex-col items-center justify-center h-48 gap-3 text-gray-400'>
                <div className='w-7 h-7 border-4 border-blue-400 border-t-transparent rounded-full animate-spin' />
                <p className='text-sm'>Loading submissions…</p>
            </div>
        );
    }

    if (!submissions.length) {
        return (
            <div className='flex flex-col items-center justify-center h-64 text-gray-400 dark:text-gray-600 gap-2'>
                <p className='text-4xl'>📭</p>
                <p className='text-sm'>No submissions yet.</p>
                <p className='text-xs text-gray-400'>Submit your code to see history here.</p>
            </div>
        );
    }

    return (
        <div className='w-full overflow-x-auto'>
            <table className='w-full text-sm border-collapse'>
                <thead>
                    <tr className='border-b border-gray-200 dark:border-neutral-700'>
                        <th className='py-2 px-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 w-8'>#</th>
                        <th className='py-2 px-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400'>Status</th>
                        <th className='py-2 px-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400'>Language</th>
                        <th className='py-2 px-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400'>Runtime</th>
                        <th className='py-2 px-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400'>Memory</th>
                        <th className='py-2 px-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400'>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {submissions.map((sub, idx) => {
                        const accepted = sub.status === 'Accepted';
                        const isOpen = expandedId === sub._id;

                        return (
                            <React.Fragment key={sub._id}>
                                {/* Row */}
                                <tr
                                    onClick={() => setExpandedId(isOpen ? null : sub._id)}
                                    className={`border-b border-gray-100 dark:border-neutral-700/50 cursor-pointer select-none transition-colors ${
                                        isOpen
                                            ? 'bg-blue-50 dark:bg-blue-900/10'
                                            : 'hover:bg-gray-50 dark:hover:bg-neutral-700/30'
                                    }`}
                                >
                                    <td className='py-3 px-2 text-xs text-gray-400 dark:text-gray-500'>{idx + 1}</td>

                                    <td className='py-3 px-3'>
                                        <span className={`font-semibold text-xs ${STATUS_COLOR[sub.status] ?? 'text-gray-500'}`}>
                                            {accepted ? 'Accepted' : sub.status}
                                        </span>
                                        {sub.verdict?.passedCount != null && (
                                            <span className='block text-xs text-gray-400 dark:text-gray-500 mt-0.5'>
                                                {sub.verdict.passedCount}/{sub.verdict.totalCount}
                                            </span>
                                        )}
                                    </td>

                                    <td className='py-3 px-3'>
                                        <span className='text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-300 font-mono'>
                                            {LANG_LABEL[sub.language] ?? sub.language}
                                        </span>
                                    </td>

                                    <td className='py-3 px-3 text-xs text-gray-600 dark:text-gray-300'>
                                        {fmt.runtime(sub.verdict?.runtime)}
                                    </td>

                                    <td className='py-3 px-3 text-xs text-gray-600 dark:text-gray-300'>
                                        {fmt.memory(sub.verdict?.memory)}
                                    </td>

                                    <td className='py-3 px-3 text-right'>
                                        <div className='flex items-center justify-end gap-1'>
                                            <span className='text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap'>
                                                {fmt.date(sub.createdAt)}
                                            </span>
                                            <svg
                                                className={`w-3 h-3 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                                                fill='none' viewBox='0 0 24 24' stroke='currentColor'
                                            >
                                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                                            </svg>
                                        </div>
                                    </td>
                                </tr>

                                {/* Expandable detail panel */}
                                {isOpen && (
                                    <tr>
                                        <td colSpan={6} className='p-0'>
                                            <div className='bg-gray-50 dark:bg-neutral-800/60 border-b border-gray-200 dark:border-neutral-700 px-4 py-4 space-y-4'>

                                                {/* Result summary */}
                                                <div className={`flex flex-wrap items-center gap-3 p-3 rounded-lg ${
                                                    accepted
                                                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
                                                        : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                                                }`}>
                                                    <span className={`text-sm font-bold ${STATUS_COLOR[sub.status] ?? 'text-gray-500'}`}>
                                                        {accepted ? '✅' : '❌'} {sub.status}
                                                    </span>
                                                    {sub.verdict?.passedCount != null && (
                                                        <span className='text-xs text-gray-500 dark:text-gray-400'>
                                                            {sub.verdict.passedCount} / {sub.verdict.totalCount} test cases passed
                                                        </span>
                                                    )}
                                                    <div className='flex gap-3 ml-auto text-xs text-gray-500 dark:text-gray-400'>
                                                        <span>⏱ {fmt.runtime(sub.verdict?.runtime)}</span>
                                                        <span>💾 {fmt.memory(sub.verdict?.memory)}</span>
                                                    </div>
                                                </div>

                                                {/* Failed test case */}
                                                {!accepted && sub.verdict?.failedCase && (
                                                    <div className='space-y-2'>
                                                        <p className='text-xs font-semibold text-red-500 dark:text-red-400'>Failed Test Case</p>
                                                        {[
                                                            { label: 'Input',           value: sub.verdict.failedCase.input },
                                                            { label: 'Expected Output', value: sub.verdict.failedCase.expectedOutput },
                                                            { label: 'Your Output',     value: sub.verdict.failedCase.actualOutput },
                                                        ].map(({ label, value }) => (
                                                            <div key={label}>
                                                                <p className='text-xs text-gray-400 dark:text-gray-500 mb-0.5'>{label}</p>
                                                                <pre className='text-xs font-mono bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-600 p-2 rounded-lg whitespace-pre-wrap overflow-x-auto text-gray-800 dark:text-gray-200'>
                                                                    {value || '(empty)'}
                                                                </pre>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Error output */}
                                                {sub.verdict?.error && (
                                                    <div>
                                                        <p className='text-xs text-gray-400 dark:text-gray-500 mb-0.5'>Error</p>
                                                        <pre className='text-xs font-mono bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 p-2 rounded-lg whitespace-pre-wrap overflow-x-auto'>
                                                            {sub.verdict.error}
                                                        </pre>
                                                    </div>
                                                )}

                                                {/* Code section */}
                                                <div>
                                                    <div className='flex items-center justify-between mb-1.5'>
                                                        <p className='text-xs font-semibold text-gray-500 dark:text-gray-400'>
                                                            Code &middot; {LANG_LABEL[sub.language] ?? sub.language}
                                                        </p>
                                                        <div className='flex items-center gap-2'>
                                                            {/* Copy button */}
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); copyCode(sub._id, sub.code); }}
                                                                title='Copy code'
                                                                className='flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-neutral-700 hover:bg-gray-200 dark:hover:bg-neutral-600 text-gray-600 dark:text-gray-300 transition-colors'
                                                            >
                                                                {copiedId === sub._id ? (
                                                                    <>
                                                                        <svg className='w-3.5 h-3.5 text-emerald-500' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M5 13l4 4L19 7' />
                                                                        </svg>
                                                                        Copied!
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <svg className='w-3.5 h-3.5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z' />
                                                                        </svg>
                                                                        Copy
                                                                    </>
                                                                )}
                                                            </button>

                                                            {/* Move to editor */}
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); loadCodeToEditor(sub.language, sub.code); }}
                                                                title='Load into editor'
                                                                className='flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700 transition-colors'
                                                            >
                                                                <svg className='w-3.5 h-3.5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' />
                                                                </svg>
                                                                Move to Editor
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Code display with macOS-style chrome */}
                                                    <div className='rounded-lg overflow-hidden border border-gray-200 dark:border-neutral-600'>
                                                        <div className='bg-neutral-800 px-3 py-1.5 flex items-center gap-1.5 border-b border-neutral-700'>
                                                            <span className='w-2.5 h-2.5 rounded-full bg-red-500/70' />
                                                            <span className='w-2.5 h-2.5 rounded-full bg-yellow-500/70' />
                                                            <span className='w-2.5 h-2.5 rounded-full bg-green-500/70' />
                                                        </div>
                                                        <pre className='text-xs font-mono bg-neutral-900 text-gray-200 p-4 overflow-x-auto max-h-56 leading-relaxed'>
                                                            {sub.code}
                                                        </pre>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Result tab — shows the latest submission result (spinner while judging)
// ─────────────────────────────────────────────────────────────────────────────
const ResultTab = ({ submissionResult, isSubmitting }) => {
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
            <div className={`p-4 rounded-xl ${accepted
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
                    <p className='font-semibold text-gray-800 dark:text-gray-200'>{fmt.runtime(verdict?.runtime)}</p>
                </div>
                <div className='bg-gray-100 dark:bg-neutral-700 rounded-lg px-4 py-2'>
                    <p className='text-xs text-gray-400 dark:text-gray-500'>Memory</p>
                    <p className='font-semibold text-gray-800 dark:text-gray-200'>{fmt.memory(verdict?.memory)}</p>
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

            {/* Error output */}
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
// Code editor — language/code state now lifted from ProblemPage
// ─────────────────────────────────────────────────────────────────────────────
const CodeEditor = ({
    problem,
    language, setLanguage, code, setCode,
    setSubmissionResult, isSubmitting, setIsSubmitting, setLeftTab,
    setRunResult, isRunning, setIsRunning,
}) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const WS_URL = process.env.NEXT_PUBLIC_API_BASE_URL_WS || 'http://localhost:5000';

    const handleLanguageChange = (e) => {
        const lang = e.target.value;
        setLanguage(lang);
        setCode(TEMPLATES[lang]);
    };

    // ── Run ───────────────────────────────────────────────────────────────────
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
            socket.once('runResult', (data) => {
                setRunResult(data);
                setIsRunning(false);
                socket.disconnect();
            });
        } catch (err) {
            console.error('Run error:', err);
            setIsRunning(false);
        }
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        setIsSubmitting(true);
        setSubmissionResult(null);
        setLeftTab('result'); // Auto-switch left panel to Result tab
        try {
            const resp = await apiFetch(`submit/${problem._id}/submit`, {
                method: 'POST',
                body: JSON.stringify({ code, language }),
            });
            const { submissionId } = resp.data;

            const socket = io(WS_URL);
            socket.emit('join', `submission:${submissionId}`);
            socket.once('submissionResult', (data) => {
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
        <div className="h-full flex flex-col bg-neutral-100 dark:bg-neutral-900 rounded-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-300 dark:border-neutral-700">
                <select
                    value={language}
                    onChange={handleLanguageChange}
                    disabled={busy}
                    className="px-3 py-1 rounded bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white border border-neutral-400 dark:border-neutral-600 outline-none text-sm disabled:opacity-50"
                >
                    <option value="cpp">C++</option>
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="java">Java</option>
                </select>

                <div className="flex gap-2">
                    <button
                        id="run-btn"
                        onClick={handleRun}
                        disabled={busy}
                        className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${busy
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

                    <button
                        id="submit-btn"
                        onClick={handleSubmit}
                        disabled={busy}
                        className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${busy
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
                    language={language === 'cpp' ? 'cpp' : language}
                    theme={isDark ? 'vs-dark' : 'light'}
                    value={code}
                    onChange={(val) => setCode(val || '')}
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
                            className={`px-4 py-2 text-sm font-medium whitespace-nowrap flex items-center gap-1.5 transition-colors ${activeTab === i
                                ? 'border-b-2 border-blue-500 text-blue-500'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                        >
                            Case {i + 1}
                            {caseResult && (
                                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${caseResult.passed ? 'bg-emerald-500' : 'bg-red-500'
                                    }`} />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4">
                {isRunning && (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-500 dark:text-gray-400">
                        <div className="w-7 h-7 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm">Running on sample test cases…</p>
                    </div>
                )}

                {!isRunning && isSubmitting && (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400 dark:text-gray-600">
                        <div className="w-7 h-7 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm">Judging submission…</p>
                    </div>
                )}

                {!isRunning && !isSubmitting && (() => {
                    const tc = testCases[activeTab];
                    const caseRes = cases?.[activeTab];

                    if (!caseRes) {
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

                    return (
                        <div className="space-y-3 text-sm">
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${caseRes.passed
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

                            <div>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Input</p>
                                <pre className="bg-gray-50 dark:bg-neutral-900 text-gray-800 dark:text-gray-200 p-3 rounded-lg font-mono text-xs whitespace-pre-wrap">{caseRes.input || '(empty)'}</pre>
                            </div>

                            <div>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Expected Output</p>
                                <pre className="bg-gray-50 dark:bg-neutral-900 text-gray-800 dark:text-gray-200 p-3 rounded-lg font-mono text-xs whitespace-pre-wrap">{caseRes.expectedOutput || '(empty)'}</pre>
                            </div>

                            <div>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Your Output</p>
                                <pre className={`p-3 rounded-lg font-mono text-xs whitespace-pre-wrap ${caseRes.passed
                                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300'
                                    : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                                    }`}>
                                    {caseRes.actualOutput || '(empty)'}
                                </pre>
                            </div>

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