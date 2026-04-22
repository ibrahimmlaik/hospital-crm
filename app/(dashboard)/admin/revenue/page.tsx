import { getRevenueStats } from "@/actions/staff";
import { GlassCard } from "@/components/ui/glass-card";
import { DollarSign, TrendingUp, CheckCircle, XCircle, BarChart3 } from "lucide-react";
import RevenueTableClient from "@/components/admin/RevenueTableClient";

export default async function AdminRevenuePage() {
    const stats = await getRevenueStats();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white">Revenue Dashboard</h1>
                <p className="text-indigo-200">Track hospital income from patient payments</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <GlassCard className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-emerald-500/20 text-emerald-400">
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <p className="text-xs text-indigo-300 uppercase tracking-wider">Total Revenue</p>
                            <h3 className="text-2xl font-bold text-white">PKR {stats.totalRevenue.toLocaleString()}</h3>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-blue-500/20 text-blue-400">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-xs text-indigo-300 uppercase tracking-wider">This Month</p>
                            <h3 className="text-2xl font-bold text-white">PKR {stats.monthlyRevenue.toLocaleString()}</h3>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="bg-gradient-to-br from-teal-500/10 to-teal-500/5 border-teal-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-teal-500/20 text-teal-400">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <p className="text-xs text-indigo-300 uppercase tracking-wider">Paid Invoices</p>
                            <h3 className="text-2xl font-bold text-white">{stats.paidCount}</h3>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-red-500/20 text-red-400">
                            <XCircle size={24} />
                        </div>
                        <div>
                            <p className="text-xs text-indigo-300 uppercase tracking-wider">Unpaid Invoices</p>
                            <h3 className="text-2xl font-bold text-white">{stats.unpaidCount}</h3>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Revenue Breakdown Bar */}
            {stats.totalBills > 0 && (
                <GlassCard>
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <BarChart3 size={20} className="text-teal-400" /> Payment Collection Rate
                    </h3>
                    <div className="w-full bg-white/5 rounded-full h-6 overflow-hidden border border-white/10">
                        <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-1000 flex items-center justify-center text-[11px] font-bold text-white"
                            style={{ width: `${Math.round((stats.paidCount / stats.totalBills) * 100)}%` }}
                        >
                            {Math.round((stats.paidCount / stats.totalBills) * 100)}% Collected
                        </div>
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-indigo-300">
                        <span>{stats.paidCount} Paid</span>
                        <span>{stats.unpaidCount} Unpaid</span>
                    </div>
                </GlassCard>
            )}

            {/* Paid Bills Table with Search */}
            <GlassCard className="p-0 overflow-hidden">
                <RevenueTableClient paidBills={stats.paidBills} />
            </GlassCard>
        </div>
    );
}
