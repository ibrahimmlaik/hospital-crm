"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function getPatientHistory() {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "PATIENT") {
        throw new Error("Unauthorized");
    }

    // Find patient profile
    const patient = await prisma.patient.findUnique({
        where: { userId: currentUser.userId },
        include: {
            appointments: {
                include: {
                    doctor: {
                        include: { user: true }
                    },
                    prescription: true
                },
                orderBy: { date: 'desc' }
            },
            prescriptions: {
                include: {
                    doctor: {
                        include: { user: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            },
            labTests: {
                orderBy: { date: 'desc' }
            },
            vitals: {
                orderBy: { recordedAt: 'desc' }
            }
        }
    });

    if (!patient) {
        return null;
    }

    return {
        appointments: patient.appointments,
        prescriptions: patient.prescriptions,
        labTests: patient.labTests,
        vitals: patient.vitals
    };
}
