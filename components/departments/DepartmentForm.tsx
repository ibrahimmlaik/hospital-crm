"use client";

import { createDepartment, updateDepartment } from "@/actions/departments";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface DepartmentFormProps {
    department?: {
        id: string;
        name: string;
        description: string | null;
        headId: string | null;
        isActive: boolean;
    };
}

export function DepartmentForm({ department }: DepartmentFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            const result = department
                ? await updateDepartment(department.id, formData)
                : await createDepartment(formData);

            if (result.success) {
                router.push("/admin/departments");
                router.refresh();
            } else {
                setError(result.error || "An error occurred");
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            <div>
                <label htmlFor="name" className="block text-sm font-medium text-indigo-200 mb-2">
                    Department Name *
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    defaultValue={department?.name}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-indigo-300/50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="e.g., Cardiology, Orthopedics"
                />
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium text-indigo-200 mb-2">
                    Description
                </label>
                <textarea
                    id="description"
                    name="description"
                    defaultValue={department?.description || ""}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-indigo-300/50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                    placeholder="Brief description of the department..."
                />
            </div>

            {department && (
                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        id="isActive"
                        name="isActive"
                        value="true"
                        defaultChecked={department.isActive}
                        className="w-5 h-5 rounded bg-white/5 border-white/10 text-teal-500 focus:ring-2 focus:ring-teal-500"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-indigo-200">
                        Department is active
                    </label>
                </div>
            )}

            <div className="flex gap-4">
                <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-teal-500/20 transition-all disabled:cursor-not-allowed"
                >
                    {isPending ? "Saving..." : department ? "Update Department" : "Create Department"}
                </button>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}
