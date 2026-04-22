import { getAllPharmacies } from "@/actions/admin-pharmacy";
import { GlassCard } from "@/components/ui/glass-card";
import { Pill, Package, MapPin, Plus } from "lucide-react";
import Link from "next/link";
import PharmacyGridClient from "@/components/admin/PharmacyGridClient";

export const dynamic = "force-dynamic";

export default async function AdminPharmacyPage() {
    const pharmacies = await getAllPharmacies(true);

    const totalPharmacies = pharmacies.length;
    const activePharmacies = pharmacies.filter((p: any) => p.isActive).length;
    const totalProducts = pharmacies.reduce((sum: number, p: any) => sum + (p._count?.products || 0), 0);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Pharmacy Management</h1>
                    <p className="text-indigo-200">Manage hospital pharmacies and their products</p>
                </div>
                <Link href="/admin/pharmacy/create">
                    <button className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-rose-500/20 transition-all flex items-center gap-2">
                        <Plus size={20} />
                        Create Pharmacy
                    </button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GlassCard className="bg-rose-500/10 border-rose-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-rose-500/20 text-rose-300">
                            <Pill size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-indigo-200">Total Pharmacies</p>
                            <h3 className="text-2xl font-bold text-white">{totalPharmacies}</h3>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="bg-emerald-500/10 border-emerald-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-emerald-500/20 text-emerald-300">
                            <MapPin size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-indigo-200">Active Pharmacies</p>
                            <h3 className="text-2xl font-bold text-white">{activePharmacies}</h3>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="bg-amber-500/10 border-amber-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-amber-500/20 text-amber-300">
                            <Package size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-indigo-200">Total Products</p>
                            <h3 className="text-2xl font-bold text-white">{totalProducts}</h3>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Pharmacies Grid */}
            <GlassCard className="p-0 overflow-hidden">
                <PharmacyGridClient pharmacies={pharmacies} />
            </GlassCard>
        </div>
    );
}
