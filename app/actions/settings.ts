"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateSecuritySettings(userId: string, data: { twoFactorEnabled?: boolean; passwordExpiry?: boolean }) {
    if (!userId) {
        return { error: "User ID is required" };
    }

    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                ...data
            }
        });
        revalidatePath("/admin/settings");
        return { success: true };
    } catch (error) {
        console.error("Failed to update security settings:", error);
        return { error: "Failed to update settings" };
    }
}

export async function getSystemSettings() {
    try {
        const settings = await prisma.systemSettings.findFirst();
        return settings;
    } catch (error) {
        return null;
    }
}

export async function updateSystemSettings(data: { hospitalName: string }) {
    try {
        // Upsert ensures we create if doesn't exist, or update the first one we find
        // Since we don't know the ID, we'll try to find one first or create it.
        // Actually, prisma upsert needs a unique where clause. 
        // For a singleton, we can just findFirst and then update or create.

        const existing = await prisma.systemSettings.findFirst();

        if (existing) {
            await prisma.systemSettings.update({
                where: { id: existing.id },
                data: { hospitalName: data.hospitalName }
            });
        } else {
            await prisma.systemSettings.create({
                data: { hospitalName: data.hospitalName }
            });
        }

        revalidatePath("/admin/settings");
        revalidatePath("/"); // Update everywhere essentially
        return { success: true };
    } catch (error) {
        console.error("Failed to update system settings:", error);
        return { error: "Failed to update system settings" };
    }
}
