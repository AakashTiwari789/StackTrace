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
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (activeTab === "login") {
                await login(formData);
            } else {
                await register(formData);
            }
        } catch (error) {
            console.error(activeTab === "login" ? "Login failed:" : "Registration failed:", error);
        }
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
                                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                            placeholder="username or email"
                                            required
                                        />
                                    </div>
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
                                            className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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
                                </div>

                                <div className="flex items-center justify-between">
                                    <p className='text-black dark:text-white'>
                                        Forgot password?
                                    </p>
                                    <Link href="/account/forgot-password" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                                        Reset here
                                    </Link>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900"
                                >
                                    Login
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
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
                                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                            placeholder="you@example.com"
                                            required
                                        />
                                    </div>
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
                                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                            placeholder="johndoe"
                                            required
                                        />
                                    </div>
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
                                            className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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
                                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
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

                                <button
                                    type="submit"
                                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900"
                                >
                                    Create Account
                                </button>
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