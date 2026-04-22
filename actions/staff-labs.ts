"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { generateLabTestId } from "@/lib/id-generator";

export async function getPendingLabTests() {
    const tests = await prisma.labTest.findMany({
        include: {
            patient: {
                select: {
                    name: true,
                    phone: true
                }
            }
        },
        orderBy: { date: 'desc' }
    });

    return tests;
}

export async function updateLabTestStatus(prevState: any, formData: FormData) {
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.role.startsWith("STAFF")) {
        return { success: false, error: "Unauthorized" };
    }

    const testId = formData.get("testId") as string;
    const status = formData.get("status") as string;
    const resultUrl = formData.get("resultUrl") as string;

    if (!testId || !status) {
        return { success: false, error: "Test ID and status are required" };
    }

    try {
        await prisma.labTest.update({
            where: { id: testId },
            data: {
                status,
                resultUrl: resultUrl || null
            }
        });

        revalidatePath("/staff/labs");
        return { success: true, message: "Lab test updated successfully" };
    } catch (error) {
        console.error("Error updating lab test:", error);
        return { success: false, error: "Failed to update lab test" };
    }
}

export async function createLabTest(prevState: any, formData: FormData) {
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.role.startsWith("STAFF")) {
        return { success: false, error: "Unauthorized" };
    }

    const patientId = formData.get("patientId") as string;
    const testName = formData.get("testName") as string;

    if (!patientId || !testName) {
        return { success: false, error: "Patient and test name are required" };
    }

    try {
        const labId = await generateLabTestId();
        await prisma.labTest.create({
            data: {
                displayId: labId,
                patientId,
                testName,
                status: "PENDING"
            }
        });

        revalidatePath("/staff/labs");
        return { success: true, message: `Lab test ${labId} created` };
    } catch (error) {
        console.error("Error creating lab test:", error);
        return { success: false, error: "Failed to create lab test" };
    }
}
