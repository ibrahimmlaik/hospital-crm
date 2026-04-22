"use client";

import { useState, useEffect } from "react";
import { clockIn, clockOut, getMyAttendance } from "@/actions/attendance";
import { GlassCard } from "@/components/ui/glass-card";
import { Clock, LogIn, LogOut, Calendar } from "lucide-react";
import { motion } from "framer-motion";

export default function AttendanceWidget() {
    const [loading, setLoading] = useState(false);
    const [todayAttendance, setTodayAttendance] = useState<any>(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        loadTodayAttendance();
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const loadTodayAttendance = async () => {
        const attendance = await getMyAttendance();
        const now = new Date();

        // Get all attendance records for today
        const todayRecords = attendance.filter((a: any) => {
            const recordDate = new Date(a.date);
            return recordDate.toDateString() === now.toDateString();
        });

        // Find the most recent record (could be active or completed)
        const mostRecent = todayRecords.sort((a: any, b: any) => {
            return new Date(b.clockIn).getTime() - new Date(a.clockIn).getTime();
        })[0];

        setTodayAttendance(mostRecent || null);
    };

    const handleClockIn = async () => {
        setLoading(true);
        const result = await clockIn();
        if (result.success) {
            await loadTodayAttendance();
        } else {
            alert(result.error);
        }
        setLoading(false);
    };

    const handleClockOut = async () => {
        setLoading(true);
        const result = await clockOut();
        if (result.success) {
            await loadTodayAttendance();
            alert(`Clocked out! Total hours: ${result.totalHours}`);
        } else {
            alert(result.error);
        }
        setLoading(false);
    };


    const isClockedIn = todayAttendance && !todayAttendance.clockOut;
    const isClockedOut = todayAttendance && todayAttendance.clockOut;

    return (
        <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-teal-500/20 rounded-full">
                    <Clock className="text-teal-300" size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">Attendance</h3>
                    <p className="text-sm text-indigo-300" suppressHydrationWarning>
                        {currentTime.toLocaleTimeString()}
                    </p>
                </div>
            </div>

            {!todayAttendance && (
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleClockIn}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    <LogIn size={20} />
                    {loading ? "Processing..." : "Clock In"}
                </motion.button>
            )}

            {isClockedIn && (
                <div className="space-y-4">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                        <p className="text-sm text-emerald-300 mb-1">Clocked In</p>
                        <p className="text-2xl font-bold text-white">
                            {new Date(todayAttendance.clockIn).toLocaleTimeString()}
                        </p>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleClockOut}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <LogOut size={20} />
                        {loading ? "Processing..." : "Clock Out"}
                    </motion.button>
                </div>
            )}

            {isClockedOut && (
                <div className="space-y-3">
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                        <p className="text-sm text-blue-300 mb-1">Shift Completed</p>
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-xs text-indigo-300">Clock In</p>
                                <p className="text-lg font-bold text-white">
                                    {new Date(todayAttendance.clockIn).toLocaleTimeString()}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-indigo-300">Clock Out</p>
                                <p className="text-lg font-bold text-white">
                                    {new Date(todayAttendance.clockOut).toLocaleTimeString()}
                                </p>
                            </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-white/10">
                            <p className="text-xs text-indigo-300">Total Hours</p>
                            <p className="text-2xl font-bold text-teal-300">
                                {todayAttendance.totalHours} hrs
                            </p>
                        </div>
                    </div>

                    {/* Allow clocking in again for a new shift */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleClockIn}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white font-bold py-3 rounded-xl shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <LogIn size={20} />
                        {loading ? "Processing..." : "Clock In Again"}
                    </motion.button>
                </div>
            )}
        </GlassCard>
    );
}
