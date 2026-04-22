"use client";

import { useEffect, useState, useActionState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { TestTube, CheckCircle, Clock, Upload, Plus } from "lucide-react";
import { getPendingLabTests, updateLabTestStatus, createLabTest } from "@/actions/staff-labs";
import { getAllPatients } from "@/actions/staff-vitals";
import { motion } from "framer-motion";

export default function LabsPage() {
    const [tests, setTests] = useState<any[]>([]);
    const [patients, setPatients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [updateState, updateAction, updatePending] = useActionState(updateLabTestStatus, null);
    const [createState, createAction, createPending] = useActionState(createLabTest, null);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (updateState?.success || createState?.success) {
            loadData();
            setShowCreateForm(false);
        }
    }, [updateState, createState]);

    const loadData = async () => {
        try {
            const [testsData, patientsData] = await Promise.all([
                getPendingLabTests(),
                getAllPatients()
            ]);
            setTests(testsData);
            setPatients(patientsData);
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setLoading(false);
        }
    };

    const stats = {
        total: tests.length,
        pending: tests.filter(t => t.status === "PENDING").length,
        completed: tests.filter(t => t.status === "COMPLETED").length
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Lab Tests</h1>
                    <p className="text-indigo-200">Manage laboratory test requests and results</p>
                </div>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-white rounded-lg font-bold transition-colors"
                >
                    <Plus size={18} />
                    New Test
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GlassCard className="bg-teal-500/10 border-teal-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-teal-500/20 text-teal-300">
                            <TestTube size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-indigo-200">Total Tests</p>
                            <h3 className="text-2xl font-bold text-white">{stats.total}</h3>
                        </div>
                    </div>
                </GlassCard>
                <GlassCard className="bg-yellow-500/10 border-yellow-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-yellow-500/20 text-yellow-300">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-indigo-200">Pending</p>
                            <h3 className="text-2xl font-bold text-white">{stats.pending}</h3>
                        </div>
                    </div>
                </GlassCard>
                <GlassCard className="bg-emerald-500/10 border-emerald-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-emerald-500/20 text-emerald-300">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-indigo-200">Completed</p>
                            <h3 className="text-2xl font-bold text-white">{stats.completed}</h3>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Create Test Form */}
            {showCreateForm && (
                <GlassCard>
                    <h2 className="text-xl font-bold text-white mb-4">Create Lab Test</h2>
                    <form action={createAction} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
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
                                            {patient.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-indigo-300 mb-2 block">Test Name</label>
                                <input
                                    type="text"
                                    name="testName"
                                    placeholder="e.g., Complete Blood Count"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500/50"
                                />
                            </div>
                        </div>
                        {createState?.error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-200 rounded-lg text-sm">
                                {createState.error}
                            </div>
                        )}
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowCreateForm(false)}
                                className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={createPending}
                                className="flex-1 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-white rounded-lg font-bold transition-colors disabled:opacity-50"
                            >
                                {createPending ? "Creating..." : "Create Test"}
                            </button>
                        </div>
                    </form>
                </GlassCard>
            )}

            {/* Tests List */}
            <GlassCard>
                <h2 className="text-xl font-bold text-white mb-4">All Lab Tests</h2>
                {loading ? (
                    <div className="text-center py-8 text-indigo-300">Loading...</div>
                ) : tests.length === 0 ? (
                    <div className="text-center py-8 text-indigo-300">No lab tests found</div>
                ) : (
                    <div className="space-y-4">
                        {tests.map((test, index) => (
                            <motion.div
                                key={test.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                                className="p-4 bg-white/5 rounded-xl border border-white/10"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex gap-3">
                                        <div className="p-2 bg-purple-500/20 rounded-lg">
                                            <TestTube className="text-purple-300" size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white">{test.testName}</h3>
                                            <p className="text-sm text-indigo-300">{test.patient.name}</p>
                                            <p className="text-xs text-indigo-400 mt-1">
                                                {new Date(test.date).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${test.status === "COMPLETED" ? "bg-emerald-500/20 text-emerald-300" :
                                            "bg-yellow-500/20 text-yellow-300"
                                        }`}>
                                        {test.status}
                                    </span>
                                </div>

                                {test.status === "PENDING" && (
                                    <form action={updateAction} className="flex gap-3 pt-3 border-t border-white/10">
                                        <input type="hidden" name="testId" value={test.id} />
                                        <input type="hidden" name="status" value="COMPLETED" />
                                        <input
                                            type="text"
                                            name="resultUrl"
                                            placeholder="Result URL (optional)"
                                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500/50"
                                        />
                                        <button
                                            type="submit"
                                            disabled={updatePending}
                                            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
                                        >
                                            <CheckCircle size={16} />
                                            Mark Complete
                                        </button>
                                    </form>
                                )}

                                {test.resultUrl && (
                                    <a
                                        href={test.resultUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 mt-3 text-sm text-teal-400 hover:text-teal-300 underline"
                                    >
                                        <Upload size={14} />
                                        View Results
                                    </a>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </GlassCard>
        </div>
    );
}
