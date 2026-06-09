"use client";
import React, { useState, useEffect, use } from 'react';
import {
    Group,
    Panel,
    Separator,
} from "react-resizable-panels";
import Editor from "@monaco-editor/react";
import apiFetch from '@/services/api';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { io } from 'socket.io-client';

const ProblemPage = ({ params }) => {

    const [problem, setProblem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [verdict, setVerdict] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { slug } = use(params);

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/problem/${slug}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                const data = await response.json();
                // console.log("Fetched problem data:", data);
                if (response.ok) {
                    setProblem(data.data.problem);
                } else {
                    console.error("Failed to fetch problem:", data.message);
                    setError(data.message || "Failed to fetch problem");
                }
            } catch (error) {
                console.error("Error fetching problem:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProblem();
    }, [slug]);
    // console.log("Problem page for problem:", problem);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <h2 className="text-xl font-semibold">Loading problem...</h2>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <h2 className="text-xl text-red-500">{error}</h2>
            </div>
        );
    }

    if (!problem) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <h2 className="text-xl">Problem not found</h2>
            </div>
        );
    }
    return (
        <Group direction="horizontal" className="h-screen">
            <Panel defaultSize={35} minSize={20} className='p-1'>
                <ProblemDescription problem={problem} />
            </Panel>
            <Separator className="w-1 bg-neutral-700 hover:bg-blue-500 cursor-col-resize transition-colors" />
            {/* Editor + IO — nested vertical split */}
            <Panel defaultSize={40} minSize={25} className='p-1'>
                <Group orientation="vertical" className="h-full gap-1">
                    <Panel defaultSize={65} minSize={35}>
                        <CodeEditor
                            problem={problem}
                            setVerdict={setVerdict}
                            isSubmitting={isSubmitting}
                            setIsSubmitting={setIsSubmitting}
                        />
                    </Panel>

                    <Separator />

                    <Panel defaultSize={30} minSize={15}>
                        <TestCasePanel
                            testCases={problem.sampleTestCases}
                            verdict={verdict}
                            isSubmitting={isSubmitting}
                        />
                    </Panel>
                </Group>
            </Panel>
        </Group>
    )
}

