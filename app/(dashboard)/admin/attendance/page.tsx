import { getAllAttendance } from "@/actions/attendance";
import { GlassCard } from "@/components/ui/glass-card";
import { Calendar, Clock, Users, TrendingUp } from "lucide-react";
import AttendanceTableClient from "@/components/admin/AttendanceTableClient";

export const dynamic = "force-dynamic";

export default async function AdminAttendancePage() {
    const result = await getAllAttendance();
    const attendance = result.success && result.data ? result.data : [];

    // Calculate stats
    const totalRecords = attendance.length;
    const present = attendance.filter((a: any) => a.status === "PRESENT").length;
    const totalHours = attendance.reduce((sum: number, a: any) => sum + (a.totalHours || 0), 0);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white">Attendance Management</h1>
                <p className="text-indigo-200">Track and manage employee attendance</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <GlassCard className="bg-teal-500/10 border-teal-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-teal-500/20 text-teal-300">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-indigo-200">Total Records</p>
                            <h3 className="text-2xl font-bold text-white">{totalRecords}</h3>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="bg-emerald-500/10 border-emerald-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-emerald-500/20 text-emerald-300">
                            <Calendar size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-indigo-200">Present</p>
                            <h3 className="text-2xl font-bold text-white">{present}</h3>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="bg-blue-500/10 border-blue-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-blue-500/20 text-blue-300">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-indigo-200">Total Hours</p>
                            <h3 className="text-2xl font-bold text-white">{Math.round(totalHours)}</h3>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="bg-purple-500/10 border-purple-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-purple-500/20 text-purple-300">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-indigo-200">Avg Hours/Day</p>
                            <h3 className="text-2xl font-bold text-white">
                                {totalRecords > 0 ? (totalHours / totalRecords).toFixed(1) : 0}
                            </h3>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Attendance Table */}
            <GlassCard className="p-0 overflow-hidden">
                <AttendanceTableClient attendance={attendance} />
            </GlassCard>
        </div>
    );
}
