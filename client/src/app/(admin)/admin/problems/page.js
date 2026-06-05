"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MdEdit, MdLock, MdLockOpen, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { useAuth } from '@/context/AuthContext';
import apiFetch from '@/services/api';

const AdminProblemsPage = () => {
    const { user, isAuthenticated } = useAuth();
    const [userId, setUserId] = useState(null);
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const handleTogglePremium = async (problem) => {
        try {
            const response = await apiFetch(`problem/${problem._id}/toggle-premium`, {
                method: 'PATCH',
            });
            const isPremium = response.data.isPremium;
            setProblems((prevProblems) =>
                prevProblems.map((p) =>
                    p.slug === problem.slug ? { ...p, isPremium: isPremium } : p
                )
            );
        } catch (toggleError) {
            console.error('Error toggling premium status:', toggleError);
            alert('Failed to toggle premium status. Please try again.');
        }
    }

    const handleTogglePublish = async (problem) => {
        try {
            const response = await apiFetch(`problem/${problem._id}/toggle-publish`, {
                method: 'PATCH',
            });
            const isPublished = response.data.isPublished;
            setProblems((prevProblems) =>
                prevProblems.map((p) =>
                    p.slug === problem.slug ? { ...p, isPublished: isPublished } : p
                )
            );
        } catch (toggleError) {
            console.error('Error toggling publish status:', toggleError);
            alert('Failed to toggle publish status. Please try again.');
        }
    }

    useEffect(() => {
        setUserId(user?.id || null);
    }, [user]);

    useEffect(() => {
        // console.log("AdminProblemsPage: isAuthenticated =", isAuthenticated, "userId =", userId);
        const fetchProblems = async () => {
            try {
                setLoading(true);
                const data = await apiFetch('problem', {
                    method: 'GET',
                });
                setProblems(data.data.problems || []);
            } catch (fetchError) {
                console.error('Error fetching problems:', fetchError);
                setError('Failed to load problems. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchProblems();
    }, [isAuthenticated]);

    if (loading) {
        return (
            <div className='w-full bg-gray-50 dark:bg-neutral-950 min-h-screen flex flex-col items-center text-center px-6'>
                <h1 className='text-4xl font-bold max-w-3xl text-gray-900 dark:text-white'>Loading...</h1>
            </div>
        );
    }

    if (error) {
        return (
            <div className='w-full bg-gray-50 dark:bg-neutral-950 min-h-screen flex flex-col items-center px-6'>
                <h1 className='text-4xl font-bold max-w-3xl text-gray-900 dark:text-white'>{error}</h1>
            </div>
        );
    }

    return (
        <div className='w-full bg-gray-50 dark:bg-neutral-950 min-h-screen flex flex-col items-center px-6'>
            <div className='flex justify-between items-center w-full max-w-7xl mt-8'>
                <div className='text-4xl font-bold max-w-3xl text-gray-900 dark:text-white'>Problem List</div>
                <div>
                    <Link href='/admin/problems/create' className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200'>
                        Create Problem
                    </Link>
                </div>
            </div>

            {problems.length === 0 ? (
                <p className='text-gray-700 dark:text-gray-300 mt-4'>No problems found.</p>
            ) : (
                <ul className='space-y-4 mt-6 w-full max-w-7xl'>
                    {problems.map((problem) => (
                        <li key={problem._id} className='p-1'>
                            <div className='p-4 bg-white dark:bg-neutral-800 rounded-lg shadow hover:shadow-md transition-shadow duration-200'>
                                <div className='flex justify-between items-start'>
                                    <div className='flex-1'>
                                        <div className='flex items-start justify-between'>
                                            <Link href={`/problems/${problem.slug}`} className='text-lg font-semibold text-gray-800 dark:text-gray-200'>
                                                {problem.order}.{problem.title}
                                            </Link>

                                            <div className='flex items-center'>
                                                <div className='flex gap-2'>
                                                    {
                                                        userId &&
                                                        problem.createdBy &&
                                                        String(problem.createdBy) === String(userId) && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleTogglePublish(problem)}
                                                                    className={`ml-4 relative flex h-8 w-16 items-center rounded-full transition-colors duration-300 ${problem.isPublished
                                                                        ? "bg-green-500"
                                                                        : "bg-red-500"
                                                                        }`}
                                                                >
                                                                    <span
                                                                        className={`absolute flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md transition-transform duration-300 ${problem.isPublished
                                                                            ? "translate-x-9"
                                                                            : "translate-x-1"
                                                                            }`}
                                                                    >
                                                                        {problem.isPublished ? (
                                                                            <MdVisibility className="text-green-600 text-lg" />
                                                                        ) : (
                                                                            <MdVisibilityOff className="text-red-600 text-lg" />
                                                                        )}
                                                                    </span>
                                                                </button>
                                                                <button
                                                                    onClick={() => handleTogglePremium(problem)}
                                                                    className={`ml-4 relative flex h-8 w-16 items-center rounded-full transition-colors duration-300 ${problem.isPremium ? "bg-yellow-500" : "bg-gray-400"
                                                                        }`}
                                                                >
                                                                    <span
                                                                        className={`absolute flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md transition-transform duration-300 ${problem.isPremium ? "translate-x-9" : "translate-x-1"
                                                                            }`}
                                                                    >
                                                                        {problem.isPremium ? (
                                                                            <MdLock className="text-yellow-600" />
                                                                        ) : (
                                                                            <MdLockOpen className="text-gray-600" />
                                                                        )}
                                                                    </span>
                                                                </button>
                                                            </>
                                                        )
                                                    }
                                                </div>

                                                <span className={`ml-4 px-2 py-1 text-sm font-medium rounded ${problem.isPublished ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {problem.acceptanceRate}%
                                                </span>

                                                <span className={`ml-4 px-2 py-1 text-sm font-medium rounded ${problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                                    {problem.difficulty}
                                                </span>
                                            </div>
                                        </div>

                                        <div className='mt-2'>
                                            {(problem.tags || []).map((tag, index) => (
                                                <span key={index} className='inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2'>
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className='ml-4 flex flex-col items-end'>
                                        {userId && problem.createdBy && String(problem.createdBy) === String(userId) && (
                                            <Link href={`/admin/problems/edit/${problem.slug}`} className='text-sm text-blue-600 hover:underline'>
                                                <MdEdit size={20} className='inline-block mr-1' />
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AdminProblemsPage;