"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { Save, X, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface UserFormProps {
    action: (formData: FormData) => Promise<any>;
    user?: {
        id: string;
        name: string;
        email: string;
        role: string;
        status: string;
        specialization?: string;
    };
    title: string;
    departments?: { id: string; name: string }[];
}

export default function UserForm({ action, user, title, departments = [] }: UserFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [selectedRole, setSelectedRole] = useState(user?.role || "PATIENT");
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        setError(null);
        try {
            // @ts-ignore - Action returns promise of object now
            const result = await action(formData);

            if (result && result.success) {
                // CRITICAL: Refresh BEFORE navigation to ensure cache is cleared
                router.refresh();

                // Small delay to ensure revalidation completes
                await new Promise(resolve => setTimeout(resolve, 100));

                router.push("/admin/users");
            } else {
                setError(result?.error || "An error occurred");
            }
        } catch (err) {
            setError("An unexpected error occurred");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <GlassCard className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                    {error}
                </div>
            )}

            <form action={handleSubmit} className="space-y-6">
                {user && <input type="hidden" name="userId" value={user.id} />}

                <div className="space-y-2">
                    <label className="text-sm font-medium text-indigo-300">Full Name</label>
                    <input
                        name="name"
                        defaultValue={user?.name}
                        required
                        className="w-full bg-[#0f172a]/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500/50"
                        placeholder="John Doe"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-indigo-300">Email Address</label>
                    <input
                        name="email"
                        type="email"
                        defaultValue={user?.email}
                        required
                        className="w-full bg-[#0f172a]/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500/50"
                        placeholder="john@example.com"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-indigo-300">Role</label>
                    <select
                        name="role"
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        required
                        className="w-full bg-[#0f172a]/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500/50"
                    >
                        <option value="ADMIN">Admin</option>
                        <option value="DOCTOR">Doctor</option>
                        <option value="STAFF_NURSE">Staff (Nurse)</option>
                        <option value="STAFF_RECEPTION">Staff (Reception)</option>
                        <option value="PATIENT">Patient</option>
                    </select>
                </div>

                {/* Department Assignment (for all roles except Patient) */}
                {selectedRole !== "PATIENT" && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-indigo-300">Department</label>
                        <select
                            name="specialization"
                            defaultValue={user?.specialization || ""}
                            required
                            className="w-full bg-[#0f172a]/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500/50"
                        >
                            <option value="">Select Department</option>
                            {departments.map(dept => (
                                <option key={dept.id} value={dept.name}>{dept.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-medium text-indigo-300">Status</label>
                    <select
                        name="status"
                        defaultValue={user?.status || "PENDING"} // Default to PENDING if new/undefined
                        className="w-full bg-[#0f172a]/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500/50"
                    >
                        <option value="ACTIVE">Active</option>
                        <option value="PENDING">Pending</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="SUSPENDED">Suspended</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-indigo-300">
                        {user ? "New Password (leave blank to keep current)" : "Password"}
                    </label>
                    <div className="relative">
                        <input
                            name="password"
                            type={showPassword ? "text" : "password"}
                            required={!user}
                            className="w-full bg-[#0f172a]/50 border border-white/10 rounded-lg pl-4 pr-10 py-2 text-white focus:outline-none focus:border-teal-500/50"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-2.5 text-indigo-400 hover:text-white transition-colors"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <Link
                        href="/admin/users"
                        className="flex-1 py-2.5 rounded-xl border border-white/10 text-center text-indigo-300 hover:bg-white/5 transition-colors font-medium"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-bold shadow-lg shadow-teal-500/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <span>Saving...</span>
                        ) : (
                            <>
                                <Save size={18} /> Save User
                            </>
                        )}
                    </button>
                </div>
            </form>
        </GlassCard>
    );
}
