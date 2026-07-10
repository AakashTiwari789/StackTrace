import Link from "next/link";
import { FaGithub } from "react-icons/fa";

const footerLinks = {
    Platform: [
        { name: "Problems", href: "/problems" },
        { name: "Contests", href: "/contests" },
        { name: "Leaderboard", href: "/leaderboard" },
        { name: "Features", href: "/features" },
    ],
    Company: [
        { name: "Developers", href: "/developers" },
        { name: "Contact Us", href: "/contact" },
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms & Conditions", href: "/terms" },
    ],
    Account: [
        { name: "Login / Sign Up", href: "/account/login" },
        { name: "Premium", href: "/subscribe" },
    ],
};

export default function Footer() {
    return (
        <footer className="border-t border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-6 py-12">
            <div className="max-w-6xl mx-auto">
                {/* Top row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="text-lg font-bold text-gray-900 dark:text-white">
                            StackTrace
                        </Link>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-[180px]">
                            Practice DSA. Debug logic. Master coding.
                        </p>
                        <div className="flex gap-3 mt-4">
                            <a
                                href="https://github.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
                            >
                                <FaGithub className="text-lg" />
                            </a>
                        </div>
                    </div>

                    {/* Link columns */}
                    {Object.entries(footerLinks).map(([category, links]) => (
                        <div key={category}>
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
                                {category}
                            </p>
                            <ul className="space-y-2">
                                {links.map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
                                        >
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom row */}
                <div className="pt-8 border-t border-gray-100 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                        © {new Date().getFullYear()} StackTrace. All rights reserved.
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                        Built with ❤️ using Next.js, Express & Judge0
                    </p>
                </div>
            </div>
        </footer>
    );
}
