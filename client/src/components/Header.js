"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HiX, HiMenu } from "react-icons/hi";
import { CgProfile } from "react-icons/cg";
import { FiSettings, FiLogOut } from "react-icons/fi";
import { FaUserClock } from "react-icons/fa6";
import ThemeToggle from "./ThemeToggle.js";
import { useAuth } from "@/context/AuthContext.js";

const menuItems = [
    { name: "Premium", href: "/subscribe" },
    { name: "Features", href: "/features" },
    { name: "Developers", href: "/developers" },
    { name: "Contact Us", href: "/contact" },
];



export default function Header() {
    
    const { user, isAuthenticated, logout } = useAuth();
    
    useEffect(() => {
        // Close mobile menu on route change
        setOpen(false);
    }, [logout]);
    
    const authMenuItems = [
        { name: "Profile", href: `/profile/${user?.username}` },
        { name: "Problems", href: "/problems" },
        { name: "Contests", href: "/contests" },
        { name: "Leaderboard", href: "/leaderboard" },
    ];

    const authSubMenuItems = [
        { name: "Profile", href: `/profile/${user?.username}`, icon: CgProfile },
        { name: "Settings", href: "/settings", icon: FiSettings },
        { name: "Sessions", href: "/sessions", icon: FaUserClock },
    ];

    const [open, setOpen] = useState(false);
    const [subMenuOpen, setSubMenuOpen] = useState(false);

    const navLinkBase =
        "px-4 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition";

    const handleLogout = () => {
        logout();
        // refresh the page or redirect to home
        setOpen(false);
    };

    return (
        <>
            <header className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 bg-gray-100/80 dark:bg-neutral-900/80 backdrop-blur border-b border-gray-200 dark:border-neutral-800">
                <div className="flex items-center gap-3">
                    <Link href="/" className="inline-flex items-center">
                        <span className="text-xl font-semibold text-gray-900 dark:text-white">StackTrace</span>
                    </Link>
                </div>

                {/* Desktop nav */}
                <nav className="hidden md:flex items-center gap-4 font-semibold">
                    {
                        !!isAuthenticated ?
                            authMenuItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={navLinkBase}
                                >
                                    {item.name}
                                </Link>
                            )) :
                            menuItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={navLinkBase}
                                >
                                    {item.name}
                                </Link>
                            ))
                    }
                </nav>

                <div className="flex items-center gap-3">
                    {/* Login/Logout button on md+ */}
                    {!!isAuthenticated && user.username ? (
                        <>
                            <div
                                onClick={() => { setSubMenuOpen(!subMenuOpen) }}
                                className="hidden md:inline-block text-sm font-medium rounded-md text-gray-700 dark:text-gray-200"
                            >
                                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-700">
                                    {user.imageUrl ? (
                                        <img
                                            src={user.imageUrl}
                                            alt="Profile"
                                            className="w-8 h-8 rounded-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-lg font-medium text-gray-700 dark:text-gray-200">
                                            {user.username.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <Link
                            href="/account/login"
                            className="hidden md:inline-block px-5 py-2 text-sm font-medium rounded-md bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200 transition"
                        >
                            Login
                        </Link>
                    )}

                    {/* Theme toggle */}
                    <div className="hidden md:inline-flex">
                        <ThemeToggle />
                    </div>

                    {/* Mobile menu button */}
                    <button
                        type="button"
                        className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:outline-none"
                        aria-label="Toggle navigation"
                        aria-expanded={open}
                        onClick={() => setOpen((v) => !v)}
                    >
                        {open ? <HiX className="h-6 w-6" /> : <HiMenu className="h-6 w-6" />}
                        <span className="sr-only">Menu</span>
                    </button>
                </div>

                {/* Mobile nav panel */}
                {open && (
                    <div className="absolute left-0 right-0 top-full md:hidden border-b border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
                        <nav className="flex flex-col p-2">
                            <div className="flex items-center justify-between px-2 py-1">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Theme</span>
                                <ThemeToggle />
                            </div>
                            {
                                !!isAuthenticated ?
                                    authMenuItems.map((item) => (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className="mt-1 px-4 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                                            onClick={() => setOpen(false)}
                                        >
                                            {item.name}
                                        </Link>
                                    )) :
                                    menuItems.map((item) => (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className="mt-1 px-4 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                                            onClick={() => setOpen(false)}
                                        >
                                            {item.name}
                                        </Link>
                                    ))
                            }
                            {!!isAuthenticated ? (
                                <>
                                    {authSubMenuItems.map((item) => (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className="mt-1 px-4 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                                            onClick={() => {
                                                setOpen(false);
                                                setSubMenuOpen(false);
                                            }}
                                        >
                                            {item.name}
                                        </Link>
                                    ))}
                                    <button
                                        onClick={handleLogout}
                                        className="mt-2 px-4 py-2 text-sm text-left font-medium rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                                    >
                                        Logout
                                    </button>

                                </>
                            ) : (
                                <Link
                                    href="/account/login"
                                    className="mt-2 px-5 py-2 text-sm font-medium rounded-md bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200 transition"
                                    onClick={() => {
                                        setOpen(false);
                                        setSubMenuOpen(false);
                                    }}
                                >
                                    Login
                                </Link>
                            )}
                        </nav>
                    </div>
                )}
            </header>

            <div className="z-1000 hidden md:block" >
                {subMenuOpen && (
                    <div className="absolute top-16 right-4 w-32 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-md shadow-lg">
                        {authSubMenuItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="w-full block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                                onClick={() => setSubMenuOpen(false)}
                            >
                                <item.icon className="inline mr-2 mb-1" />
                                {item.name}
                            </Link>
                        ))}
                        <button
                            onClick={() => {
                                handleLogout();
                                setSubMenuOpen(false);
                            }}
                            className="w-full block px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            <FiLogOut className="inline mr-2 mb-1" />
                            Logout
                        </button>
                    </div>
                )}
            </div>

        </>);
}