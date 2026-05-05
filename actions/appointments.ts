"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { generatePatientId, generateAppointmentId } from "@/lib/id-generator";

export async function getSpecializations() {
    try {
        const departments = await prisma.department.findMany({
            select: { name: true },
            distinct: ['name']
        });
        return departments.map(d => d.name);
    } catch (error) {
        console.error("Error fetching departments/specializations:", error);
        return [];
    }
}

export async function getDoctorsBySpecialization(departmentName: string) {
    if (!departmentName) return [];

    try {
        const doctors = await prisma.doctor.findMany({
            where: {
                departments: {
                    some: {
                        department: {
                            name: departmentName
                        }
                    }
                },
                user: { status: "ACTIVE" } // Only show active doctors
            },
            include: {
                user: {
                    select: { name: true }
                }
            }
        });

        return doctors.map(doc => ({
            id: doc.id,
            name: doc.user.name,
            specialization: departmentName, // Maintaining the key for frontend compatibility
            availability: doc.availability // JSON string
        }));
    } catch (error) {
        console.error("Error fetching doctors:", error);
        return [];
    }
}

export async function bookAppointment(formData: FormData) {
    const user = await getSessionUser();
    if (!user || user.role !== "PATIENT") {
        return { success: false, error: "Unauthorized" };
    }

    const doctorId = formData.get("doctorId") as string;
    const dateStr = formData.get("date") as string; // YYYY-MM-DD
    const timeSlot = formData.get("timeSlot") as string; // HH:mm
    const reason = formData.get("reason") as string;
    const notes = formData.get("notes") as string || "";

    if (!doctorId || !dateStr || !timeSlot || !reason) {
        return { success: false, error: "Missing required fields" };
    }

    try {
        // 1. Combine Date and Time
        const appointmentDate = new Date(`${dateStr}T${timeSlot}:00`);

        // 2. Check Valid Date
        if (isNaN(appointmentDate.getTime()) || appointmentDate < new Date()) {
            return { success: false, error: "Invalid or past date selected" };
        }

        // 3. Check Double Booking
        // Check if doctor is busy
        const existingAppt = await prisma.appointment.findFirst({
            where: {
                doctorId,
                date: appointmentDate,
                status: { not: "CANCELLED" }
            }
        });

        if (existingAppt) {
            return { success: false, error: "Doctor is not available at this time." };
        }

        // Check if patient has another appointment at same time? (Optional constraint)

        // 4. Get or Create Patient Profile
        let patient = await prisma.patient.findUnique({
            where: { userId: user.userId }
        });

        // If patient profile doesn't exist, create it
        if (!patient) {
            // Fetch user's name from DB (only needed once for profile creation)
            const userRecord = await prisma.user.findUnique({ where: { id: user.userId }, select: { name: true } });
            const patId = await generatePatientId();
            patient = await prisma.patient.create({
                data: {
                    displayId: patId,
                    userId: user.userId,
                    name: userRecord?.name ?? "Patient",
                    phone: "",
                    dob: new Date(),
                    gender: "Other"
                }
            });
        }

        // 5. Fetch Department for the doctor
        const doctorDept = await prisma.doctorDepartment.findFirst({
            where: { doctorId }
        });

        if (!doctorDept) {
            return { success: false, error: "Doctor is not assigned to any department." };
        }

        // 6. Create Appointment
        const aptId = await generateAppointmentId();
        const appointment = await prisma.appointment.create({
            data: {
                displayId: aptId,
                patientId: patient.id,
                doctorId,
                departmentId: doctorDept.departmentId,
                date: appointmentDate,
                status: "SCHEDULED", // Changed from PENDING to match doctor UI
                reason,
                notes
            },
            include: {
                doctor: { include: { user: true } },
                patient: { include: { user: true } }
            }
        });

        // 7. Notify Doctor/Admin
        // Notify Doctor
        await prisma.notification.create({
            data: {
                userId: appointment.doctor.userId,
                title: "New Appointment Request",
                message: `Patient ${appointment.patient.name} has requested an appointment on ${dateStr} at ${timeSlot}.`,
                type: "INFO",
                relatedEntity: "APPOINTMENT",
                relatedEntityId: appointment.id,
                actionUrl: "/doctor/appointments"
            }
        });

        // Notify Admins
        const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
        if (admins.length > 0) {
            await prisma.notification.createMany({
                data: admins.map(admin => ({
                    userId: admin.id,
                    title: "New Appointment",
                    message: `${appointment.patient.name} booked with Dr. ${appointment.doctor.user.name}`,
                    type: "INFO",
                    relatedEntity: "APPOINTMENT",
                    relatedEntityId: appointment.id,
                    actionUrl: "/admin/appointments"
                }))
            });
        }

        revalidatePath("/patient/appointments");
        return { success: true, message: "Appointment request submitted successfully!" };

    } catch (error) {
        console.error("Booking error:", error);
        return { success: false, error: "Failed to book appointment. Please try again." };
    }
}
