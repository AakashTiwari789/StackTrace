import Link from "next/link";

export default function Footer() {
    return (
        <footer className="border-t border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-6 py-8">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    © {new Date().getFullYear()} StackTrace. All rights reserved.
                </p>

                <div className="flex gap-6 text-sm">
                    <Link href="/pricing" className="text-gray-700 dark:text-gray-300 hover:underline">
                        Pricing
                    </Link>
                    <Link href="/privacy" className="text-gray-700 dark:text-gray-300 hover:underline">
                        Privacy
                    </Link>
                    <Link href="/terms" className="text-gray-700 dark:text-gray-300 hover:underline">
                        Terms
                    </Link>
                </div>
            </div>
        </footer>
    );
}
