import { getAllLabs } from "@/actions/admin-labs";
import { GlassCard } from "@/components/ui/glass-card";
import { TestTube2, Package, MapPin, Plus } from "lucide-react";
import Link from "next/link";
import LabGridClient from "@/components/admin/LabGridClient";

export const dynamic = "force-dynamic";

export default async function AdminLabsPage() {
    const labs = await getAllLabs(true);

    const totalLabs = labs.length;
    const activeLabs = labs.filter((l: any) => l.isActive).length;
    const totalProducts = labs.reduce((sum: number, l: any) => sum + (l._count?.products || 0), 0);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Lab Management</h1>
                    <p className="text-indigo-200">Manage hospital laboratories and their tests/services</p>
                </div>
                <Link href="/admin/labs/create">
                    <button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2">
                        <Plus size={20} />
                        Create Lab
                    </button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GlassCard className="bg-cyan-500/10 border-cyan-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-cyan-500/20 text-cyan-300">
                            <TestTube2 size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-indigo-200">Total Labs</p>
                            <h3 className="text-2xl font-bold text-white">{totalLabs}</h3>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="bg-emerald-500/10 border-emerald-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-emerald-500/20 text-emerald-300">
                            <MapPin size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-indigo-200">Active Labs</p>
                            <h3 className="text-2xl font-bold text-white">{activeLabs}</h3>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="bg-purple-500/10 border-purple-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-purple-500/20 text-purple-300">
                            <Package size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-indigo-200">Total Tests/Services</p>
                            <h3 className="text-2xl font-bold text-white">{totalProducts}</h3>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Labs Grid */}
            <GlassCard className="p-0 overflow-hidden">
                <LabGridClient labs={labs} />
            </GlassCard>
        </div>
    );
}