const ProblemDescription = ({ problem }) => {
    return (
        <div className='p-4 bg-white dark:bg-neutral-800 rounded-lg shadow-md text-left'>
            <h2 className='text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-200'>{problem.order}.{problem?.title}</h2>
            <span className={`px-2 py-1 text-sm font-medium rounded ${problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
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
                <h3 className='font-semibold'>Sample Test Cases:</h3>
                {problem?.sampleTestCases.map((testCase, index) => (
                    <div key={index} className='mb-2'>
                        <p><strong>Input:</strong> {testCase.input}</p>
                        <p><strong>Output:</strong> {testCase.output}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

const CodeEditor = ({ problem, setVerdict, isSubmitting, setIsSubmitting }) => {
    const templates = {
        cpp: `#include <bits/stdc++.h>
    using namespace std;

    int main() {

        return 0;
    }`,

        python: `def solve():
        pass

    if __name__ == "__main__":
        solve()`,

        javascript: `function solve() {
            
    }
    solve();`,

        java: `import java.util.*;

    public class Main {
        public static void main(String[] args) {

        }
    }`,
    };

    const [language, setLanguage] = useState("cpp");
    const [code, setCode] = useState(templates.cpp);

    const handleLanguageChange = (e) => {
        const newLanguage = e.target.value;
        setLanguage(newLanguage);
        setCode(templates[newLanguage]);
    };

    const handleProblemSubmit = async () => {
        try {
            setIsSubmitting(true);
            setVerdict(null); // Clear previous results

            // 1. Send code and language to the backend
            const response = await apiFetch(`submit/${problem._id}/submit`, { // Ensure this matches your route
                method: "POST",
                body: JSON.stringify({
                    code: code,
                    language: language
                }),
            });

            // Assuming your ApiResponse looks like: { data: { submissionId: "..." } }
            const submissionId = response.data.submissionId;

            // 2. Connect to WebSocket
            const socket = io(process.env.NEXT_PUBLIC_API_BASE_URL_WS || "http://localhost:5000");

            // Join the specific submission room
            socket.emit('join', `submission:${submissionId}`);

            // 3. Listen for the backend event
            socket.on('submissionResult', (data) => {
                setVerdict(data);
                setIsSubmitting(false); // Stop loading
                socket.disconnect(); // Clean up connection
            });

        } catch (error) {
            console.error("Error submitting problem:", error);
            setIsSubmitting(false);
        }
    }

    return (
        <div className="h-full flex flex-col bg-neutral-900 rounded-lg overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-700">

                <select
                    value={language}
                    onChange={handleLanguageChange}
                    className="px-3 py-1 rounded bg-neutral-800 text-white border border-neutral-600 outline-none"
                >
                    <option value="cpp">C++</option>
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="java">Java</option>
                </select>

                <div className="flex gap-2">
                    <button
                        className="px-4 py-1 rounded bg-neutral-700 hover:bg-neutral-600"
                    >
                        Run
                    </button>

                    {isSubmitting ? (
                        <button className="px-4 py-1 rounded bg-blue-500 text-white cursor-not-allowed opacity-70" disabled>
                            Judging...
                        </button>
                    ) : (
                        <button className="px-4 py-1 rounded bg-blue-500 text-white hover:bg-blue-600" onClick={handleProblemSubmit}>
                            Submit
                        </button>
                    )}
                </div>
            </div>

            {/* Monaco */}
            <div className="flex-1">
                <Editor
                    height="100%"
                    language={language}
                    theme="vs-dark"
                    value={code}
                    onChange={(value) => setCode(value || "")}
                    options={{
                        minimap: {
                            enabled: false,
                        },
                        fontSize: 15,
                        automaticLayout: true,
                        scrollBeyondLastLine: false,
                        padding: {
                            top: 16,
                        },
                        tabSize: 4,
                        scrollbar: {
                            vertical: "auto",
                            horizontal: "auto",
                        },
                    }}
                />
            </div>
        </div>
    );
};

const TestCasePanel = ({ testCases, verdict, isSubmitting }) => {
    // We use either a number (for test case index) or the string "result"
    const [activeTab, setActiveTab] = useState(0);

    // Automatically switch to the result tab when a submission begins
    useEffect(() => {
        if (isSubmitting) {
            setActiveTab("result");
        }
    }, [isSubmitting]);

    return (
        <div className="h-full flex flex-col bg-white dark:bg-neutral-800 rounded-lg shadow-md">
            {/* Tabs Header */}
            <div className="flex border-b border-neutral-300 dark:border-neutral-700 overflow-x-auto">
                {testCases.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setActiveTab(index)}
                        className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === index
                                ? "border-b-2 border-blue-500 text-blue-500"
                                : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                            }`}
                    >
                        Case {index + 1}
                    </button>
                ))}

                {/* Submission Result Tab - visible if result exists or is processing */}
                {(verdict || isSubmitting) && (
                    <button
                        onClick={() => setActiveTab("result")}
                        className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === "result"
                                ? "border-b-2 border-green-500 text-green-500"
                                : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                            }`}
                    >
                        Submission Result
                    </button>
                )}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-auto p-4">
                {activeTab === "result" ? (
                    // RESULT VIEW
                    <div className="h-full">
                        {isSubmitting ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                <p>Evaluating your code on hidden test cases...</p>
                            </div>
                        ) : verdict ? (
                            <div className="animate-fade-in">
                                <h2 className={`text-2xl font-bold mb-4 ${verdict.status === 'Accepted' ? 'text-green-500' : 'text-red-500'}`}>
                                    {verdict.status}
                                </h2>

                                <div className="bg-neutral-100 dark:bg-neutral-900 p-4 rounded-lg space-y-2 text-sm">
                                    <p className="text-gray-700 dark:text-gray-300">
                                        <span className="font-semibold">Test Cases Passed: </span>
                                        {verdict.verdict?.passedCount} / {verdict.verdict?.totalCount}
                                    </p>

                                    {/* {verdict.verdict?.error && (
                                        <div className="mt-4">
                                            <h3 className="font-semibold text-red-400 mb-1">Error Output:</h3>
                                            <pre className="bg-red-950/20 text-red-400 p-3 rounded whitespace-pre-wrap overflow-x-auto">
                                                {verdict.verdict.error}
                                            </pre>
                                        </div>
                                    )} */}
                                </div>
                            </div>
                        ) : null}
                    </div>
                ) : (
                    // TEST CASE VIEW
                    <div>
                        <h3 className="font-semibold text-lg mb-2 text-gray-800 dark:text-gray-200">
                            Input
                        </h3>
                        <pre className="bg-neutral-100 dark:bg-neutral-900 p-3 rounded mb-4 whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                            {testCases[activeTab]?.input}
                        </pre>

                        <h3 className="font-semibold text-lg mb-2 text-gray-800 dark:text-gray-200">
                            Expected Output
                        </h3>
                        <pre className="bg-neutral-100 dark:bg-neutral-900 p-3 rounded whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                            {testCases[activeTab]?.output}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProblemPage