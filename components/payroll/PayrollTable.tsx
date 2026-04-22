"use client";

import { useState } from "react";
import { approvePayroll, markPayrollPaid } from "@/actions/payroll";
import { GlassCard } from "@/components/ui/glass-card";
import { CheckCircle, DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PayrollTable({ payroll }: { payroll: any[] }) {
    const [loading, setLoading] = useState<string | null>(null);
    const router = useRouter();

    const handleApprove = async (id: string) => {
        setLoading(id);
        const result = await approvePayroll(id);
        if (result.success) {
            router.refresh();
        } else {
            alert(result.error);
        }
        setLoading(null);
    };

    const handleMarkPaid = async (id: string) => {
        setLoading(id);
        const result = await markPayrollPaid(id);
        if (result.success) {
            router.refresh();
        } else {
            alert(result.error);
        }
        setLoading(null);
    };

    return (
        <GlassCard className="p-0 overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-white/5">
                <h2 className="text-xl font-bold text-white">Payroll Records</h2>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 text-indigo-200 text-sm uppercase tracking-wider">
                            <th className="p-5 font-medium">Employee</th>
                            <th className="p-5 font-medium">Role</th>
                            <th className="p-5 font-medium">Period</th>
                            <th className="p-5 font-medium">Hours</th>
                            <th className="p-5 font-medium">Overtime</th>
                            <th className="p-5 font-medium">Total Salary</th>
                            <th className="p-5 font-medium">Status</th>
                            <th className="p-5 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {payroll.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="p-12 text-center text-indigo-300">
                                    No payroll records found. Generate payroll to get started.
                                </td>
                            </tr>
                        ) : (
                            payroll.map((record) => (
                                <tr key={record.id} className="hover:bg-white/5 transition-colors text-slate-300">
                                    <td className="p-5 font-medium text-white">{record.user.name}</td>
                                    <td className="p-5">
                                        <span className="px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded text-xs font-medium">
                                            {record.user.role}
                                        </span>
                                    </td>
                                    <td className="p-5">{record.month}/{record.year}</td>
                                    <td className="p-5">{record.hoursWorked.toFixed(1)} hrs</td>
                                    <td className="p-5 text-yellow-300">{record.overtimeHours.toFixed(1)} hrs</td>
                                    <td className="p-5 font-bold text-teal-300">PKR {record.totalSalary.toFixed(2)}</td>
                                    <td className="p-5">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${record.status === "PAID" ? "bg-emerald-500/20 text-emerald-300" :
                                            record.status === "APPROVED" ? "bg-blue-500/20 text-blue-300" :
                                                "bg-yellow-500/20 text-yellow-300"
                                            }`}>
                                            {record.status}
                                        </span>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex gap-2">
                                            {record.status === "PENDING" && (
                                                <button
                                                    onClick={() => handleApprove(record.id)}
                                                    disabled={loading === record.id}
                                                    className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/30 transition-colors text-xs font-medium disabled:opacity-50 flex items-center gap-1"
                                                >
                                                    <CheckCircle size={14} />
                                                    Approve
                                                </button>
                                            )}
                                            {record.status === "APPROVED" && (
                                                <button
                                                    onClick={() => handleMarkPaid(record.id)}
                                                    disabled={loading === record.id}
                                                    className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded hover:bg-emerald-500/30 transition-colors text-xs font-medium disabled:opacity-50 flex items-center gap-1"
                                                >
                                                    <DollarSign size={14} />
                                                    Mark Paid
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </GlassCard>
    );
}
