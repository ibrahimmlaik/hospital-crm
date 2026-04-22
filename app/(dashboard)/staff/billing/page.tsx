"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { Search, CreditCard, Download, Send, Plus, CheckCircle, Loader2 } from "lucide-react";
import { useState, useEffect, useTransition } from "react";
import { getBillingStats, createInvoice, markBillPaid } from "@/actions/staff";
import { useActionState } from "react";

export default function Billing() {
    const [activeTab, setActiveTab] = useState("pending");
    const [stats, setStats] = useState<{ bills: any[], totalRevenue: number, pending: number, patients?: any[] }>({ bills: [], totalRevenue: 0, pending: 0, patients: [] });

    // Invoice Form State
    const [showForm, setShowForm] = useState(false);
    const [formState, formAction, isPending] = useActionState(createInvoice, null);
    const [payingId, setPayingId] = useState<string | null>(null);
    const [isMarking, startTransition] = useTransition();

    const fetchStats = () => getBillingStats().then(setStats);

    useEffect(() => {
        fetchStats();
    }, [formState]);

    useEffect(() => {
        if (formState?.success) setShowForm(false);
    }, [formState]);

    const handleMarkPaid = (billId: string) => {
        setPayingId(billId);
        startTransition(async () => {
            const res = await markBillPaid(billId);
            if (res.success) {
                fetchStats();
            } else {
                alert(res.error || "Failed to mark as paid");
            }
            setPayingId(null);
        });
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Billing & Invoices</h1>
                    <p className="text-indigo-200">Manage patient payments and insurance claims</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="bg-teal-500 hover:bg-teal-400 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors">
                    <Plus size={18} /> New Invoice
                </button>
            </div>

            <div className="flex gap-4">
                <GlassCard className="flex-1 bg-gradient-to-r from-teal-500/10 to-teal-500/5 border-teal-500/20">
                    <p className="text-indigo-200 text-sm">Total Revenue</p>
                    <h3 className="text-3xl font-bold text-white mt-1">PKR {stats.totalRevenue.toLocaleString()}</h3>
                </GlassCard>
                <GlassCard className="flex-1 bg-gradient-to-r from-red-500/10 to-red-500/5 border-red-500/20">
                    <p className="text-indigo-200 text-sm">Pending Payments</p>
                    <h3 className="text-3xl font-bold text-white mt-1">PKR {stats.pending.toLocaleString()}</h3>
                </GlassCard>
            </div>

            {showForm && (
                <GlassCard className="border-teal-500/30">
                    <h3 className="text-xl font-bold text-white mb-4">Create New Invoice</h3>
                    <form action={formAction} className="grid grid-cols-1 md:grid-cols-3 gap-4 border border-white/10 p-4 rounded-xl bg-slate-900/50">
                        <select name="patientId" required className="bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-teal-500 outline-none">
                            <option value="">Select Patient</option>
                            {stats.patients?.map(p => (
                                <option key={p.id} value={p.id} className="bg-slate-800">{p.name} {p.phone ? `(${p.phone})` : ''}</option>
                            ))}
                        </select>
                        <input name="amount" type="number" placeholder="Amount (PKR)" required className="bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-teal-500 outline-none" />
                        <input name="services" placeholder="Services (e.g. Consult, X-Ray)" className="bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-teal-500 outline-none" />
                        <div className="md:col-span-3 flex justify-end gap-2">
                            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-indigo-300 hover:text-white">Cancel</button>
                            <button disabled={isPending} type="submit" className="bg-teal-500 text-white px-6 py-2 rounded-lg font-bold">
                                {isPending ? "Creating..." : "Generate Invoice"}
                            </button>
                        </div>
                    </form>
                </GlassCard>
            )}

            <GlassCard className="p-0 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 text-indigo-200 text-sm uppercase tracking-wider">
                            <th className="p-5 font-medium">Invoice ID</th>
                            <th className="p-5 font-medium">Patient</th>
                            <th className="p-5 font-medium">Date</th>
                            <th className="p-5 font-medium">Amount</th>
                            <th className="p-5 font-medium">Status</th>
                            <th className="p-5 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm text-slate-300">
                        {stats.bills.map((inv) => (
                            <tr key={inv.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-5 font-mono text-white text-xs">{inv.id.substring(0, 8)}...</td>
                                <td className="p-5 font-bold text-white">{inv.patient?.name || "Unknown"}</td>
                                <td className="p-5">{new Date(inv.date).toLocaleDateString()}</td>
                                <td className="p-5 font-mono text-white">PKR {inv.amount.toLocaleString()}</td>
                                <td className="p-5">
                                    <span className={`px-2 py-1 rounded text-xs font-bold border ${inv.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                        inv.status === 'UNPAID' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                            'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                        }`}>
                                        {inv.status}
                                    </span>
                                </td>
                                <td className="p-5 text-right">
                                    <div className="flex justify-end gap-2">
                                        {inv.status === "UNPAID" && (
                                            <button
                                                onClick={() => handleMarkPaid(inv.id)}
                                                disabled={isMarking && payingId === inv.id}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 text-xs font-bold transition-colors disabled:opacity-50"
                                            >
                                                {isMarking && payingId === inv.id ? (
                                                    <Loader2 size={14} className="animate-spin" />
                                                ) : (
                                                    <CheckCircle size={14} />
                                                )}
                                                Mark Paid
                                            </button>
                                        )}
                                        {inv.status === "PAID" && (
                                            <span className="flex items-center gap-1.5 px-3 py-1.5 text-emerald-400 text-xs font-medium">
                                                <CheckCircle size={14} /> Paid
                                            </span>
                                        )}
                                        <button className="p-2 hover:bg-white/10 text-indigo-300 hover:text-white rounded-lg transition-colors">
                                            <Download size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {stats.bills.length === 0 && (
                            <tr><td colSpan={6} className="p-8 text-center text-indigo-300">No invoices found.</td></tr>
                        )}
                    </tbody>
                </table>
            </GlassCard>
        </div>
    );
}
