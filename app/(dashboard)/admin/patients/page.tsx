import { prisma } from "@/lib/prisma";
import { GlassCard } from "@/components/ui/glass-card";
import { Users, UserPlus, Calendar, Stethoscope } from "lucide-react";
import PatientTableClient from "@/components/admin/PatientTableClient";

export const dynamic = "force-dynamic";

export default async function AdminPatientsPage() {
    const patients = await prisma.patient.findMany({
        include: {
            user: {
                select: {
                    email: true,
                    status: true,
                    createdAt: true,
                }
            },
            _count: {
                select: {
                    appointments: true,
                    prescriptions: true,
                    bills: true,
                    labTests: true,
                }
            }
        },
        orderBy: { name: "asc" }
    });

    // Stats
    const totalPatients = patients.length;
    const activePatients = patients.filter(p => p.user?.status === "ACTIVE").length;
    const maleCount = patients.filter(p => p.gender === "Male").length;
    const femaleCount = patients.filter(p => p.gender === "Female").length;
    const totalAppointments = patients.reduce((sum, p) => sum + p._count.appointments, 0);

    // Serialize dates
    const serialized = patients.map(p => ({
        id: p.id,
        name: p.name,
        phone: p.phone,
        dob: p.dob.toISOString(),
        gender: p.gender,
        address: p.address,
        medicalHistory: p.medicalHistory,
        relatedDoctorId: (p as any).relatedDoctorId ?? null,
        familyMemberName: (p as any).familyMemberName ?? null,
        user: p.user ? {
            ...p.user,
            createdAt: p.user.createdAt.toISOString(),
        } : null,
        _count: p._count,
    }));

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Registered Patients</h1>
                    <p className="text-indigo-200">Complete list of all patients in the system</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <GlassCard className="!p-4 bg-teal-500/5 border-teal-500/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-teal-500/20 text-teal-300">
                            <Users size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-indigo-300">Total Patients</p>
                            <h3 className="text-xl font-bold text-white">{totalPatients}</h3>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="!p-4 bg-emerald-500/5 border-emerald-500/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-300">
                            <UserPlus size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-indigo-300">Active</p>
                            <h3 className="text-xl font-bold text-white">{activePatients}</h3>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="!p-4 bg-blue-500/5 border-blue-500/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-blue-500/20 text-blue-300">
                            <Users size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-indigo-300">Male</p>
                            <h3 className="text-xl font-bold text-white">{maleCount}</h3>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="!p-4 bg-pink-500/5 border-pink-500/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-pink-500/20 text-pink-300">
                            <Users size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-indigo-300">Female</p>
                            <h3 className="text-xl font-bold text-white">{femaleCount}</h3>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="!p-4 bg-violet-500/5 border-violet-500/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-violet-500/20 text-violet-300">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-indigo-300">Total Appointments</p>
                            <h3 className="text-xl font-bold text-white">{totalAppointments}</h3>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Patient Table */}
            <PatientTableClient patients={serialized} />
        </div>
    );
}
