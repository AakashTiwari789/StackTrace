"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import ProblemCreateForm from '@/components/ProblemCreateForm';
import apiFetch from '@/services/api';

const toApiPayload = (form) => ({
    title: form.title,
    slug: form.slug,
    difficulty: form.difficulty.charAt(0).toUpperCase() + form.difficulty.slice(1),
    tags: form.tags,
    statement: form.statement,
    inputFormat: form.inputFormat,
    outputFormat: form.outputFormat,
    constraints: form.constraints,
    sampleTestCases: form.examples.map((example) => ({
        input: example.input,
        output: example.output,
        explanation: example.explanation,
    })),
    testCases: form.testCases.map((testCase) => ({
        input: testCase.input,
        output: testCase.expectedOutput,
        isSample: testCase.isSample,
    })),
    timeLimit: form.timeLimit,
    memoryLimit: form.memoryLimit,
    isPublished: form.isPublished,
    isPremium: form.isPremium,
    languagesAllowed: form.languagesAllowed,
});

export default function EditProblemPage({ params }) {
    const router = useRouter();
    const [problem, setProblem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const { slug } = use(params);

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                setLoading(true);
                const data = await apiFetch(`problem/${slug}`, { method: 'GET' });
                setProblem(data.data.problem);
                const fetchTestCases = await apiFetch(`problem/${slug}/test-cases`, { method: 'GET' });
                setProblem((prev) => ({ ...prev, testCases: fetchTestCases.data.testCases }));
            } catch (fetchError) {
                setError(fetchError.message || 'Failed to load problem.');
            } finally {
                setLoading(false);
            }
        };


        fetchProblem();
    }, [slug]);

    const handleSubmit = async (form) => {
        if (!problem?._id) {
            return;
        }

        try {
            setSubmitting(true);
            setError(null);
            await apiFetch(`admin/problems/update/${problem._id}`, {
                method: 'PUT',
                body: JSON.stringify(toApiPayload(form)),
            });
            router.push('/admin/problems');
        } catch (submitError) {
            setError(submitError.message || 'Failed to update problem.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className='text-gray-700 dark:text-gray-300'>Loading problem...</div>;
    }

    if (error && !problem) {
        return <div className='text-red-600 dark:text-red-400'>{error}</div>;
    }

    return (
        <>
            <div className='flex items-center justify-between mb-8'>
                <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
                    {problem.title}
                </h1>
                <button
                    type='button'
                    onClick={() => router.push('/admin/problems')}
                    className='text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                >
                    ← Back to problems
                </button>
            </div>
            <ProblemCreateForm
                key={problem._id}
                problem={problem}
                submitLabel='Update Problem'
                loadingLabel='Updating...'
                error={error}
                onSubmit={handleSubmit}
                loading={submitting}
            />
        </>
    );
}