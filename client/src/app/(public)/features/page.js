import React from 'react'
import { FaCode, FaBolt, FaChartLine, FaLock, FaUsers, FaBookOpen, FaTerminal, FaTrophy } from 'react-icons/fa'
import { MdSpeed } from 'react-icons/md'

const features = [
    {
        icon: FaCode,
        title: 'Monaco-Powered Editor',
        desc: 'Full-featured code editor with syntax highlighting, multi-language support, and a familiar VS Code-like experience right in your browser.',
        gradient: 'from-violet-500 to-purple-600',
        badge: 'Editor',
        badgeColor: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
    },
    {
        icon: FaBolt,
        title: 'Real-time Verdicts',
        desc: 'Submissions are judged via a queue-based pipeline (BullMQ + Judge0) and results are pushed instantly over WebSockets — no page refresh needed.',
        gradient: 'from-amber-400 to-orange-500',
        badge: 'Live',
        badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    },
    {
        icon: FaBookOpen,
        title: 'Structured Problems',
        desc: 'Markdown statements with LaTeX math support. Filter by difficulty, tags, and topic to target exactly what you want to practice.',
        gradient: 'from-sky-400 to-blue-600',
        badge: 'Library',
        badgeColor: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
    },
    {
        icon: FaChartLine,
        title: 'Track Your Progress',
        desc: 'See your solve stats broken down by difficulty (Easy, Medium, Hard). Revisit past submissions and study your growth over time.',
        gradient: 'from-emerald-400 to-green-600',
        badge: 'Analytics',
        badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    },
    {
        icon: FaLock,
        title: 'Secure by Design',
        desc: 'JWT auth with httpOnly cookies, Redis-backed token revocation, per-device session management, and Google OAuth — security is never an afterthought.',
        gradient: 'from-rose-500 to-pink-600',
        badge: 'Security',
        badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
    },
    {
        icon: FaUsers,
        title: 'Public Profiles',
        desc: 'Share your profile with others — showcase your solve count, join date, verification badge, and compete on the global leaderboard.',
        gradient: 'from-teal-400 to-cyan-600',
        badge: 'Social',
        badgeColor: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
    },
    {
        icon: FaTerminal,
        title: 'Multi-language Support',
        desc: 'Write and run code in C++, Java, Python, and JavaScript. Each language is sandboxed with strict time and memory limits for fair judging.',
        gradient: 'from-indigo-400 to-violet-600',
        badge: 'Languages',
        badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
    },
    {
        icon: FaTrophy,
        title: 'Premium Problems',
        desc: 'Unlock exclusive problems, detailed editorial walkthroughs, and advanced test cases with a StackTrace Premium subscription.',
        gradient: 'from-yellow-400 to-amber-600',
        badge: 'Premium',
        badgeColor: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
    },
    {
        icon: MdSpeed,
        title: 'Blazing Fast Judging',
        desc: 'Our worker infrastructure scales horizontally. Submissions are picked up by BullMQ workers the instant they are queued — median verdict in under 2 seconds.',
        gradient: 'from-fuchsia-500 to-pink-600',
        badge: 'Performance',
        badgeColor: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/40 dark:text-fuchsia-300',
    },
]

const stats = [
    { value: '10+', label: 'Problems' },
    { value: '4', label: 'Languages' },
    { value: '<2s', label: 'Avg. Verdict' },
    { value: '99.9%', label: 'Uptime' },
]

const FeaturesPage = () => {
    return (
        <div className='w-full bg-gray-50 dark:bg-neutral-950 min-h-screen px-6 py-20'>
            <div className='max-w-6xl mx-auto'>

                {/* Header */}
                <div className='text-center mb-6'>
                    <span className='inline-block px-3 py-1 text-xs font-semibold tracking-widest uppercase rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 mb-4'>
                        Platform Features
                    </span>
                    <h1 className='text-5xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight'>
                        Built for Coders,{' '}
                        <span className='bg-gradient-to-r from-blue-500 to-violet-600 bg-clip-text text-transparent'>
                            by Coders
                        </span>
                    </h1>
                    <p className='text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto'>
                        Everything you need to practice DSA, debug logic, and master coding — built for speed and clarity.
                    </p>
                </div>

                {/* Stats bar */}
                <div className='flex flex-wrap justify-center gap-8 mb-16 py-8 border-y border-gray-200 dark:border-neutral-800'>
                    {stats.map((s) => (
                        <div key={s.label} className='text-center'>
                            <div className='text-3xl font-extrabold text-gray-900 dark:text-white'>{s.value}</div>
                            <div className='text-sm text-gray-500 dark:text-gray-400 mt-1'>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Feature cards */}
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {features.map((feature) => (
                        <div
                            key={feature.title}
                            className='group relative bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-6 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:hover:shadow-black/60 hover:border-transparent'
                        >
                            {/* Gradient glow on hover */}
                            <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-to-br ${feature.gradient} rounded-2xl pointer-events-none`} />

                            {/* Top border accent line */}
                            <div className={`absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r ${feature.gradient} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                            {/* Badge */}
                            <div className='flex items-center justify-between mb-5'>
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${feature.gradient} shadow-lg`}>
                                    <feature.icon className='text-white text-xl' />
                                </div>
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${feature.badgeColor}`}>
                                    {feature.badge}
                                </span>
                            </div>

                            <h2 className='text-base font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors'>
                                {feature.title}
                            </h2>
                            <p className='text-sm text-gray-500 dark:text-gray-400 leading-relaxed'>
                                {feature.desc}
                            </p>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className='mt-20 text-center'>
                    <p className='text-gray-500 dark:text-gray-400 text-sm mb-4'>Ready to level up your coding skills?</p>
                    <a
                        href='/account/register'
                        className='inline-block px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 text-white font-semibold text-sm shadow-lg hover:shadow-blue-500/30 hover:scale-105 transition-all duration-200'
                    >
                        Get Started for Free
                    </a>
                </div>
            </div>
        </div>
    )
}

export default FeaturesPage