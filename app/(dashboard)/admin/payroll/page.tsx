import { getAllPayroll, getPayrollEligibleUsers } from "@/actions/payroll";
import { GlassCard } from "@/components/ui/glass-card";
import { DollarSign, Users, CheckCircle, Clock } from "lucide-react";
import PayrollGenerator from "@/components/payroll/PayrollGenerator";
import PayrollTable from "@/components/payroll/PayrollTable";

export const dynamic = "force-dynamic";

export default async function AdminPayrollPage() {
    const result = await getAllPayroll();
    const payroll = result.success && result.data ? result.data : [];
    const eligibleUsers = await getPayrollEligibleUsers();

    // Calculate stats
    const totalPayroll = payroll.reduce((sum, p) => sum + p.totalSalary, 0);
    const pending = payroll.filter(p => p.status === "PENDING").length;
    const approved = payroll.filter(p => p.status === "APPROVED").length;
    const paid = payroll.filter(p => p.status === "PAID").length;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white">Payroll Management</h1>
                <p className="text-indigo-200">Manage employee salaries and payroll</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <GlassCard className="bg-teal-500/10 border-teal-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-teal-500/20 text-teal-300">
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-indigo-200">Total Payroll</p>
                            <h3 className="text-2xl font-bold text-white">PKR {totalPayroll.toFixed(2)}</h3>
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
                            <h3 className="text-2xl font-bold text-white">{pending}</h3>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="bg-blue-500/10 border-blue-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-blue-500/20 text-blue-300">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-indigo-200">Approved</p>
                            <h3 className="text-2xl font-bold text-white">{approved}</h3>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="bg-emerald-500/10 border-emerald-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-emerald-500/20 text-emerald-300">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-indigo-200">Paid</p>
                            <h3 className="text-2xl font-bold text-white">{paid}</h3>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Payroll Generator */}
            <PayrollGenerator eligibleUsers={eligibleUsers} />

            {/* Payroll Table */}
            <PayrollTable payroll={payroll} />
        </div>
    );
}
