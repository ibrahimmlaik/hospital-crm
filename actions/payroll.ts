"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { revalidatePath } from "next/cache";

/**
 * Create or Update Salary Structure for a user
 */
export async function createSalaryStructure(prevState: any, formData: FormData) {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }

    const userId = formData.get("userId") as string;
    const baseSalary = parseFloat(formData.get("baseSalary") as string);
    const paymentType = formData.get("paymentType") as string;
    const perAppointmentFee = formData.get("perAppointmentFee") ? parseFloat(formData.get("perAppointmentFee") as string) : null;
    const hourlyRate = formData.get("hourlyRate") ? parseFloat(formData.get("hourlyRate") as string) : null;
    const overtimeRate = formData.get("overtimeRate") ? parseFloat(formData.get("overtimeRate") as string) : null;

    if (!userId || !baseSalary || !paymentType) {
        return { success: false, error: "Missing required fields" };
    }

    try {
        // Check if salary structure exists
        const existing = await prisma.salaryStructure.findUnique({
            where: { userId }
        });

        if (existing) {
            // Update existing
            await prisma.salaryStructure.update({
                where: { userId },
                data: {
                    baseSalary,
                    paymentType,
                    perAppointmentFee,
                    hourlyRate,
                    overtimeRate,
                    effectiveFrom: new Date()
                }
            });
        } else {
            // Create new
            await prisma.salaryStructure.create({
                data: {
                    userId,
                    baseSalary,
                    paymentType,
                    perAppointmentFee,
                    hourlyRate,
                    overtimeRate,
                    effectiveFrom: new Date()
                }
            });
        }

        // Create audit log
        await prisma.auditLog.create({
            data: {
                userId: user.userId,
                action: "SALARY_STRUCTURE_UPDATE",
                entity: "SALARY_STRUCTURE",
                entityId: userId,
                newValue: JSON.stringify({ baseSalary, paymentType, perAppointmentFee, hourlyRate, overtimeRate })
            }
        });

        revalidatePath("/admin/payroll");
        return { success: true, message: "Salary structure saved successfully" };
    } catch (error) {
        console.error("Error saving salary structure:", error);
        return { success: false, error: "Failed to save salary structure" };
    }
}

/**
 * Generate Monthly Payroll for all employees or specific users
 */
export async function generatePayroll(month: number, year: number, userIds?: string[]) {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }

    try {
        // Get all employees with salary structures
        const salaryStructures = await prisma.salaryStructure.findMany({
            where: userIds ? { userId: { in: userIds } } : undefined,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        role: true
                    }
                }
            }
        });

        if (salaryStructures.length === 0) {
            return { success: false, error: "No employees with salary structures found" };
        }

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const payrollRecords = [];

        for (const structure of salaryStructures) {
            // Check if payroll already exists
            const existing = await prisma.payroll.findUnique({
                where: {
                    userId_month_year: {
                        userId: structure.userId,
                        month,
                        year
                    }
                }
            });

            if (existing) {
                continue; // Skip if already generated
            }

            // Get attendance records for the month
            const attendance = await prisma.attendance.findMany({
                where: {
                    userId: structure.userId,
                    date: {
                        gte: startDate,
                        lte: endDate
                    }
                }
            });

            // Calculate total hours
            const totalHours = attendance.reduce((sum, record) => sum + (record.totalHours || 0), 0);

            // Calculate overtime (hours beyond 8 hours/day * working days)
            const workingDays = attendance.length;
            const regularHours = workingDays * 8;
            const overtimeHours = Math.max(0, totalHours - regularHours);

            // Calculate salary based on payment type
            let calculatedSalary = structure.baseSalary;

            if (structure.paymentType === "HOURLY" && structure.hourlyRate) {
                calculatedSalary = totalHours * structure.hourlyRate;
            } else if (structure.paymentType === "PER_APPOINTMENT") {
                // Count appointments for doctors
                const appointmentCount = await prisma.appointment.count({
                    where: {
                        doctorId: structure.userId,
                        date: {
                            gte: startDate,
                            lte: endDate
                        },
                        status: "COMPLETED"
                    }
                });
                calculatedSalary = appointmentCount * (structure.perAppointmentFee || 0);
            }

            // Add overtime pay
            const overtimePay = overtimeHours * (structure.overtimeRate || structure.hourlyRate || 0);

            const totalSalary = calculatedSalary + overtimePay;

            // Create payroll record
            const payroll = await prisma.payroll.create({
                data: {
                    userId: structure.userId,
                    month,
                    year,
                    baseSalary: structure.baseSalary,
                    bonuses: 0,
                    deductions: 0,
                    totalSalary,
                    hoursWorked: totalHours,
                    overtimeHours,
                    status: "PENDING",
                    generatedBy: user.userId
                }
            });

            payrollRecords.push(payroll);
        }

        // Create audit log
        await prisma.auditLog.create({
            data: {
                userId: user.userId,
                action: "PAYROLL_GENERATE",
                entity: "PAYROLL",
                newValue: JSON.stringify({ month, year, count: payrollRecords.length })
            }
        });

        revalidatePath("/admin/payroll");
        return {
            success: true,
            message: `Generated ${payrollRecords.length} payroll records for ${month}/${year}`,
            count: payrollRecords.length
        };
    } catch (error) {
        console.error("Error generating payroll:", error);
        return { success: false, error: "Failed to generate payroll" };
    }
}

