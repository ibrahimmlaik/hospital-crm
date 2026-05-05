"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function getDoctorAppointments() {
    const currentUser = await getSessionUser();
    if (!currentUser || currentUser.role !== "DOCTOR") {
        return [];
    }

    // Find doctor profile
    const doctor = await prisma.doctor.findUnique({
        where: { userId: currentUser.userId }
    });

    if (!doctor) {
        return [];
    }

    // Fetch appointments with patient details
    const appointments = await prisma.appointment.findMany({
        where: { doctorId: doctor.id },
        include: {
            patient: true,
            prescription: true
        },
        orderBy: { date: 'asc' }
    });

    return appointments;
}

export async function updateAppointmentStatus(appointmentId: string, status: string) {
    const currentUser = await getSessionUser();
    if (!currentUser || currentUser.role !== "DOCTOR") {
        return { success: false, error: "Unauthorized" };
    }

    try {
        // Update appointment
        const appointment = await prisma.appointment.update({
            where: { id: appointmentId },
            data: { status },
            include: {
                patient: { include: { user: true } },
                doctor: { include: { user: true } }
            }
        });

        // Notify patient of status change
        const statusMessages: Record<string, string> = {
            COMPLETED: "Your appointment has been completed.",
            CANCELLED: "Your appointment has been cancelled. Please contact us if you have questions.",
            SCHEDULED: "Your appointment has been rescheduled."
        };

        if (appointment.patient.user) {
            await prisma.notification.create({
                data: {
                    userId: appointment.patient.user.id,
                    title: "Appointment Status Updated",
                    message: statusMessages[status] || `Your appointment status is now: ${status}`,
                    type: status === "COMPLETED" ? "SUCCESS" : status === "CANCELLED" ? "WARNING" : "INFO",
                    relatedEntity: "APPOINTMENT",
                    relatedEntityId: appointmentId,
                    actionUrl: "/patient/appointments"
                }
            });
        }

        revalidatePath("/doctor/appointments");
        revalidatePath("/patient/appointments");
        return { success: true };
    } catch (error) {
        console.error("Error updating appointment status:", error);
        return { success: false, error: "Failed to update appointment" };
    }
}

export async function addAppointmentNotes(formData: FormData) {
    const currentUser = await getSessionUser();
    if (!currentUser || currentUser.role !== "DOCTOR") {
        return { success: false, error: "Unauthorized" };
    }

    const appointmentId = formData.get("appointmentId") as string;
    const notes = formData.get("notes") as string;

    if (!appointmentId || !notes) {
        return { success: false, error: "Missing required fields" };
    }

    try {
        await prisma.appointment.update({
            where: { id: appointmentId },
            data: { notes }
        });

        revalidatePath("/doctor/appointments");
        return { success: true, message: "Notes saved successfully" };
    } catch (error) {
        console.error("Error saving notes:", error);
        return { success: false, error: "Failed to save notes" };
    }
}

export async function createLabTestRequest(formData: FormData) {
    const currentUser = await getSessionUser();
    if (!currentUser || currentUser.role !== "DOCTOR") {
        return { success: false, error: "Unauthorized" };
    }

    const patientId = formData.get("patientId") as string;
    const testName = formData.get("testName") as string;

    if (!patientId || !testName) {
        return { success: false, error: "Missing required fields" };
    }

    try {
        await prisma.labTest.create({
            data: {
                patientId,
                testName,
                status: "PENDING"
            }
        });

        revalidatePath("/doctor/appointments");
        return { success: true, message: "Lab test requested successfully" };
    } catch (error) {
        console.error("Error creating lab test:", error);
        return { success: false, error: "Failed to request lab test" };
    }
}
