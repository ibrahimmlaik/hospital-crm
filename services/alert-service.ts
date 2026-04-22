"use server";

import { prisma } from "@/lib/prisma";

/**
 * Alert Generation Service
 * Dynamically generates system alerts based on real database conditions
 * Auto-resolves alerts when conditions clear
 */

export async function generateBedCapacityAlerts() {
    try {
        const beds = await prisma.bed.findMany({ include: { ward: true } });

        const icuBeds = beds.filter(b => b.ward?.name === "ICU");
        const icuAvailable = icuBeds.filter(b => b.status === "AVAILABLE").length;
        const icuTotal = icuBeds.length;

        const generalBeds = beds.filter(b => b.ward?.name === "General");
        const generalAvailable = generalBeds.filter(b => b.status === "AVAILABLE").length;

        // CRITICAL: ICU beds at zero
        if (icuAvailable === 0 && icuTotal > 0) {
            await createOrUpdateAlert({
                alertType: "BED_CAPACITY",
                title: "ICU Beds Full",
                message: "All ICU beds are occupied. Immediate attention required.",
                severity: "CRITICAL",
                relatedEntity: "BED"
            });
        } else if (icuAvailable > 0) {
            await resolveAlert("BED_CAPACITY", "ICU Beds Full");
        }

        // WARNING: ICU capacity at 90%
        const icuOccupancy = ((icuTotal - icuAvailable) / icuTotal) * 100;
        if (icuOccupancy >= 90 && icuAvailable > 0) {
            await createOrUpdateAlert({
                alertType: "BED_CAPACITY",
                title: `ICU Bed Capacity at ${Math.round(icuOccupancy)}%`,
                message: `Only ${icuAvailable} ICU bed(s) remaining out of ${icuTotal}.`,
                severity: "WARNING",
                relatedEntity: "BED"
            });
        } else if (icuOccupancy < 90) {
            await resolveAlert("BED_CAPACITY", `ICU Bed Capacity at`);
        }

        // WARNING: General beds low
        if (generalAvailable <= 2 && generalAvailable > 0) {
            await createOrUpdateAlert({
                alertType: "BED_CAPACITY",
                title: "General Beds Running Low",
                message: `Only ${generalAvailable} general bed(s) available.`,
                severity: "WARNING",
                relatedEntity: "BED"
            });
        } else if (generalAvailable > 2) {
            await resolveAlert("BED_CAPACITY", "General Beds Running Low");
        }

    } catch (error) {
        console.error("Error generating bed capacity alerts:", error);
    }
}

export async function generateInventoryAlerts() {
    try {
        const inventory = await prisma.inventory.findMany();

        for (const item of inventory) {
            if (item.quantity <= item.reorderLevel) {
                await createOrUpdateAlert({
                    alertType: "INVENTORY_LOW",
                    title: `Low Stock: ${item.itemName}`,
                    message: `${item.itemName} stock is at ${item.quantity} ${item.unit}. Reorder level: ${item.reorderLevel} ${item.unit}.`,
                    severity: item.quantity === 0 ? "CRITICAL" : "WARNING",
                    relatedEntity: "INVENTORY",
                    relatedEntityId: item.id
                });
            } else {
                // Resolve alert if stock is back above reorder level
                await resolveAlert("INVENTORY_LOW", `Low Stock: ${item.itemName}`);
            }
        }
    } catch (error) {
        console.error("Error generating inventory alerts:", error);
    }
}

export async function generateLeaveRequestAlerts() {
    try {
        const pendingLeaves = await prisma.leaveRequest.findMany({
            where: { status: "PENDING" },
            include: {
                user: {
                    select: {
                        name: true,
                        role: true
                    }
                }
            }
        });

        if (pendingLeaves.length > 0) {
            await createOrUpdateAlert({
                alertType: "LEAVE_REQUEST",
                title: `${pendingLeaves.length} Pending Leave Request(s)`,
                message: `${pendingLeaves.map(l => l.user.name).join(", ")} have submitted leave requests awaiting approval.`,
                severity: "INFO",
                relatedEntity: "LEAVE_REQUEST"
            });
        } else {
            await resolveAlert("LEAVE_REQUEST", "Pending Leave Request");
        }
    } catch (error) {
        console.error("Error generating leave request alerts:", error);
    }
}

export async function generateUnapprovedUsersAlert() {
    try {
        const unapprovedUsers = await prisma.user.findMany({
            where: {
                isApproved: false,
                role: { not: "ADMIN" } // Admins are auto-approved
            }
        });

        if (unapprovedUsers.length > 0) {
            await createOrUpdateAlert({
                alertType: "UNAPPROVED_USERS",
                title: `${unapprovedUsers.length} User(s) Awaiting Approval`,
                message: `${unapprovedUsers.map(u => u.name).join(", ")} are waiting for account approval.`,
                severity: "INFO",
                relatedEntity: "USER"
            });
        } else {
            await resolveAlert("UNAPPROVED_USERS", "Awaiting Approval");
        }
    } catch (error) {
        console.error("Error generating unapproved users alert:", error);
    }
}

export async function generatePendingLabTestsAlert() {
    try {
        const pendingTests = await prisma.labTest.findMany({
            where: { status: "PENDING" }
        });

        if (pendingTests.length > 5) {
            await createOrUpdateAlert({
                alertType: "LAB_PENDING",
                title: `${pendingTests.length} Pending Lab Tests`,
                message: `Lab has ${pendingTests.length} pending tests. Please prioritize processing.`,
                severity: "WARNING",
                relatedEntity: "LAB_TEST"
            });
        } else {
            await resolveAlert("LAB_PENDING", "Pending Lab Tests");
        }
    } catch (error) {
        console.error("Error generating lab tests alert:", error);
    }
}

/**
 * Helper: Create or update alert (prevents duplicates)
 */
async function createOrUpdateAlert(data: {
    alertType: string;
    title: string;
    message: string;
    severity: string;
    relatedEntity?: string;
    relatedEntityId?: string;
}) {
    // Check if alert already exists and is unresolved
    const existing = await prisma.systemAlert.findFirst({
        where: {
            alertType: data.alertType,
            title: data.title,
            isResolved: false
        }
    });

    if (!existing) {
        await prisma.systemAlert.create({
            data: {
                alertType: data.alertType,
                title: data.title,
                message: data.message,
                severity: data.severity,
                relatedEntity: data.relatedEntity,
                relatedEntityId: data.relatedEntityId,
                isResolved: false
            }
        });
    }
}

/**
 * Helper: Resolve alert when condition clears
 */
async function resolveAlert(alertType: string, titleContains: string) {
    await prisma.systemAlert.updateMany({
        where: {
            alertType,
            title: { contains: titleContains },
            isResolved: false
        },
        data: {
            isResolved: true,
            resolvedAt: new Date()
        }
    });
}

/**
 * Run all alert generators
 */
export async function generateAllAlerts() {
    await Promise.all([
        generateBedCapacityAlerts(),
        generateInventoryAlerts(),
        generateLeaveRequestAlerts(),
        generateUnapprovedUsersAlert(),
        generatePendingLabTestsAlert()
    ]);
}
