"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { revalidatePath } from "next/cache";

/**
 * Add a payment record for a doctor (called by ADMIN)
 */
export async function addDoctorPayment(prevState: any, formData: FormData) {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }

    const doctorId = formData.get("doctorId") as string;
    const amount = parseFloat(formData.get("amount") as string);
    const patientName = formData.get("patientName") as string;
    const description = formData.get("description") as string;

    if (!doctorId || !amount || isNaN(amount) || amount <= 0) {
        return { success: false, error: "Doctor and a valid amount are required" };
    }

    try {
        // Verify doctor exists
        const doctorUser = await prisma.user.findUnique({
            where: { id: doctorId, role: "DOCTOR" },
            select: { id: true, name: true }
        });
        if (!doctorUser) return { success: false, error: "Doctor not found" };

        // Try to find patient if name provided
        let patientId: string | undefined;
        if (patientName && patientName.trim()) {
            const patient = await prisma.patient.findFirst({
                where: { name: { contains: patientName.trim() } }
            });
            if (patient) patientId = patient.id;
        }

        await prisma.revenueRecord.create({
            data: {
                source: "DOCTOR_PAYMENT",
                amount,
                doctorId,
                patientId: patientId ?? null,
                description: description || (patientName ? `Payment for patient: ${patientName}` : `Payment to Dr. ${doctorUser.name}`),
                recordedBy: user.userId,
            }
        });

        revalidatePath("/admin/doctor-payments");
        revalidatePath("/admin/payroll");
        return { success: true, message: `Payment of PKR ${amount.toFixed(2)} recorded for Dr. ${doctorUser.name}` };
    } catch (error) {
        console.error("Error recording doctor payment:", error);
        return { success: false, error: "Failed to record payment" };
    }
}

/**
 * Get all doctors with their patient counts and total payments recorded
 */
export async function getDoctorPaymentSummary() {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
        return [];
    }

    try {
        // Get all active doctors with their profile and appointment counts
        const doctors = await prisma.user.findMany({
            where: { role: "DOCTOR", status: "ACTIVE" },
            select: {
                id: true,
                name: true,
                email: true,
                doctorProfile: {
                    select: {
                        id: true,
                        departments: {
                            select: {
                                department: { select: { name: true } }
                            }
                        },
                        _count: {
                            select: { appointments: true, prescriptions: true }
                        }
                    }
                }
            },
            orderBy: { name: "asc" }
        });

        // Get payment records per doctor
        const paymentRecords = await prisma.revenueRecord.findMany({
            where: { source: "DOCTOR_PAYMENT", doctorId: { not: null } },
            orderBy: { recordedAt: "desc" }
        });

        // Group payments by doctor
        const paymentsByDoctor = paymentRecords.reduce<Record<string, typeof paymentRecords>>((acc, rec) => {
            const did = rec.doctorId!;
            acc[did] = acc[did] || [];
            acc[did].push(rec);
            return acc;
        }, {});

        return doctors.map(doc => {
            const payments = paymentsByDoctor[doc.id] || [];
            const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
            const dept = doc.doctorProfile?.departments?.[0]?.department?.name ?? "—";
            const patientCount = doc.doctorProfile?._count?.appointments ?? 0;
            const prescriptionCount = doc.doctorProfile?._count?.prescriptions ?? 0;
            return {
                id: doc.id,
                name: doc.name,
                email: doc.email,
                department: dept,
                patientCount,
                prescriptionCount,
                totalPaid,
                paymentCount: payments.length,
                recentPayments: payments.slice(0, 5).map(p => ({
                    ...p,
                    recordedAt: p.recordedAt.toISOString()
                }))
            };
        });
    } catch (error) {
        console.error("Error fetching doctor payment summary:", error);
        return [];
    }
}

/**
 * Get all payment records for a specific doctor
 */
export async function getDoctorPayments(doctorId: string) {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
        return [];
    }

    try {
        const payments = await prisma.revenueRecord.findMany({
            where: { source: "DOCTOR_PAYMENT", doctorId },
            orderBy: { recordedAt: "desc" }
        });
        return payments.map(p => ({
            ...p,
            recordedAt: p.recordedAt.toISOString()
        }));
    } catch (error) {
        console.error("Error fetching doctor payments:", error);
        return [];
    }
}

/**
 * Get list of all active doctors (for dropdown in receptionist form)
 */
export async function getActiveDoctors() {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
        return [];
    }

    try {
        return await prisma.user.findMany({
            where: { role: "DOCTOR", status: "ACTIVE" },
            select: { id: true, name: true, email: true },
            orderBy: { name: "asc" }
        });
    } catch (error) {
        console.error("Error fetching doctors:", error);
        return [];
    }
}
