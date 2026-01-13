"use client"
import apiFetch from '@/services/api';
import React, { useState, useEffect, use } from 'react'
import { HiOutlineMailOpen, HiCalendar, HiCheckCircle, HiXCircle } from 'react-icons/hi';

const ProfilePage = ({ params }) => {
  const { username } = use(params);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await apiFetch(`user/${username}`);
        // console.log('Fetched user data:', data);
        setUser(data.data.user);
      } catch (err) {
        setError(err.message || 'Failed to load profile');
        console.error(`error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  if (loading) {
    return (
      <div className='w-full bg-white dark:bg-neutral-950 min-h-screen flex flex-col justify-center items-center px-6 py-20'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
        <p className='mt-4 text-gray-600 dark:text-gray-400'>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='w-full bg-white dark:bg-neutral-950 min-h-screen flex flex-col justify-center items-center px-6 py-20'>
        <div className='text-red-500 text-lg font-semibold'>Error</div>
        <p className='mt-2 text-gray-600 dark:text-gray-400'>{error}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className='w-full bg-white dark:bg-neutral-950 min-h-screen flex flex-col justify-center items-center px-6 py-20'>
        <p className='text-gray-600 dark:text-gray-400'>User not found</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className='w-full bg-white dark:bg-neutral-950 min-h-screen px-6 py-12'>
      <div className='max-w-2xl mx-auto'>
        
        {/* Profile Header */}
        <div className='bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-2xl p-8 text-white text-center'>
          <div className='flex justify-center mb-6'>
            {user.imageUrl ? (
              <img 
                src={user.imageUrl} 
                alt={user.fullName}
                className='w-24 h-24 rounded-full border-4 border-white object-cover'
              />
            ) : (
              <div className='w-24 h-24 rounded-full bg-blue-400 border-4 border-white flex items-center justify-center text-4xl font-bold'>
                {user.fullName?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <h1 className='text-4xl font-bold mb-2'>{user.fullName}</h1>
          <p className='text-blue-100 text-lg'>@{user.username}</p>
        </div>

        {/* Profile Details */}
        <div className='bg-gray-50 dark:bg-neutral-900 rounded-b-2xl p-8 shadow-lg'>
          
          {/* Verification & Role */}
          <div className='grid grid-cols-2 gap-4 mb-8'>
            <div className='bg-white dark:bg-neutral-800 rounded-lg p-4'>
              <div className='flex items-center space-x-2 mb-2'>
                {user.isVerified ? (
                  <HiCheckCircle className='text-green-500 text-xl' />
                ) : (
                  <HiXCircle className='text-yellow-500 text-xl' />
                )}
                <span className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                  {user.isVerified ? 'Verified' : 'Not Verified'}
                </span>
              </div>
            </div>
            <div className='bg-white dark:bg-neutral-800 rounded-lg p-4'>
              <p className='text-xs font-medium text-gray-600 dark:text-gray-400 mb-1'>Role</p>
              <p className='text-sm font-semibold text-gray-900 dark:text-white capitalize'>
                {user.role}
              </p>
            </div>
          </div>

          {/* Email */}
          <div className='bg-white dark:bg-neutral-800 rounded-lg p-4 mb-6'>
            <div className='flex items-start space-x-3'>
              <HiOutlineMailOpen className='text-xl text-blue-500 mt-1 flex-shrink-0' />
              <div>
                <p className='text-xs font-medium text-gray-600 dark:text-gray-400 mb-1'>Email Address</p>
                <p className='text-base font-semibold text-gray-900 dark:text-white break-all'>{user.email}</p>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='bg-white dark:bg-neutral-800 rounded-lg p-4'>
              <div className='flex items-start space-x-3'>
                <HiCalendar className='text-xl text-green-500 mt-1 flex-shrink-0' />
                <div>
                  <p className='text-xs font-medium text-gray-600 dark:text-gray-400 mb-1'>Joined</p>
                  <p className='text-sm font-semibold text-gray-900 dark:text-white'>{formatDate(user.createdAt)}</p>
                </div>
              </div>
            </div>
            <div className='bg-white dark:bg-neutral-800 rounded-lg p-4'>
              <div className='flex items-start space-x-3'>
                <HiCalendar className='text-xl text-blue-500 mt-1 flex-shrink-0' />
                <div>
                  <p className='text-xs font-medium text-gray-600 dark:text-gray-400 mb-1'>Last Updated</p>
                  <p className='text-sm font-semibold text-gray-900 dark:text-white'>{formatDate(user.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* User ID */}
          <div className='bg-gray-100 dark:bg-neutral-700 rounded-lg p-4 mt-6'>
            <p className='text-xs font-medium text-gray-600 dark:text-gray-400 mb-1'>User ID</p>
            <p className='text-xs text-gray-700 dark:text-gray-300 font-mono break-all'>{user._id}</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;