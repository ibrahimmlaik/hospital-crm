"use client";

import { useActionState, useState, useEffect } from "react";
import { login } from "@/actions/auth";
import { checkSystemSetup } from "@/actions/setup";
import { GlassCard } from "@/components/ui/glass-card";
import { User, Lock, Activity, ArrowRight, ShieldCheck, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [state, formAction, isPending] = useActionState(login, null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [checking, setChecking] = useState(true);
    const router = useRouter();

    // Check if system needs setup
    useEffect(() => {
        let mounted = true;

        const checkSetup = async () => {
            try {
                const result = await checkSystemSetup();
                if (mounted) {
                    if (result.needsSetup) {
                        router.push("/setup");
                    } else {
                        setChecking(false);
                    }
                }
            } catch (error) {
                console.error("Setup check error:", error);
                // On error, assume setup is needed
                if (mounted) {
                    setChecking(false);
                }
            }
        };

        // Add a timeout to prevent infinite loading
        const timeout = setTimeout(() => {
            if (mounted && checking) {
                console.warn("Setup check timeout - proceeding to login");
                setChecking(false);
            }
        }, 3000);

        checkSetup();

        return () => {
            mounted = false;
            clearTimeout(timeout);
        };
    }, [router]);

    // Handle redirect on successful login
    useEffect(() => {
        if (state?.success && state?.redirectTo) {
            router.push(state.redirectTo);
        }
    }, [state, router]);

    if (checking) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
                <div className="text-white text-lg">Checking system status...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f172a] flex flex-col justify-center items-center p-4 relative overflow-hidden">
            {/* Background Blobs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md z-10"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="p-3 bg-gradient-to-br from-teal-400 to-blue-600 rounded-xl shadow-lg shadow-teal-500/20">
                            <Activity className="text-white w-8 h-8" />
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight text-white">Nexus Health</h1>
                    </div>
                    <p className="text-lg text-indigo-200/80">
                        Next-Generation Hospital Management System
                    </p>
                </div>

                {/* Login Form */}
                <GlassCard className="w-full">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-white">Sign In</h2>
                        <p className="text-indigo-200 text-sm mt-1">Access your secure portal</p>
                    </div>

                    <form action={formAction} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-indigo-100 ml-1">Email Address</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3.5 text-indigo-400 w-5 h-5" />
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-white placeholder-indigo-300/30 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-transparent transition-all"
                                    placeholder="name@hospital.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-indigo-100 ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3.5 text-indigo-400 w-5 h-5" />
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-white placeholder-indigo-300/30 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-transparent transition-all"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3.5 text-indigo-400 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {state?.error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-200 text-sm p-3 rounded-lg flex items-center gap-2">
                                <ShieldCheck size={16} /> {state.error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-teal-900/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                        >
                            {isPending ? "Authenticating..." : "Access System"}
                            {!isPending && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                        </button>

                        <p className="text-center text-indigo-300 text-sm">
                            New staff member? <Link href="/signup" className="text-teal-400 hover:text-teal-300 font-medium">Create account</Link>
                        </p>
                    </form>
                </GlassCard>
            </motion.div>
        </div>
    );
}
