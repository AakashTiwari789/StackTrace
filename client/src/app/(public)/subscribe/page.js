import React from 'react'
import Link from 'next/link'
import { FaCheck, FaTimes, FaBolt, FaCrown } from 'react-icons/fa'

const plans = [
    {
        id: 'free',
        name: 'Free',
        price: '$0',
        period: 'forever',
        desc: 'Everything you need to get started and practice daily.',
        cta: 'Start for Free',
        ctaHref: '/account/register',
        gradient: null,
        highlight: false,
        features: [
            { text: 'All public problems', included: true },
            { text: 'Multi-language editor (C++, Java, Python, JS)', included: true },
            { text: 'Submission history', included: true },
            { text: 'Public profile & leaderboard', included: true },
            { text: 'Session management (up to 3 devices)', included: true },
            { text: 'Premium problems', included: false },
            { text: 'Detailed editorial walkthroughs', included: false },
            { text: 'Priority judging queue', included: false },
            { text: 'Advanced test case viewer', included: false },
        ],
    },
    {
        id: 'premium',
        name: 'Premium',
        price: null,
        period: null,
        desc: 'Unlock the full platform and accelerate your learning.',
        cta: 'Coming Soon',
        ctaHref: null,
        gradient: 'from-blue-500 to-violet-600',
        highlight: true,
        features: [
            { text: 'All public problems', included: true },
            { text: 'Multi-language editor (C++, Java, Python, JS)', included: true },
            { text: 'Submission history', included: true },
            { text: 'Public profile & leaderboard', included: true },
            { text: 'Session management (unlimited devices)', included: true },
            { text: 'Premium problems', included: true },
            { text: 'Detailed editorial walkthroughs', included: true },
            { text: 'Priority judging queue', included: true },
            { text: 'Advanced test case viewer', included: true },
        ],
    },
]

const faqs = [
    {
        q: 'Can I cancel anytime?',
        a: 'Yes. Cancel from your account settings at any time. You keep Premium access until the end of your billing period.',
    },
    {
        q: 'Is there a student discount?',
        a: 'We offer a 50% discount for verified students. Reach out via the Contact page with your student email.',
    },
    {
        q: 'What payment methods do you accept?',
        a: 'We accept all major credit cards and UPI (India). Payments are processed securely via Razorpay.',
    },
]

export default function SubscribePage() {
    return (
        <div className='w-full bg-gray-50 dark:bg-neutral-950 min-h-screen px-6 py-20'>
            <div className='max-w-5xl mx-auto'>

                {/* Header */}
                <div className='text-center mb-14'>
                    <span className='inline-block px-3 py-1 text-xs font-semibold tracking-widest uppercase rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 mb-4'>
                        Pricing
                    </span>
                    <h1 className='text-4xl font-extrabold text-gray-900 dark:text-white mb-3'>Simple, Honest Pricing</h1>
                    <p className='text-gray-500 dark:text-gray-400 max-w-xl mx-auto'>
                        Start for free. Upgrade when you want more — no tricks, no hidden fees.
                    </p>
                </div>

                {/* Pricing cards */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-8 mb-16'>
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`relative bg-white dark:bg-neutral-900 rounded-2xl border overflow-hidden transition-all duration-300 ${plan.highlight
                                ? 'border-transparent ring-2 ring-blue-500 shadow-2xl shadow-blue-500/20'
                                : 'border-gray-200 dark:border-neutral-800'
                                }`}
                        >
                            {plan.highlight && (
                                <div className='absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-violet-600' />
                            )}
                            {plan.highlight && (
                                <div className='absolute top-4 right-4'>
                                    <span className='flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-gradient-to-r from-blue-500 to-violet-600 text-white'>
                                        <FaCrown className='text-yellow-300 text-xs' /> Coming Soon
                                    </span>
                                </div>
                            )}

                            <div className='p-8'>
                                <div className='flex items-center gap-2 mb-1'>
                                    {plan.highlight ? <FaBolt className='text-yellow-400' /> : null}
                                    <h2 className='text-lg font-bold text-gray-900 dark:text-white'>{plan.name}</h2>
                                </div>
                                <p className='text-sm text-gray-500 dark:text-gray-400 mb-6'>{plan.desc}</p>

                                {plan.price ? (
                                    <div className='flex items-baseline gap-1 mb-8'>
                                        <span className='text-4xl font-extrabold text-gray-900 dark:text-white'>{plan.price}</span>
                                        <span className='text-sm text-gray-400'>/{plan.period}</span>
                                    </div>
                                ) : (
                                    <div className='flex items-center gap-2 mb-8'>
                                        <span className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm font-semibold'>
                                            🚧 Coming Soon — pricing TBA
                                        </span>
                                    </div>
                                )}

                                {plan.ctaHref ? (
                                    <Link
                                        href={plan.ctaHref}
                                        className={`block w-full text-center py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${plan.highlight
                                            ? 'bg-gradient-to-r from-blue-500 to-violet-600 text-white shadow-lg hover:shadow-blue-500/30 hover:scale-[1.02]'
                                            : 'border border-gray-300 dark:border-neutral-700 text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-neutral-800'
                                            }`}
                                    >
                                        {plan.cta}
                                    </Link>
                                ) : (
                                    <button
                                        disabled
                                        className='block w-full text-center py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-blue-400 to-violet-500 text-white opacity-60 cursor-not-allowed'
                                    >
                                        {plan.cta}
                                    </button>
                                )}

                                <ul className='mt-8 space-y-3'>
                                    {plan.features.map((f) => (
                                        <li key={f.text} className='flex items-start gap-3 text-sm'>
                                            {f.included
                                                ? <FaCheck className='text-emerald-500 mt-0.5 flex-shrink-0' />
                                                : <FaTimes className='text-gray-300 dark:text-gray-600 mt-0.5 flex-shrink-0' />
                                            }
                                            <span className={f.included ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-600 line-through'}>{f.text}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>

                {/* FAQs */}
                <div>
                    <h2 className='text-xl font-bold text-gray-900 dark:text-white mb-6 text-center'>Frequently Asked Questions</h2>
                    <div className='space-y-4'>
                        {faqs.map((faq) => (
                            <div key={faq.q} className='bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 p-5'>
                                <p className='font-semibold text-gray-900 dark:text-white text-sm mb-2'>{faq.q}</p>
                                <p className='text-sm text-gray-500 dark:text-gray-400'>{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}