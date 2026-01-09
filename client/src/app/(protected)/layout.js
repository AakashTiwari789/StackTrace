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

  if (loading) return <p>Loading...</p>;
  if (!isAuthenticated) return null;

  return (
    <div className="flex">
      <main>{children}</main>
    </div>
  );
}