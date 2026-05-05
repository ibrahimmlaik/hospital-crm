"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function updateUserStatus(userId: string, newStatus: string) {
    const currentUser = await getSessionUser();

    if (!currentUser || currentUser.role !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }

    if (!["PENDING", "ACTIVE", "INACTIVE", "SUSPENDED"].includes(newStatus)) {
        return { success: false, error: "Invalid status" };
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return { success: false, error: "User not found" };
        }

        const oldStatus = (user as any).status;

        // Update user status
        await prisma.user.update({
            where: { id: userId },
            data: { status: newStatus } as any
        });

        // Create notification for user
        const statusMessages: Record<string, { title: string; message: string; type: string }> = {
            ACTIVE: {
                title: "Account Activated",
                message: "Your account has been activated. You can now log in and access the system.",
                type: "SUCCESS"
            },
            INACTIVE: {
                title: "Account Deactivated",
                message: "Your account has been deactivated. Please contact an administrator for more information.",
                type: "WARNING"
            },
            SUSPENDED: {
                title: "Account Suspended",
                message: "Your account has been suspended. Please contact an administrator immediately.",
                type: "WARNING"
            },
            PENDING: {
                title: "Account Status Changed",
                message: "Your account status has been changed to pending. An administrator will review your account.",
                type: "INFO"
            }
        };

        const notificationData = statusMessages[newStatus];

        await prisma.notification.create({
            data: {
                userId: user.id,
                title: notificationData.title,
                message: notificationData.message,
                type: notificationData.type,
                relatedEntity: "USER",
                relatedEntityId: user.id,
                actionUrl: "/login"
            }
        });

        // Log status change (notify admins)
        const admins = await prisma.user.findMany({
            where: { role: "ADMIN", id: { not: currentUser.userId } }
        });

        await prisma.notification.createMany({
            data: admins.map(admin => ({
                userId: admin.id,
                title: "User Status Changed",
                message: `${user.name}'s status changed from ${oldStatus} to ${newStatus}`,
                type: "INFO",
                relatedEntity: "USER",
                relatedEntityId: user.id,
                actionUrl: "/admin/users"
            }))
        });

        revalidatePath("/admin/users");
        return { success: true, message: "User status updated successfully" };
    } catch (error) {
        console.error("Error updating user status:", error);
        return { success: false, error: "Failed to update user status" };
    }
}
