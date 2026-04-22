import { getPatientDashboardData } from "@/actions/patient-dashboard";
import { GlassCard } from "@/components/ui/glass-card";
import { Calendar, FileText, Pill, Clock, Plus, AlertTriangle } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PatientDashboard() {
    const data = await getPatientDashboardData();

    if (!data) {
        return (
            <div className="flex items-center justify-center h-96">
                <GlassCard className="p-8 text-center">
                    <AlertTriangle className="mx-auto text-red-400 mb-4" size={48} />
                    <h3 className="text-xl font-bold text-white mb-2">Access Denied</h3>
                    <p className="text-indigo-300">Unable to load patient data.</p>
                </GlassCard>
            </div>
        );
    }

    const { patient, nextAppointment, appointments, prescriptions } = data;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white">Welcome, {patient.name}</h1>
                    <p className="text-indigo-200">Manage your health journey</p>
                </div>
                <Link href="/patient/appointments">
                    <button className="bg-teal-500 hover:bg-teal-400 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-teal-500/20 transition-all">
                        <Plus size={18} /> Book Appointment
                    </button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Next Appointment - Real Data */}
                <GlassCard className="bg-gradient-to-br from-teal-500/10 to-teal-500/5 border-teal-500/20">
                    <h3 className="text-indigo-200 text-sm font-medium mb-1">Next Appointment</h3>
                    <div className="flex items-start gap-4 mt-2">
                        <div className="p-3 bg-teal-500 rounded-lg text-white shadow-lg shadow-teal-500/30">
                            <Calendar size={24} />
                        </div>
                        <div>
                            {nextAppointment ? (
                                <>
                                    <p className="text-xl font-bold text-white">
                                        {new Date(nextAppointment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </p>
                                    <p className="text-sm text-teal-300">
                                        {new Date(nextAppointment.date).toLocaleTimeString('en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })} • Dr. {nextAppointment.doctor.user.name}
                                    </p>
                                </>
                            ) : (
                                <p className="text-sm text-indigo-300">No upcoming appointments</p>
                            )}
                        </div>
                    </div>
                </GlassCard>

                {/* Active Prescriptions - Real Data */}
                <GlassCard className="bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 border-indigo-500/20">
                    <h3 className="text-indigo-200 text-sm font-medium mb-1">Active Prescriptions</h3>
                    <div className="flex items-start gap-4 mt-2">
                        <div className="p-3 bg-indigo-500 rounded-lg text-white shadow-lg shadow-indigo-500/30">
                            <Pill size={24} />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-white">{prescriptions.length}</p>
                            <p className="text-sm text-indigo-300">
                                {prescriptions.length === 0 ? "No active prescriptions" : "Active medications"}
                            </p>
                        </div>
                    </div>
                </GlassCard>

                {/* Total Appointments - Real Data */}
                <GlassCard className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
                    <h3 className="text-indigo-200 text-sm font-medium mb-1">Total Appointments</h3>
                    <div className="flex items-start gap-4 mt-2">
                        <div className="p-3 bg-blue-500 rounded-lg text-white shadow-lg shadow-blue-500/30">
                            <FileText size={24} />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-white">{appointments.length}</p>
                            <p className="text-sm text-blue-300">Medical visits</p>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Medical Timeline - Real Data */}
            <GlassCard>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">Medical Timeline</h3>
                    <Link href="/patient/history">
                        <button className="text-sm text-teal-300 hover:text-teal-200 transition-colors">
                            View Full History
                        </button>
                    </Link>
                </div>

                {appointments.length === 0 ? (
                    <div className="text-center py-12 text-indigo-300">
                        <Calendar className="mx-auto mb-4 opacity-50" size={48} />
                        <p className="mb-2">No medical history yet</p>
                        <Link href="/patient/appointments">
                            <button className="mt-4 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-white rounded-lg transition-all">
                                Book Your First Appointment
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div className="relative border-l-2 border-white/10 ml-3 space-y-8 pb-4">
                        {appointments.slice(0, 5).map((appointment, i) => (
                            <div key={appointment.id} className="ml-6 relative">
                                <div className="absolute -left-[31px] top-0 w-4 h-4 bg-teal-500 rounded-full border-4 border-[#0f172a]" />
                                <p className="text-xs text-indigo-300 mb-1">
                                    {new Date(appointment.date).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </p>
                                <h4 className="text-lg font-bold text-white">
                                    {appointment.reason || "Medical Consultation"}
                                </h4>
                                <p className="text-sm text-slate-300 mt-1">
                                    Status: <span className={`font-medium ${appointment.status === 'COMPLETED' ? 'text-emerald-400' :
                                        appointment.status === 'CONFIRMED' ? 'text-blue-400' :
                                            appointment.status === 'CANCELLED' ? 'text-red-400' :
                                                'text-amber-400'
                                        }`}>{appointment.status}</span>
                                </p>
                                <div className="flex items-center gap-2 mt-2 text-xs text-indigo-400 font-medium bg-white/5 inline-flex px-2 py-1 rounded">
                                    Dr. {appointment.doctor.user.name} • {appointment.department?.name || "General"}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </GlassCard>
        </div>
    );
}
