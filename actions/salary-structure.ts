"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function getAllEmployeesWithSalary() {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
        return [];
    }

    try {
        const users = await prisma.user.findMany({
            where: {
                role: {
                    in: ["DOCTOR", "STAFF_NURSE", "STAFF_RECEPTION", "STAFF_LAB", "STAFF_PHARMACY"]
                },
                status: "ACTIVE"
            },
            include: {
                salaryStructure: true
            },
            orderBy: { name: 'asc' }
        });

        return users.map(u => ({
            id: u.id,
            name: u.name,
            role: u.role,
            email: u.email,
            salaryStructure: u.salaryStructure ? {
                ...u.salaryStructure,
                effectiveFrom: u.salaryStructure.effectiveFrom?.toISOString(),
                createdAt: u.salaryStructure.createdAt?.toISOString(),
                updatedAt: u.salaryStructure.updatedAt?.toISOString()
            } : null
        }));
    } catch (error) {
        console.error("Error fetching employees with salary:", error);
        return [];
    }
}
