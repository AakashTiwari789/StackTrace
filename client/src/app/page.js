import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* HERO */}
      <section className="w-full bg-gray-50 dark:bg-neutral-950 min-h-screen flex flex-col justify-center items-center text-center px-6 py-20">
        <h2 className="text-4xl font-bold max-w-3xl text-gray-900 dark:text-white">
          Practice DSA, Debug Logic, Master Coding
        </h2>

        <p className="mt-6 max-w-2xl text-gray-700 dark:text-gray-300">
          StackTrace is a coding platform to practice data structures and algorithms, read structured editorials, run code against real test cases, and improve problem-solving skills with instant feedback.
        </p>

        <div className="mt-8 flex gap-4">
          <Link
            href="/subscribe"
            className="px-6 py-3 rounded-md bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200 transition"
          >
            Unlock Premium
          </Link>

          <Link
            href="/contact"
            className="px-6 py-3 rounded-md border border-gray-300 text-gray-900 dark:text-white dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </main>
  );
}
