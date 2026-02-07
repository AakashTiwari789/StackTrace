"use client"
import { useAuth } from '@/context/AuthContext';
import apiFetch from '@/services/api';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'

const VerifyPage = () => {
    const { user } = useAuth();

    const router = useRouter();
    const [activeTab, setActiveTab] = useState("otp");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [linkSent, setLinkSent] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [timer, setTimer] = useState(null);
    const [otp, setOtp] = useState('');

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
                const data = await apiFetch('auth/send-otp', {
                    method: 'POST',
                });
                // console.log('OTP sent:', data);
                setOtpSent(true);
                setLoading(false);
                countdown(60);
                // show success message to user
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

    const verifyOtp = async () => {
        setLoading(true);
        try {
            const data = await apiFetch('auth/verify-otp', {
                method: 'POST',
                body: JSON.stringify({ otp }),
            });
            // console.log('OTP verification successful:', data);
            setLoading(false);
            alert('OTP verified successfully! Your account is now verified.'); // Show success message to user
            router.push(`/profile/${user.username}`); // Redirect to profile after successful verification
        } catch (error) {
            console.error('OTP verification error:', error);
            setError('Invalid OTP. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className='w-full bg-gray-50 dark:bg-neutral-950 min-h-screen flex flex-col justify-center items-center text-center px-6 py-20'>
            {
                user && !user.isVerified ? (
                    <>
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
                                        {
                                            otpSent ? (
                                                timer > 0 ? (
                                                    <>
                                                        <p className="mt-4 text-green-600 dark:text-green-400">An OTP has been sent to your email address. Please check your inbox.</p>
                                                        <input type='number' value={otp} onChange={(e) => setOtp(e.target.value)} placeholder='Enter OTP' className='mt-4 w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500' />
                                                        <button onClick={verifyOtp} className='mt-4 py-2 px-4 bg-gray-600 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-800 text-white font-semibold rounded-lg transition-colors cursor-pointer' disabled={loading}>
                                                            {loading ? 'Verifying...' : 'Verify OTP'}
                                                        </button>
                                                        <p className="mt-2 text-gray-600 dark:text-gray-400">You can request a new OTP in {timer} seconds.</p>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={handleSubmit}
                                                        className='mt-4 py-2 px-4 bg-gray-600 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-800 text-white font-semibold rounded-lg transition-colors cursor-pointer'
                                                        disabled={loading}
                                                    >
                                                        {loading ? 'Resending...' : 'Resend OTP'}
                                                    </button>
                                                )
                                            ) : (
                                                <button
                                                    onClick={handleSubmit}
                                                    className='mt-4 py-2 px-4 bg-gray-600 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-800 text-white font-semibold rounded-lg transition-colors cursor-pointer'
                                                    disabled={loading}
                                                >
                                                    {loading ? 'Sending...' : 'Send OTP'}
                                                </button>
                                            )
                                        }
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
                    </>
                ) : (
                    <div className='text-center'>
                        <h1 className='text-3xl font-bold mb-4'>You are already verified</h1>
                        <p className='text-gray-600 dark:text-gray-400 mb-6'>Your account is already verified. You can view your profile.</p>
                        <button
                            onClick={() => router.push(`/profile/${user.username}`)}
                            className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition'
                        >
                            Go to Profile
                        </button>
                    </div>
                )
            }
        </div>
    )
}

export default VerifyPage