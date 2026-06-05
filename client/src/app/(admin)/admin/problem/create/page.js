"use client";
import { useState } from 'react';
import apiFetch from '@/services/api';
import { useRouter } from 'next/navigation';

const LANGUAGES = ['cpp', 'python', 'javascript', 'java'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];
const TAGS = ['array', 'string', 'dp', 'graph', 'tree', 'math',
              'greedy', 'binary-search', 'two-pointer', 'sliding-window'];

const emptyExample = () => ({ input: '', output: '', explanation: '' });
const emptyTestCase = () => ({ input: '', expectedOutput: '', isSample: false });

export default function CreateProblemPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    title: '',
    difficulty: 'medium',
    tags: [],
    statement: '',
    inputFormat: '',
    outputFormat: '',
    constraints: '',
    timeLimit: 2000,
    memoryLimit: 256,
    examples: [emptyExample()],
    testCases: [emptyTestCase()],
    isPublished: false,
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  // examples
  const addExample = () => set('examples', [...form.examples, emptyExample()]);
  const removeExample = (i) => set('examples', form.examples.filter((_, idx) => idx !== i));
  const setExample = (i, key, val) => {
    const arr = [...form.examples];
    arr[i] = { ...arr[i], [key]: val };
    set('examples', arr);
  };

  // test cases
  const addTestCase = () => set('testCases', [...form.testCases, emptyTestCase()]);
  const removeTestCase = (i) => set('testCases', form.testCases.filter((_, idx) => idx !== i));
  const setTestCase = (i, key, val) => {
    const arr = [...form.testCases];
    arr[i] = { ...arr[i], [key]: val };
    set('testCases', arr);
  };

  // tags toggle
  const toggleTag = (tag) => {
    set('tags', form.tags.includes(tag)
      ? form.tags.filter(t => t !== tag)
      : [...form.tags, tag]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiFetch('admin/problems', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      router.push('/admin/problems');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className='flex items-center justify-between mb-8'>
        <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
          Create Problem
        </h1>
        <button
          onClick={() => router.push('/admin/problems')}
          className='text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
        >
          ← Back to problems
        </button>
      </div>

      {error && (
        <div className='bg-red-50 dark:bg-red-900/20 border border-red-300 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-6'>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className='space-y-8'>

        {/* Basic Info */}
        <Section title='Basic Info'>
          <Field label='Title'>
            <input
              type='text'
              value={form.title}
              onChange={e => set('title', e.target.value)}
              required
              placeholder='Two Sum'
              className={inputCls}
            />
          </Field>

          <Field label='Difficulty'>
            <div className='flex gap-3'>
              {DIFFICULTIES.map(d => (
                <button
                  key={d}
                  type='button'
                  onClick={() => set('difficulty', d)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition
                    ${form.difficulty === d
                      ? difficultyActive[d]
                      : 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400'
                    }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </Field>

          <Field label='Tags'>
            <div className='flex flex-wrap gap-2'>
              {TAGS.map(tag => (
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

        {/* Problem Statement */}
        <Section title='Problem Statement'>
          <p className='text-xs text-gray-500 mb-2'>Supports Markdown, LaTeX ($formula$), Mermaid (```mermaid)</p>
          <Field label='Statement'>
            <textarea
              value={form.statement}
              onChange={e => set('statement', e.target.value)}
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
                onChange={e => set('inputFormat', e.target.value)}
                rows={3}
                className={inputCls}
              />
            </Field>
            <Field label='Output Format'>
              <textarea
                value={form.outputFormat}
                onChange={e => set('outputFormat', e.target.value)}
                rows={3}
                className={inputCls}
              />
            </Field>
          </div>
          <Field label='Constraints'>
            <textarea
              value={form.constraints}
              onChange={e => set('constraints', e.target.value)}
              rows={3}
              placeholder='1 <= nums.length <= 10^4'
              className={inputCls}
            />
          </Field>
        </Section>

        {/* Limits */}
        <Section title='Limits'>
          <div className='grid grid-cols-2 gap-4'>
            <Field label='Time Limit (ms)'>
              <input
                type='number'
                value={form.timeLimit}
                onChange={e => set('timeLimit', Number(e.target.value))}
                min={500}
                max={10000}
                className={inputCls}
              />
            </Field>
            <Field label='Memory Limit (MB)'>
              <input
                type='number'
                value={form.memoryLimit}
                onChange={e => set('memoryLimit', Number(e.target.value))}
                min={64}
                max={1024}
                className={inputCls}
              />
            </Field>
          </div>
        </Section>

        {/* Examples */}
        <Section title='Examples (shown to users)'>
          {form.examples.map((ex, i) => (
            <div key={i} className='border border-gray-200 dark:border-neutral-700 rounded-lg p-4 space-y-3'>
              <div className='flex justify-between items-center'>
                <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>Example {i + 1}</span>
                {form.examples.length > 1 && (
                  <button type='button' onClick={() => removeExample(i)}
                    className='text-xs text-red-500 hover:text-red-700'>Remove</button>
                )}
              </div>
              <div className='grid grid-cols-2 gap-3'>
                <Field label='Input'>
                  <textarea rows={2} value={ex.input}
                    onChange={e => setExample(i, 'input', e.target.value)}
                    className={inputCls} />
                </Field>
                <Field label='Output'>
                  <textarea rows={2} value={ex.output}
                    onChange={e => setExample(i, 'output', e.target.value)}
                    className={inputCls} />
                </Field>
              </div>
              <Field label='Explanation (optional)'>
                <input type='text' value={ex.explanation}
                  onChange={e => setExample(i, 'explanation', e.target.value)}
                  className={inputCls} />
              </Field>
            </div>
          ))}
          <button type='button' onClick={addExample}
            className='text-sm text-blue-600 dark:text-blue-400 hover:underline'>
            + Add example
          </button>
        </Section>

        {/* Test Cases */}
        <Section title='Test Cases (hidden from users)'>
          <p className='text-xs text-red-500 mb-3'>These are used for judging. Never exposed to users.</p>
          {form.testCases.map((tc, i) => (
            <div key={i} className='border border-gray-200 dark:border-neutral-700 rounded-lg p-4 space-y-3'>
              <div className='flex justify-between items-center'>
                <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>Test Case {i + 1}</span>
                <div className='flex gap-3 items-center'>
                  <label className='flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400'>
                    <input type='checkbox' checked={tc.isSample}
                      onChange={e => setTestCase(i, 'isSample', e.target.checked)} />
                    Sample (visible)
                  </label>
                  {form.testCases.length > 1 && (
                    <button type='button' onClick={() => removeTestCase(i)}
                      className='text-xs text-red-500 hover:text-red-700'>Remove</button>
                  )}
                </div>
              </div>
              <div className='grid grid-cols-2 gap-3'>
                <Field label='Input'>
                  <textarea rows={3} value={tc.input}
                    onChange={e => setTestCase(i, 'input', e.target.value)}
                    required
                    className={`${inputCls} font-mono text-sm`} />
                </Field>
                <Field label='Expected Output'>
                  <textarea rows={3} value={tc.expectedOutput}
                    onChange={e => setTestCase(i, 'expectedOutput', e.target.value)}
                    required
                    className={`${inputCls} font-mono text-sm`} />
                </Field>
              </div>
            </div>
          ))}
          <button type='button' onClick={addTestCase}
            className='text-sm text-blue-600 dark:text-blue-400 hover:underline'>
            + Add test case
          </button>
        </Section>

        {/* Publish toggle + submit */}
        <div className='flex items-center justify-between pt-4 border-t border-gray-200 dark:border-neutral-800'>
          <label className='flex items-center gap-2 cursor-pointer'>
            <input
              type='checkbox'
              checked={form.isPublished}
              onChange={e => set('isPublished', e.target.checked)}
              className='w-4 h-4'
            />
            <span className='text-sm text-gray-700 dark:text-gray-300'>
              Publish immediately
            </span>
          </label>

          <div className='flex gap-3'>
            <button
              type='button'
              onClick={() => router.push('/admin/problems')}
              className='px-4 py-2 text-sm border border-gray-300 dark:border-neutral-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={loading}
              className='px-6 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {loading ? 'Creating...' : 'Create Problem'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

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