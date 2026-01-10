"use client";
import apiFetch from '@/services/api';
import React, { useEffect, useState } from 'react'
import { FiLogOut, FiSmartphone, FiMonitor, FiMapPin, FiClock } from 'react-icons/fi'
import { useAuth } from '@/context/AuthContext.js';

const DeviceIcon = ({ device }) => {
    const isMobile = device?.toLowerCase().includes('mobile') || 
                     device?.toLowerCase().includes('android') || 
                     device?.toLowerCase().includes('ios') ||
                     device?.toLowerCase().includes('iphone');
    
    return (
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-gray-200 text-gray-700 dark:bg-neutral-800 dark:text-gray-200">
            {isMobile ? <FiSmartphone /> : <FiMonitor />}
        </span>
    );
}

const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString();
}

const SessionsPage = () => {

    const { user, logout } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentSessionId, setCurrentSessionId] = useState(null);

    const fetchSessions = async () => {
        try {
            setLoading(true);
            const data = await apiFetch('user/sessions', {
                method: 'POST',
                body: JSON.stringify({}),
            });
            // console.log('Fetched sessions:', data.message.sessions);
            const activeSessions = data.message.sessions.filter(s => !s.revoked);
            // console.log('current session id:', data.message.currentSessionId);
            setSessions(activeSessions);
        } catch (error) {
            console.error('Error fetching sessions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogoutSession = async (sessionId) => {
        try {
            await apiFetch(`user/logout-device`, {
                method: 'POST',
                body: JSON.stringify({ sessionId }),
            });
            // Refresh the sessions list
            await fetchSessions();
        } catch (error) {
            console.error('Error logging out session:', error);
        }
    };

    const handleLogoutAllSessions = async () => {
        try {
            await apiFetch('user/logout-all-devices', {
                method: 'POST',
                body: JSON.stringify({}),
            });
            // Refresh the sessions list
            await logout();
        } catch (error) {
            console.error('Error logging out all sessions:', error);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    return (
        <div className="w-full bg-gray-50 dark:bg-neutral-950 min-h-screen px-6 py-12">
            <div className="mx-auto w-full max-w-4xl">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Active Sessions</h1>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Manage devices currently logged into your account. You have {sessions.length} active session{sessions.length !== 1 ? 's' : ''}.
                        </p>
                    </div>
                    {sessions.length > 1 && (
                        <button
                            type="button"
                            className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                            aria-label="Logout from all devices"
                            onClick={handleLogoutAllSessions}
                            disabled={loading}
                        >
                            <FiLogOut />
                            Logout all devices
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="mt-8 flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="mt-8 text-center py-12">
                        <p className="text-gray-600 dark:text-gray-400">No active sessions found.</p>
                    </div>
                ) : (
                    <div className="mt-8 space-y-4">
                        {sessions.map((s) => {
                            const isCurrentSession = s.sessionId === currentSessionId;
                            
                            return (
                                <div
                                    key={s._id}
                                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
                                >
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <DeviceIcon device={s.device} />
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                                                    {s.device || 'Unknown Device'}
                                                </p>
                                                {isCurrentSession && (
                                                    <span className="inline-flex items-center rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                                                        Current device
                                                    </span>
                                                )}
                                            </div>
                                            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600 dark:text-gray-400">
                                                {s.ip && (
                                                    <span className="inline-flex items-center gap-1">
                                                        <FiMapPin className="inline" /> IP: {s.ip}
                                                    </span>
                                                )}
                                                {s.lastActive && (
                                                    <span className="inline-flex items-center gap-1">
                                                        <FiClock className="inline" /> Last active: {formatTimeAgo(s.lastActive)}
                                                    </span>
                                                )}
                                                {s.createdAt && (
                                                    <span className="inline-flex items-center gap-1">
                                                        Created: {new Date(s.createdAt).toLocaleDateString()}
                                                    </span>
                                                )}
                                                {s.updatedAt && (
                                                    <span className="inline-flex items-center gap-1">
                                                        Updated: {formatTimeAgo(s.updatedAt)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {!isCurrentSession && (
                                        <button
                                            type="button"
                                            className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-neutral-700 dark:text-gray-200 dark:hover:bg-neutral-800 ml-4"
                                            aria-label={`Logout ${s.device}`}
                                            onClick={() => handleLogoutSession(s.sessionId)}
                                        >
                                            <FiLogOut />
                                            Logout
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

export default SessionsPage