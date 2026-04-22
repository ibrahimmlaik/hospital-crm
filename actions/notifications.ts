"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createNotification(data: {
    userId?: string;
    title: string;
    message: string;
    type: string;
    isGlobal?: boolean;
}) {
    try {
        if (data.isGlobal) {
            // Create notification for all users
            const users = await prisma.user.findMany({
                select: { id: true }
            });

            await prisma.notification.createMany({
                data: users.map(user => ({
                    userId: user.id,
                    title: data.title,
                    message: data.message,
                    type: data.type,
                    read: false
                }))
            });
        } else if (data.userId) {
            // Create notification for specific user
            await prisma.notification.create({
                data: {
                    userId: data.userId,
                    title: data.title,
                    message: data.message,
                    type: data.type,
                    read: false
                }
            });
        }

        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Error creating notification:", error);
        return { success: false, error: "Failed to create notification" };
    }
}

export async function getNotifications(userId: string) {
    try {
        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 10
        });

        return notifications;
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return [];
    }
}

export async function markAsRead(notificationId: string) {
    try {
        await prisma.notification.update({
            where: { id: notificationId },
            data: { read: true }
        });

        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Error marking notification as read:", error);
        return { success: false };
    }
}

export async function markAllAsRead(userId: string) {
    try {
        await prisma.notification.updateMany({
            where: { userId, read: false },
            data: { read: true }
        });

        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Error marking all as read:", error);
        return { success: false };
    }
}
