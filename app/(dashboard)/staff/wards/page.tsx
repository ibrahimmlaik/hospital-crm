"use client";

import { useEffect, useState, useActionState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { BedDouble, User, CheckCircle, AlertTriangle } from "lucide-react";
import { getAllBeds, assignBed, dischargeBed, getWardStats } from "@/actions/staff-wards";
import { getAllPatients } from "@/actions/staff-vitals";
import { motion } from "framer-motion";

export default function WardsPage() {
    const [beds, setBeds] = useState<any[]>([]);
    const [patients, setPatients] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedBed, setSelectedBed] = useState<any>(null);
    const [assignState, assignAction, assignPending] = useActionState(assignBed, null);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (assignState?.success) {
            loadData();
            setSelectedBed(null);
        }
    }, [assignState]);

    const loadData = async () => {
        try {
            const [bedsData, patientsData, statsData] = await Promise.all([
                getAllBeds(),
                getAllPatients(),
                getWardStats()
            ]);
            setBeds(bedsData);
            setPatients(patientsData);
            setStats(statsData);
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDischarge = async (bedId: string) => {
        if (confirm("Are you sure you want to discharge this patient?")) {
            const result = await dischargeBed(bedId);
            if (result.success) {
                loadData();
            }
        }
    };

    const groupedBeds = {
        ICU: beds.filter(b => b.wardType === "ICU"),
        GENERAL: beds.filter(b => b.wardType === "GENERAL"),
        PRIVATE: beds.filter(b => b.wardType === "PRIVATE")
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white">Ward Management</h1>
                <p className="text-indigo-200">Manage bed assignments and patient admissions</p>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <GlassCard className="bg-teal-500/10 border-teal-500/20">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-teal-500/20 text-teal-300">
                                <BedDouble size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-indigo-200">Total Beds</p>
                                <h3 className="text-2xl font-bold text-white">{stats.total}</h3>
                            </div>
                        </div>
                    </GlassCard>
                    <GlassCard className="bg-emerald-500/10 border-emerald-500/20">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-emerald-500/20 text-emerald-300">
                                <CheckCircle size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-indigo-200">Available</p>
                                <h3 className="text-2xl font-bold text-white">{stats.available}</h3>
                            </div>
                        </div>
                    </GlassCard>
                    <GlassCard className="bg-red-500/10 border-red-500/20">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-red-500/20 text-red-300">
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-indigo-200">Occupied</p>
                                <h3 className="text-2xl font-bold text-white">{stats.occupied}</h3>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            )}

            {/* Bed Grid by Ward Type */}
            {Object.entries(groupedBeds).map(([wardType, wardBeds]) => (
                <GlassCard key={wardType}>
                    <h2 className="text-xl font-bold text-white mb-4">{wardType} Ward</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {(wardBeds as any[]).map((bed, index) => (
                            <motion.div
                                key={bed.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.02 }}
                                onClick={() => bed.status === "AVAILABLE" && setSelectedBed(bed)}
                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${bed.status === "AVAILABLE"
                                        ? "bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20"
                                        : "bg-red-500/10 border-red-500/30"
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <BedDouble className={bed.status === "AVAILABLE" ? "text-emerald-300" : "text-red-300"} size={20} />
                                    <span className={`text-xs font-bold ${bed.status === "AVAILABLE" ? "text-emerald-300" : "text-red-300"}`}>
                                        {bed.status === "AVAILABLE" ? "FREE" : "OCCUPIED"}
                                    </span>
                                </div>
                                <p className="font-bold text-white text-sm">{bed.bedNumber}</p>
                                {bed.patient && (
                                    <>
                                        <p className="text-xs text-indigo-300 mt-2">{bed.patient.name}</p>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDischarge(bed.id);
                                            }}
                                            className="mt-2 w-full px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded text-xs font-medium transition-colors"
                                        >
                                            Discharge
                                        </button>
                                    </>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </GlassCard>
            ))}

            {/* Assign Bed Modal */}
            {selectedBed && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setSelectedBed(null)}>
                    <GlassCard className="max-w-md w-full mx-4" onClick={(e: any) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-white mb-4">Assign Bed {selectedBed.bedNumber}</h3>
                        <form action={assignAction} className="space-y-4">
                            <input type="hidden" name="bedId" value={selectedBed.id} />
                            <div>
                                <label className="text-sm font-medium text-indigo-300 mb-2 block">Select Patient</label>
                                <select
                                    name="patientId"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500/50"
                                >
                                    <option value="">Choose patient...</option>
                                    {patients.map(patient => (
                                        <option key={patient.id} value={patient.id} className="bg-[#0f172a]">
                                            {patient.name} - {patient.phone}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {assignState?.error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-200 rounded-lg text-sm">
                                    {assignState.error}
                                </div>
                            )}
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setSelectedBed(null)}
                                    className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={assignPending}
                                    className="flex-1 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-white rounded-lg font-bold transition-colors disabled:opacity-50"
                                >
                                    {assignPending ? "Assigning..." : "Assign Bed"}
                                </button>
                            </div>
                        </form>
                    </GlassCard>
                </div>
            )}
        </div>
    );
}
