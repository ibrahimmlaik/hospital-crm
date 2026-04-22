"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

/**
 * Get Patient Dashboard Data - 100% Database Driven
 */
export async function getPatientDashboardData() {
    const user = await getCurrentUser();
    if (!user || user.role !== "PATIENT") {
        return null;
    }

    try {
        // Get patient profile
        const patient = await prisma.patient.findUnique({
            where: { userId: user.userId },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });

        if (!patient) {
            return null;
        }

        // Get all appointments
        const appointments = await prisma.appointment.findMany({
            where: { patientId: patient.id },
            include: {
                department: true,
                doctor: {
                    include: {
                        user: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            },
            orderBy: { date: 'desc' }
        });

        // Get next upcoming appointment
        const now = new Date();
        const nextAppointment = await prisma.appointment.findFirst({
            where: {
                patientId: patient.id,
                date: { gte: now },
                status: { in: ["PENDING", "CONFIRMED"] }
            },
            include: {
                department: true,
                doctor: {
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

        // Get active prescriptions
        const prescriptions = await prisma.prescription.findMany({
            where: { patientId: patient.id },
            include: {
                doctor: {
                    include: {
                        user: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        return {
            patient: {
                ...patient,
                name: patient.user?.name || "Unknown Patient",
                email: patient.user?.email || "No Email"
            },
            appointments,
            nextAppointment,
            prescriptions
        };
    } catch (error) {
        console.error("Error fetching patient dashboard data:", error);
        return null;
    }
}
