"use client"
import React from 'react'
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const ProfilePage = () => {
    const router = useRouter();
    const loggedInUser = useAuth().user;
    // console.log('Logged in user in profile page:', loggedInUser);

    return (
        <div className='w-full bg-white dark:bg-neutral-950 min-h-screen flex flex-col justify-center items-center px-6 py-20'>
            {
                !!loggedInUser ? (
                    <div className='text-center'>
                        <h1 className='text-3xl font-bold mb-4'>Welcome, {loggedInUser.username}!</h1>
                        <p className='text-gray-600 dark:text-gray-400 mb-6'>This is your profile page.</p>
                        <button
                            onClick={() => router.push(`/profile/${loggedInUser.username}`)}
                            className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition'
                        >
                            View Full Profile
                        </button>
                    </div>
                ) : (
                    <div className='text-center'>
                        <h1 className='text-3xl font-bold mb-4'>You are not logged in</h1>
                        <p className='text-gray-600 dark:text-gray-400 mb-6'>Please log in to view your profile.</p>
                        <button
                            onClick={() => router.push('/account/login')}
                            className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition'
                        >
                            Go to Login
                        </button>
                    </div>
                )
            }
        </div>
    )
}

export default ProfilePage