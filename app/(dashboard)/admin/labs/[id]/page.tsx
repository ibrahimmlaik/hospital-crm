import { getLabById } from "@/actions/admin-labs";
import { GlassCard } from "@/components/ui/glass-card";
import { ArrowLeft, TestTube2, Package, DollarSign, Clock } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import LabDetailClient from "@/components/admin/LabDetailClient";

export const dynamic = "force-dynamic";

export default async function LabDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const lab = await getLabById(id);

    if (!lab) {
        notFound();
    }

    const totalProducts = lab.products.length;
    const activeProducts = lab.products.filter(p => p.isActive).length;
    const avgPrice = totalProducts > 0
        ? (lab.products.reduce((sum, p) => sum + p.price, 0) / totalProducts).toFixed(2)
        : "0.00";

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Link href="/admin/labs">
                    <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-all">
                        <ArrowLeft size={20} />
                    </button>
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-white">{lab.name}</h1>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${lab.isActive ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"}`}>
                            {lab.isActive ? "Active" : "Inactive"}
                        </span>
                    </div>
                    <p className="text-indigo-200">{lab.description || "No description"}</p>
                </div>
                <Link href={`/admin/labs/${id}/edit`}>
                    <button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-amber-500/20 transition-all">
                        Edit Lab
                    </button>
                </Link>
            </div>

            {/* Lab Info */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <GlassCard className="bg-cyan-500/10 border-cyan-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-cyan-500/20 text-cyan-300">
                            <TestTube2 size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-indigo-200">Location</p>
                            <h3 className="text-lg font-bold text-white">{lab.location || "N/A"}</h3>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="bg-emerald-500/10 border-emerald-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-emerald-500/20 text-emerald-300">
                            <Package size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-indigo-200">Total Tests</p>
                            <h3 className="text-2xl font-bold text-white">{totalProducts}</h3>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="bg-blue-500/10 border-blue-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-blue-500/20 text-blue-300">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-indigo-200">Active Tests</p>
                            <h3 className="text-2xl font-bold text-white">{activeProducts}</h3>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="bg-purple-500/10 border-purple-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-purple-500/20 text-purple-300">
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-indigo-200">Avg. Price</p>
                            <h3 className="text-2xl font-bold text-white">${avgPrice}</h3>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Products Manager */}
            <LabDetailClient lab={lab} />
        </div>
    );
}
