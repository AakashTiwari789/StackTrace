"use client";

import React, { useState } from 'react';

const LANGUAGES = ['cpp', 'python', 'javascript', 'java'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const TAGS = ['array', 'string', 'dp', 'graph', 'tree', 'math', 'greedy', 'binary-search', 'two-pointer', 'sliding-window'];

const sampleTestCase = () => ({ input: '', output: '', explanation: '' });
const emptyTestCase = () => ({ input: '', expectedOutput: '', isSample: false });

const createDefaultForm = () => ({
    title: '',
    slug: '',
    difficulty: 'Medium',
    tags: [],
    statement: '',
    inputFormat: '',
    outputFormat: '',
    constraints: '',
    timeLimit: 2000,
    memoryLimit: 256,
    sampleTestCases: [sampleTestCase()],
    testCases: [emptyTestCase()],
    isPublished: false,
    isPremium: false,
    languagesAllowed: [...LANGUAGES],
});

const normalizeProblemForm = (problem) => {
    if (!problem) {
        return createDefaultForm();
    }

    const sampleTestCases = problem.sampleTestCases || [];
    const testCases = problem.testCases || [];

    return {
        ...createDefaultForm(),
        ...problem,
        difficulty: (problem.difficulty || 'medium').toLowerCase(),
        tags: problem.tags || [],
        sampleTestCases: sampleTestCases.length > 0
            ? sampleTestCases.map((sample) => ({
                input: sample.input || '',
                output: sample.output || '',
                explanation: sample.explanation || '',
            }))
            : [sampleTestCase()],
        testCases: testCases.length > 0
            ? testCases.map((testCase) => ({
                input: testCase.input || '',
                expectedOutput: testCase.output || testCase.expectedOutput || '',
                isSample: !!testCase.isSample,
            }))
            : [emptyTestCase()],
        isPublished: !!problem.isPublished,
        isPremium: !!problem.isPremium,
        languagesAllowed: problem.languagesAllowed?.length ? problem.languagesAllowed : [...LANGUAGES],
    };
};

const slugify = (value) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

const ProblemCreateForm = ({
    problem,
    onSubmit,
    loading = false,
    error = null,
    submitLabel = 'Create Problem',
    loadingLabel = 'Creating...',
    onBack,
}) => {
    const [form, setForm] = useState(() => normalizeProblemForm(problem));
    const [dirtySlug, setDirtySlug] = useState(Boolean(problem?.slug));

    const set = (key, val) => setForm((current) => ({ ...current, [key]: val }));

    const addSampleTestCase = () => set('sampleTestCases', [...form.sampleTestCases, sampleTestCase()]);
    const removeSampleTestCase = (index) => set('sampleTestCases', form.sampleTestCases.filter((_, currentIndex) => currentIndex !== index));
    const setSampleTestCase = (index, key, val) => {
        const updated = [...form.sampleTestCases];
        updated[index] = { ...updated[index], [key]: val };
        set('sampleTestCases', updated);
    };

    const addTestCase = () => set('testCases', [...form.testCases, emptyTestCase()]);
    const removeTestCase = (index) => set('testCases', form.testCases.filter((_, currentIndex) => currentIndex !== index));
    const setTestCase = (index, key, val) => {
        const updated = [...form.testCases];
        updated[index] = { ...updated[index], [key]: val };
        set('testCases', updated);
    };

    const toggleTag = (tag) => {
        set('tags', form.tags.includes(tag)
            ? form.tags.filter((currentTag) => currentTag !== tag)
            : [...form.tags, tag]
        );
    };

    const toggleLanguage = (language) => {
        set('languagesAllowed', form.languagesAllowed.includes(language)
            ? form.languagesAllowed.filter((currentLanguage) => currentLanguage !== language)
            : [...form.languagesAllowed, language]
        );
    };

    const handleTitleChange = (event) => {
        const nextTitle = event.target.value;
        set('title', nextTitle);
        if (!dirtySlug) {
            set('slug', slugify(nextTitle));
        }
    };

    const handleSlugChange = (event) => {
        setDirtySlug(true);
        set('slug', event.target.value);
    };

    const handleSubmit = async (event) => {
        console.log("Submitting form with data:", form);
        event.preventDefault();
        if (onSubmit) {
            await onSubmit(form);
        }
    };

    return (
        <div>

            {error && (
                <div className='bg-red-50 dark:bg-red-900/20 border border-red-300 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-6'>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className='space-y-8'>
                <Section title='Basic Info'>
                    <Field label='Title'>
                        <input
                            type='text'
                            value={form.title}
                            onChange={handleTitleChange}
                            required
                            placeholder='Two Sum'
                            className={inputCls}
                        />
                    </Field>

                    <Field label='Slug'>
                        <input
                            type='text'
                            value={form.slug}
                            onChange={handleSlugChange}
                            required
                            placeholder='two-sum'
                            className={inputCls}
                        />
                    </Field>

                    <Field label='Difficulty'>
                        <div className='flex gap-3'>
                            {DIFFICULTIES.map((difficulty) => (
                                <button
                                    key={difficulty}
                                    type='button'
                                    onClick={() => set('difficulty', difficulty)}
                                    className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition
                                        ${form.difficulty === difficulty
                                            ? difficultyActive[difficulty]
                                            : 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400'
                                        }`}
                                >
                                    {difficulty}
                                </button>
                            ))}
                        </div>
                    </Field>

                    <Field label='Tags'>
                        <div className='flex flex-wrap gap-2'>
                            {TAGS.map((tag) => (
                                <button
                                    key={tag}
                                    type='button'
                                    onClick={() => toggleTag(tag)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition
                                        ${form.tags.includes(tag)
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-neutral-700'
                                        }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </Field>
                </Section>

                <Section title='Problem Statement'>
                    <p className='text-xs text-gray-500 mb-2'>Supports Markdown, LaTeX ($formula$), Mermaid (```mermaid)</p>
                    <Field label='Statement'>
                        <textarea
                            value={form.statement}
                            onChange={(event) => set('statement', event.target.value)}
                            required
                            rows={8}
                            placeholder='Given an array of integers nums...'
                            className={inputCls}
                        />
                    </Field>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <Field label='Input Format'>
                            <textarea
                                value={form.inputFormat}
                                onChange={(event) => set('inputFormat', event.target.value)}
                                rows={3}
                                className={inputCls}
                            />
                        </Field>
                        <Field label='Output Format'>
                            <textarea
                                value={form.outputFormat}
                                onChange={(event) => set('outputFormat', event.target.value)}
                                rows={3}
                                className={inputCls}
                            />
                        </Field>
                    </div>
                    <Field label='Constraints'>
                        <textarea
                            value={form.constraints}
                            onChange={(event) => set('constraints', event.target.value)}
                            rows={3}
                            placeholder='1 <= nums.length <= 10^4'
                            className={inputCls}
                        />
                    </Field>
                </Section>

                <Section title='Limits'>
                    <div className='grid grid-cols-2 gap-4'>
                        <Field label='Time Limit (ms)'>
                            <input
                                type='number'
                                value={form.timeLimit}
                                onChange={(event) => set('timeLimit', Number(event.target.value))}
                                min={500}
                                max={10000}
                                className={inputCls}
                            />
                        </Field>
                        <Field label='Memory Limit (MB)'>
                            <input
                                type='number'
                                value={form.memoryLimit}
                                onChange={(event) => set('memoryLimit', Number(event.target.value))}
                                min={64}
                                max={1024}
                                className={inputCls}
                            />
                        </Field>
                    </div>
                </Section>

                <Section title='Languages Allowed'>
                    <div className='flex flex-wrap gap-2'>
                        {LANGUAGES.map((language) => (
                            <button
                                key={language}
                                type='button'
                                onClick={() => toggleLanguage(language)}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition uppercase
                                    ${form.languagesAllowed.includes(language)
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-neutral-700'
                                    }`}
                            >
                                {language}
                            </button>
                        ))}
                    </div>
                </Section>

                <Section title='sampleTestCases (shown to users)'>
                    {form.sampleTestCases.map((example, index) => (
                        <div key={index} className='border border-gray-200 dark:border-neutral-700 rounded-lg p-4 space-y-3'>
                            <div className='flex justify-between items-center'>
                                <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>Example {index + 1}</span>
                                {form.sampleTestCases.length > 1 && (
                                    <button
                                        type='button'
                                        onClick={() => removeSampleTestCase(index)}
                                        className='text-xs text-red-500 hover:text-red-700'
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                            <div className='grid grid-cols-2 gap-3'>
                                <Field label='Input'>
                                    <textarea
                                        rows={2}
                                        value={example.input}
                                        onChange={(event) => setSampleTestCase(index, 'input', event.target.value)}
                                        className={inputCls}
                                    />
                                </Field>
                                <Field label='Output'>
                                    <textarea
                                        rows={2}
                                        value={example.output}
                                        onChange={(event) => setSampleTestCase(index, 'output', event.target.value)}
                                        className={inputCls}
                                    />
                                </Field>
                            </div>
                            <Field label='Explanation (optional)'>
                                <input
                                    type='text'
                                    value={example.explanation}
                                    onChange={(event) => setSampleTestCase(index, 'explanation', event.target.value)}
                                    className={inputCls}
                                />
                            </Field>
                        </div>
                    ))}
                    <button
                        type='button'
                        onClick={addSampleTestCase}
                        className='text-sm text-blue-600 dark:text-blue-400 hover:underline'
                    >
                        + Add example
                    </button>
                </Section>

                <Section title='Test Cases (hidden from users)'>
                    {form.testCases.map((testCase, index) => {
                        return (
                            <div key={index} className='border border-gray-200 dark:border-neutral-700 rounded-lg p-4 space-y-3'>
                                <div className='flex justify-between items-center'>
                                    <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>Test Case {index + 1}</span>
                                    <div className='flex gap-3 items-center'>
                                        <label className='flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400'>
                                            <input
                                                type='checkbox'
                                                checked={testCase.isSample}
                                                onChange={(event) => setTestCase(index, 'isSample', event.target.checked)}
                                            />
                                            Sample (visible)
                                        </label>
                                        {form.testCases.length > 1 && (
                                            <button
                                                type='button'
                                                onClick={() => removeTestCase(index)}
                                                className='text-xs text-red-500 hover:text-red-700'
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className='grid grid-cols-2 gap-3'>
                                    <Field label='Input'>
                                        <textarea
                                            rows={3}
                                            value={testCase.input}
                                            onChange={(event) => setTestCase(index, 'input', event.target.value)}
                                            required
                                            className={`${inputCls} font-mono text-sm`}
                                        />
                                    </Field>
                                    <Field label='Expected Output'>
                                        <textarea
                                            rows={3}
                                            value={testCase.expectedOutput}
                                            onChange={(event) => setTestCase(index, 'expectedOutput', event.target.value)}
                                            required
                                            className={`${inputCls} font-mono text-sm`}
                                        />
                                    </Field>
                                </div>
                            </div>
                        );
                    })}
                    <button
                        type='button'
                        onClick={addTestCase}
                        className='text-sm text-blue-600 dark:text-blue-400 hover:underline'
                    >
                        + Add test case
                    </button>
                </Section>

                <div className='flex items-center justify-between pt-4 border-t border-gray-200 dark:border-neutral-800'>
                    <label className='flex items-center gap-2 cursor-pointer'>
                        <input
                            type='checkbox'
                            checked={form.isPublished}
                            onChange={(event) => set('isPublished', event.target.checked)}
                            className='w-4 h-4'
                        />
                        <span className='text-sm text-gray-700 dark:text-gray-300'>
                            Publish immediately
                        </span>
                    </label>

                    <label className='flex items-center gap-2 cursor-pointer'>
                        <input
                            type='checkbox'
                            checked={form.isPremium}
                            onChange={(event) => set('isPremium', event.target.checked)}
                            className='w-4 h-4'
                        />
                        <span className='text-sm text-gray-700 dark:text-gray-300'>
                            Premium problem
                        </span>
                    </label>

                    <div className='flex gap-3'>
                        <button
                            type='button'
                            onClick={onBack}
                            className='px-4 py-2 text-sm border border-gray-300 dark:border-neutral-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800'
                        >
                            Cancel
                        </button>
                        <button
                            type='submit'
                            disabled={loading}
                            className='px-6 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            {loading ? loadingLabel : submitLabel}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

// reusable field wrapper
const Field = ({ label, children }) => (
    <div>
        <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5'>
            {label}
        </label>
        {children}
    </div>
);

// reusable section wrapper
const Section = ({ title, children }) => (
    <div className='bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 p-6 space-y-4'>
        <h2 className='text-base font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-neutral-800 pb-3'>
            {title}
        </h2>
        {children}
    </div>
);

const inputCls = 'w-full px-3 py-2 text-sm bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500';

const difficultyActive = {
    easy: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    medium: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    hard: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
};

export default ProblemCreateForm;