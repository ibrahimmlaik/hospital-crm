import { getAllBeds, getWardStats } from "@/actions/staff-wards";
import { GlassCard } from "@/components/ui/glass-card";
import { BedDouble, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { DeleteBedButton } from "@/components/beds/DeleteBedButton";

export const dynamic = "force-dynamic";

export default async function BedsManagementPage() {
    const [beds, stats] = await Promise.all([
        getAllBeds(),
        getWardStats()
    ]);

    const groupedBeds = {
        ICU: beds.filter((b: any) => b.wardType === "ICU"),
        GENERAL: beds.filter((b: any) => b.wardType === "GENERAL"),
        PRIVATE: beds.filter((b: any) => b.wardType === "PRIVATE")
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Bed Management</h1>
                    <p className="text-indigo-200">Configure and manage hospital beds</p>
                </div>
                <Link
                    href="/admin/beds/create"
                    className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-white rounded-lg font-bold transition-colors"
                >
                    <Plus size={20} />
                    Add Bed
                </Link>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    <GlassCard className="bg-blue-500/10 border-blue-500/20">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-blue-500/20 text-blue-300">
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
                                <BedDouble size={24} />
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
                                <BedDouble size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-indigo-200">Occupied</p>
                                <h3 className="text-2xl font-bold text-white">{stats.occupied}</h3>
                            </div>
                        </div>
                    </GlassCard>
                    <GlassCard className="bg-purple-500/10 border-purple-500/20">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-purple-500/20 text-purple-300">
                                <BedDouble size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-indigo-200">ICU</p>
                                <h3 className="text-2xl font-bold text-white">{stats.icu}</h3>
                            </div>
                        </div>
                    </GlassCard>
                    <GlassCard className="bg-indigo-500/10 border-indigo-500/20">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-indigo-500/20 text-indigo-300">
                                <BedDouble size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-indigo-200">General</p>
                                <h3 className="text-2xl font-bold text-white">{stats.general}</h3>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            )}

            {/* Beds by Ward Type */}
            {Object.entries(groupedBeds).map(([wardType, wardBeds]) => (
                <GlassCard key={wardType}>
                    <h2 className="text-xl font-bold text-white mb-6">{wardType} Ward ({(wardBeds as any[]).length} beds)</h2>
                    {(wardBeds as any[]).length === 0 ? (
                        <div className="text-center py-12 text-indigo-300">
                            <BedDouble className="mx-auto mb-4 opacity-50" size={48} />
                            <p>No beds in this ward</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {(wardBeds as any[]).map((bed: any) => (
                                <div
                                    key={bed.id}
                                    className={`p-4 rounded-lg border-2 ${bed.status === "AVAILABLE"
                                            ? "bg-emerald-500/10 border-emerald-500/30"
                                            : "bg-red-500/10 border-red-500/30"
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <BedDouble
                                                className={bed.status === "AVAILABLE" ? "text-emerald-300" : "text-red-300"}
                                                size={20}
                                            />
                                            <div>
                                                <p className="font-bold text-white">{bed.bedNumber}</p>
                                                <p className="text-xs text-indigo-300">{bed.wardType}</p>
                                            </div>
                                        </div>
                                        <span
                                            className={`text-xs font-bold px-2 py-1 rounded ${bed.status === "AVAILABLE"
                                                    ? "bg-emerald-500/20 text-emerald-300"
                                                    : "bg-red-500/20 text-red-300"
                                                }`}
                                        >
                                            {bed.status}
                                        </span>
                                    </div>
                                    {bed.patient && (
                                        <div className="mb-3 p-2 bg-white/5 rounded">
                                            <p className="text-sm text-white font-medium">{bed.patient.name}</p>
                                            <p className="text-xs text-indigo-300">{bed.patient.phone}</p>
                                            {bed.assignedAt && (
                                                <p className="text-xs text-indigo-400 mt-1">
                                                    Admitted: {new Date(bed.assignedAt).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                    {bed.status === "AVAILABLE" && (
                                        <DeleteBedButton bedId={bed.id} bedNumber={bed.bedNumber} />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </GlassCard>
            ))}
        </div>
    );
}
