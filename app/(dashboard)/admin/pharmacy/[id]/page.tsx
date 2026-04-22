import { getPharmacyById } from "@/actions/admin-pharmacy";
import { GlassCard } from "@/components/ui/glass-card";
import { ArrowLeft, Pill, Package, DollarSign, Boxes } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import PharmacyDetailClient from "@/components/admin/PharmacyDetailClient";

export const dynamic = "force-dynamic";

export default async function PharmacyDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const pharmacy = await getPharmacyById(id);

    if (!pharmacy) {
        notFound();
    }

    const totalProducts = pharmacy.products.length;
    const activeProducts = pharmacy.products.filter(p => p.isActive).length;
    const totalStock = pharmacy.products.reduce((sum, p) => sum + p.stock, 0);
    const avgPrice = totalProducts > 0
        ? (pharmacy.products.reduce((sum, p) => sum + p.price, 0) / totalProducts).toFixed(2)
        : "0.00";

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Link href="/admin/pharmacy">
                    <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-all">
                        <ArrowLeft size={20} />
                    </button>
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-white">{pharmacy.name}</h1>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${pharmacy.isActive ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"}`}>
                            {pharmacy.isActive ? "Active" : "Inactive"}
                        </span>
                    </div>
                    <p className="text-indigo-200">{pharmacy.description || "No description"}</p>
                </div>
                <Link href={`/admin/pharmacy/${id}/edit`}>
                    <button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-amber-500/20 transition-all">
                        Edit Pharmacy
                    </button>
                </Link>
            </div>

            {/* Pharmacy Info */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <GlassCard className="bg-rose-500/10 border-rose-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-rose-500/20 text-rose-300">
                            <Pill size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-indigo-200">Location</p>
                            <h3 className="text-lg font-bold text-white">{pharmacy.location || "N/A"}</h3>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="bg-emerald-500/10 border-emerald-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-emerald-500/20 text-emerald-300">
                            <Package size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-indigo-200">Products</p>
                            <h3 className="text-2xl font-bold text-white">{activeProducts}/{totalProducts}</h3>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="bg-blue-500/10 border-blue-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-blue-500/20 text-blue-300">
                            <Boxes size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-indigo-200">Total Stock</p>
                            <h3 className="text-2xl font-bold text-white">{totalStock}</h3>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="bg-amber-500/10 border-amber-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-amber-500/20 text-amber-300">
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
            <PharmacyDetailClient pharmacy={pharmacy} />
        </div>
    );
}
