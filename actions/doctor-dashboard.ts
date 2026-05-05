"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

/**
 * Get Doctor Dashboard Data - 100% Database Driven
 */
export async function getDoctorDashboardData() {
    const user = await getSessionUser();
    if (!user || user.role !== "DOCTOR") {
        return null;
    }

    try {
        // Get doctor profile
        let doctor = await prisma.doctor.findUnique({
            where: { userId: user.userId },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                },
                departments: {
                    include: {
                        department: true
                    }
                }
            }
        });

        if (!doctor) {
            // Auto-create doctor profile if missing (without assigning random department)
            doctor = await prisma.doctor.create({
                data: {
                    userId: user.userId,
                    licenseNumber: `DOC-${Math.floor(Math.random() * 10000)}`,
                    qualification: "MD",
                },
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true
                        }
                    },
                    departments: {
                        include: {
                            department: true
                        }
                    }
                }
            });
        }

        if (!doctor) {
            return null;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get today's appointments
        const todayAppointments = await prisma.appointment.findMany({
            where: {
                doctorId: doctor.id,
                date: {
                    gte: today,
                    lt: tomorrow
                }
            },
            include: {
                patient: {
                    include: {
                        user: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            },
            orderBy: { date: 'asc' }
        });

        // Get stats
        const [totalAppointments, completedAppointments] = await Promise.all([
            prisma.appointment.count({
                where: { doctorId: doctor.id }
            }),
            prisma.appointment.count({
                where: {
                    doctorId: doctor.id,
                    status: "COMPLETED"
                }
            })
        ]);

        return {
            doctor: {
                ...doctor,
                user: doctor.user
            },
            stats: {
                todayAppointments: todayAppointments.length,
                totalAppointments,
                completedAppointments
            },
            todayAppointments
        };
    } catch (error) {
        console.error("Error fetching doctor dashboard data:", error);
        return null;
    }
}

/**
 * Get Doctor Stats - Legacy function, now calls getDoctorDashboardData
 * @deprecated Use getDoctorDashboardData instead
 */
export async function getDoctorStats() {
    const data = await getDoctorDashboardData();
    if (!data) return null;

    return {
        appointments: data.stats.todayAppointments,
        completed: data.stats.completedAppointments,
        avgTime: "-" // This should be calculated from actual appointment durations
    };
}
