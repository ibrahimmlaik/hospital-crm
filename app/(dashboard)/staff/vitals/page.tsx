"use client";

import { useEffect, useState, useActionState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Activity, Save, User } from "lucide-react";
import { recordVitals, getAllPatients, getRecentVitals } from "@/actions/staff-vitals";
import { motion } from "framer-motion";

export default function VitalsPage() {
    const [patients, setPatients] = useState<any[]>([]);
    const [recentVitals, setRecentVitals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [state, formAction, isPending] = useActionState(recordVitals, null);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (state?.success) {
            loadData();
        }
    }, [state]);

    const loadData = async () => {
        try {
            const [patientsData, vitalsData] = await Promise.all([
                getAllPatients(),
                getRecentVitals()
            ]);
            setPatients(patientsData);
            setRecentVitals(vitalsData);
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white">Vitals Monitoring</h1>
                <p className="text-indigo-200">Record and track patient vital signs</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Record Vitals Form */}
                <GlassCard>
                    <h2 className="text-xl font-bold text-white mb-6">Record Vitals</h2>
                    <form action={formAction} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-indigo-300 mb-2 block">Patient</label>
                            <select
                                name="patientId"
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500/50"
                            >
                                <option value="">Select patient...</option>
                                {patients.map(patient => (
                                    <option key={patient.id} value={patient.id} className="bg-[#0f172a]">
                                        {patient.name} - {patient.phone}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-indigo-300 mb-2 block">Blood Pressure</label>
                                <input
                                    type="text"
                                    name="bloodPressure"
                                    placeholder="120/80"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500/50"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-indigo-300 mb-2 block">Temperature (°C)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    name="temperature"
                                    placeholder="37.0"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500/50"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-indigo-300 mb-2 block">Pulse (BPM)</label>
                                <input
                                    type="number"
                                    name="pulse"
                                    placeholder="72"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500/50"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-indigo-300 mb-2 block">SpO2 (%)</label>
                                <input
                                    type="number"
                                    name="oxygenLevel"
                                    placeholder="98"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500/50"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-indigo-300 mb-2 block">Notes (Optional)</label>
                            <textarea
                                name="notes"
                                rows={3}
                                placeholder="Any observations..."
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500/50"
                            />
                        </div>

                        {state?.error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-200 rounded-lg text-sm">
                                {state.error}
                            </div>
                        )}
                        {state?.success && (
                            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 rounded-lg text-sm">
                                {state.message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-teal-500 hover:bg-teal-400 text-white rounded-lg font-bold transition-colors disabled:opacity-50"
                        >
                            <Save size={18} />
                            {isPending ? "Recording..." : "Record Vitals"}
                        </button>
                    </form>
                </GlassCard>

                {/* Recent Vitals */}
                <GlassCard>
                    <h2 className="text-xl font-bold text-white mb-6">Recent Recordings</h2>
                    {loading ? (
                        <div className="text-center py-8 text-indigo-300">Loading...</div>
                    ) : recentVitals.length === 0 ? (
                        <div className="text-center py-8 text-indigo-300">No vitals recorded yet</div>
                    ) : (
                        <div className="space-y-3 max-h-[600px] overflow-y-auto">
                            {recentVitals.map((vital, index) => (
                                <motion.div
                                    key={vital.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    className="p-3 bg-white/5 rounded-lg border border-white/10"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <User className="text-teal-400" size={16} />
                                        <span className="font-bold text-white text-sm">{vital.patient.name}</span>
                                        <span className="text-xs text-indigo-400 ml-auto">
                                            {new Date(vital.recordedAt).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2 text-xs">
                                        <div className="bg-white/5 p-2 rounded">
                                            <p className="text-indigo-400">BP</p>
                                            <p className="text-white font-bold">{vital.bloodPressure}</p>
                                        </div>
                                        <div className="bg-white/5 p-2 rounded">
                                            <p className="text-indigo-400">Temp</p>
                                            <p className="text-white font-bold">{vital.temperature}°C</p>
                                        </div>
                                        <div className="bg-white/5 p-2 rounded">
                                            <p className="text-indigo-400">Pulse</p>
                                            <p className="text-white font-bold">{vital.pulse}</p>
                                        </div>
                                        {vital.oxygenLevel && (
                                            <div className="bg-white/5 p-2 rounded">
                                                <p className="text-indigo-400">SpO2</p>
                                                <p className="text-white font-bold">{vital.oxygenLevel}%</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </GlassCard>
            </div>
        </div>
    );
}
