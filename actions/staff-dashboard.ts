"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

/**
 * Get Staff Dashboard Data - 100% Database Driven
 */
export async function getStaffDashboardData() {
    const user = await getSessionUser();
    if (!user || !user.role.startsWith("STAFF_")) {
        return null;
    }

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get bed data (if Bed model exists, otherwise return empty)
        let beds: any[] = [];
        let occupiedBeds = 0;
        let cleaningBeds = 0;
        let availableBeds = 0;

        // Check if Bed model exists in schema
        try {
            // @ts-ignore - Bed model may not exist yet
            beds = await prisma.bed?.findMany({
                orderBy: { bedNumber: 'asc' },
                take: 50 // Limit to 50 beds for display
            }) || [];

            occupiedBeds = beds.filter(b => b.status === 'OCCUPIED').length;
            cleaningBeds = beds.filter(b => b.status === 'CLEANING').length;
            availableBeds = beds.filter(b => b.status === 'AVAILABLE').length;
        } catch (error) {
            // Bed model doesn't exist, use empty array
            beds = [];
        }

        // Get appointment stats + user name in parallel
        const [todayAppointments, completedToday, pendingToday, totalPatients, staffUser] = await Promise.all([
            prisma.appointment.count({
                where: {
                    date: {
                        gte: today,
                        lt: tomorrow
                    }
                }
            }),
            prisma.appointment.count({
                where: {
                    date: {
                        gte: today,
                        lt: tomorrow
                    },
                    status: 'COMPLETED'
                }
            }),
            prisma.appointment.count({
                where: {
                    date: {
                        gte: today,
                        lt: tomorrow
                    },
                    status: { in: ['PENDING', 'CONFIRMED'] }
                }
            }),
            prisma.patient.count(),
            prisma.user.findUnique({ where: { id: user.userId }, select: { name: true } })
        ]);

        return {
            user: {
                name: staffUser?.name ?? user.role,
                role: user.role
            },
            beds,
            stats: {
                occupiedBeds,
                cleaningBeds,
                availableBeds,
                totalBeds: beds.length,
                todayAppointments,
                completedToday,
                pendingToday,
                totalPatients
            }
        };
    } catch (error) {
        console.error("Error fetching staff dashboard data:", error);
        return null;
    }
}
