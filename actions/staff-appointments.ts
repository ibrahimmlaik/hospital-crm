"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { generateAppointmentId } from "@/lib/id-generator";

export async function createAppointment(prevState: any, formData: FormData) {
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.role.startsWith("STAFF")) {
        return { success: false, error: "Unauthorized" };
    }

    const patientId = formData.get("patientId") as string;
    const doctorId = formData.get("doctorId") as string;
    const date = formData.get("date") as string;
    const time = formData.get("time") as string;
    const service = formData.get("service") as string;
    const reason = formData.get("reason") as string;

    if (!patientId || !doctorId || !date || !time || !service) {
        return { success: false, error: "All fields are required" };
    }

    try {
        // Combine date and time
        const appointmentDateTime = new Date(`${date}T${time}`);

        // Get doctor's primary department
        const docDept = await prisma.doctorDepartment.findFirst({
            where: { doctorId }
        });

        if (!docDept) {
            return { success: false, error: "Doctor has no department assigned" };
        }

        // Build the reason string with service info
        const fullReason = reason
            ? `[${service}] ${reason}`
            : service;

        const aptId = await generateAppointmentId();
        await prisma.appointment.create({
            data: {
                displayId: aptId,
                patientId,
                doctorId,
                departmentId: docDept.departmentId,
                date: appointmentDateTime,
                status: "SCHEDULED",
                reason: fullReason
            }
        });

        revalidatePath("/staff/appointments");
        return { success: true, message: `Appointment ${aptId} created successfully` };
    } catch (error) {
        console.error("Error creating appointment:", error);
        return { success: false, error: "Failed to create appointment" };
    }
}

export async function getAllDoctors() {
    const doctors = await prisma.doctor.findMany({
        include: {
            user: {
                select: {
                    name: true
                }
            }
        }
    });

    return doctors;
}

export async function getStaffAppointments() {
    const appointments = await prisma.appointment.findMany({
        include: {
            patient: {
                select: {
                    name: true,
                    phone: true
                }
            },
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
        orderBy: { date: 'desc' },
        take: 50
    });

    return appointments;
}
