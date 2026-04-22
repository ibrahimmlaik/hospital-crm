"use server";

import { prisma } from "@/lib/prisma";

/**
 * Professional ID prefixes for each entity type
 */
const ID_PREFIXES: Record<string, string> = {
    BILL: "INV",
    APPOINTMENT: "APT",
    PRESCRIPTION: "RX",
    LAB_TEST: "LAB",
    PATIENT: "PAT",
    LEAVE: "LV",
    PAYROLL: "PAY",
};

/**
 * Counter model name in DB — we use a simple key-value approach via SystemSettings
 * Since SQLite doesn't have sequences, we track counters in a dedicated table.
 */

/**
 * Generates a professional display ID like INV-2026-0001
 * Thread-safe via database-level counter increments.
 * 
 * @param entityType - e.g. "BILL", "APPOINTMENT", "PRESCRIPTION"
 * @returns formatted ID string like "INV-2026-0042"
 */
export async function generateDisplayId(entityType: string): Promise<string> {
    const prefix = ID_PREFIXES[entityType] || entityType.substring(0, 3).toUpperCase();
    const year = new Date().getFullYear();
    const counterKey = `${prefix}_${year}`;

    // Use upsert to atomically get-and-increment the counter
    const counter = await prisma.idCounter.upsert({
        where: { key: counterKey },
        create: {
            key: counterKey,
            value: 1,
        },
        update: {
            value: { increment: 1 },
        },
    });

    const paddedNumber = counter.value.toString().padStart(4, "0");
    return `${prefix}-${year}-${paddedNumber}`;
}

/**
 * Generates a display ID synchronously-style (still async, but simple to call)
 * For use in server actions where you need the ID before creating the record.
 */
export async function generateInvoiceNumber(): Promise<string> {
    return generateDisplayId("BILL");
}

export async function generateAppointmentId(): Promise<string> {
    return generateDisplayId("APPOINTMENT");
}

export async function generatePrescriptionId(): Promise<string> {
    return generateDisplayId("PRESCRIPTION");
}

export async function generateLabTestId(): Promise<string> {
    return generateDisplayId("LAB_TEST");
}

export async function generatePatientId(): Promise<string> {
    return generateDisplayId("PATIENT");
}

export async function generatePayrollId(): Promise<string> {
    return generateDisplayId("PAYROLL");
}

export async function generateLeaveId(): Promise<string> {
    return generateDisplayId("LEAVE");
}
