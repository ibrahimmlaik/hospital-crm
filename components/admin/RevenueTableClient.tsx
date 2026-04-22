"use client";

import AdminFilterWrapper from "@/components/admin/AdminFilterWrapper";
import { DollarSign } from "lucide-react";
import { format } from "date-fns";

export default function RevenueTableClient({ paidBills }: { paidBills: any[] }) {
    return (
        <AdminFilterWrapper
            data={paidBills}
            searchKeys={["patient.name", "id", "items"]}
            searchPlaceholder="Search by patient name, invoice ID, or services..."
        >
            {(filteredBills) => (
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 text-indigo-200 text-xs uppercase tracking-wider">
                            <th className="p-5 font-medium">Invoice ID</th>
                            <th className="p-5 font-medium">Patient</th>
                            <th className="p-5 font-medium">Date Paid</th>
                            <th className="p-5 font-medium">Amount</th>
                            <th className="p-5 font-medium">Services</th>
                            <th className="p-5 font-medium">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm text-slate-300">
                        {filteredBills.map((bill: any) => (
                            <tr key={bill.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-5 font-mono text-white text-xs">{bill.id.substring(0, 8)}...</td>
                                <td className="p-5 font-bold text-white">{bill.patient?.name || "Unknown"}</td>
                                <td className="p-5">{format(new Date(bill.date), "MMM dd, yyyy")}</td>
                                <td className="p-5 font-mono text-emerald-400 font-bold">PKR {bill.amount.toLocaleString()}</td>
                                <td className="p-5 text-indigo-300">{bill.items || "—"}</td>
                                <td className="p-5">
                                    <span className="px-2.5 py-1 rounded text-xs font-bold border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                                        PAID
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {filteredBills.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-12 text-center text-indigo-300">
                                    <DollarSign className="mx-auto mb-3 opacity-30" size={40} />
                                    <p className="font-medium">No matching revenue records</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </AdminFilterWrapper>
    );
}
