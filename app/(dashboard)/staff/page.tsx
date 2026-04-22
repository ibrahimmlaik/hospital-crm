import { getStaffDashboardData } from "@/actions/staff-dashboard";
import { GlassCard } from "@/components/ui/glass-card";
import { Users, BedDouble, FilePlus, ClipboardList, AlertTriangle } from "lucide-react";
import Link from "next/link";
import AttendanceWidget from "@/components/attendance/AttendanceWidget";

export const dynamic = "force-dynamic";

export default async function StaffDashboard() {
    const data = await getStaffDashboardData();

    if (!data) {
        return (
            <div className="flex items-center justify-center h-96">
                <GlassCard className="p-8 text-center">
                    <AlertTriangle className="mx-auto text-red-400 mb-4" size={48} />
                    <h3 className="text-xl font-bold text-white mb-2">Access Denied</h3>
                    <p className="text-indigo-300">Unable to load staff data.</p>
                </GlassCard>
            </div>
        );
    }

    const { user, beds, stats } = data;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white">Staff Dashboard</h1>
                <p className="text-indigo-200">{user.name} • {user.role.replace('STAFF_', '').replace('_', ' ')}</p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Link href="/staff/registration">
                    <GlassCard className="hover:bg-teal-500/20 border-teal-500/30 cursor-pointer transition-colors group h-full">
                        <div className="flex flex-col items-center text-center gap-3 py-2">
                            <div className="p-3 bg-teal-500 rounded-lg text-white group-hover:scale-110 transition-transform">
                                <FilePlus size={24} />
                            </div>
                            <span className="font-bold text-white">Register Patient</span>
                        </div>
                    </GlassCard>
                </Link>
                <Link href="/staff/wards">
                    <GlassCard className="hover:bg-indigo-500/20 border-indigo-500/30 cursor-pointer transition-colors group h-full">
                        <div className="flex flex-col items-center text-center gap-3 py-2">
                            <div className="p-3 bg-indigo-500 rounded-lg text-white group-hover:scale-110 transition-transform">
                                <BedDouble size={24} />
                            </div>
                            <span className="font-bold text-white">Manage Admission</span>
                        </div>
                    </GlassCard>
                </Link>
                <Link href="/staff/billing">
                    <GlassCard className="hover:bg-blue-500/20 border-blue-500/30 cursor-pointer transition-colors group h-full">
                        <div className="flex flex-col items-center text-center gap-3 py-2">
                            <div className="p-3 bg-blue-500 rounded-lg text-white group-hover:scale-110 transition-transform">
                                <ClipboardList size={24} />
                            </div>
                            <span className="font-bold text-white">Create Invoice</span>
                        </div>
                    </GlassCard>
                </Link>

                {/* Attendance Widget for Staff */}
                <AttendanceWidget />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Ward Occupancy - Real Data */}
                <GlassCard>
                    <h3 className="text-xl font-bold text-white mb-6">Ward Occupancy</h3>
                    {beds.length === 0 ? (
                        <div className="text-center py-12 text-indigo-300">
                            <BedDouble className="mx-auto mb-4 opacity-50" size={48} />
                            <p className="mb-2">No beds configured</p>
                            <p className="text-sm">Contact admin to set up wards and beds</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-5 gap-2">
                                {beds.map((bed) => {
                                    const color =
                                        bed.status === 'OCCUPIED' ? 'bg-red-500/60' :
                                            bed.status === 'CLEANING' ? 'bg-amber-500/60' :
                                                'bg-emerald-500/40';
                                    return (
                                        <div
                                            key={bed.id}
                                            className={`aspect-square rounded-lg ${color} flex items-center justify-center text-xs font-bold text-white border border-white/10 hover:border-white/50 transition-colors cursor-pointer`}
                                            title={`Bed ${bed.bedNumber} - ${bed.status}`}
                                        >
                                            {bed.bedNumber}
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex gap-4 mt-4 text-xs text-indigo-200 justify-center">
                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded bg-red-500/60"></span> Occupied ({stats.occupiedBeds})
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded bg-amber-500/60"></span> Cleaning ({stats.cleaningBeds})
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded bg-emerald-500/40"></span> Available ({stats.availableBeds})
                                </span>
                            </div>
                        </>
                    )}
                </GlassCard>

                {/* Today's Appointments */}
                <GlassCard>
                    <h3 className="text-xl font-bold text-white mb-6">Today's Appointments</h3>
                    <div className="space-y-4">
                        {stats.todayAppointments === 0 ? (
                            <div className="text-center py-12 text-indigo-300">
                                <Users className="mx-auto mb-4 opacity-50" size={48} />
                                <p>No appointments scheduled for today</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                    <p className="text-sm text-indigo-200">Total Today</p>
                                    <p className="text-2xl font-bold text-white">{stats.todayAppointments}</p>
                                </div>
                                <div className="p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                    <p className="text-sm text-indigo-200">Completed</p>
                                    <p className="text-2xl font-bold text-white">{stats.completedToday}</p>
                                </div>
                                <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                                    <p className="text-sm text-indigo-200">Pending</p>
                                    <p className="text-2xl font-bold text-white">{stats.pendingToday}</p>
                                </div>
                                <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                                    <p className="text-sm text-indigo-200">Total Patients</p>
                                    <p className="text-2xl font-bold text-white">{stats.totalPatients}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
