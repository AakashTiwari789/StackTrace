"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiFetch from '@/services/api';
import ProblemCreateForm from '@/components/ProblemCreateForm';

const toApiPayload = (form) => ({
  title: form.title,
  slug: form.slug,
  difficulty: form.difficulty,
  tags: form.tags,
  statement: form.statement,
  inputFormat: form.inputFormat,
  outputFormat: form.outputFormat,
  constraints: form.constraints,
  sampleTestCases: form.sampleTestCases.map((example) => ({
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

export default function CreateProblemPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (form) => {
    try {
      setLoading(true);
      setError(null);
      // console.log("Submitting form with data:", form);
      await apiFetch('problem/create', {
        method: 'POST',
        body: JSON.stringify(toApiPayload(form)),
      });
      router.push('/admin/problems');
    } catch (createError) {
      setError(createError.message || 'Failed to create problem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className='flex items-center justify-between mb-8'>
        <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
          Create New Problem
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
        submitLabel='Create Problem'
        loadingLabel='Creating...'
        loading={loading}
        error={error}
        onSubmit={handleSubmit}
      />
    </>
  );
}