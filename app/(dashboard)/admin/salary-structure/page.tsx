import { getAllEmployeesWithSalary } from "@/actions/salary-structure";
import { GlassCard } from "@/components/ui/glass-card";
import { DollarSign, Percent, Briefcase, Calculator } from "lucide-react";
import SalaryStructureClient from "@/app/(dashboard)/admin/salary-structure/SalaryStructureClient";

export const dynamic = "force-dynamic";

export default async function SalaryStructurePage() {
    const employees = await getAllEmployeesWithSalary();

    // Stats
    const totalEmployees = employees.length;
    const configuredCount = employees.filter(e => e.salaryStructure).length;
    const avgBaseSalary = configuredCount > 0
        ? employees.reduce((sum, e) => sum + (e.salaryStructure?.baseSalary || 0), 0) / configuredCount
        : 0;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white">Salary Structure Module</h1>
                <p className="text-indigo-200 mt-1">Manage base salaries and compensation types for all staff</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <GlassCard className="bg-teal-500/10 border-teal-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-teal-500/20 text-teal-300">
                            <Briefcase size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-indigo-200">Total Eligible</p>
                            <h3 className="text-2xl font-bold text-white">{totalEmployees}</h3>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="bg-blue-500/10 border-blue-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-blue-500/20 text-blue-300">
                            <Percent size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-indigo-200">Configured</p>
                            <h3 className="text-2xl font-bold text-white">{configuredCount}</h3>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="bg-purple-500/10 border-purple-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-purple-500/20 text-purple-300">
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-indigo-200">Avg Base Salary</p>
                            <h3 className="text-2xl font-bold text-white">PKR {avgBaseSalary.toFixed(0)}</h3>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="bg-emerald-500/10 border-emerald-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-emerald-500/20 text-emerald-300">
                            <Calculator size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-indigo-200">Unconfigured</p>
                            <h3 className="text-2xl font-bold text-white">{totalEmployees - configuredCount}</h3>
                        </div>
                    </div>
                </GlassCard>
            </div>

            <SalaryStructureClient initialEmployees={employees} />
        </div>
    );
}
