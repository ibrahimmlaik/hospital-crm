"use client";

import { Bell, Settings, LogOut } from "lucide-react";
import { GlobalSearch } from "./GlobalSearch";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getNotifications, markAsRead } from "@/actions/notifications";
import { getCurrentUser, logout } from "@/actions/auth";

export default function TopBar() {
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [userId, setUserId] = useState<string | null>(null);

    const loadNotifications = useCallback(async () => {
        try {
            const user = await getCurrentUser();
            if (user) {
                setUserId(user.userId);
                const notifs = await getNotifications(user.userId);
                setNotifications(notifs);
            }
        } catch (err) {
            // Silently fail on polling errors
        }
    }, []);

    useEffect(() => {
        loadNotifications();
        const interval = setInterval(loadNotifications, 15000);
        return () => clearInterval(interval);
    }, [loadNotifications]);

    const handleNotificationClick = async (notifId: string) => {
        await markAsRead(notifId);
        setNotifications(prev => prev.map(n =>
            n.id === notifId ? { ...n, read: true } : n
        ));
    };

    const formatTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - new Date(date).getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);

        if (minutes < 1) return "Just now";
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <header className="h-16 border-b border-white/10 bg-[#0f172a]/95 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-6">
            {/* Global Search */}
            <GlobalSearch />

            {/* Right Actions */}
            <div className="flex items-center gap-2 relative ml-4">
                {/* Notifications */}
                <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 rounded-lg hover:bg-white/5 text-indigo-300 hover:text-white transition-colors"
                >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                        <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center animate-pulse">
                            {unreadCount}
                        </span>
                    )}
                </button>

                {/* Settings */}
                <Link href="/admin/settings" className="p-2 rounded-lg hover:bg-white/5 text-indigo-300 hover:text-white transition-colors">
                    <Settings size={18} />
                </Link>

                {/* Divider */}
                <div className="w-px h-6 bg-white/10 mx-1" />

                {/* Sign Out */}
                <button
                    onClick={() => logout()}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-300 hover:bg-red-500/20 transition-colors text-sm font-medium border border-red-500/20"
                >
                    <LogOut size={15} />
                    <span className="hidden sm:inline">Sign Out</span>
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                    <div className="absolute top-12 right-0 w-80 bg-[#1e293b] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
                        <div className="p-4 border-b border-white/10 flex justify-between items-center">
                            <h3 className="font-bold text-white text-sm">Notifications</h3>
                            <button onClick={() => setShowNotifications(false)} className="text-xs text-indigo-300 hover:text-white">Close</button>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-4 text-center text-indigo-400 text-sm">
                                    No notifications
                                </div>
                            ) : (
                                notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        onClick={() => handleNotificationClick(n.id)}
                                        className={`p-3 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors ${!n.read ? 'bg-teal-500/5' : ''}`}
                                    >
                                        <p className="text-sm text-white font-medium">{n.title}</p>
                                        <p className="text-xs text-indigo-300 mt-1">{n.message}</p>
                                        <p className="text-xs text-indigo-400 mt-1">{formatTime(n.createdAt)}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
