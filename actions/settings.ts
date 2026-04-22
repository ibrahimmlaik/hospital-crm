"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateSystemSettings(data: { hospitalName: string }) {
    try {
        const settings = await prisma.systemSettings.findFirst();

        if (settings) {
            await prisma.systemSettings.update({
                where: { id: settings.id },
                data: { hospitalName: data.hospitalName },
            });
        } else {
            await prisma.systemSettings.create({
                data: { hospitalName: data.hospitalName },
            });
        }

        // Revalidate all pages so the sidebar picks up the new name
        revalidatePath("/", "layout");
        revalidatePath("/admin/settings");
        revalidatePath("/admin");

        return { success: true };
    } catch (error) {
        console.error("Failed to update system settings:", error);
        throw new Error("Failed to update settings");
    }
}
