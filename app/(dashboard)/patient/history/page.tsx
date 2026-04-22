"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Calendar, FileText, Pill, TestTube, Activity, User } from "lucide-react";
import { getPatientHistory } from "@/actions/patient-history";
import { motion } from "framer-motion";

export default function PatientHistoryPage() {
    const [history, setHistory] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("appointments");

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const data = await getPatientHistory();
            setHistory(data);
        } catch (error) {
            console.error("Error loading history:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-indigo-300">Loading your medical history...</div>
            </div>
        );
    }

    if (!history) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-indigo-300">No medical history found</div>
            </div>
        );
    }

    const tabs = [
        { id: "appointments", label: "Appointments", icon: Calendar, count: history.appointments.length },
        { id: "prescriptions", label: "Prescriptions", icon: Pill, count: history.prescriptions.length },
        { id: "labTests", label: "Lab Tests", icon: TestTube, count: history.labTests.length },
        { id: "vitals", label: "Vitals", icon: Activity, count: history.vitals.length }
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white">My Medical History</h1>
                <p className="text-indigo-200">Complete timeline of your healthcare journey</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                                    ? "bg-teal-500 text-white"
                                    : "bg-white/5 text-indigo-300 hover:bg-white/10"
                                }`}
                        >
                            <Icon size={18} />
                            {tab.label}
                            <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">{tab.count}</span>
                        </button>
                    );
                })}
            </div>

            {/* Appointments Tab */}
            {activeTab === "appointments" && (
                <GlassCard>
                    <h2 className="text-xl font-bold text-white mb-4">Appointment History</h2>
                    {history.appointments.length === 0 ? (
                        <div className="text-center py-8 text-indigo-300">No appointments yet</div>
                    ) : (
                        <div className="space-y-4">
                            {history.appointments.map((apt: any, index: number) => (
                                <motion.div
                                    key={apt.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="p-4 bg-white/5 rounded-xl border border-white/10"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex gap-3">
                                            <div className="p-2 bg-teal-500/20 rounded-lg">
                                                <User className="text-teal-300" size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white">Dr. {apt.doctor.user.name}</h3>
                                                <p className="text-sm text-indigo-300">
                                                    {new Date(apt.date).toLocaleDateString()} at {new Date(apt.date).toLocaleTimeString()}
                                                </p>
                                                {apt.notes && (
                                                    <p className="text-sm text-indigo-200 mt-2 bg-white/5 p-2 rounded">
                                                        Notes: {apt.notes}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${apt.status === "COMPLETED" ? "bg-emerald-500/20 text-emerald-300" :
                                                apt.status === "SCHEDULED" ? "bg-blue-500/20 text-blue-300" :
                                                    "bg-red-500/20 text-red-300"
                                            }`}>
                                            {apt.status}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </GlassCard>
            )}

            {/* Prescriptions Tab */}
            {activeTab === "prescriptions" && (
                <GlassCard>
                    <h2 className="text-xl font-bold text-white mb-4">Prescription History</h2>
                    {history.prescriptions.length === 0 ? (
                        <div className="text-center py-8 text-indigo-300">No prescriptions yet</div>
                    ) : (
                        <div className="space-y-4">
                            {history.prescriptions.map((rx: any, index: number) => {
                                const medicines = JSON.parse(rx.medicines || "[]");
                                return (
                                    <motion.div
                                        key={rx.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="p-4 bg-white/5 rounded-xl border border-white/10"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h3 className="font-bold text-white">Dr. {rx.doctor.user.name}</h3>
                                                <p className="text-sm text-indigo-300">
                                                    {new Date(rx.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${rx.status === "DISPENSED" ? "bg-emerald-500/20 text-emerald-300" :
                                                    "bg-yellow-500/20 text-yellow-300"
                                                }`}>
                                                {rx.status}
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            {medicines.map((med: any, i: number) => (
                                                <div key={i} className="flex items-center gap-2 text-sm text-indigo-200 bg-white/5 p-2 rounded">
                                                    <Pill size={14} className="text-teal-400" />
                                                    <span className="font-medium">{med.name}</span>
                                                    <span className="text-indigo-400">• {med.dosage} • {med.freq} • {med.duration}</span>
                                                </div>
                                            ))}
                                        </div>
                                        {rx.notes && (
                                            <p className="text-sm text-indigo-200 mt-2 bg-white/5 p-2 rounded">
                                                Notes: {rx.notes}
                                            </p>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </GlassCard>
            )}

            {/* Lab Tests Tab */}
            {activeTab === "labTests" && (
                <GlassCard>
                    <h2 className="text-xl font-bold text-white mb-4">Lab Test Results</h2>
                    {history.labTests.length === 0 ? (
                        <div className="text-center py-8 text-indigo-300">No lab tests yet</div>
                    ) : (
                        <div className="space-y-4">
                            {history.labTests.map((test: any, index: number) => (
                                <motion.div
                                    key={test.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="p-4 bg-white/5 rounded-xl border border-white/10"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex gap-3">
                                            <div className="p-2 bg-purple-500/20 rounded-lg">
                                                <TestTube className="text-purple-300" size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white">{test.testName}</h3>
                                                <p className="text-sm text-indigo-300">
                                                    {new Date(test.date).toLocaleDateString()}
                                                </p>
                                                {test.resultUrl && (
                                                    <a
                                                        href={test.resultUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-teal-400 hover:text-teal-300 underline mt-2 inline-block"
                                                    >
                                                        View Results
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${test.status === "COMPLETED" ? "bg-emerald-500/20 text-emerald-300" :
                                                "bg-yellow-500/20 text-yellow-300"
                                            }`}>
                                            {test.status}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </GlassCard>
            )}

            {/* Vitals Tab */}
            {activeTab === "vitals" && (
                <GlassCard>
                    <h2 className="text-xl font-bold text-white mb-4">Vital Signs History</h2>
                    {history.vitals.length === 0 ? (
                        <div className="text-center py-8 text-indigo-300">No vitals recorded yet</div>
                    ) : (
                        <div className="space-y-4">
                            {history.vitals.map((vital: any, index: number) => (
                                <motion.div
                                    key={vital.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="p-4 bg-white/5 rounded-xl border border-white/10"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <p className="text-sm text-indigo-300">
                                            {new Date(vital.recordedAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="bg-white/5 p-3 rounded-lg">
                                            <p className="text-xs text-indigo-400">Blood Pressure</p>
                                            <p className="text-lg font-bold text-white">{vital.bloodPressure}</p>
                                        </div>
                                        <div className="bg-white/5 p-3 rounded-lg">
                                            <p className="text-xs text-indigo-400">Temperature</p>
                                            <p className="text-lg font-bold text-white">{vital.temperature}°C</p>
                                        </div>
                                        <div className="bg-white/5 p-3 rounded-lg">
                                            <p className="text-xs text-indigo-400">Pulse</p>
                                            <p className="text-lg font-bold text-white">{vital.pulse} BPM</p>
                                        </div>
                                        {vital.oxygenLevel && (
                                            <div className="bg-white/5 p-3 rounded-lg">
                                                <p className="text-xs text-indigo-400">SpO2</p>
                                                <p className="text-lg font-bold text-white">{vital.oxygenLevel}%</p>
                                            </div>
                                        )}
                                    </div>
                                    {vital.notes && (
                                        <p className="text-sm text-indigo-200 mt-3 bg-white/5 p-2 rounded">
                                            Notes: {vital.notes}
                                        </p>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )}
                </GlassCard>
            )}
        </div>
    );
}
