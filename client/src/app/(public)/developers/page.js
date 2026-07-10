import React from 'react'
import { FaGithub, FaLinkedin } from 'react-icons/fa'

const stack = [
    {
        category: 'Frontend',
        color: 'from-blue-400 to-cyan-500',
        items: [
            { name: 'Next.js 15', desc: 'App Router, RSC, SSR' },
            { name: 'Tailwind CSS v4', desc: 'Utility-first styling' },
            { name: 'Monaco Editor', desc: 'VS Code editor in browser' },
            { name: 'React Icons', desc: 'Icon library' },
        ],
    },
    {
        category: 'Backend',
        color: 'from-emerald-400 to-green-600',
        items: [
            { name: 'Node.js + Express', desc: 'REST API server' },
            { name: 'MongoDB + Mongoose', desc: 'Primary database' },
            { name: 'Redis', desc: 'Token revocation & caching' },
            { name: 'BullMQ', desc: 'Submission job queue' },
        ],
    },
    {
        category: 'Infrastructure',
        color: 'from-violet-400 to-purple-600',
        items: [
            { name: 'Judge0', desc: 'Sandboxed code execution' },
            { name: 'Socket.IO', desc: 'Real-time verdict push' },
            { name: 'Docker', desc: 'Judge0 & worker containers' },
            { name: 'ImageKit', desc: 'Profile image CDN' },
        ],
    },
]

const apiEndpoints = [
    { method: 'GET', path: '/api/problems', desc: 'List all published problems' },
    { method: 'GET', path: '/api/problems/:slug', desc: 'Get problem by slug' },
    { method: 'POST', path: '/api/submissions', desc: 'Submit code for judging' },
    { method: 'GET', path: '/api/submissions/:id', desc: 'Poll a submission verdict' },
    { method: 'GET', path: '/api/profile/:username', desc: 'Get public user profile' },
]

const methodColor = {
    GET: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    POST: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    PUT: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    DELETE: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
    PATCH: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
}

export default function DevelopersPage() {
    return (
        <div className='w-full bg-gray-50 dark:bg-neutral-950 min-h-screen px-6 py-20'>
            <div className='max-w-5xl mx-auto'>

                {/* Header */}
                <div className='text-center mb-14'>
                    <span className='inline-block px-3 py-1 text-xs font-semibold tracking-widest uppercase rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 mb-4'>
                        Open Platform
                    </span>
                    <h1 className='text-4xl font-extrabold text-gray-900 dark:text-white mb-3'>Developer Docs</h1>
                    <p className='text-gray-500 dark:text-gray-400 max-w-xl mx-auto'>
                        StackTrace is built in the open. Explore the tech stack and API that powers the platform.
                    </p>
                    <a
                        href='https://github.com/AakashTiwari789/StackTrace'
                        target='_blank'
                        rel='noopener noreferrer'
                        className='inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-xl border border-gray-300 dark:border-neutral-700 text-sm font-medium text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 transition'
                    >
                        <FaGithub /> View on GitHub
                    </a>
                </div>

                {/* Tech stack */}
                <section className='mb-16'>
                    <h2 className='text-xl font-bold text-gray-900 dark:text-white mb-6'>Tech Stack</h2>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                        {stack.map((cat) => (
                            <div key={cat.category} className='bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-6'>
                                <div className={`inline-block px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r ${cat.color} text-white mb-5`}>
                                    {cat.category}
                                </div>
                                <ul className='space-y-4'>
                                    {cat.items.map((item) => (
                                        <li key={item.name} className='flex flex-col'>
                                            <span className='text-sm font-semibold text-gray-900 dark:text-white'>{item.name}</span>
                                            <span className='text-xs text-gray-400 dark:text-gray-500'>{item.desc}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Architecture overview */}
                <section className='mb-16'>
                    <h2 className='text-xl font-bold text-gray-900 dark:text-white mb-6'>Submission Pipeline</h2>
                    <div className='bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-6'>
                        <div className='flex flex-wrap items-center gap-3 text-sm font-mono'>
                            {['Browser', '→', 'Express API', '→', 'BullMQ Queue', '→', 'Worker', '→', 'Judge0', '→', 'Result', '→', 'Socket.IO', '→', 'Browser'].map((step, i) => (
                                step === '→'
                                    ? <span key={i} className='text-gray-300 dark:text-gray-600'>→</span>
                                    : (
                                        <span key={i} className='px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-neutral-700'>
                                            {step}
                                        </span>
                                    )
                            ))}
                        </div>
                        <p className='text-sm text-gray-500 dark:text-gray-400 mt-5'>
                            When you submit code, it is placed in a BullMQ job queue. A Node.js worker picks it up, sends it to Judge0 (a sandboxed execution engine), and pushes the verdict back to the browser over a Socket.IO WebSocket connection — all in under 2 seconds on average.
                        </p>
                    </div>
                </section>

                {/* Built by */}
                <section className='mb-16'>
                    <h2 className='text-xl font-bold text-gray-900 dark:text-white mb-6'>Built by</h2>
                    <div className='bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6'>
                        {/* Avatar */}
                        <div className='w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-2xl font-black flex-shrink-0 shadow-lg'>
                            A
                        </div>
                        {/* Info */}
                        <div className='flex-1'>
                            <p className='text-lg font-bold text-gray-900 dark:text-white'>Aakash Tiwari</p>
                            <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
                                Full-stack developer — built StackTrace from the ground up, including the judging pipeline, auth system, and editor integration.
                            </p>
                            <div className='flex gap-3 mt-4'>
                                <a
                                    href='https://github.com/AakashTiwari789'
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-neutral-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 transition'
                                >
                                    <FaGithub className='text-base' /> @AakashTiwari789
                                </a>
                                <a
                                    href='https://www.linkedin.com/in/aakash-tiwari-in/'
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-neutral-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 transition'
                                >
                                    <FaLinkedin className='text-base text-blue-600' /> LinkedIn
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* API Reference */}
                <section>
                    <h2 className='text-xl font-bold text-gray-900 dark:text-white mb-2'>REST API Reference</h2>
                    <p className='text-sm text-gray-500 dark:text-gray-400 mb-6'>
                        All endpoints are prefixed with <code className='px-1.5 py-0.5 rounded bg-gray-100 dark:bg-neutral-800 font-mono text-xs'>/api/v1</code>. Authentication uses httpOnly JWT cookies.
                    </p>
                    <div className='bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 overflow-hidden'>
                        {apiEndpoints.map((ep, i) => (
                            <div
                                key={i}
                                className='flex items-center gap-4 px-5 py-4 border-b border-gray-100 dark:border-neutral-800 last:border-0 hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors'
                            >
                                <span className={`text-xs font-bold px-2 py-1 rounded font-mono flex-shrink-0 ${methodColor[ep.method]}`}>
                                    {ep.method}
                                </span>
                                <code className='text-sm font-mono text-gray-800 dark:text-gray-200 flex-1'>{ep.path}</code>
                                <span className='text-sm text-gray-400 dark:text-gray-500 hidden sm:block'>{ep.desc}</span>
                            </div>
                        ))}
                    </div>
                    <p className='text-xs text-gray-400 dark:text-gray-600 mt-4'>
                        Full OpenAPI / Swagger docs coming soon. In the meantime, check the GitHub repo for route definitions.
                    </p>
                </section>
            </div>
        </div>
    )
}