"use client";

import { useState } from "react";
import { generatePayroll } from "@/actions/payroll";
import { GlassCard } from "@/components/ui/glass-card";
import { Calendar, Play } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PayrollGenerator({ eligibleUsers }: { eligibleUsers: any[] }) {
    const [loading, setLoading] = useState(false);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const router = useRouter();

    const handleGenerate = async () => {
        if (!confirm(`Generate payroll for ${month}/${year}? This will create payroll records for all eligible employees.`)) {
            return;
        }

        setLoading(true);
        const result = await generatePayroll(month, year);
        if (result.success) {
            alert(result.message);
            router.refresh();
        } else {
            alert(result.error);
        }
        setLoading(false);
    };

    return (
        <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-teal-500/20 rounded-full">
                    <Calendar className="text-teal-300" size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">Generate Payroll</h3>
                    <p className="text-sm text-indigo-300">Create monthly payroll for employees</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="text-sm font-medium text-indigo-300 mb-2 block">Month</label>
                    <select
                        value={month}
                        onChange={(e) => setMonth(parseInt(e.target.value))}
                        className="w-full bg-[#0f172a]/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500/50"
                    >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                            <option key={m} value={m}>
                                {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="text-sm font-medium text-indigo-300 mb-2 block">Year</label>
                    <select
                        value={year}
                        onChange={(e) => setYear(parseInt(e.target.value))}
                        className="w-full bg-[#0f172a]/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500/50"
                    >
                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-end">
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white font-bold py-2 px-4 rounded-lg shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <Play size={18} />
                        {loading ? "Generating..." : "Generate Payroll"}
                    </button>
                </div>
            </div>

            <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-sm text-blue-300">
                    <strong>{eligibleUsers.length}</strong> eligible employees found.
                    Payroll will be calculated based on attendance records and salary structures.
                </p>
            </div>
        </GlassCard>
    );
}
