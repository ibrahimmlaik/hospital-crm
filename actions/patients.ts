"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

/**
 * Get Patients associated with a specific Doctor
 */
export async function getDoctorPatients() {
    const user = await getSessionUser();

    // Quick auth check to make sure they are a doctor
    if (!user || user.role !== "DOCTOR") {
        return [];
    }

    try {
        // Find real doctor instance
        const doctor = await prisma.doctor.findUnique({
            where: { userId: user.userId }
        });

        if (!doctor) return [];

        // Fetch distinct patients who have had or have scheduled appointments with this doctor
        const patients = await prisma.patient.findMany({
            where: {
                appointments: {
                    some: {
                        doctorId: doctor.id
                    }
                }
            },
            include: {
                appointments: {
                    where: {
                        doctorId: doctor.id
                    },
                    orderBy: {
                        date: 'desc'
                    }
                }
            }
        });

        // Format to map into the frontend structure
        return patients.map(p => {
            const latestAppointment = p.appointments[0]; // because of the desc sort, this is the most recent

            // Generate a random ID for UI (since they requested a "unique random id")
            const randomDisplayId = Math.floor(1000 + Math.random() * 9000);

            // Compute Age from DOB
            const ageDiffMs = Date.now() - new Date(p.dob).getTime();
            const ageDate = new Date(ageDiffMs);
            const age = Math.abs(ageDate.getUTCFullYear() - 1970);

            // Format Last Visit 
            let lastVisitText = "Never";
            if (latestAppointment) {
                const apptDate = new Date(latestAppointment.date);
                const today = new Date();

                if (apptDate.toDateString() === today.toDateString()) {
                    lastVisitText = "Today";
                } else {
                    lastVisitText = apptDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
                }
            }

            return {
                id: p.id,
                displayId: randomDisplayId,
                name: p.name,
                age: age || "N/A",
                gender: p.gender || "Unknown",
                lastVisit: lastVisitText,
                condition: p.medicalHistory || latestAppointment?.reason || "General Checkup",
            };
        });

    } catch (error) {
        console.error("Error fetching doctor patients:", error);
        return [];
    }
}

export async function getPatientDetailsForDoctor(patientId: string) {
    const user = await getSessionUser();
    if (!user || user.role !== "DOCTOR") return null;

    try {
        const patient = await prisma.patient.findUnique({
            where: { id: patientId },
            include: {
                appointments: {
                    orderBy: { date: 'desc' },
                    include: { doctor: { include: { user: true } } }
                },
                prescriptions: { orderBy: { createdAt: 'desc' } },
                labTests: { orderBy: { date: 'desc' } },
                vitals: { orderBy: { recordedAt: 'desc' } }
            }
        });

        return patient;
    } catch (error) {
        console.error("Error fetching patient details:", error);
        return null;
    }
}

import { revalidatePath } from "next/cache";

export async function addPatientVitals(patientId: string, formData: FormData) {
    const user = await getSessionUser();
    if (!user || user.role !== "DOCTOR") {
        return { success: false, error: "Unauthorized" };
    }

    const bloodPressure = formData.get("bloodPressure") as string;
    const pulse = formData.get("pulse") as string;
    const temperature = formData.get("temperature") as string;
    const oxygenLevel = formData.get("oxygenLevel") as string;

    if (!bloodPressure || !pulse || !temperature) {
        return { success: false, error: "Blood pressure, pulse, and temperature are required." };
    }

    try {
        await prisma.vital.create({
            data: {
                patientId,
                recordedBy: user.userId, // Record who added the vitals
                bloodPressure,
                pulse: parseInt(pulse),
                temperature: parseFloat(temperature),
                oxygenLevel: oxygenLevel ? parseFloat(oxygenLevel) : null,
            }
        });

        revalidatePath(`/doctor/patients/${patientId}/vitals`);
        return { success: true };
    } catch (error) {
        console.error("Error saving vitals:", error);
        return { success: false, error: "Failed to record vitals." };
    }
}
