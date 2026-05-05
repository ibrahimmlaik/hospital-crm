"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

/**
 * Get Admin Dashboard Stats - 100% Database Driven
 */
export async function getAdminDashboardStats() {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
        return null;
    }

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get real counts from database
        const [
            totalUsers,
            totalDoctors,
            totalPatients,
            todayAppointments,
            totalAppointments,
            completedAppointments,
            pendingAppointments,
            totalBills,
            paidBills,
            pendingBills,
            totalRevenue,
            todayRevenue,
            activeDoctors,
            activeStaff,
            totalDepartments,
            todayAttendance
        ] = await Promise.all([
            prisma.user.count({ where: { status: "ACTIVE" } }),
            prisma.doctor.count(),
            prisma.patient.count(),
            prisma.appointment.count({
                where: {
                    date: {
                        gte: today,
                        lt: tomorrow
                    }
                }
            }),
            prisma.appointment.count(),
            prisma.appointment.count({ where: { status: "COMPLETED" } }),
            prisma.appointment.count({ where: { status: "PENDING" } }),
            prisma.bill.count(),
            prisma.bill.count({ where: { status: "PAID" } }),
            prisma.bill.count({ where: { status: "PENDING" } }),
            prisma.bill.aggregate({
                where: { status: "PAID" },
                _sum: { amount: true }
            }),
            prisma.bill.aggregate({
                where: {
                    status: "PAID",
                    date: {
                        gte: today,
                        lt: tomorrow
                    }
                },
                _sum: { amount: true }
            }),
            prisma.user.count({
                where: {
                    role: "DOCTOR",
                    status: "ACTIVE"
                }
            }),
            prisma.user.count({
                where: {
                    role: { in: ["STAFF_NURSE", "STAFF_RECEPTION", "STAFF_LAB", "STAFF_PHARMACY"] },
                    status: "ACTIVE"
                }
            }),
            prisma.department.count({ where: { isActive: true } }),
            prisma.attendance.count({
                where: {
                    date: {
                        gte: today,
                        lt: tomorrow
                    }
                }
            })
        ]);

        return {
            totalUsers,
            totalDoctors,
            totalPatients,
            todayAppointments,
            totalAppointments,
            completedAppointments,
            pendingAppointments,
            totalBills,
            paidBills,
            pendingBills,
            totalRevenue: totalRevenue._sum.amount || 0,
            todayRevenue: todayRevenue._sum.amount || 0,
            activeDoctors,
            activeStaff,
            totalDepartments,
            todayAttendance
        };
    } catch (error) {
        console.error("Error fetching admin dashboard stats:", error);
        return null;
    }
}

/**
 * Get Monthly Revenue Data for Chart - Real Data
 */
export async function getMonthlyRevenueData(year?: number) {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
        return [];
    }

    try {
        const targetYear = year || new Date().getFullYear();

        // Fetch all paid bills for the year in one query
        const yearStart = new Date(targetYear, 0, 1);
        const yearEnd = new Date(targetYear, 11, 31, 23, 59, 59);

        const bills = await prisma.bill.findMany({
            where: {
                status: "PAID",
                date: {
                    gte: yearStart,
                    lte: yearEnd
                }
            },
            select: { date: true, amount: true }
        });

        // Group by month
        const monthlyData = [];
        for (let month = 0; month < 12; month++) {
            const monthBills = bills.filter(b => {
                const billDate = new Date(b.date);
                return billDate.getMonth() === month;
            });
            const revenue = monthBills.reduce((sum, b) => sum + b.amount, 0);

            monthlyData.push({
                month: month + 1,
                monthName: new Date(targetYear, month).toLocaleString('default', { month: 'short' }),
                revenue
            });
        }

        return monthlyData;
    } catch (error) {
        console.error("Error fetching monthly revenue:", error);
        return [];
    }
}

/**
 * Get System Alerts - Real Database-Driven Alerts
 */
export async function getSystemAlerts() {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
        return [];
    }

    try {
        // Get real system alerts from notifications
        const alerts = await prisma.notification.findMany({
            where: {
                userId: user.userId,
                type: { in: ["WARNING", "ERROR", "CRITICAL"] },
                read: false
            },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        return alerts;
    } catch (error) {
        console.error("Error fetching system alerts:", error);
        return [];
    }
}

/**
 * Get Recent Activity - Real User Actions
 */
export async function getRecentActivity(limit = 10) {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
        return [];
    }

    try {
        const recentLogs = await prisma.auditLog.findMany({
            where: {
                action: {
                    in: [
                        "USER_CREATE",
                        "APPOINTMENT_CREATE",
                        "CLOCK_IN",
                        "CLOCK_OUT",
                        "PAYROLL_GENERATE",
                        "DEPARTMENT_CREATE"
                    ]
                }
            },
            include: {
                user: {
                    select: {
                        name: true,
                        role: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: limit
        });

        return recentLogs;
    } catch (error) {
        console.error("Error fetching recent activity:", error);
        return [];
    }
}
