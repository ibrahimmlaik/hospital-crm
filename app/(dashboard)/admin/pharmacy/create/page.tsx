import { GlassCard } from "@/components/ui/glass-card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import PharmacyFormClient from "@/components/admin/PharmacyFormClient";

export default function CreatePharmacyPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Link href="/admin/pharmacy">
                    <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-all">
                        <ArrowLeft size={20} />
                    </button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-white">Create Pharmacy</h1>
                    <p className="text-indigo-200">Add a new pharmacy to the hospital</p>
                </div>
            </div>

            <GlassCard className="max-w-2xl">
                <PharmacyFormClient />
            </GlassCard>
        </div>
    );
}
