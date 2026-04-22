import { getLabById } from "@/actions/admin-labs";
import { GlassCard } from "@/components/ui/glass-card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import LabFormClient from "@/components/admin/LabFormClient";

export const dynamic = "force-dynamic";

export default async function EditLabPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const lab = await getLabById(id);

    if (!lab) {
        notFound();
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Link href={`/admin/labs/${id}`}>
                    <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-all">
                        <ArrowLeft size={20} />
                    </button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-white">Edit Lab</h1>
                    <p className="text-indigo-200">Update lab details for {lab.name}</p>
                </div>
            </div>

            <GlassCard className="max-w-2xl">
                <LabFormClient lab={lab} />
            </GlassCard>
        </div>
    );
}
