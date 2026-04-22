import { getActiveDoctors, getDoctorPaymentSummary } from "@/actions/doctor-payments";
import { GlassCard } from "@/components/ui/glass-card";
import { DollarSign, Users, Stethoscope, TrendingUp } from "lucide-react";
import StaffPayrollClient from "@/components/payroll/StaffPayrollClient";

export const dynamic = "force-dynamic";

export default async function AdminDoctorPaymentsPage() {
    const [doctors, doctorSummary] = await Promise.all([
        getActiveDoctors(),
        getDoctorPaymentSummary()
    ]);

    const totalPaidOut = doctorSummary.reduce((sum, d) => sum + d.totalPaid, 0);
    const totalPatients = doctorSummary.reduce((sum, d) => sum + d.patientCount, 0);
    const totalPayments = doctorSummary.reduce((sum, d) => sum + d.paymentCount, 0);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white">Doctor Payment Recording</h1>
                <p className="text-indigo-200 mt-1">Record payments for doctors and track patient loads</p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <GlassCard className="bg-teal-500/10 border-teal-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-teal-500/20 text-teal-300">
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-indigo-200">Total Paid Out</p>
                            <h3 className="text-2xl font-bold text-white">PKR {totalPaidOut.toFixed(2)}</h3>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="bg-blue-500/10 border-blue-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-blue-500/20 text-blue-300">
                            <Stethoscope size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-indigo-200">Active Doctors</p>
                            <h3 className="text-2xl font-bold text-white">{doctors.length}</h3>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="bg-purple-500/10 border-purple-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-purple-500/20 text-purple-300">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-indigo-200">Total Patients Seen</p>
                            <h3 className="text-2xl font-bold text-white">{totalPatients}</h3>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="bg-emerald-500/10 border-emerald-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-emerald-500/20 text-emerald-300">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-indigo-200">Payment Records</p>
                            <h3 className="text-2xl font-bold text-white">{totalPayments}</h3>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Client-side interactive component */}
            <StaffPayrollClient doctors={doctors} doctorSummary={doctorSummary} />
        </div>
    );
}
