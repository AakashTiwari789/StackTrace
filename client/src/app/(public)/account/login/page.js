"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from "@/context/AuthContext.js";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaEnvelope, FaLock, FaUser, FaEye, FaEyeSlash } from "react-icons/fa";

const LoginPage = () => {

    const { login, isAuthenticated, user, register } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("login");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isPasswordMatch, setIsPasswordMatch] = useState(true);
    const [fieldErrors, setFieldErrors] = useState({});

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usernameRegex = /^[a-zA-Z0-9_]+$/; // letters, numbers, underscore 

    const checkValidEmail = (email) => {
        return emailRegex.test(email);
    }

    const checkValidUsername = (username) => {
        return usernameRegex.test(username);
    }

    const validate = () => {
        const errors = {};

        if (activeTab === "login") {
            if (!formData.username.trim()) {
                errors.username = "Username or email is required.";
            } else if (!checkValidEmail(formData.username) && !checkValidUsername(formData.username)) {
                errors.username = "Please enter a valid email or username.";
            }
            if (!formData.password.trim()) {
                errors.password = "Password is required.";
            }
        } else {
            if (!formData.email.trim()) {
                errors.email = "Email is required.";
            } else if (!checkValidEmail(formData.email)) {
                errors.email = "Please enter a valid email address.";
            }

            if (!formData.username.trim()) {
                errors.username = "Username is required.";
            } else if (!checkValidUsername(formData.username)) {
                errors.username = "Username can only contain letters, numbers, and underscore (_).";
            }

            if (!formData.password.trim() || formData.password.length <= 6) {
                errors.password = "Password must be longer than 6 characters.";
            }

            if (!formData.confirmPassword.trim()) {
                errors.confirmPassword = "Confirm your password.";
            } else if (formData.password !== formData.confirmPassword) {
                errors.confirmPassword = "Passwords do not match.";
            }
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    }

    useEffect(() => {
        setFieldErrors({});
        setError(null);
    }, [activeTab]);

    useEffect(() => {
        if (isAuthenticated) {
            // console.log("[LoginPage] Redirecting to profile:", "/profile/" + user.username);
            router.replace("/profile/" + user.username);
        }
    }, [isAuthenticated, user, router]);

    const [formData, setFormData] = React.useState({
        email: "",
        username: "",
        password: "",
        confirmPassword: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (e.target.name === "confirmPassword" || e.target.name === "password") {
            setIsPasswordMatch(value === formData.password);
        }

        // Clear field-specific error when user edits that field
        if (fieldErrors[name]) {
            const nextErrors = { ...fieldErrors };
            delete nextErrors[name];
            setFieldErrors(nextErrors);
        }

        if (activeTab === "login" && name === "username") {
            setFormData({
                ...formData,
                username: value,
                email: value,
            });
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });
        }
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (!validate()) {
            return;
        }
        setLoading(true);
        try {
            if (activeTab === "login") {
                await login(formData);
            } else {
                await register(formData);
            }
        } catch (error) {
            console.error(activeTab === "login" ? "Login failed:" : "Registration failed:", error);
            setError(error.message || "An error occurred. Please try again.");
        }
        setLoading(false);
    };

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-neutral-950 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                {/* Logo/Brand */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        StackTrace
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        A Platform to Practice, Learn, and Share Coding Knowledge
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-gray-200 dark:border-neutral-800 overflow-hidden">
                    {/* Tabs Header */}
                    <div className="p-2">
                        <div className="grid grid-cols-2 gap-2 bg-gray-200 dark:bg-neutral-900 rounded-xl p-1">
                            <button
                                onClick={() => setActiveTab("login")}
                                className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === "login"
                                    ? "bg-white dark:bg-neutral-800 text-gray-900 dark:text-white shadow-sm"
                                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                    }`}
                            >
                                Login
                            </button>
                            <button
                                onClick={() => setActiveTab("register")}
                                className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === "register"
                                    ? "bg-white dark:bg-neutral-800 text-gray-900 dark:text-white shadow-sm"
                                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                    }`}
                            >
                                Register
                            </button>
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6 sm:p-8">
                        {activeTab === "login" ? (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {
                                    error && (
                                        <div className="bg-transparent border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                                            <strong className="font-bold">Error: </strong>
                                            <span className="block sm:inline">{error}</span>
                                        </div>
                                    )
                                }
                                <div>
                                    <label htmlFor="login-username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Username or Email
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaUser className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="login-username"
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${fieldErrors.username ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-neutral-700'}`}
                                            placeholder="username or email"
                                            required
                                        />
                                    </div>
                                    {fieldErrors.username && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.username}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaLock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="login-password"
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className={`block w-full pl-10 pr-10 py-2.5 border rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${fieldErrors.password ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-neutral-700'}`}
                                            placeholder="••••••••"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                        >
                                            {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                    {fieldErrors.password && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.password}</p>
                                    )}
                                </div>

                                <div className="flex items-center justify-between">
                                    <p className='text-black dark:text-white'>
                                        Forgot password?
                                    </p>
                                    <Link href="/account/forgot-password" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                                        Reset here
                                    </Link>
                                </div>

                                {
                                    loading ? (
                                        <button
                                            type="button"
                                            disabled
                                            className="w-full py-3 px-4 bg-gray-400 text-white font-semibold rounded-lg transition cursor-not-allowed"
                                        >
                                            Logging in...
                                        </button>
                                    ) : (
                                        <button
                                            type="submit"
                                            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900"
                                        >
                                            Login
                                        </button>
                                    )
                                }
                            </form>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {
                                    error && (
                                        <div className="bg-transparent border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                                            <strong className="font-bold">Error: </strong>
                                            <span className="block sm:inline">{error}</span>
                                        </div>
                                    )
                                }
                                <div>
                                    <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaEnvelope className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="register-email"
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${fieldErrors.email ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-neutral-700'}`}
                                            placeholder="you@example.com"
                                            required
                                        />
                                    </div>
                                    {fieldErrors.email && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.email}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="register-username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Username
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaUser className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="register-username"
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${fieldErrors.username ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-neutral-700'}`}
                                            placeholder="johndoe"
                                            required
                                        />
                                    </div>
                                    {fieldErrors.username && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.username}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaLock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="register-password"
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className={`block w-full pl-10 pr-10 py-2.5 border rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${fieldErrors.password ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-neutral-700'}`}
                                            placeholder="••••••••"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                        >
                                            {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                    {fieldErrors.password && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.password}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="register-confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaLock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="register-confirm-password"
                                            type={showPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${fieldErrors.confirmPassword ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-neutral-700'}`}
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                    {fieldErrors.confirmPassword && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.confirmPassword}</p>
                                    )}
                                    {!fieldErrors.confirmPassword && !isPasswordMatch && (
                                        <p className="text-red-600 text-sm mt-1">Passwords do not match</p>
                                    )}
                                </div>

                                <div className="flex items-start">
                                    <input
                                        id="terms"
                                        type="checkbox"
                                        className="h-4 w-4 mt-1 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        required
                                    />
                                    <label htmlFor="terms" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                        I agree to the{" "}
                                        <Link href="/terms" className="text-blue-600 dark:text-blue-400 hover:underline">
                                            Terms of Service
                                        </Link>{" "}
                                        and{" "}
                                        <Link href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">
                                            Privacy Policy
                                        </Link>
                                    </label>
                                </div>

                                {
                                    loading ? (
                                        <button
                                            type="button"
                                            disabled
                                            className="w-full py-3 px-4 bg-gray-400 text-white font-semibold rounded-lg transition cursor-not-allowed"
                                        >
                                            Processing...
                                        </button>
                                    ) : (
                                        <button
                                            type="submit"
                                            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900"
                                        >
                                            Create Account
                                        </button>
                                    )
                                }
                            </form>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 pb-6 text-center text-sm text-gray-600 dark:text-gray-400">
                        {activeTab === "login" ? (
                            <p>
                                Don't have an account?{" "}
                                <button
                                    onClick={() => setActiveTab("register")}
                                    className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                                >
                                    Register
                                </button>
                            </p>
                        ) : (
                            <p>
                                Already have an account?{" "}
                                <button
                                    onClick={() => setActiveTab("login")}
                                    className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                                >
                                    Login
                                </button>
                            </p>
                        )}
                    </div>
                </div>

                {/* Back to home */}
                <div className="text-center mt-6">
                    <Link href="/" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </main>
    )
}

export default LoginPage