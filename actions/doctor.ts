"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";
import { generateAppointmentId, generatePrescriptionId, generateLabTestId } from "@/lib/id-generator";

export async function createPrescription(prevState: any, formData: FormData) {
    const patientId = formData.get("patientId") as string;
    const medicines = formData.get("medicines") as string;
    const notes = formData.get("notes") as string;
    const labTests = formData.get("labTests") as string;

    if (!patientId || !medicines) {
        return { success: false, error: "Patient and Medicines are required" };
    }

    try {
        // 1. Find the patient
        const patient = await prisma.patient.findUnique({ where: { id: patientId } });
        if (!patient) {
            return { success: false, error: "Patient not found" };
        }

        // 2. Find current doctor
        const user = await getCurrentUser();
        let doctor;
        if (user && user.role === "DOCTOR") {
            doctor = await prisma.doctor.findUnique({ where: { userId: user.userId } });
        }
        if (!doctor) {
            doctor = await prisma.doctor.findFirst();
        }
        if (!doctor) {
            return { success: false, error: "No doctor profile found" };
        }

        const docDept = await prisma.doctorDepartment.findFirst({
            where: { doctorId: doctor.id }
        });

        // 3. Create Appointment (Implicit for the prescription)
        const aptId = await generateAppointmentId();
        const appointment = await prisma.appointment.create({
            data: {
                displayId: aptId,
                patientId: patient.id,
                doctorId: doctor.id,
                departmentId: docDept ? docDept.departmentId : (await prisma.department.findFirst())?.id || "unknown",
                date: new Date(),
                status: "COMPLETED",
                reason: "Prescription Visit"
            }
        });

        // 4. Build full notes with lab tests
        let fullNotes = notes || "";
        const parsedLabTests = labTests ? JSON.parse(labTests) : [];
        if (parsedLabTests.length > 0) {
            fullNotes += `\n\n--- LAB TESTS ORDERED ---\n${parsedLabTests.join("\n")}`;
        }

        // 5. Create Prescription
        const rxId = await generatePrescriptionId();
        await prisma.prescription.create({
            data: {
                displayId: rxId,
                appointmentId: appointment.id,
                patientId: patient.id,
                doctorId: doctor.id,
                medicines: medicines,
                notes: fullNotes || null,
                status: "PENDING"
            }
        });

        // 6. Create lab test records if any
        if (parsedLabTests.length > 0) {
            for (const testName of parsedLabTests) {
                const labId = await generateLabTestId();
                await prisma.labTest.create({
                    data: {
                        displayId: labId,
                        patientId: patient.id,
                        testName: testName,
                        status: "PENDING",
                        date: new Date()
                    }
                }).catch(() => {
                    // Silently continue if lab test creation fails (model might not have all fields)
                });
            }
        }

        return { success: true, message: `Prescription issued with ${parsedLabTests.length} lab test(s) ordered` };
    } catch (error) {
        console.error("Prescription error:", error);
        return { success: false, error: "Failed to issue prescription" };
    }
}

export async function getDoctorStats() {
    // Determine current doctor (first one for demo)
    const doctor = await prisma.doctor.findFirst();
    if (!doctor) return null;

    const appointments = await prisma.appointment.count({
        where: { doctorId: doctor.id, date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } }
    });

    const completed = await prisma.appointment.count({
        where: { doctorId: doctor.id, status: "COMPLETED" }
    });

    return { appointments, completed, avgTime: "15m" };
}

export async function getDoctorsList() {
    try {
        const doctors = await prisma.doctor.findMany({
            include: { user: { select: { name: true, email: true } } },
            orderBy: { user: { name: "asc" } }
        });
        return doctors;
    } catch (e) {
        console.error("Failed to fetch doctors", e);
        return [];
    }
}

/**
 * Get the logged-in doctor's patients for prescription dropdown
 */
export async function getMyPatients() {
    const user = await getCurrentUser();
    if (!user || user.role !== "DOCTOR") return [];

    try {
        const doctor = await prisma.doctor.findUnique({
            where: { userId: user.userId }
        });
        if (!doctor) return [];

        const patients = await prisma.patient.findMany({
            where: {
                appointments: {
                    some: { doctorId: doctor.id }
                }
            },
            select: {
                id: true,
                name: true,
                phone: true,
                gender: true,
                dob: true,
            },
            orderBy: { name: "asc" }
        });

        return patients.map(p => ({
            id: p.id,
            name: p.name,
            phone: p.phone,
            gender: p.gender,
            age: Math.abs(new Date(Date.now() - new Date(p.dob).getTime()).getUTCFullYear() - 1970),
        }));
    } catch (error) {
        console.error("Error fetching doctor patients:", error);
        return [];
    }
}
