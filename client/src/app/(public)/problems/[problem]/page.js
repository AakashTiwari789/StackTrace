import React from 'react'

const ProblemPage = async ({ params }) => {
    const { problem } = await params;
    console.log("Problem page for problem:", problem);
    return (
        <div className='w-full bg-gray-50 dark:bg-neutral-950 min-h-screen flex flex-col justify-center items-center text-center px-6 py-20'>
            <h1 className='text-4xl font-bold max-w-3xl text-gray-900 dark:text-white'>Problem Page: {problem}</h1>
        </div>
    )
}

export default ProblemPage