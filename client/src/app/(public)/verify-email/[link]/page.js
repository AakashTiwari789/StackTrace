"use client"
import apiFetch from '@/services/api';
import Link from 'next/link';
import React, { useState, useEffect, use } from 'react'

const EmailVerificationPage = ({ params }) => {
    const { link } = use(params);

    // console.log("Verification link param:", link);

    const [isVerified, setIsVerified] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const response = await apiFetch(`auth/verify-email/${encodeURIComponent(link)}`, {
                    method: 'GET',
                });
                // console.log("Email verification response status:", response);
                if (response.success) {
                    setIsVerified(true);
                } else {
                    setError(data.message || 'Verification failed');
                }
            } catch (error) {
                console.error('Email verification error:', error.message);
                setError('An error occurred during verification. Please try again.');
            }
        }
        verifyEmail();
    }, []);


    return (
        <div className='w-full bg-gray-50 dark:bg-neutral-950 min-h-screen flex flex-col justify-center items-center text-center px-6 py-20'>
            <h1 className='text-4xl font-bold max-w-3xl text-gray-900 dark:text-white'>EmailVerificationPage
            </h1>
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-gray-200 dark:border-neutral-800 overflow-hidden mt-6 p-8 max-w-md">
                {isVerified ? (
                    <div>
                        <h2 className="text-2xl font-bold mb-4 text-green-600 dark:text-green-400">Email Verified Successfully!</h2>
                        <p className="text-gray-700 dark:text-gray-300">Thank you for verifying your email address. You can now log in to your account.</p>
                    </div>
                ) : error ? (
                    <div>
                        <h2 className="text-2xl font-bold mb-4 text-red-600 dark:text-red-400">Verification Failed</h2>
                        <p className="text-gray-700 dark:text-gray-300">{error}</p>
                        <p>Get the new Verification Link: 
                            <Link href="/verify" className="text-blue-600 dark:text-blue-400 hover:underline ml-1">Verify Email</Link>
                        </p>
                    </div>
                ) : (
                    <div>
                        <p className="text-gray-700 dark:text-gray-300">Verifying your email, please wait...</p>
                    </div>
                )}
            </div>  
        </div>
    )
}

export default EmailVerificationPage