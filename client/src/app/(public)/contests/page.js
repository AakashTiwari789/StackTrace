import React from 'react'
import Link from 'next/link'
import { FaTrophy, FaBell } from 'react-icons/fa'
import { HiClock } from 'react-icons/hi'

export default function ContestsPage() {
    return (
        <div className='w-full bg-gray-50 dark:bg-neutral-950 min-h-screen flex flex-col items-center justify-center px-6 py-20'>

            {/* Decorative blobs */}
            <div className='absolute top-1/3 left-1/4 w-80 h-80 rounded-full bg-amber-400/10 dark:bg-amber-600/10 blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2' />
            <div className='absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full bg-violet-400/10 dark:bg-violet-600/10 blur-3xl pointer-events-none' />

            <div className='relative z-10 flex flex-col items-center text-center max-w-lg'>

                {/* Icon */}
                <div className='w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl shadow-amber-500/30 mb-6'>
                    <FaTrophy className='text-white text-3xl' />
                </div>

                {/* Badge */}
                <span className='inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold tracking-widest uppercase rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 mb-5'>
                    <HiClock className='text-sm' /> Coming Soon
                </span>

                <h1 className='text-4xl font-extrabold text-gray-900 dark:text-white mb-4'>
                    Contests are on the way
                </h1>

                <p className='text-gray-500 dark:text-gray-400 leading-relaxed mb-8'>
                    We're building timed competitive contests with live leaderboards, rated rounds, and real-time verdicts.
                    Check back soon — it's going to be exciting.
                </p>

                {/* Upcoming features list */}
                <div className='w-full bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-6 text-left mb-8 space-y-3'>
                    {[
                        'Rated & unrated rounds',
                        'Live leaderboard during contest',
                        'Real-time verdict over WebSockets',
                        'Post-contest editorial walkthroughs',
                        'Per-language score penalties',
                    ].map((item) => (
                        <div key={item} className='flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400'>
                            <span className='w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0' />
                            {item}
                        </div>
                    ))}
                </div>

                <div className='flex flex-wrap gap-4 justify-center'>
                    <Link
                        href='/problems'
                        className='px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-semibold text-sm shadow-lg hover:shadow-amber-400/30 hover:scale-105 transition-all duration-200'
                    >
                        Practice Problems Instead →
                    </Link>
                    <Link
                        href='/'
                        className='px-6 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-white font-semibold text-sm hover:bg-gray-100 dark:hover:bg-neutral-800 transition'
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    )
}