"use client";
import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext.js';
import { useRouter } from 'next/navigation';

export default function ProtectedLayout({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/account/login");
    }
  }, [loading, isAuthenticated]);

  if (loading) {
    return (
      <div className='w-full min-h-screen bg-gray-50 dark:bg-neutral-950 flex justify-center items-center'>
        <p className='text-gray-700 dark:text-gray-300'>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950">
      <main>{children}</main>
    </div>
  );
}