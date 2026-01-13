"use client"
import { useAuth } from '@/context/AuthContext';
import apiFetch from '@/services/api';
import React, { useState } from 'react'

const VerifyPage = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("otp");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [linkSent, setLinkSent] = useState(false);
    const [timer, setTimer] = useState(null);

    // console.log('VerifyPage - logged in user:', user);

    const countdown = (seconds) => {
        setTimer(seconds);
        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return null;
                }
                return prev - 1;
            });
        }, 1000);
    }

    const handleSubmit = async (e) => {
        // e.preventDefault();
        // Handle form submission logic here
        setLoading(true);
        try {
            if (activeTab === "otp") {
                // Logic for OTP verification
            } else {
                // console.log('Sending verification link to user email:', user.email);
                const data = await apiFetch('auth/send-verification-link', {
                    method: 'POST',
                });
                // console.log('Verification link sent:', data);
                setLinkSent(true);
                setLoading(false);
                countdown(60);
                // Show success message to user
            }
        } catch (error) {
            console.error('Verification error:', error);
            setError('An error occurred during verification. Please try again.');
        }

    }

    return (
        <div className='w-full bg-gray-50 dark:bg-neutral-950 min-h-screen flex flex-col justify-center items-center text-center px-6 py-20'>
            <h1 className='text-4xl font-bold max-w-3xl text-gray-900 dark:text-white'>Verify Page</h1>
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-gray-200 dark:border-neutral-800 overflow-hidden mt-10">
                <div className="p-2">
                    <div className="grid grid-cols-2 gap-2 bg-gray-200 dark:bg-neutral-900 rounded-xl p-1">
                        <button
                            onClick={() => setActiveTab("otp")}
                            className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === "otp"
                                ? "bg-white dark:bg-neutral-800 text-gray-900 dark:text-white shadow-sm"
                                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                }`}
                        >
                            OTP Verification
                        </button>
                        <button
                            onClick={() => setActiveTab("link")}
                            className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === "link"
                                ? "bg-white dark:bg-neutral-800 text-gray-900 dark:text-white shadow-sm"
                                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                }`}
                        >
                            Link Verification
                        </button>
                    </div>
                </div>

                <div className="p-6 sm:p-8">
                    {activeTab === "otp" ? (
                        <div>
                            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">OTP Verification</h2>
                            <p className="text-gray-700 dark:text-gray-300">Verify your account using a One-Time Password (OTP) sent to your email.</p>
                            <button className='mt-4 py-2 px-4 bg-gray-600 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-800 text-white font-semibold rounded-lg transition-colors cursor-pointer'>
                                Send OTP
                            </button>
                        </div>
                    ) : (
                        <div>
                            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Link Verification</h2>
                            <p className="text-gray-700 dark:text-gray-300">Verify your account by clicking the verification link sent to your registered email address.</p>
                            {/* Email Verification Form Goes Here */}
                            {
                                linkSent ? (
                                            timer > 0 ? (
                                                <>
                                                    <p className="mt-4 text-green-600 dark:text-green-400">A verification link has been sent to your email address. Please check your inbox.</p>
                                                    <p className="mt-2 text-gray-600 dark:text-gray-400">You can request a new link in {timer} seconds.</p>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={handleSubmit}
                                                    className='mt-4 py-2 px-4 bg-gray-600 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-800 text-white font-semibold rounded-lg transition-colors cursor-pointer'
                                                    disabled={loading}
                                                >
                                                    {loading ? 'Resending...' : 'Resend Verification Link'}
                                                </button>
                                            )
                                ) : (
                                    <button
                                        onClick={handleSubmit}
                                        className='mt-4 py-2 px-4 bg-gray-600 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-800 text-white font-semibold rounded-lg transition-colors cursor-pointer'
                                        disabled={loading}
                                    >
                                        {loading ? 'Sending...' : 'Send Verification Link'}
                                    </button>
                                )
                            }
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default VerifyPage