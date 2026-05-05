"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { revalidatePath } from "next/cache";

/**
 * Clock In - Records start of work shift
 */
export async function clockIn() {
    const user = await getSessionUser();
    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    // Only doctors and staff can clock in
    if (!["DOCTOR", "STAFF_NURSE", "STAFF_RECEPTION"].includes(user.role)) {
        return { success: false, error: "Only doctors and staff can clock in" };
    }

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Check if there's an active (not clocked out) session
        const activeAttendance = await prisma.attendance.findFirst({
            where: {
                userId: user.userId,
                date: {
                    gte: today,
                    lt: tomorrow
                },
                clockOut: null // Only check for active sessions
            },
            orderBy: { clockIn: 'desc' }
        });

        if (activeAttendance) {
            return { success: false, error: "Already clocked in. Please clock out first." };
        }

        // Create new attendance record (allows multiple shifts per day)
        const clockInTime = new Date();
        const attendance = await prisma.attendance.create({
            data: {
                userId: user.userId,
                date: today,
                clockIn: clockInTime,
                status: "PRESENT"
            }
        });

        // Create audit log
        await prisma.auditLog.create({
            data: {
                userId: user.userId,
                action: "CLOCK_IN",
                entity: "ATTENDANCE",
                entityId: attendance.id,
                newValue: JSON.stringify({ clockIn: clockInTime })
            }
        });

        // Notify admins
        const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true, name: true } });
        // Fetch current user's name for the notification message
        const currentUserRecord = await prisma.user.findUnique({ where: { id: user.userId }, select: { name: true } });
        if (admins.length > 0) {
            await prisma.notification.createMany({
                data: admins.map(admin => ({
                    userId: admin.id,
                    title: "Clock In",
                    message: `${currentUserRecord?.name ?? 'Staff'} (${user.role}) clocked in at ${clockInTime.toLocaleTimeString()}`,
                    type: "INFO",
                    relatedEntity: "ATTENDANCE",
                    relatedEntityId: attendance.id,
                    actionUrl: "/admin/attendance"
                }))
            });
        }

        revalidatePath("/admin/attendance");
        return { success: true, message: "Clocked in successfully", clockIn: clockInTime };
    } catch (error) {
        console.error("Clock in error:", error);
        return { success: false, error: "Failed to clock in" };
    }
}

/**
 * Clock Out - Records end of work shift and calculates hours
 */
export async function clockOut() {
    const user = await getSessionUser();
    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Find the most recent active attendance record (not clocked out)
        const attendance = await prisma.attendance.findFirst({
            where: {
                userId: user.userId,
                date: {
                    gte: today,
                    lt: tomorrow
                },
                clockOut: null // Only find active sessions
            },
            orderBy: { clockIn: 'desc' } // Get the most recent one
        });

        if (!attendance) {
            return { success: false, error: "No clock-in record found for today" };
        }

        if (attendance.clockOut) {
            return { success: false, error: "Already clocked out" };
        }

        // Calculate hours worked
        const clockOutTime = new Date();
        const clockInTime = new Date(attendance.clockIn);
        const hoursWorked = (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);

        // Update attendance record
        const updatedAttendance = await prisma.attendance.update({
            where: { id: attendance.id },
            data: {
                clockOut: clockOutTime,
                totalHours: Math.round(hoursWorked * 100) / 100 // Round to 2 decimals
            }
        });

        // Create audit log
        await prisma.auditLog.create({
            data: {
                userId: user.userId,
                action: "CLOCK_OUT",
                entity: "ATTENDANCE",
                entityId: attendance.id,
                newValue: JSON.stringify({
                    clockOut: clockOutTime,
                    totalHours: updatedAttendance.totalHours
                })
            }
        });

        revalidatePath("/admin/attendance");
        return {
            success: true,
            message: "Clocked out successfully",
            clockOut: clockOutTime,
            totalHours: updatedAttendance.totalHours
        };
    } catch (error) {
        console.error("Clock out error:", error);
        return { success: false, error: "Failed to clock out" };
    }
}

/**
 * Get My Attendance - User views their own attendance
 */
export async function getMyAttendance(month?: number, year?: number) {
    const user = await getSessionUser();
    if (!user) {
        return [];
    }

    try {
        const currentDate = new Date();
        const targetMonth = month || currentDate.getMonth() + 1;
        const targetYear = year || currentDate.getFullYear();

        const startDate = new Date(targetYear, targetMonth - 1, 1);
        const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

        const attendance = await prisma.attendance.findMany({
            where: {
                userId: user.userId,
                date: {
                    gte: startDate,
                    lte: endDate
                }
            },
            orderBy: { date: 'desc' }
        });

        return attendance;
    } catch (error) {
        console.error("Error fetching attendance:", error);
        return [];
    }
}

