import { getPharmacyById } from "@/actions/admin-pharmacy";
import { GlassCard } from "@/components/ui/glass-card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import PharmacyFormClient from "@/components/admin/PharmacyFormClient";

export const dynamic = "force-dynamic";

export default async function EditPharmacyPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const pharmacy = await getPharmacyById(id);

    if (!pharmacy) {
        notFound();
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Link href={`/admin/pharmacy/${id}`}>
                    <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-all">
                        <ArrowLeft size={20} />
                    </button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-white">Edit Pharmacy</h1>
                    <p className="text-indigo-200">Update pharmacy details for {pharmacy.name}</p>
                </div>
            </div>

            <GlassCard className="max-w-2xl">
                <PharmacyFormClient pharmacy={pharmacy} />
            </GlassCard>
        </div>
    );
}
