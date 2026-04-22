"use client";

import Link from "next/link";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import { motion } from "framer-motion";

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[20%] left-[10%] w-[400px] h-[400px] bg-orange-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-8"
                >
                    {/* Icon */}
                    <div className="flex justify-center">
                        <div className="w-24 h-24 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                            <ShieldAlert className="w-12 h-12 text-red-400" />
                        </div>
                    </div>

                    {/* Error Code */}
                    <div>
                        <h1 className="text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400 mb-4">
                            403
                        </h1>
                        <h2 className="text-3xl font-bold text-white mb-4">
                            Access Denied
                        </h2>
                        <p className="text-lg text-slate-400 max-w-md mx-auto">
                            You don't have permission to access this page. Please contact your administrator if you believe this is an error.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                        <Link href="/">
                            <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white font-bold shadow-lg shadow-teal-500/25 flex items-center gap-2 transition-all transform hover:scale-105">
                                <Home className="w-5 h-5" />
                                Go to Home
                            </button>
                        </Link>
                        <button
                            onClick={() => window.history.back()}
                            className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold backdrop-blur-md transition-all flex items-center gap-2"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Go Back
                        </button>
                    </div>

                    {/* Additional Info */}
                    <div className="pt-8 border-t border-white/10">
                        <p className="text-sm text-slate-500">
                            Error Code: <span className="text-red-400 font-mono">UNAUTHORIZED_ACCESS</span>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
