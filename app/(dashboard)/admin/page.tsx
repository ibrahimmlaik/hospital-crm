import { getAdminDashboardStats, getMonthlyRevenueData, getSystemAlerts } from "@/actions/admin-dashboard";
import { GlassCard } from "@/components/ui/glass-card";
import { Users, Activity, DollarSign, Calendar, Building2, Clock, AlertTriangle } from "lucide-react";
import { RevenueChart } from "@/components/admin/RevenueChart";

export const dynamic = "force-dynamic";

const StatCard = ({ title, value, icon: Icon, color, subtitle }: any) => (
    <GlassCard className="flex items-center gap-4 relative overflow-hidden group">
        <div className={`p-4 rounded-xl bg-${color}-500/20 text-${color}-400 group-hover:scale-110 transition-transform duration-300`}>
            <Icon size={24} />
        </div>
        <div>
            <p className="text-indigo-200 text-sm font-medium">{title}</p>
            <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
            {subtitle && <p className="text-xs text-indigo-300 mt-1">{subtitle}</p>}
        </div>
        <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-${color}-500/10 rounded-full blur-2xl group-hover:bg-${color}-500/20 transition-colors`} />
    </GlassCard>
);

export default async function AdminDashboard() {
    const stats = await getAdminDashboardStats();
    const monthlyRevenue = await getMonthlyRevenueData();
    const alerts = await getSystemAlerts();

    // If stats is null, user is unauthorized or error occurred
    if (!stats) {
        return (
            <div className="flex items-center justify-center h-96">
                <GlassCard className="p-8 text-center">
                    <AlertTriangle className="mx-auto text-red-400 mb-4" size={48} />
                    <h3 className="text-xl font-bold text-white mb-2">Access Denied</h3>
                    <p className="text-indigo-300">You don't have permission to view this page.</p>
                </GlassCard>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">Admin Overview</h1>
                <p className="text-indigo-200">Real-time hospital statistics from database</p>
            </div>

            {/* Stats Grid - 100% Database Driven */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Today's Revenue"
                    value={`PKR ${stats.todayRevenue.toLocaleString()}`}
                    subtitle={`Total: PKR ${stats.totalRevenue.toLocaleString()}`}
                    icon={DollarSign}
                    color="emerald"
                />
                <StatCard
                    title="Today's Appointments"
                    value={stats.todayAppointments}
                    subtitle={`${stats.completedAppointments} completed`}
                    icon={Calendar}
                    color="blue"
                />
                <StatCard
                    title="Active Doctors"
                    value={stats.activeDoctors}
                    subtitle={`${stats.totalDoctors} total doctors`}
                    icon={Users}
                    color="violet"
                />
                <StatCard
                    title="Departments"
                    value={stats.totalDepartments}
                    subtitle={`${stats.activeStaff} active staff`}
                    icon={Building2}
                    color="teal"
                />
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Patients"
                    value={stats.totalPatients}
                    icon={Users}
                    color="pink"
                />
                <StatCard
                    title="Today's Attendance"
                    value={stats.todayAttendance}
                    subtitle="Clock-ins today"
                    icon={Clock}
                    color="orange"
                />
                <StatCard
                    title="Pending Bills"
                    value={stats.pendingBills}
                    subtitle={`${stats.paidBills} paid`}
                    icon={DollarSign}
                    color="red"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Chart - Real Data */}
                <GlassCard className="lg:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white">Monthly Revenue</h3>
                        <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                            {new Date().getFullYear()}
                        </span>
                    </div>
                    <RevenueChart data={monthlyRevenue} />
                </GlassCard>

                {/* System Alerts - Real Data */}
                <GlassCard>
                    <h3 className="text-xl font-bold text-white mb-6">System Alerts</h3>
                    <div className="space-y-4">
                        {alerts.length === 0 ? (
                            <div className="text-center py-8 text-indigo-300">
                                <AlertTriangle className="mx-auto mb-2 opacity-50" size={32} />
                                <p className="text-sm">No active alerts</p>
                            </div>
                        ) : (
                            alerts.map((alert) => (
                                <div key={alert.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                                    <AlertTriangle
                                        size={18}
                                        className={
                                            alert.type === 'CRITICAL' ? 'text-red-400' :
                                                alert.type === 'ERROR' ? 'text-orange-400' :
                                                    'text-amber-400'
                                        }
                                    />
                                    <div className="flex-1">
                                        <p className="text-sm text-slate-200 font-medium">{alert.title}</p>
                                        <p className="text-xs text-indigo-300 mt-1">{alert.message}</p>
                                        <p className="text-xs text-indigo-400 mt-1">
                                            {new Date(alert.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    {alerts.length > 0 && (
                        <button className="w-full mt-6 py-2 rounded-lg bg-indigo-500/20 text-indigo-300 text-sm hover:bg-indigo-500/30 transition-colors">
                            View All Alerts
                        </button>
                    )}
                </GlassCard>
            </div>

            {/* Empty State Message if No Data */}
            {stats.totalUsers === 0 && (
                <GlassCard className="p-8 text-center border-2 border-amber-500/30">
                    <AlertTriangle className="mx-auto text-amber-400 mb-4" size={48} />
                    <h3 className="text-xl font-bold text-white mb-2">No Data Available</h3>
                    <p className="text-indigo-300 mb-4">
                        The database is empty. Start by creating users, doctors, and patients.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <a href="/admin/users" className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-white rounded-lg transition-all">
                            Create Users
                        </a>
                    </div>
                </GlassCard>
            )}
        </div>
    );
}
