"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function recordVitals(prevState: any, formData: FormData) {
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.role.startsWith("STAFF")) {
        return { success: false, error: "Unauthorized" };
    }

    const patientId = formData.get("patientId") as string;
    const bloodPressure = formData.get("bloodPressure") as string;
    const temperature = formData.get("temperature") as string;
    const pulse = formData.get("pulse") as string;
    const oxygenLevel = formData.get("oxygenLevel") as string;
    const notes = formData.get("notes") as string;

    if (!patientId || !bloodPressure || !temperature || !pulse) {
        return { success: false, error: "Required fields: Patient, BP, Temperature, Pulse" };
    }

    try {
        await prisma.vital.create({
            data: {
                patientId,
                recordedBy: currentUser.userId,
                bloodPressure,
                temperature: parseFloat(temperature),
                pulse: parseInt(pulse),
                oxygenLevel: oxygenLevel ? parseInt(oxygenLevel) : null,
                notes: notes || null
            }
        });

        revalidatePath("/staff/vitals");
        return { success: true, message: "Vitals recorded successfully" };
    } catch (error) {
        console.error("Error recording vitals:", error);
        return { success: false, error: "Failed to record vitals" };
    }
}

export async function getPatientVitals(patientId: string) {
    const vitals = await prisma.vital.findMany({
        where: { patientId },
        orderBy: { recordedAt: 'desc' },
        take: 10
    });

    return vitals;
}

export async function getAllPatients() {
    const patients = await prisma.patient.findMany({
        select: {
            id: true,
            name: true,
            phone: true
        },
        orderBy: { name: 'asc' }
    });

    return patients;
}

export async function getRecentVitals() {
    const vitals = await prisma.vital.findMany({
        include: {
            patient: {
                select: {
                    name: true
                }
            }
        },
        orderBy: { recordedAt: 'desc' },
        take: 20
    });

    return vitals;
}
