import React from 'react'
import Link from 'next/link'
import { FaGithub } from 'react-icons/fa'
import { HiClock } from 'react-icons/hi'

const ContactPage = () => {
    return (
        <div className='w-full bg-gray-50 dark:bg-neutral-950 min-h-screen flex flex-col items-center justify-center px-6 py-20'>

            {/* Decorative blobs */}
            <div className='absolute top-1/3 left-1/4 w-80 h-80 rounded-full bg-blue-400/10 dark:bg-blue-600/10 blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2' />
            <div className='absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full bg-violet-400/10 dark:bg-violet-600/10 blur-3xl pointer-events-none' />

            <div className='relative z-10 flex flex-col items-center text-center max-w-md'>

                {/* Icon */}
                <div className='w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-xl shadow-blue-500/30 mb-6'>
                    <FaGithub className='text-white text-3xl' />
                </div>

                {/* Badge */}
                <span className='inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold tracking-widest uppercase rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 mb-5'>
                    <HiClock className='text-sm' /> Coming Soon
                </span>

                <h1 className='text-4xl font-extrabold text-gray-900 dark:text-white mb-4'>
                    Contact Us
                </h1>

                <p className='text-gray-500 dark:text-gray-400 leading-relaxed mb-8'>
                    A proper contact form is on the way. For now, the best way to reach us or report an issue is through the GitHub repository.
                </p>

                <a
                    href='https://github.com/AakashTiwari789/StackTrace'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 text-white font-semibold text-sm shadow-lg hover:shadow-blue-500/30 hover:scale-105 transition-all duration-200 mb-4'
                >
                    <FaGithub className='text-lg' />
                    Open an Issue on GitHub
                </a>

                <Link
                    href='/'
                    className='text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition'
                >
                    ← Back to Home
                </Link>
            </div>
        </div>
    )
}

export default ContactPage