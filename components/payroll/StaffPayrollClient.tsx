"use client";

import React, { useState, useEffect, useActionState } from "react";
import { addDoctorPayment } from "@/actions/doctor-payments";
import { GlassCard } from "@/components/ui/glass-card";
import {
    DollarSign, Plus, X, ChevronDown, ChevronUp,
    Stethoscope, Users, FileText, Search
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Doctor { id: string; name: string; email: string; }
interface DoctorSummary {
    id: string; name: string; email: string; department: string;
    patientCount: number; prescriptionCount: number;
    totalPaid: number; paymentCount: number;
    recentPayments: { id: string; amount: number; description: string | null; recordedAt: string }[];
}

export default function StaffPayrollClient({
    doctors,
    doctorSummary,
}: {
    doctors: Doctor[];
    doctorSummary: DoctorSummary[];
}) {
    const router = useRouter();
    const [showForm, setShowForm] = useState(false);
    const [expandedDoctor, setExpandedDoctor] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [formState, formAction, isPending] = useActionState(addDoctorPayment, null);

    useEffect(() => {
        if (formState?.success) {
            setShowForm(false);
            router.refresh();
        }
    }, [formState]);

    const filtered = doctorSummary.filter(d =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.department.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header with Add Payment button */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Doctor Payment List</h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-teal-500/20 transition-all"
                >
                    {showForm ? <X size={18} /> : <Plus size={18} />}
                    {showForm ? "Cancel" : "Record Payment"}
                </button>
            </div>

            {/* Add Payment Form */}
            {showForm && (
                <GlassCard className="border-teal-500/30 bg-teal-500/5">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-teal-500/20 rounded-lg">
                            <DollarSign className="text-teal-300" size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-white">Record Doctor Payment</h3>
                    </div>

                    <form action={formAction} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Doctor Select */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-indigo-300">Doctor *</label>
                            <select
                                name="doctorId"
                                required
                                className="bg-[#0f172a]/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500/60 transition-colors"
                            >
                                <option value="">-- Select Doctor --</option>
                                {doctors.map(d => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Amount */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-indigo-300">Amount ($) *</label>
                            <input
                                name="amount"
                                type="number"
                                step="0.01"
                                min="0.01"
                                required
                                placeholder="e.g. 5000.00"
                                className="bg-[#0f172a]/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-indigo-400 focus:outline-none focus:border-teal-500/60 transition-colors"
                            />
                        </div>

                        {/* Patient Name */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-indigo-300">Patient Name (optional)</label>
                            <input
                                name="patientName"
                                type="text"
                                placeholder="Patient name for reference"
                                className="bg-[#0f172a]/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-indigo-400 focus:outline-none focus:border-teal-500/60 transition-colors"
                            />
                        </div>

                        {/* Description */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-indigo-300">Description (optional)</label>
                            <input
                                name="description"
                                type="text"
                                placeholder="e.g. Consultation fee for March"
                                className="bg-[#0f172a]/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-indigo-400 focus:outline-none focus:border-teal-500/60 transition-colors"
                            />
                        </div>

                        {/* Status / Errors */}
                        {formState?.error && (
                            <div className="md:col-span-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                                {formState.error}
                            </div>
                        )}

                        <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-5 py-2.5 text-indigo-300 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isPending}
                                className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg shadow-teal-500/20"
                            >
                                {isPending ? "Saving..." : "Save Payment"}
                            </button>
                        </div>
                    </form>
                </GlassCard>
            )}

            {/* Success Toast */}
            {formState?.success && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-medium">
                    ✓ {formState.message}
                </div>
            )}

            {/* Search */}
            <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" />
                <input
                    type="text"
                    placeholder="Search doctors or departments..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-indigo-400 focus:outline-none focus:border-teal-500/50 transition-colors"
                />
            </div>

            {/* Doctor Table */}
            <GlassCard className="p-0 overflow-hidden">
                <div className="p-5 border-b border-white/10 bg-white/5">
                    <h3 className="text-lg font-bold text-white">Employee Payment Overview</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 text-indigo-200 text-xs uppercase tracking-wider">
                                <th className="p-5 font-medium">Doctor</th>
                                <th className="p-5 font-medium">Department</th>
                                <th className="p-5 font-medium text-center">
                                    <span className="flex items-center justify-center gap-1">
                                        <Users size={14} /> Patients
                                    </span>
                                </th>
                                <th className="p-5 font-medium text-center">
                                    <span className="flex items-center justify-center gap-1">
                                        <FileText size={14} /> Prescriptions
                                    </span>
                                </th>
                                <th className="p-5 font-medium text-center">Payments</th>
                                <th className="p-5 font-medium text-right">Total Paid</th>
                                <th className="p-5 font-medium text-center">History</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-12 text-center text-indigo-300">
                                        <Stethoscope className="mx-auto mb-3 opacity-40" size={40} />
                                        <p>No doctors found.</p>
                                    </td>
                                </tr>
                            ) : filtered.map(doc => (
                                <React.Fragment key={doc.id}>
                                    <tr className="hover:bg-white/5 transition-colors text-slate-300">
                                        <td className="p-5">
                                            <p className="font-bold text-white">{doc.name}</p>
                                            <p className="text-xs text-indigo-400">{doc.email}</p>
                                        </td>
                                        <td className="p-5">
                                            <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-medium">
                                                {doc.department}
                                            </span>
                                        </td>
                                        <td className="p-5 text-center">
                                            <span className="px-3 py-1 bg-blue-500/10 text-blue-300 rounded-full text-sm font-bold">
                                                {doc.patientCount}
                                            </span>
                                        </td>
                                        <td className="p-5 text-center">
                                            <span className="px-3 py-1 bg-purple-500/10 text-purple-300 rounded-full text-sm font-bold">
                                                {doc.prescriptionCount}
                                            </span>
                                        </td>
                                        <td className="p-5 text-center">
                                            <span className="text-sm font-medium text-slate-300">
                                                {doc.paymentCount} records
                                            </span>
                                        </td>
                                        <td className="p-5 text-right">
                                            <span className="text-lg font-bold text-teal-300">
                                                PKR {doc.totalPaid.toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="p-5 text-center">
                                            {doc.recentPayments.length > 0 && (
                                                <button
                                                    onClick={() => setExpandedDoctor(expandedDoctor === doc.id ? null : doc.id)}
                                                    className="p-1.5 rounded-lg hover:bg-white/10 text-indigo-400 hover:text-white transition-colors"
                                                    title="View payment history"
                                                >
                                                    {expandedDoctor === doc.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                    {/* Expanded payment history */}
                                    {expandedDoctor === doc.id && (
                                        <tr key={`${doc.id}-history`}>
                                            <td colSpan={7} className="bg-white/[0.02] px-5 pb-4 pt-2">
                                                <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-3">
                                                    Recent Payment Records
                                                </p>
                                                <div className="space-y-2">
                                                    {doc.recentPayments.map(p => (
                                                        <div key={p.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                                                            <div>
                                                                <p className="text-sm text-white">{p.description || "Payment"}</p>
                                                                <p className="text-xs text-indigo-400 mt-0.5">
                                                                    {new Date(p.recordedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                                                </p>
                                                            </div>
                                                            <span className="text-teal-300 font-bold text-sm">PKR {p.amount.toFixed(2)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
        </div>
    );
}
