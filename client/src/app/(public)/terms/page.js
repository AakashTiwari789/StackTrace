import React from 'react'

const TermsAndConditionsPage = () => {
    return (
        <div className='w-full bg-gray-50 dark:bg-neutral-950 min-h-screen px-6 py-20'>
            <div className='max-w-3xl mx-auto text-gray-900 dark:text-white'>
                <h1 className='text-4xl font-bold mb-8'>Terms & Conditions</h1>
                <p className='text-gray-600 dark:text-gray-400 mb-8'>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

                <div className='space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed'>
                    <section>
                        <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>1. Acceptance of Terms</h2>
                        <p>By accessing or using StackTrace, you agree to be bound by these Terms & Conditions. If you disagree with any part, you may not use the platform.</p>
                    </section>

                    <section>
                        <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>2. Account Registration</h2>
                        <p>You must provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account.</p>
                    </section>

                    <section>
                        <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>3. Acceptable Use</h2>
                        <p>You agree not to: submit malicious code intended to exploit the judging system, attempt to access other users&apos; accounts, scrape or reverse-engineer platform content, or use automated tools to farm submissions.</p>
                    </section>

                    <section>
                        <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>4. Code Submissions</h2>
                        <p>Code you submit for evaluation is executed in a sandboxed environment. StackTrace is not liable for any loss resulting from code execution. You retain ownership of code you write, but grant us a license to store and display it within the platform (e.g. submission history).</p>
                    </section>

                    <section>
                        <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>5. Premium Subscriptions</h2>
                        <p>Premium features are billed as described at checkout. Subscriptions may be cancelled at any time; access continues until the end of the current billing period. Refunds are handled on a case-by-case basis.</p>
                    </section>

                    <section>
                        <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>6. Termination</h2>
                        <p>We reserve the right to suspend or terminate accounts that violate these terms, including but not limited to abuse of the judging system or harassment of other users.</p>
                    </section>

                    <section>
                        <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>7. Limitation of Liability</h2>
                        <p>StackTrace is provided &quot;as is&quot; without warranties of any kind. We are not liable for downtime, data loss, or indirect damages arising from use of the platform.</p>
                    </section>

                    <section>
                        <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>8. Changes to Terms</h2>
                        <p>We may update these terms from time to time. Continued use of the platform after changes constitutes acceptance of the updated terms.</p>
                    </section>

                    <section>
                        <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>9. Contact</h2>
                        <p>Questions about these terms? Reach out via the Contact page.</p>
                    </section>
                </div>
            </div>
        </div>
    )
}

export default TermsAndConditionsPage