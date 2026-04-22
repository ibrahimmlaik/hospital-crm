"use client";

import { useActionState, useState, useEffect } from "react";
import { signup } from "@/actions/auth";
import { checkSystemSetup } from "@/actions/setup";
import { GlassCard } from "@/components/ui/glass-card";
import { User, Mail, Lock, Activity, Shield, ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getAllDepartments } from "@/actions/departments";
import { useRouter } from "next/navigation";

const ROLES = [
    { value: "DOCTOR", label: "Doctor" },
    { value: "PATIENT", label: "Patient" },
    { value: "STAFF_NURSE", label: "Nurse" },
    { value: "STAFF_RECEPTION", label: "Receptionist" },
    { value: "ADMIN", label: "Administrator" },
];

export default function SignupPage() {
    const [state, formAction, isPending] = useActionState(signup, null);
    const [selectedRole, setSelectedRole] = useState("PATIENT");
    const [departments, setDepartments] = useState<any[]>([]);
    const [checking, setChecking] = useState(true);
    const router = useRouter();

    // Check if system needs setup first (no users = redirect to /setup)
    useEffect(() => {
        let mounted = true;
        const check = async () => {
            try {
                const result = await checkSystemSetup();
                if (mounted) {
                    if (result.needsSetup) {
                        router.push("/setup");
                    } else {
                        setChecking(false);
                    }
                }
            } catch {
                if (mounted) setChecking(false);
            }
        };
        const timeout = setTimeout(() => {
            if (mounted && checking) setChecking(false);
        }, 3000);
        check();
        return () => { mounted = false; clearTimeout(timeout); };
    }, [router]);

    useEffect(() => {
        getAllDepartments().then(setDepartments);
    }, []);

    if (checking) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
                <div className="text-white text-lg">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Blobs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[100px]" />
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px]" />
            </div>

            <GlassCard className="w-full max-w-lg z-10 relative">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-blue-600 shadow-lg shadow-teal-500/20 mb-4">
                        <Activity className="text-white w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Create Account</h2>
                    <p className="text-indigo-200 text-sm mt-1">Join the Nexus Health network</p>
                </div>

                <form action={formAction} className="space-y-4">
                    {/* Name */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-indigo-300 uppercase ml-1">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-indigo-400 w-5 h-5" />
                            <input name="name" type="text" required className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-indigo-400/30 focus:outline-none focus:border-teal-500/50 transition-all" placeholder="John Doe" />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-indigo-300 uppercase ml-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-indigo-400 w-5 h-5" />
                            <input name="email" type="email" required className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-indigo-400/30 focus:outline-none focus:border-teal-500/50 transition-all" placeholder="name@hospital.com" />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-indigo-300 uppercase ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-indigo-400 w-5 h-5" />
                            <input name="password" type="password" required className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-indigo-400/30 focus:outline-none focus:border-teal-500/50 transition-all" placeholder="••••••••" />
                        </div>
                    </div>

                    {/* Role Selection */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-indigo-300 uppercase ml-1">Select Role</label>
                        <div className="relative">
                            <Shield className="absolute left-3 top-3 text-indigo-400 w-5 h-5 pointer-events-none z-10" />
                            <select
                                name="role"
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                className="w-full bg-[#0f172a]/50 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-white focus:outline-none focus:border-teal-500/50 appearance-none cursor-pointer"
                            >
                                {ROLES.map(role => (
                                    <option key={role.value} value={role.value}>{role.label}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-3 text-indigo-400 w-5 h-5 pointer-events-none" />
                        </div>
                    </div>

                    {/* Conditional Doctor Department/Specialization Field */}
                    {selectedRole === "DOCTOR" && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="space-y-1 overflow-hidden"
                        >
                            <label className="text-xs font-bold text-indigo-300 uppercase ml-1">Department / Specialization</label>
                            <div className="relative">
                                <Activity className="absolute left-3 top-3 text-indigo-400 w-5 h-5 pointer-events-none z-10" />
                                <select
                                    name="specialization"
                                    required
                                    className="w-full bg-[#0f172a]/50 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-white focus:outline-none focus:border-teal-500/50 appearance-none cursor-pointer"
                                >
                                    <option value="">Select Department</option>
                                    {departments.map((dept: any) => (
                                        <option key={dept.id} value={dept.name}>{dept.name}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-3 text-indigo-400 w-5 h-5 pointer-events-none" />
                            </div>
                        </motion.div>
                    )}

                    {state?.error && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-sm text-center">
                            {state.error}
                        </motion.div>
                    )}

                    {state?.success && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-sm text-center">
                            {state.message} <Link href="/login" className="underline font-bold">Log in here</Link>.
                        </motion.div>
                    )}

                    <button
                        disabled={isPending}
                        type="submit"
                        className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-teal-900/20 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPending ? "Creating Account..." : "Create Account"}
                        {!isPending && <ArrowRight size={18} />}
                    </button>

                    <p className="text-center text-indigo-300 text-sm mt-4">
                        Already have an account? <Link href="/login" className="text-teal-400 hover:text-teal-300 font-medium">Sign in</Link>
                    </p>
                </form>
            </GlassCard>
        </div>
    );
}
