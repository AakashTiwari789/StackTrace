"use client";

import Link from "next/link";
import { useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { FaCode, FaBolt, FaChartLine, FaTrophy } from "react-icons/fa";

// Lazy-load Monaco so it doesn't block the initial page render
const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const highlightedFeatures = [
    { icon: FaCode, label: "Monaco Editor", desc: "VS Code in your browser" },
    { icon: FaBolt, label: "Real-time Verdicts", desc: "Powered by BullMQ + Judge0" },
    { icon: FaChartLine, label: "Progress Tracking", desc: "Solve stats by difficulty" },
    { icon: FaTrophy, label: "Leaderboard", desc: "Compete globally" },
];

const defaultCode = `function twoSum(nums, target) {
  const map = new Map();

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
}

// Try editing this code — the editor is live!
console.log(twoSum([2, 7, 11, 15], 9)); // [0, 1]
`;

export default function HomePage() {
    const heroRef = useRef(null);
    const [spotlight, setSpotlight] = useState({ x: 50, y: 50 });
    const [code, setCode] = useState(defaultCode);

    const handleMouseMove = useCallback((e) => {
        const rect = heroRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setSpotlight({ x, y });
    }, []);

    return (
        <main className="min-h-screen flex flex-col">

            {/* ── HERO ── */}
            <section
                ref={heroRef}
                onMouseMove={handleMouseMove}
                className="relative w-full min-h-screen flex flex-col justify-center items-center text-center px-6 py-24 overflow-hidden bg-gray-50 dark:bg-neutral-950"
            >
                {/* Mouse-tracking radial spotlight */}
                <div
                    className="pointer-events-none absolute inset-0 transition-opacity duration-300"
                    style={{
                        background: `radial-gradient(600px circle at ${spotlight.x}% ${spotlight.y}%, rgba(99,102,241,0.12) 0%, transparent 70%)`,
                    }}
                />

                {/* Subtle grid overlay */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
                    style={{
                        backgroundImage:
                            "linear-gradient(rgba(99,102,241,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.8) 1px, transparent 1px)",
                        backgroundSize: "48px 48px",
                    }}
                />

                {/* Static ambient blobs */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-400/10 dark:bg-blue-600/10 blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-violet-400/10 dark:bg-violet-600/10 blur-3xl pointer-events-none translate-x-1/2 translate-y-1/2" />

                {/* Hero content */}
                <div className="relative z-10 max-w-3xl">
                    <span className="inline-block px-3 py-1 text-xs font-semibold tracking-widest uppercase rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 mb-6">
                        Open Beta
                    </span>

                    <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6 leading-tight">
                        Practice DSA.{" "}
                        <span className="bg-gradient-to-r from-blue-500 to-violet-600 bg-clip-text text-transparent">
                            Debug Logic.
                        </span>
                        <br />
                        Master Coding.
                    </h1>

                    <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10">
                        StackTrace is a coding platform to practice data structures and algorithms, read structured editorials, run code against real test cases, and improve problem-solving skills with instant feedback.
                    </p>

                    <div className="flex flex-wrap gap-4 justify-center">
                        <Link
                            href="/problems"
                            className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 text-white font-semibold text-sm shadow-lg hover:shadow-blue-500/30 hover:scale-105 transition-all duration-200"
                        >
                            Start Solving →
                        </Link>
                        <Link
                            href="/subscribe"
                            className="px-7 py-3.5 rounded-xl border border-gray-300 dark:border-neutral-700 text-gray-800 dark:text-white font-semibold text-sm hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
                        >
                            Unlock Premium
                        </Link>
                    </div>
                </div>

                {/* Live Monaco editor card */}
                <div className="relative z-10 mt-16 w-full max-w-2xl mx-auto">
                    <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-2xl overflow-hidden text-left">

                        {/* Mac-style title bar */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 bg-neutral-900/90 backdrop-blur">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-red-500" />
                                <span className="w-3 h-3 rounded-full bg-yellow-400" />
                                <span className="w-3 h-3 rounded-full bg-green-500" />
                                <span className="ml-3 text-xs text-neutral-400 font-mono">twoSum.js — StackTrace</span>
                            </div>
                            <span className="text-xs text-neutral-500 font-mono select-none">JavaScript</span>
                        </div>

                        {/* Monaco editor — fully editable, no submit */}
                        <div className="h-64">
                            <Editor
                                height="100%"
                                defaultLanguage="javascript"
                                value={code}
                                onChange={(val) => setCode(val || "")}
                                theme="vs-dark"
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 13,
                                    lineNumbers: "on",
                                    automaticLayout: true,
                                    scrollBeyondLastLine: false,
                                    padding: { top: 12 },
                                    tabSize: 2,
                                    wordWrap: "on",
                                    renderLineHighlight: "all",
                                    scrollbar: { vertical: "hidden", horizontal: "hidden" },
                                    overviewRulerBorder: false,
                                    hideCursorInOverviewRuler: true,
                                    contextmenu: false,
                                }}
                            />
                        </div>

                        {/* Footer bar */}
                        <div className="px-4 py-2.5 border-t border-neutral-800 flex items-center justify-between">
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                Live editor — try editing the code!
                            </span>
                            <Link
                                href="/problems"
                                className="text-xs text-blue-400 hover:text-blue-300 transition font-medium"
                            >
                                Solve real problems →
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── MINI FEATURES STRIP ── */}
            <section className="w-full bg-white dark:bg-neutral-900 border-y border-gray-200 dark:border-neutral-800 px-6 py-12">
                <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {highlightedFeatures.map((f) => (
                        <div key={f.label} className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <f.icon className="text-blue-600 dark:text-blue-400 text-lg" />
                            </div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{f.label}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── SECOND CTA ── */}
            <section className="w-full bg-gray-50 dark:bg-neutral-950 px-6 py-20 text-center">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Ready to get started?</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-xl mx-auto">
                    Join hundreds of developers already sharpening their problem-solving skills on StackTrace.
                </p>
                <Link
                    href="/account/register"
                    className="inline-block px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 text-white font-semibold text-sm shadow-lg hover:shadow-blue-500/30 hover:scale-105 transition-all duration-200"
                >
                    Create Free Account
                </Link>
            </section>
        </main>
    );
}
