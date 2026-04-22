"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { useRouter } from "next/navigation";
import { createBed } from "@/actions/staff-wards";

export default function CreateBedPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const result = await createBed(formData);

        if (result.success) {
            router.push("/admin/beds");
        } else {
            setError(result.error || "Failed to create bed");
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white">Add New Bed</h1>
                <p className="text-indigo-200">Create a new bed in the hospital</p>
            </div>

            <GlassCard>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="text-sm font-medium text-indigo-300 mb-2 block">
                            Bed Number *
                        </label>
                        <input
                            type="text"
                            name="bedNumber"
                            required
                            placeholder="e.g., ICU-101, GEN-201, PVT-301"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-indigo-400 focus:outline-none focus:border-teal-500/50"
                        />
                        <p className="text-xs text-indigo-400 mt-1">
                            Use format: WARD-NUMBER (e.g., ICU-101)
                        </p>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-indigo-300 mb-2 block">
                            Ward Type *
                        </label>
                        <select
                            name="wardType"
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-teal-500/50"
                        >
                            <option value="" className="bg-[#0f172a]">Select ward type...</option>
                            <option value="ICU" className="bg-[#0f172a]">ICU (Intensive Care Unit)</option>
                            <option value="GENERAL" className="bg-[#0f172a]">General Ward</option>
                            <option value="PRIVATE" className="bg-[#0f172a]">Private Room</option>
                        </select>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-200 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg font-bold transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-3 bg-teal-500 hover:bg-teal-400 text-white rounded-lg font-bold transition-colors disabled:opacity-50"
                        >
                            {loading ? "Creating..." : "Create Bed"}
                        </button>
                    </div>
                </form>
            </GlassCard>
        </div>
    );
}
