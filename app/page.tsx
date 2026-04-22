"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Activity, ArrowRight, ShieldCheck, Users, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white overflow-hidden relative">

      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-teal-500/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      <nav className="relative z-20 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-teal-400 to-blue-600 p-2 rounded-lg">
            <Activity className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight">Nexus Health</span>
        </div>
        <Link
          href="/login"
          className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 transition-all font-medium backdrop-blur-md"
        >
          Staff Login
        </Link>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-12 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-sm font-medium mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
          </span>
          Next-Gen Hospital OS v2.0 Live
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60"
        >
          The Future of <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-400">Healthcare Management</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12"
        >
          An enterprise-grade CRM designed for modern hospitals. Streamline patient care,
          manage staff workflows, and optimize billing—all in one beautiful interface.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 w-full justify-center"
        >
          <Link href="/login">
            <button className="px-8 py-4 rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white font-bold shadow-lg shadow-teal-500/25 flex items-center gap-2 transition-all transform hover:scale-105">
              Launch Demo Portal <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
          <button className="px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold backdrop-blur-md transition-all">
            View Documentation
          </button>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 w-full">
          {[
            { icon: Users, title: "Role-Based Access", desc: "Dedicated portals for Admins, Doctors, and Patients." },
            { icon: Zap, title: "Real-time Analytics", desc: "Live dashboards for bed occupancy, revenue, and queue." },
            { icon: ShieldCheck, title: "Enterprise Security", desc: "HIPAA-compliant data handling and audit logs." },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + (i * 0.1) }}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-lg bg-indigo-500/20 flex items-center justify-center mb-4">
                <feature.icon className="text-indigo-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}