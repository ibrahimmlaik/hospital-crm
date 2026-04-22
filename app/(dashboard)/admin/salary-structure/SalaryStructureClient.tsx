"use client";

import { useState, useActionState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { createSalaryStructure } from "@/actions/payroll";
import { Search, Edit2, CheckCircle, AlertCircle, X, DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SalaryStructureClient({ initialEmployees }: { initialEmployees: any[] }) {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [formData, setFormData] = useState<any>({});

    // We import createSalaryStructure from payroll actions which already exists!
    const [state, formAction, isPending] = useActionState(createSalaryStructure, null);

    useEffect(() => {
        if (state?.success) {
            setEditingUserId(null);
            router.refresh();
        }
    }, [state]);

    const filtered = initialEmployees.filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.role.toLowerCase().includes(search.toLowerCase()) ||
        e.email.toLowerCase().includes(search.toLowerCase())
    );

    const handleEdit = (user: any) => {
        setEditingUserId(user.id);
        const struct = user.salaryStructure;
        setFormData({
            userId: user.id,
            baseSalary: struct?.baseSalary ?? "",
            paymentType: struct?.paymentType || "FIXED",
            perAppointmentFee: struct?.perAppointmentFee ?? "",
            hourlyRate: struct?.hourlyRate ?? "",
            overtimeRate: struct?.overtimeRate ?? "",
        });
    };

    return (
        <div className="space-y-6">
            <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" />
                <input
                    type="text"
                    placeholder="Search employees by name, role, or email..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-indigo-400 focus:outline-none focus:border-teal-500/50 transition-colors"
                />
            </div>

            {state?.success && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex gap-3 items-center text-emerald-300">
                    <CheckCircle size={20} />
                    <span>{state.message}</span>
                </div>
            )}

            {state?.error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex gap-3 items-center text-red-300">
                    <AlertCircle size={20} />
                    <span>{state.error}</span>
                </div>
            )}

            <GlassCard className="p-0 overflow-hidden">
                <div className="p-5 border-b border-white/10 bg-white/5">
                    <h3 className="text-lg font-bold text-white">Employee Compensation List</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 text-indigo-200 text-xs uppercase tracking-wider">
                                <th className="p-5 font-medium">Employee</th>
                                <th className="p-5 font-medium">Type</th>
                                <th className="p-5 font-medium">Base Salary</th>
                                <th className="p-5 font-medium">Variables</th>
                                <th className="p-5 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-indigo-300">
                                        No employees found matching your search.
                                    </td>
                                </tr>
                            ) : filtered.map((emp) => (
                                <tr key={emp.id} className="hover:bg-white/5 transition-colors text-slate-300">
                                    <td className="p-5">
                                        <p className="font-bold text-white">{emp.name}</p>
                                        <p className="text-xs text-indigo-400 mt-1">{emp.email}</p>
                                        <span className="inline-block mt-2 px-2.5 py-1 bg-indigo-500/20 text-indigo-300 rounded-lg text-xs font-medium">
                                            {emp.role.replace("STAFF_", "").replace("_", " ")}
                                        </span>
                                    </td>

                                    {editingUserId === emp.id ? (
                                        <td colSpan={4} className="p-5">
                                            <form action={formAction} className="bg-[#0f172a]/80 rounded-xl p-5 border border-white/10 shadow-inner grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <input type="hidden" name="userId" value={formData.userId} />

                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-xs font-medium text-indigo-300 uppercase tracking-wider">Payment Type *</label>
                                                    <select
                                                        name="paymentType"
                                                        value={formData.paymentType}
                                                        onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
                                                        className="bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-teal-500/50 outline-none"
                                                    >
                                                        <option value="FIXED">Fixed Regular</option>
                                                        <option value="PER_APPOINTMENT">Per Appointment (Doctors)</option>
                                                        <option value="HOURLY">Hourly Rate</option>
                                                    </select>
                                                </div>

                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-xs font-medium text-indigo-300 uppercase tracking-wider">Base Salary ($) *</label>
                                                    <div className="relative">
                                                        <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" />
                                                        <input
                                                            name="baseSalary"
                                                            type="number"
                                                            required
                                                            step="0.01"
                                                            value={formData.baseSalary === "" ? "" : formData.baseSalary}
                                                            onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value === "" ? "" : parseFloat(e.target.value) })}
                                                            className="w-full bg-[#0f172a] border border-white/10 rounded-lg pl-8 pr-3 py-2 text-white text-sm focus:border-teal-500/50 outline-none"
                                                        />
                                                    </div>
                                                </div>

                                                {formData.paymentType === "PER_APPOINTMENT" && (
                                                    <div className="flex flex-col gap-1.5">
                                                        <label className="text-xs font-medium text-indigo-300 uppercase tracking-wider">Fee per Appointment ($)</label>
                                                        <div className="relative">
                                                            <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" />
                                                            <input
                                                                name="perAppointmentFee"
                                                                type="number"
                                                                step="0.01"
                                                                value={formData.perAppointmentFee === "" ? "" : formData.perAppointmentFee}
                                                                onChange={(e) => setFormData({ ...formData, perAppointmentFee: e.target.value === "" ? "" : parseFloat(e.target.value) })}
                                                                className="w-full bg-[#0f172a] border border-white/10 rounded-lg pl-8 pr-3 py-2 text-white text-sm focus:border-teal-500/50 outline-none"
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {formData.paymentType === "HOURLY" && (
                                                    <div className="flex flex-col gap-1.5">
                                                        <label className="text-xs font-medium text-indigo-300 uppercase tracking-wider">Hourly Rate ($)</label>
                                                        <div className="relative">
                                                            <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" />
                                                            <input
                                                                name="hourlyRate"
                                                                type="number"
                                                                step="0.01"
                                                                value={formData.hourlyRate === "" ? "" : formData.hourlyRate}
                                                                onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value === "" ? "" : parseFloat(e.target.value) })}
                                                                className="w-full bg-[#0f172a] border border-white/10 rounded-lg pl-8 pr-3 py-2 text-white text-sm focus:border-teal-500/50 outline-none"
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-xs font-medium text-indigo-300 uppercase tracking-wider">Overtime Rate ($/hr)</label>
                                                    <div className="relative">
                                                        <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" />
                                                        <input
                                                            name="overtimeRate"
                                                            type="number"
                                                            step="0.01"
                                                            value={formData.overtimeRate === "" ? "" : formData.overtimeRate}
                                                            onChange={(e) => setFormData({ ...formData, overtimeRate: e.target.value === "" ? "" : parseFloat(e.target.value) })}
                                                            className="w-full bg-[#0f172a] border border-white/10 rounded-lg pl-8 pr-3 py-2 text-white text-sm focus:border-teal-500/50 outline-none"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="lg:col-span-3 flex justify-end gap-3 mt-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditingUserId(null)}
                                                        className="px-4 py-2 hover:bg-white/5 rounded-lg text-sm font-medium text-indigo-300 transition-colors flex items-center gap-2"
                                                    >
                                                        <X size={16} /> Cancel
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        disabled={isPending}
                                                        className="px-6 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 disabled:opacity-50 rounded-lg text-sm font-bold text-white shadow-lg shadow-teal-500/20 transition-all flex items-center gap-2"
                                                    >
                                                        {isPending ? "Saving..." : "Save Configuration"}
                                                    </button>
                                                </div>
                                            </form>
                                        </td>
                                    ) : (
                                        <>
                                            <td className="p-5">
                                                {emp.salaryStructure ? (
                                                    <span className={`px-2.5 py-1 rounded text-xs font-bold border ${emp.salaryStructure.paymentType === 'FIXED' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                        emp.salaryStructure.paymentType === 'PER_APPOINTMENT' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                                            'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                        }`}>
                                                        {emp.salaryStructure.paymentType.replace("_", " ")}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-500 italic text-sm">Not Configured</span>
                                                )}
                                            </td>
                                            <td className="p-5">
                                                {emp.salaryStructure ? (
                                                    <span className="font-bold text-teal-300 text-lg">PKR {emp.salaryStructure.baseSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                ) : (
                                                    <span className="text-slate-500 text-sm">—</span>
                                                )}
                                            </td>
                                            <td className="p-5">
                                                {emp.salaryStructure ? (
                                                    <div className="flex flex-col gap-1 text-sm">
                                                        {emp.salaryStructure.paymentType === 'PER_APPOINTMENT' && (
                                                            <span className="text-purple-300">PKR {emp.salaryStructure.perAppointmentFee?.toFixed(2) || 0} / appointment</span>
                                                        )}
                                                        {emp.salaryStructure.paymentType === 'HOURLY' && (
                                                            <span className="text-amber-300">PKR {emp.salaryStructure.hourlyRate?.toFixed(2) || 0} / hr</span>
                                                        )}
                                                        {emp.salaryStructure.overtimeRate && (
                                                            <span className="text-red-300">PKR {emp.salaryStructure.overtimeRate.toFixed(2)} / overtime hr</span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-500 text-sm">—</span>
                                                )}
                                            </td>
                                            <td className="p-5 text-right">
                                                <button
                                                    onClick={() => handleEdit(emp)}
                                                    className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
                                                >
                                                    <Edit2 size={14} className="text-teal-400" />
                                                    {emp.salaryStructure ? "Edit" : "Configure"}
                                                </button>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
        </div>
    );
}
