import React from 'react'

const PrivacyPage = () => {
    return (
        <div className='w-full bg-gray-50 dark:bg-neutral-950 min-h-screen px-6 py-20'>
            <div className='max-w-3xl mx-auto text-gray-900 dark:text-white'>
                <h1 className='text-4xl font-bold mb-8'>Privacy Policy</h1>
                <p className='text-gray-600 dark:text-gray-400 mb-8'>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

                <div className='space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed'>
                    <section>
                        <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>1. Information We Collect</h2>
                        <p>We collect information you provide directly: email, username, password (hashed), and profile photo. When you sign in with Google, we receive your name, email, and profile picture from Google. We also log device info, IP address, and session data for security purposes.</p>
                    </section>

                    <section>
                        <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>2. How We Use Your Information</h2>
                        <p>Your data is used to: authenticate your account, track problem-solving progress and statistics, send verification emails and OTPs, manage active sessions across devices, and improve platform features.</p>
                    </section>

                    <section>
                        <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>3. Code Submissions</h2>
                        <p>Code you submit is stored to display your submission history and is executed in an isolated sandbox (Judge0) for evaluation. We do not share your submitted code with third parties.</p>
                    </section>

                    <section>
                        <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>4. Cookies & Sessions</h2>
                        <p>We use httpOnly cookies to store access and refresh tokens for authentication. These are essential for the platform to function and cannot be disabled while remaining logged in.</p>
                    </section>

                    <section>
                        <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>5. Third-Party Services</h2>
                        <p>We use Google OAuth for sign-in, ImageKit for profile photo storage, and Judge0 for code execution. Each is governed by its own privacy policy.</p>
                    </section>

                    <section>
                        <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>6. Data Retention</h2>
                        <p>Account data is retained as long as your account is active. You may request account deletion via the Contact page; we will remove your personal data within a reasonable timeframe, excluding data required for legal/security purposes.</p>
                    </section>

                    <section>
                        <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>7. Data Security</h2>
                        <p>Passwords are hashed with bcrypt. Tokens are stored in httpOnly, secure cookies. We use Redis for token revocation to invalidate sessions immediately when needed.</p>
                    </section>

                    <section>
                        <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>8. Your Rights</h2>
                        <p>You may access, update, or delete your profile information at any time from your account settings. You can log out of individual devices or all devices from the Sessions page.</p>
                    </section>

                    <section>
                        <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>9. Changes to This Policy</h2>
                        <p>We may update this policy periodically. Material changes will be communicated via email or an in-app notice.</p>
                    </section>

                    <section>
                        <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>10. Contact</h2>
                        <p>Privacy questions or data requests? Reach out via the Contact page.</p>
                    </section>
                </div>
            </div>
        </div>
    )
}

export default PrivacyPage