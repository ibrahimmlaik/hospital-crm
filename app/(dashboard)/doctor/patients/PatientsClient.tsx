"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Search, FileText, Activity, AlertCircle, Pill } from "lucide-react";
import Link from "next/link";

export default function PatientsClient({ initialPatients }: { initialPatients: any[] }) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredPatients = initialPatients.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.displayId.toString().includes(searchQuery) ||
        p.condition.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white">My Patients</h1>
                <p className="text-indigo-200">View medical history and vital records</p>
            </div>

            <div className="relative max-w-lg mb-6">
                <Search className="absolute left-3 top-3 text-indigo-400 w-5 h-5" />
                <input
                    placeholder="Search by name, ID, or condition..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-teal-500/50"
                />
            </div>

            {filteredPatients.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-white/5 border border-white/10">
                    <AlertCircle className="w-16 h-16 text-indigo-400 mb-4 opacity-50" />
                    <h3 className="text-xl font-bold text-white">No Patients Found</h3>
                    <p className="text-indigo-300 mt-2 max-w-md">
                        {searchQuery
                            ? "No patients matched your search criteria."
                            : "There are currently no patients linked to your profile in the database. When someone books an appointment with you, they will appear here automatically."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPatients.map((p) => (
                        <GlassCard key={p.id} className="hover:bg-white/10 transition-colors cursor-pointer group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-lg font-bold text-white">
                                        {p.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white group-hover:text-teal-300 transition-colors">{p.name}</h3>
                                        <p className="text-xs text-indigo-300">{p.gender}, {p.age} yrs</p>
                                    </div>
                                </div>
                                <span className="px-2 py-1 rounded text-[10px] bg-white/10 text-indigo-200 border border-white/5 shadow-inner">
                                    ID: #{p.displayId}
                                </span>
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Condition:</span>
                                    <span className="text-white font-medium truncate max-w-[60%] text-right">{p.condition}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Last Visit:</span>
                                    <span className="text-slate-200">{p.lastVisit}</span>
                                </div>
                            </div>

                            <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
                                <Link href={`/doctor/patients/${p.id}/history`} className="flex-1 py-2 text-sm text-indigo-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center justify-center gap-2">
                                    <FileText size={16} /> History
                                </Link>
                                <Link href={`/doctor/patients/${p.id}/vitals`} className="flex-1 py-2 text-sm text-indigo-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center justify-center gap-2">
                                    <Activity size={16} /> Vitals
                                </Link>
                                <Link href={`/doctor/prescriptions/create?patient=${encodeURIComponent(p.name)}`} className="flex-1 py-2 text-sm text-teal-300 hover:text-white hover:bg-teal-500/10 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium">
                                    <Pill size={16} /> Prescribe
                                </Link>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            )}
        </div>
    );
}
