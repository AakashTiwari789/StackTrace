"use client"
import Link from 'next/link';
import React, { useState, useEffect } from 'react'
import { MdLock } from 'react-icons/md';

const ProblemSetPage = () => {

    const [problems, setProblems] = useState([]);
    useEffect(() => {
        const fetchProblems = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/problem`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                const data = await response.json();
                if (response.ok) {
                    setProblems(data.data.problems);
                } else {
                    console.error("Failed to fetch problems:", data.message);
                }
            } catch (error) {
                console.error("Error fetching problems:", error);
            }
        };

        fetchProblems();
    }, [])

    return (
        <div className='w-full bg-gray-50 dark:bg-neutral-950 min-h-screen flex flex-col items-center px-2'>
            <div className='mt-5 w-full max-w-7xl'>
                {problems.length === 0 ? (
                    <p className='text-gray-600 dark:text-gray-400'>No problems available.</p>
                ) : (
                    <ul className='space-y-4'>
                        {problems.map((problem) => (
                            <Link key={problem._id} href={`/problems/${problem.slug}`} className='block p-4 bg-white dark:bg-neutral-800 rounded-lg shadow hover:shadow-md transition-shadow duration-200'>
                                <li key={problem._id} className='p-1 bg-white dark:bg-neutral-800 rounded shadow'>
                                    <div className='flex justify-between'>
                                        <span className='text-lg font-semibold text-gray-800 dark:text-gray-200'>{problem.order}.{problem.title}</span>

                                        {problem.isPremium && <MdLock size={20} className='ml-2 text-yellow-500' title='Premium Problem' />}

                                        <div>
                                            <span className={`ml-4 px-2 py-1 text-sm font-medium rounded ${problem.isPublished ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {problem.acceptanceRate}%
                                            </span>

                                            <span className={`ml-4 px-2 py-1 text-sm font-medium rounded ${problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                                {problem.difficulty}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        {
                                            problem.tags.map((tag, index) => (
                                                <span key={index} className='inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2'>{tag}</span>
                                            ))
                                        }
                                    </div>
                                </li>
                            </Link>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}

export default ProblemSetPage