/**
 * Approve Payroll Record
 */
export async function approvePayroll(payrollId: string) {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const payroll = await prisma.payroll.update({
            where: { id: payrollId },
            data: { status: "APPROVED" },
            include: {
                user: {
                    select: { name: true }
                }
            }
        });

        // Notify employee
        await prisma.notification.create({
            data: {
                userId: payroll.userId,
                title: "Payroll Approved",
                message: `Your payroll for ${payroll.month}/${payroll.year} has been approved. Amount: $${payroll.totalSalary}`,
                type: "INFO",
                relatedEntity: "PAYROLL",
                relatedEntityId: payrollId,
                actionUrl: "/payroll"
            }
        });

        // Create audit log
        await prisma.auditLog.create({
            data: {
                userId: user.userId,
                action: "PAYROLL_APPROVE",
                entity: "PAYROLL",
                entityId: payrollId
            }
        });

        revalidatePath("/admin/payroll");
        return { success: true, message: "Payroll approved successfully" };
    } catch (error) {
        console.error("Error approving payroll:", error);
        return { success: false, error: "Failed to approve payroll" };
    }
}

/**
 * Mark Payroll as Paid
 */
export async function markPayrollPaid(payrollId: string) {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const payroll = await prisma.payroll.update({
            where: { id: payrollId },
            data: {
                status: "PAID",
                paidAt: new Date()
            },
            include: {
                user: {
                    select: { name: true }
                }
            }
        });

        // Notify employee
        await prisma.notification.create({
            data: {
                userId: payroll.userId,
                title: "Salary Paid",
                message: `Your salary for ${payroll.month}/${payroll.year} has been paid. Amount: $${payroll.totalSalary}`,
                type: "INFO",
                relatedEntity: "PAYROLL",
                relatedEntityId: payrollId,
                actionUrl: "/payroll"
            }
        });

        // Create audit log
        await prisma.auditLog.create({
            data: {
                userId: user.userId,
                action: "PAYROLL_PAID",
                entity: "PAYROLL",
                entityId: payrollId
            }
        });

        revalidatePath("/admin/payroll");
        return { success: true, message: "Payroll marked as paid" };
    } catch (error) {
        console.error("Error marking payroll as paid:", error);
        return { success: false, error: "Failed to mark payroll as paid" };
    }
}

/**
 * Get All Payroll Records (Admin)
 */
export async function getAllPayroll(month?: number, year?: number) {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const currentDate = new Date();
        const targetMonth = month || currentDate.getMonth() + 1;
        const targetYear = year || currentDate.getFullYear();

        const payroll = await prisma.payroll.findMany({
            where: {
                month: targetMonth,
                year: targetYear
            },
            include: {
                user: {
                    select: {
                        name: true,
                        role: true,
                        email: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const serializedPayroll = payroll.map(p => ({
            ...p,
            paidAt: p.paidAt?.toISOString(),
            createdAt: p.createdAt?.toISOString(),
            updatedAt: p.updatedAt?.toISOString()
        }));

        return { success: true, data: serializedPayroll };
    } catch (error) {
        console.error("Error fetching payroll:", error);
        return { success: false, error: "Failed to fetch payroll" };
    }
}

/**
 * Get Salary Structure for a user
 */
export async function getSalaryStructure(userId: string) {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
        return null;
    }

    try {
        const structure = await prisma.salaryStructure.findUnique({
            where: { userId },
            include: {
                user: {
                    select: {
                        name: true,
                        role: true
                    }
                }
            }
        });

        return structure;
    } catch (error) {
        console.error("Error fetching salary structure:", error);
        return null;
    }
}

/**
 * Get all users eligible for payroll (doctors and staff)
 */
export async function getPayrollEligibleUsers() {
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
            select: {
                id: true,
                name: true,
                role: true,
                email: true
            },
            orderBy: { name: 'asc' }
        });

        return users;
    } catch (error) {
        console.error("Error fetching eligible users:", error);
        return [];
    }
}
