"use client";

import { createPharmacy, updatePharmacy, deletePharmacy } from "@/actions/admin-pharmacy";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface PharmacyFormProps {
    pharmacy?: {
        id: string;
        name: string;
        description: string | null;
        location: string | null;
        phone: string | null;
        email: string | null;
        isActive: boolean;
    };
}

export default function PharmacyFormClient({ pharmacy }: PharmacyFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const isEdit = !!pharmacy;

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);

        try {
            const result = isEdit
                ? await updatePharmacy(pharmacy!.id, formData)
                : await createPharmacy(formData);

            if (result.success) {
                if (isEdit) {
                    router.push(`/admin/pharmacy/${pharmacy!.id}`);
                } else {
                    router.push("/admin/pharmacy");
                }
                router.refresh();
            } else {
                setError(result.error || "Something went wrong");
            }
        } catch {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete() {
        if (!pharmacy) return;
        if (!confirm("Are you sure you want to deactivate this pharmacy?")) return;

        setLoading(true);
        try {
            const result = await deletePharmacy(pharmacy.id);
            if (result.success) {
                router.push("/admin/pharmacy");
                router.refresh();
            } else {
                setError(result.error || "Failed to delete");
            }
        } catch {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-sm">
                    {error}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-indigo-200 mb-2">Pharmacy Name *</label>
                <input
                    name="name"
                    defaultValue={pharmacy?.name || ""}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-indigo-300/50 focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 outline-none transition-all"
                    placeholder="e.g. Central Pharmacy"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-indigo-200 mb-2">Description</label>
                <textarea
                    name="description"
                    defaultValue={pharmacy?.description || ""}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-indigo-300/50 focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 outline-none transition-all resize-none"
                    placeholder="Pharmacy description..."
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-indigo-200 mb-2">Location</label>
                    <input
                        name="location"
                        defaultValue={pharmacy?.location || ""}
                        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-indigo-300/50 focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 outline-none transition-all"
                        placeholder="e.g. Ground Floor, Main Building"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-indigo-200 mb-2">Phone</label>
                    <input
                        name="phone"
                        defaultValue={pharmacy?.phone || ""}
                        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-indigo-300/50 focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 outline-none transition-all"
                        placeholder="e.g. +1 234 567 8900"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-indigo-200 mb-2">Email</label>
                <input
                    name="email"
                    type="email"
                    defaultValue={pharmacy?.email || ""}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-indigo-300/50 focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 outline-none transition-all"
                    placeholder="e.g. pharmacy@hospital.com"
                />
            </div>

            {isEdit && (
                <div>
                    <label className="block text-sm font-medium text-indigo-200 mb-2">Status</label>
                    <select
                        name="isActive"
                        defaultValue={pharmacy?.isActive ? "true" : "false"}
                        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 outline-none transition-all"
                    >
                        <option value="true" className="bg-slate-800">Active</option>
                        <option value="false" className="bg-slate-800">Inactive</option>
                    </select>
                </div>
            )}

            <div className="flex gap-4 pt-2">
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white font-bold py-3 px-8 rounded-lg shadow-lg shadow-rose-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? "Saving..." : isEdit ? "Update Pharmacy" : "Create Pharmacy"}
                </button>

                {isEdit && (
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={loading}
                        className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg shadow-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Deactivate Pharmacy
                    </button>
                )}
            </div>
        </form>
    );
}
