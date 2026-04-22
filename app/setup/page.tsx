"use client";

import { useState, useActionState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { UserPlus, Lock, Mail, User, Shield } from "lucide-react";
import { createFirstAdmin } from "@/actions/setup";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function SetupPage() {
    const [state, formAction, isPending] = useActionState(createFirstAdmin, null);
    const router = useRouter();

    // Redirect to login after successful setup
    useEffect(() => {
        if (state?.success) {
            setTimeout(() => {
                router.push("/login");
            }, 2000);
        }
    }, [state, router]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <GlassCard className="p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-purple-600 mb-4">
                            <Shield className="text-white" size={32} />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Hospital CRM Setup</h1>
                        <p className="text-indigo-300">Create your administrator account to get started</p>
                    </div>

                    <form action={formAction} className="space-y-5">
                        <div>
                            <label className="text-sm font-medium text-indigo-300 mb-2 flex items-center gap-2">
                                <User size={16} />
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                required
                                placeholder="Dr. John Smith"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-indigo-400/50 focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-indigo-300 mb-2 flex items-center gap-2">
                                <Mail size={16} />
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                required
                                placeholder="admin@hospital.com"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-indigo-400/50 focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-indigo-300 mb-2 flex items-center gap-2">
                                <Lock size={16} />
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                required
                                minLength={8}
                                placeholder="Minimum 8 characters"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-indigo-400/50 focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-indigo-300 mb-2 flex items-center gap-2">
                                <Lock size={16} />
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                required
                                minLength={8}
                                placeholder="Re-enter your password"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-indigo-400/50 focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all"
                            />
                        </div>

                        {state?.error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-200 rounded-lg text-sm">
                                {state.error}
                            </div>
                        )}

                        {state?.success && (
                            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 rounded-lg text-sm">
                                {state.message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isPending || state?.success}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-400 hover:to-purple-500 text-white rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/20"
                        >
                            <UserPlus size={20} />
                            {isPending ? "Creating Account..." : state?.success ? "Redirecting..." : "Create Admin Account"}
                        </button>
                    </form>

                    <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <p className="text-xs text-blue-200">
                            <strong>Note:</strong> This is a one-time setup. You'll be able to create and manage all other users, departments, and system settings from the admin panel after logging in.
                        </p>
                    </div>
                </GlassCard>
            </motion.div>
        </div>
    );
}
