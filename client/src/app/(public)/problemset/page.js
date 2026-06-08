"use client"
import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useRef } from 'react' // 1. Import useRef
import { FaEye, FaEyeSlash } from 'react-icons/fa6';
import { MdLock, MdFilterList } from 'react-icons/md';
import { RiResetLeftFill } from 'react-icons/ri';

const ProblemSetPage = () => {
    const router = useRouter();

    const [problems, setProblems] = useState([]);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [tagFilter, setTagFilter] = useState("");
    const [diffFilter, setDiffFilter] = useState("");
    const [hideTags, setHideTags] = useState(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 2. Create a ref for the dropdown container
    const filterRef = useRef(null);

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/problem`);
                const data = await response.json();
                if (response.ok) setProblems(data.data.problems);
            } catch (error) {
                console.error("Error fetching:", error);
                setError("Failed to load problems. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchProblems();
    }, []);

    // 3. Effect to handle clicks outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterRef.current && !filterRef.current.contains(event.target)) {
                setIsFilterOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const allTags = [...new Set(problems.flatMap(p => p.tags))];

    const filteredProblems = problems.filter((problem) => {
        const matchesTag = !tagFilter || problem.tags.includes(tagFilter);
        const matchesDiff = !diffFilter || problem.difficulty === diffFilter;
        return matchesTag && matchesDiff;
    });

    if (loading) {
        return (
            <div className='w-full bg-gray-50 dark:bg-neutral-950 min-h-screen flex items-center justify-center px-4'>
                <div className="text-gray-500 dark:text-gray-400">Loading problems...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className='w-full bg-gray-50 dark:bg-neutral-950 min-h-screen flex items-center justify-center px-4'>
                <div className="text-red-500 dark:text-red-400">{error}</div>
            </div>
        )
    }

    return (
        <div className='w-full bg-gray-50 dark:bg-neutral-950 min-h-screen flex flex-col items-center px-4'>
            <div className='mt-5 w-full max-w-7xl'>

                <div className='w-full flex items-center mb-2 gap-2'>
                    <div className="relative" ref={filterRef}>
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="flex items-center gap-2 px-2 py-2 bg-white text-gray-900 dark:bg-neutral-800 dark:text-gray-100 border rounded-lg shadow-sm hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors duration-200"
                        >
                            <MdFilterList /> Filter Problems
                        </button>

                        {isFilterOpen && (
                            <div className="absolute top-12 left-0 z-10 p-2 bg-white dark:bg-neutral-800 border rounded-lg shadow-xl flex gap-2">
                                <select
                                    className="p-2 border rounded bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-700"
                                    onChange={(e) => setDiffFilter(e.target.value)} value={diffFilter} >
                                    <option value="">All Difficulties</option>
                                    <option value="Easy">Easy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                </select>

                                <select
                                    className="p-2 border rounded bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-700"
                                    onChange={(e) => setTagFilter(e.target.value)} value={tagFilter}>
                                    <option value="">All Topics</option>
                                    {allTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
                                </select>

                                <button className="px-3 py-2 text-gray-900 dark:text-gray-100 
                                bg-white dark:bg-neutral-700 dark:hover:bg-neutral-600 hover:bg-gray-100 rounded-lg shadow-sm
                                 rotate-270 transition-colors" onClick={() => {
                                        setTagFilter("");
                                        setDiffFilter("");
                                    }}>
                                    <RiResetLeftFill />
                                </button>
                            </div>
                        )}
                    </div>

                    <button className='ml-auto px-3 py-1 text-gray-900 dark:text-gray-100 
                    bg-white dark:bg-neutral-700 dark:hover:bg-neutral-600 hover:bg-gray-100 rounded-lg shadow-sm
                    transition-colors' onClick={() => setHideTags(!hideTags)}>
                        Tags: {hideTags ? <FaEye className='inline' /> : <FaEyeSlash className='inline' />}
                    </button>
                </div>



                {/* Problems List remains the same */}
                <div className="w-full overflow-hidden bg-white dark:bg-neutral-800 rounded-lg shadow">
                    <table className="w-full text-left border-collapse">
                        {/* Table Header */}
                        <thead>
                            <tr className="border-b dark:border-neutral-700 text-gray-500 dark:text-gray-400">
                                <th className="p-4 font-medium">Status</th>
                                <th className="p-4 font-medium">Title</th>
                                <th className="p-4 font-medium">Difficulty</th>
                            </tr>
                        </thead>

                        {/* Table Body */}
                        <tbody>
                            {filteredProblems.length > 0 ? (
                                filteredProblems.map((problem) => (
                                    <tr
                                        key={problem._id}
                                        onClick={() => router.push(`/problems/${problem.slug}`)} // 2. Navigate on click
                                        className="border-b dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-700/50 transition-colors cursor-pointer"
                                    >
                                        <td className="p-3 px-4">
                                            {problem.isPremium ? (
                                                <MdLock className="text-amber-300" />
                                            ) : (
                                                <div className="w-4 h-4 rounded-full border-2 border-green-500" />
                                            )}

                                        </td>
                                        <td className="p-3 px-4 text-gray-900 dark:text-gray-100">
                                            <h2 className='font-medium'>{problem.order}. {problem.title}</h2>
                                            <p>
                                                {!hideTags &&
                                                    problem.tags.map((tag) => (
                                                        <span
                                                            key={tag}
                                                            className="inline-block bg-gray-200 text-center dark:bg-neutral-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-full mr-1 mt-1"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))
                                                }
                                            </p>
                                        </td>
                                        <td className={`p-3 px-4 font-medium ${problem.difficulty === "Easy" ? "text-green-500" :
                                            problem.difficulty === "Medium" ? "text-yellow-500" : "text-red-500"
                                            }`}>
                                            {problem.difficulty}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-gray-500 dark:text-gray-400">
                                        No problems found for the selected filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div >
    )
}

export default ProblemSetPage