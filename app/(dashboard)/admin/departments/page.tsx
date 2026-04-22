import { getAllDepartments } from "@/actions/departments";
import { GlassCard } from "@/components/ui/glass-card";
import { Building2, Users, UserPlus, Plus } from "lucide-react";
import Link from "next/link";
import DepartmentGridClient from "@/components/admin/DepartmentGridClient";

export const dynamic = "force-dynamic";

export default async function AdminDepartmentsPage() {
    const departments = await getAllDepartments();

    // Calculate stats
    const totalDepartments = departments.length;
    const activeDepartments = departments.filter(d => d.isActive).length;
    const totalDoctors = departments.reduce((sum, d) => sum + (d._count?.doctors || 0), 0);
    const totalStaff = departments.reduce((sum, d) => sum + (d._count?.staff || 0), 0);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Department Management</h1>
                    <p className="text-indigo-200">Manage hospital departments and assignments</p>
                </div>
                <Link href="/admin/departments/create">
                    <button className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-teal-500/20 transition-all flex items-center gap-2">
                        <Plus size={20} />
                        Create Department
                    </button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <GlassCard className="bg-teal-500/10 border-teal-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-teal-500/20 text-teal-300">
                            <Building2 size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-indigo-200">Total Departments</p>
                            <h3 className="text-2xl font-bold text-white">{totalDepartments}</h3>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="bg-emerald-500/10 border-emerald-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-emerald-500/20 text-emerald-300">
                            <Building2 size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-indigo-200">Active</p>
                            <h3 className="text-2xl font-bold text-white">{activeDepartments}</h3>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="bg-blue-500/10 border-blue-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-blue-500/20 text-blue-300">
                            <UserPlus size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-indigo-200">Total Doctors</p>
                            <h3 className="text-2xl font-bold text-white">{totalDoctors}</h3>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="bg-purple-500/10 border-purple-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-purple-500/20 text-purple-300">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-indigo-200">Total Staff</p>
                            <h3 className="text-2xl font-bold text-white">{totalStaff}</h3>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Departments Grid with Filter */}
            <GlassCard className="p-0 overflow-hidden">
                <DepartmentGridClient departments={departments} />
            </GlassCard>
        </div>
    );
}
