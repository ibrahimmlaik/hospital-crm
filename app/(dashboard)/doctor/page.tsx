import { getDoctorDashboardData } from "@/actions/doctor-dashboard";
import { GlassCard } from "@/components/ui/glass-card";
import { Calendar, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import AttendanceWidget from "@/components/attendance/AttendanceWidget";

export const dynamic = "force-dynamic";

export default async function DoctorDashboard() {
    const data = await getDoctorDashboardData();

    if (!data) {
        return (
            <div className="flex items-center justify-center h-96">
                <GlassCard className="p-8 text-center">
                    <AlertTriangle className="mx-auto text-red-400 mb-4" size={48} />
                    <h3 className="text-xl font-bold text-white mb-2">Access Denied</h3>
                    <p className="text-indigo-300">Unable to load doctor data.</p>
                </GlassCard>
            </div>
        );
    }

    const { doctor, stats, todayAppointments } = data;

    // Dynamic greeting based on time
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white">{greeting}, Dr. {doctor.user.name}</h1>
                <p className="text-indigo-200">Here is your daily overview • {doctor.departments?.[0]?.department?.name || "General"}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <GlassCard className="bg-teal-500/10 border-teal-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-teal-500/20 text-teal-300">
                            <Calendar size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-indigo-200">Today's Appointments</p>
                            <h3 className="text-2xl font-bold text-white">{stats.todayAppointments}</h3>
                        </div>
                    </div>
                </GlassCard>
                <GlassCard className="bg-blue-500/10 border-blue-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-blue-500/20 text-blue-300">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-indigo-200">Total Appointments</p>
                            <h3 className="text-2xl font-bold text-white">{stats.totalAppointments}</h3>
                        </div>
                    </div>
                </GlassCard>
                <GlassCard className="bg-indigo-500/10 border-indigo-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-indigo-500/20 text-indigo-300">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-indigo-200">Completed</p>
                            <h3 className="text-2xl font-bold text-white">{stats.completedAppointments}</h3>
                        </div>
                    </div>
                </GlassCard>

                {/* Attendance Widget */}
                <AttendanceWidget />
            </div>

            {/* Today's Appointments */}
            <GlassCard>
                <h3 className="text-xl font-bold text-white mb-6">Today's Schedule</h3>
                {todayAppointments.length === 0 ? (
                    <div className="text-center py-12 text-indigo-300">
                        <Calendar className="mx-auto mb-4 opacity-50" size={48} />
                        <p>No appointments scheduled for today</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {todayAppointments.map((appointment) => (
                            <div
                                key={appointment.id}
                                className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-teal-500/20 rounded-lg">
                                        <Clock className="text-teal-300" size={20} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">{appointment.patient.user?.name || "Unknown Patient"}</p>
                                        <p className="text-sm text-indigo-300">{appointment.reason || "General Consultation"}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-white">
                                        {new Date(appointment.date).toLocaleTimeString('en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                    <span className={`text-xs px-2 py-1 rounded-full ${appointment.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300' :
                                        appointment.status === 'CONFIRMED' ? 'bg-blue-500/20 text-blue-300' :
                                            appointment.status === 'CANCELLED' ? 'bg-red-500/20 text-red-300' :
                                                'bg-amber-500/20 text-amber-300'
                                        }`}>
                                        {appointment.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </GlassCard>
        </div>
    );
}
