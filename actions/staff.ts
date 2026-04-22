"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { generatePatientId, generateInvoiceNumber } from "@/lib/id-generator";

export async function registerPatient(prevState: any, formData: FormData) {
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const dob = formData.get("dob") as string;
    const gender = formData.get("gender") as string;
    const address = formData.get("address") as string;
    const relatedDoctorId = formData.get("relatedDoctorId") as string;
    const familyMemberName = formData.get("familyMemberName") as string;

    if (!name || !phone || !dob) {
        return { success: false, error: "Name, Phone and DOB are required" };
    }

    try {
        const patDisplayId = await generatePatientId();
        const newPatient = await prisma.patient.create({
            data: {
                displayId: patDisplayId,
                name,
                phone,
                dob: new Date(dob),
                gender,
                address,
                relatedDoctorId: relatedDoctorId || null,
                familyMemberName: familyMemberName || null
            }
        });

        // Notify admins and staff about new patient registration
        const notifyUsers = await prisma.user.findMany({
            where: {
                OR: [
                    { role: "ADMIN" },
                    { role: { startsWith: "STAFF" } }
                ],
                status: "ACTIVE"
            }
        });

        if (notifyUsers.length > 0) {
            await prisma.notification.createMany({
                data: notifyUsers.map(user => ({
                    userId: user.id,
                    title: "New Patient Registered",
                    message: `${name} has been registered as a new patient.`,
                    type: "INFO",
                    relatedEntity: "PATIENT",
                    relatedEntityId: newPatient.id,
                    actionUrl: "/staff"
                }))
            });
        }

        return { success: true, message: `Patient registered — ID: ${patDisplayId}` };
    } catch (error) {
        console.error("Registration error:", error);
        return { success: false, error: "Failed to register patient" };
    }
}

export async function createInvoice(prevState: any, formData: FormData) {
    const patientId = formData.get("patientId") as string;
    const amount = parseFloat(formData.get("amount") as string);
    const services = formData.get("services") as string; // JSON

    if (!patientId || !amount) return { success: false, error: "Details required" };

    try {
        const invId = await generateInvoiceNumber();
        await prisma.bill.create({
            data: {
                displayId: invId,
                patientId: patientId,
                amount: amount,
                status: "UNPAID",
                items: services || "[]"
            }
        });
        revalidatePath("/staff/billing");
        return { success: true, message: `Invoice ${invId} created` };
    } catch (err) {
        console.error("Invoice Error", err);
        return { success: false, error: "Failed to create invoice" };
    }
}

export async function getBillingStats() {
    const bills = await prisma.bill.findMany({ include: { patient: true }, orderBy: { date: 'desc' } });
    const totalRevenue = bills.reduce((acc, curr) => acc + curr.amount, 0);
    const pending = bills.filter(b => b.status === 'UNPAID').reduce((acc, curr) => acc + curr.amount, 0);
    const patients = await prisma.patient.findMany({ select: { id: true, name: true, phone: true }, orderBy: { name: 'asc' } });

    return { bills, totalRevenue, pending, patients };
}

export async function markBillPaid(billId: string) {
    if (!billId) return { success: false, error: "Bill ID required" };

    try {
        const bill = await prisma.bill.findUnique({ where: { id: billId } });
        if (!bill) return { success: false, error: "Invoice not found" };
        if (bill.status === "PAID") return { success: false, error: "Already marked as paid" };

        await prisma.bill.update({
            where: { id: billId },
            data: { status: "PAID" }
        });

        // Also create a revenue record for admin tracking
        await prisma.revenueRecord.create({
            data: {
                patientId: bill.patientId,
                amount: bill.amount,
                source: "BILL_PAYMENT",
                description: `Payment for Invoice #${bill.id.substring(0, 8)}`,
                recordedBy: "SYSTEM",
            }
        });

        revalidatePath("/staff/billing");
        revalidatePath("/admin/revenue");
        return { success: true, message: "Payment recorded successfully" };
    } catch (error) {
        console.error("Mark paid error:", error);
        return { success: false, error: "Failed to record payment" };
    }
}

export async function getRevenueStats() {
    try {
        const paidBills = await prisma.bill.findMany({
            where: { status: "PAID" },
            include: { patient: true },
            orderBy: { date: 'desc' }
        });

        const revenueRecords = await prisma.revenueRecord.findMany({
            include: { patient: true },
            orderBy: { recordedAt: 'desc' }
        });

        const totalRevenue = paidBills.reduce((acc, curr) => acc + curr.amount, 0);
        const thisMonthStart = new Date();
        thisMonthStart.setDate(1);
        thisMonthStart.setHours(0, 0, 0, 0);

        const monthlyRevenue = paidBills
            .filter(b => new Date(b.date) >= thisMonthStart)
            .reduce((acc, curr) => acc + curr.amount, 0);

        const totalBills = await prisma.bill.count();
        const paidCount = paidBills.length;
        const unpaidCount = totalBills - paidCount;

        return {
            paidBills,
            revenueRecords,
            totalRevenue,
            monthlyRevenue,
            totalBills,
            paidCount,
            unpaidCount
        };
    } catch (error) {
        console.error("Revenue stats error:", error);
        return {
            paidBills: [],
            revenueRecords: [],
            totalRevenue: 0,
            monthlyRevenue: 0,
            totalBills: 0,
            paidCount: 0,
            unpaidCount: 0
        };
    }
}
