// app/(admin)/layout.js
"use client";
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({ children }) {
    const { user, loading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;
        if (!isAuthenticated) {
            router.replace('/account/login');
            return;
        }
        if (user?.role !== 'admin') {
            router.replace('/');   // kick non-admins to home
        }
    }, [loading, isAuthenticated, user]);

    if (loading) return (
        <div className='min-h-screen flex items-center justify-center'>
            <p className='text-gray-500'>Loading...</p>
        </div>
    );

    if (!isAuthenticated || user?.role !== 'admin') return null;

    return (
        <div className='min-h-screen bg-gray-50 dark:bg-neutral-950'>
            <div className='max-w-7xl mx-auto px-6 py-8'>
                {children}
            </div>
        </div>
    );
}