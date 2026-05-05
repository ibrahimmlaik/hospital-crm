"use client";

import { Bell, LogOut, Menu } from "lucide-react";
import { GlobalSearch } from "./GlobalSearch";
import { useState, useEffect, useCallback } from "react";
import { getNotifications, markAsRead } from "@/actions/notifications";
import { logout } from "@/actions/auth";
import { useSidebar } from "@/lib/sidebar-context";

export default function TopBar() {
    const { toggle } = useSidebar();
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [userId, setUserId] = useState<string | null>(null);

    const loadNotifications = useCallback(async (uid: string) => {
        try {
            const notifs = await getNotifications(uid);
            setNotifications(notifs);
        } catch {
            // Silently fail
        }
    }, []);

    // Get user ID once on mount via /api/me (JWT-only, no DB query)
    useEffect(() => {
        fetch("/api/me")
            .then(r => r.ok ? r.json() : null)
            .then((user) => {
                if (user?.userId) {
                    setUserId(user.userId);
                    loadNotifications(user.userId);
                }
            })
            .catch(() => {});
    }, [loadNotifications]);

    // Poll every 30 seconds
    useEffect(() => {
        if (!userId) return;
        const interval = setInterval(() => loadNotifications(userId), 30000);
        return () => clearInterval(interval);
    }, [userId, loadNotifications]);

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
        <header className="h-14 sm:h-16 border-b border-white/10 bg-[#0f172a]/95 backdrop-blur-md sticky top-0 z-40 flex items-center gap-3 px-3 sm:px-6">

            {/* ── Hamburger — mobile only ── */}
            <button
                onClick={toggle}
                className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-indigo-300 hover:text-white transition-colors flex-shrink-0"
                aria-label="Open navigation menu"
            >
                <Menu size={22} />
            </button>

            {/* Global Search — grows to fill space */}
            <div className="flex-1 min-w-0">
                <GlobalSearch />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1 sm:gap-2 relative flex-shrink-0">

                {/* Notifications */}
                <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 rounded-lg hover:bg-white/5 text-indigo-300 hover:text-white transition-colors"
                    aria-label="Notifications"
                >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                        <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center animate-pulse">
                            {unreadCount}
                        </span>
                    )}
                </button>

                {/* Divider */}
                <div className="w-px h-6 bg-white/10 mx-0.5 sm:mx-1" />

                {/* Sign Out */}
                <button
                    onClick={() => logout()}
                    className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-red-500/10 text-red-300 hover:bg-red-500/20 transition-colors text-sm font-medium border border-red-500/20"
                >
                    <LogOut size={15} />
                    <span className="hidden sm:inline">Sign Out</span>
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                    <div className="absolute top-12 right-0 w-[calc(100vw-2rem)] max-w-xs sm:w-80 bg-[#1e293b] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
                        <div className="p-4 border-b border-white/10 flex justify-between items-center">
                            <h3 className="font-bold text-white text-sm">Notifications</h3>
                            <button onClick={() => setShowNotifications(false)} className="text-xs text-indigo-300 hover:text-white">Close</button>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-4 text-center text-indigo-400 text-sm">No notifications</div>
                            ) : (
                                notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        onClick={() => handleNotificationClick(n.id)}
                                        className={`p-3 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors ${!n.read ? 'bg-teal-500/5' : ''}`}
                                    >
                                        <p className="text-sm text-white font-medium">{n.title}</p>
                                        <p className="text-xs text-indigo-300 mt-1 line-clamp-2">{n.message}</p>
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
