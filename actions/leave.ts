"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { generateLeaveRequestAlerts } from "@/services/alert-service";

/**
 * Apply for leave (Doctors and Staff only)
 */
export async function applyLeave(prevState: any, formData: FormData) {
    const currentUser = await getSessionUser();

    if (!currentUser) {
        return { success: false, error: "Unauthorized" };
    }

    // Only doctors and staff can apply for leave
    if (currentUser.role === "PATIENT" || currentUser.role === "ADMIN") {
        return { success: false, error: "Only doctors and staff can apply for leave" };
    }

    const leaveType = formData.get("leaveType") as string;
    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;
    const reason = formData.get("reason") as string;

    if (!leaveType || !startDate || !endDate || !reason) {
        return { success: false, error: "All fields are required" };
    }

    try {
        const leaveRequest = await prisma.leaveRequest.create({
            data: {
                userId: currentUser.userId,
                leaveType,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                reason,
                status: "PENDING"
            }
        });

        // Notify all admins about new leave request
        const [admins, applicant] = await Promise.all([
            prisma.user.findMany({ where: { role: "ADMIN", status: "ACTIVE" }, select: { id: true } }),
            prisma.user.findUnique({ where: { id: currentUser.userId }, select: { name: true } })
        ]);

        await prisma.notification.createMany({
            data: admins.map(admin => ({
                userId: admin.id,
                title: "New Leave Request",
                message: `${applicant?.name ?? 'Staff'} (${currentUser.role}) has requested ${leaveType} leave from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}.`,
                type: "INFO",
                relatedEntity: "LEAVE_REQUEST",
                relatedEntityId: leaveRequest.id,
                actionUrl: "/admin/leave-requests"
            }))
        });

        // Generate system alert for pending leave requests
        await generateLeaveRequestAlerts();

        revalidatePath("/");
        return { success: true, message: "Leave request submitted successfully" };
    } catch (error) {
        console.error("Error applying for leave:", error);
        return { success: false, error: "Failed to submit leave request" };
    }
}

/**
 * Approve leave request (Admin only)
 */
export async function approveLeave(leaveRequestId: string) {
    const currentUser = await getSessionUser();

    if (!currentUser || currentUser.role !== "ADMIN") {
        return { success: false, error: "Unauthorized - Admin only" };
    }

    try {
        const leaveRequest = await prisma.leaveRequest.findUnique({
            where: { id: leaveRequestId },
            include: {
                user: {
                    select: {
                        name: true,
                        role: true
                    }
                }
            }
        });

        if (!leaveRequest) {
            return { success: false, error: "Leave request not found" };
        }

        if (leaveRequest.status !== "PENDING") {
            return { success: false, error: "Leave request already processed" };
        }

        // Update leave request
        await prisma.leaveRequest.update({
            where: { id: leaveRequestId },
            data: {
                status: "APPROVED",
                reviewedAt: new Date(),
                reviewedBy: currentUser.userId
            }
        });

        // Notify applicant
        await prisma.notification.create({
            data: {
                userId: leaveRequest.userId,
                title: "Leave Request Approved",
                message: `Your ${leaveRequest.leaveType} leave request from ${leaveRequest.startDate.toLocaleDateString()} to ${leaveRequest.endDate.toLocaleDateString()} has been approved.`,
                type: "SUCCESS",
                relatedEntity: "LEAVE_REQUEST",
                relatedEntityId: leaveRequest.id
            }
        });

        // Regenerate alerts (will auto-resolve if no more pending)
        await generateLeaveRequestAlerts();

        revalidatePath("/admin/leave-requests");
        return { success: true, message: "Leave request approved" };
    } catch (error) {
        console.error("Error approving leave:", error);
        return { success: false, error: "Failed to approve leave request" };
    }
}

/**
 * Reject leave request (Admin only)
 */
export async function rejectLeave(leaveRequestId: string, rejectionReason?: string) {
    const currentUser = await getSessionUser();

    if (!currentUser || currentUser.role !== "ADMIN") {
        return { success: false, error: "Unauthorized - Admin only" };
    }

    try {
        const leaveRequest = await prisma.leaveRequest.findUnique({
            where: { id: leaveRequestId },
            include: {
                user: {
                    select: {
                        name: true,
                        role: true
                    }
                }
            }
        });

        if (!leaveRequest) {
            return { success: false, error: "Leave request not found" };
        }

        if (leaveRequest.status !== "PENDING") {
            return { success: false, error: "Leave request already processed" };
        }

        // Update leave request
        await prisma.leaveRequest.update({
            where: { id: leaveRequestId },
            data: {
                status: "REJECTED",
                reviewedAt: new Date(),
                reviewedBy: currentUser.userId
            }
        });

        // Notify applicant
        const message = rejectionReason
            ? `Your ${leaveRequest.leaveType} leave request has been rejected. Reason: ${rejectionReason}`
            : `Your ${leaveRequest.leaveType} leave request from ${leaveRequest.startDate.toLocaleDateString()} to ${leaveRequest.endDate.toLocaleDateString()} has been rejected.`;

        await prisma.notification.create({
            data: {
                userId: leaveRequest.userId,
                title: "Leave Request Rejected",
                message,
                type: "WARNING",
                relatedEntity: "LEAVE_REQUEST",
                relatedEntityId: leaveRequest.id
            }
        });

        // Regenerate alerts
        await generateLeaveRequestAlerts();

        revalidatePath("/admin/leave-requests");
        return { success: true, message: "Leave request rejected" };
    } catch (error) {
        console.error("Error rejecting leave:", error);
        return { success: false, error: "Failed to reject leave request" };
    }
}

/**
 * Get leave requests for current user
 */
export async function getMyLeaveRequests() {
    const currentUser = await getSessionUser();

    if (!currentUser) {
        return [];
    }

    try {
        const requests = await prisma.leaveRequest.findMany({
            where: { userId: currentUser.userId },
            orderBy: { appliedAt: "desc" }
        });

        return requests;
    } catch (error) {
        console.error("Error fetching leave requests:", error);
        return [];
    }
}

/**
 * Get all leave requests (Admin only)
 */
export async function getAllLeaveRequests() {
    const currentUser = await getSessionUser();

    if (!currentUser || currentUser.role !== "ADMIN") {
        return [];
    }

    try {
        const requests = await prisma.leaveRequest.findMany({
            include: {
                user: {
                    select: {
                        name: true,
                        role: true,
                        email: true
                    }
                }
            },
            orderBy: { appliedAt: "desc" }
        });

        return requests;
    } catch (error) {
        console.error("Error fetching all leave requests:", error);
        return [];
    }
}
