"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";

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

        // Bust the cached hospital name so the sidebar reflects the new name immediately
        revalidateTag("hospital-settings", "layout");
        revalidatePath("/", "layout");
        revalidatePath("/admin/settings");

        return { success: true };
    } catch (error) {
        console.error("Failed to update system settings:", error);
        throw new Error("Failed to update settings");
    }
}
