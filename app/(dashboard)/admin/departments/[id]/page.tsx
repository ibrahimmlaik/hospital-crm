import { getDepartmentById, getAvailableDoctors, getAvailableStaff, getDepartmentStats } from "@/actions/departments";
import { GlassCard } from "@/components/ui/glass-card";
import { ArrowLeft, Edit, Building2, UserPlus, Users, Activity } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DoctorAssignmentList } from "@/components/departments/DoctorAssignmentList";
import { StaffAssignmentList } from "@/components/departments/StaffAssignmentList";

export const dynamic = "force-dynamic";

export default async function DepartmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: departmentId } = await params;
    const department = await getDepartmentById(departmentId);

    if (!department) {
        notFound();
    }

    const stats = await getDepartmentStats(departmentId);
    const availableDoctors = await getAvailableDoctors(departmentId);
    const availableStaff = await getAvailableStaff(departmentId);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/departments">
                        <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-all">
                            <ArrowLeft size={20} />
                        </button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-white">{department.name}</h1>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${department.isActive
                                ? "bg-emerald-500/20 text-emerald-300"
                                : "bg-red-500/20 text-red-300"
                                }`}>
                                {department.isActive ? "Active" : "Inactive"}
                            </span>
                        </div>
                        <p className="text-indigo-200">{department.description || "No description"}</p>
                    </div>
                </div>
                <Link href={`/admin/departments/${departmentId}/edit`}>
                    <button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2">
                        <Edit size={20} />
                        Edit Department
                    </button>
                </Link>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <GlassCard className="bg-blue-500/10 border-blue-500/20">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-blue-500/20 text-blue-300">
                                <UserPlus size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-indigo-200">Doctors</p>
                                <h3 className="text-2xl font-bold text-white">{stats.totalDoctors}</h3>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard className="bg-purple-500/10 border-purple-500/20">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-purple-500/20 text-purple-300">
                                <Users size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-indigo-200">Staff</p>
                                <h3 className="text-2xl font-bold text-white">{stats.totalStaff}</h3>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard className="bg-teal-500/10 border-teal-500/20">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-teal-500/20 text-teal-300">
                                <Building2 size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-indigo-200">Total Employees</p>
                                <h3 className="text-2xl font-bold text-white">{stats.totalEmployees}</h3>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard className="bg-emerald-500/10 border-emerald-500/20">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-emerald-500/20 text-emerald-300">
                                <Activity size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-indigo-200">Appointments (This Month)</p>
                                <h3 className="text-2xl font-bold text-white">{stats.totalAppointments}</h3>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            )}

            {/* Doctors Section */}
            <GlassCard>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <UserPlus className="text-blue-300" size={24} />
                    Assigned Doctors
                </h2>
                <DoctorAssignmentList
                    departmentId={departmentId}
                    assignedDoctors={department.doctors}
                    availableDoctors={availableDoctors}
                />
            </GlassCard>

            {/* Staff Section */}
            <GlassCard>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <Users className="text-purple-300" size={24} />
                    Assigned Staff
                </h2>
                <StaffAssignmentList
                    departmentId={departmentId}
                    assignedStaff={department.staff}
                    availableStaff={availableStaff}
                />
            </GlassCard>
        </div>
    );
}
