import { getDepartmentById } from "@/actions/departments";
import { GlassCard } from "@/components/ui/glass-card";
import { DepartmentForm } from "@/components/departments/DepartmentForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditDepartmentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: departmentId } = await params;
    const department = await getDepartmentById(departmentId);

    if (!department) {
        notFound();
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Link href={`/admin/departments/${departmentId}`}>
                    <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-all">
                        <ArrowLeft size={20} />
                    </button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-white">Edit Department</h1>
                    <p className="text-indigo-200">Update department information</p>
                </div>
            </div>

            <GlassCard className="max-w-2xl">
                <DepartmentForm department={department} />
            </GlassCard>
        </div>
    );
}