/**
 * Get All Attendance - Admin views all attendance records
 */
export async function getAllAttendance(filters?: {
    userId?: string;
    month?: number;
    year?: number;
    status?: string;
}) {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const currentDate = new Date();
        const targetMonth = filters?.month || currentDate.getMonth() + 1;
        const targetYear = filters?.year || currentDate.getFullYear();

        const startDate = new Date(targetYear, targetMonth - 1, 1);
        const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

        const where: any = {
            date: {
                gte: startDate,
                lte: endDate
            }
        };

        if (filters?.userId) {
            where.userId = filters.userId;
        }

        if (filters?.status) {
            where.status = filters.status;
        }

        const attendance = await prisma.attendance.findMany({
            where,
            include: {
                user: {
                    select: {
                        name: true,
                        role: true,
                        email: true
                    }
                }
            },
            orderBy: { date: 'desc' }
        });

        return { success: true, data: attendance };
    } catch (error) {
        console.error("Error fetching all attendance:", error);
        return { success: false, error: "Failed to fetch attendance" };
    }
}

/**
 * Correct Attendance - Admin corrects attendance record
 */
export async function correctAttendance(
    attendanceId: string,
    data: {
        clockIn?: Date;
        clockOut?: Date;
        status?: string;
    },
    reason: string
) {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }

    if (!reason) {
        return { success: false, error: "Reason is required for corrections" };
    }

    try {
        const attendance = await prisma.attendance.findUnique({
            where: { id: attendanceId }
        });

        if (!attendance) {
            return { success: false, error: "Attendance record not found" };
        }

        // Calculate new total hours if times are updated
        let totalHours = attendance.totalHours;
        if (data.clockIn && data.clockOut) {
            const hours = (new Date(data.clockOut).getTime() - new Date(data.clockIn).getTime()) / (1000 * 60 * 60);
            totalHours = Math.round(hours * 100) / 100;
        }

        // Update attendance
        const updated = await prisma.attendance.update({
            where: { id: attendanceId },
            data: {
                ...data,
                totalHours,
                notes: reason,
                correctedBy: user.userId
            }
        });

        // Create audit log
        await prisma.auditLog.create({
            data: {
                userId: user.userId,
                action: "ATTENDANCE_EDIT",
                entity: "ATTENDANCE",
                entityId: attendanceId,
                oldValue: JSON.stringify(attendance),
                newValue: JSON.stringify(updated),
                reason
            }
        });

        // Notify the user whose attendance was corrected
        await prisma.notification.create({
            data: {
                userId: attendance.userId,
                title: "Attendance Corrected",
                message: `Your attendance for ${attendance.date.toLocaleDateString()} has been corrected by admin. Reason: ${reason}`,
                type: "WARNING",
                relatedEntity: "ATTENDANCE",
                relatedEntityId: attendanceId,
                actionUrl: "/attendance"
            }
        });

        revalidatePath("/admin/attendance");
        return { success: true, message: "Attendance corrected successfully" };
    } catch (error) {
        console.error("Error correcting attendance:", error);
        return { success: false, error: "Failed to correct attendance" };
    }
}

/**
 * Get Attendance Stats - Analytics for user or admin
 */
export async function getAttendanceStats(userId?: string, month?: number, year?: number) {
    const user = await getSessionUser();
    if (!user) {
        return null;
    }

    // If userId not provided, use current user
    const targetUserId = userId || user.userId;

    // Only admin can view other users' stats
    if (targetUserId !== user.userId && user.role !== "ADMIN") {
        return null;
    }

    try {
        const currentDate = new Date();
        const targetMonth = month || currentDate.getMonth() + 1;
        const targetYear = year || currentDate.getFullYear();

        const startDate = new Date(targetYear, targetMonth - 1, 1);
        const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

        const attendance = await prisma.attendance.findMany({
            where: {
                userId: targetUserId,
                date: {
                    gte: startDate,
                    lte: endDate
                }
            }
        });

        const totalDays = attendance.length;
        const totalHours = attendance.reduce((sum, record) => sum + (record.totalHours || 0), 0);
        const present = attendance.filter(a => a.status === "PRESENT").length;
        const late = attendance.filter(a => a.status === "LATE").length;
        const earlyLeave = attendance.filter(a => a.status === "EARLY_LEAVE").length;

        return {
            totalDays,
            totalHours: Math.round(totalHours * 100) / 100,
            present,
            late,
            earlyLeave,
            averageHours: totalDays > 0 ? Math.round((totalHours / totalDays) * 100) / 100 : 0
        };
    } catch (error) {
        console.error("Error fetching attendance stats:", error);
        return null;
    }
}
