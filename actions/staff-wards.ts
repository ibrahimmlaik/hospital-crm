"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function getAllBeds() {
    const beds = await prisma.bed.findMany({
        include: {
            ward: true,
            patient: {
                select: {
                    id: true,
                    phone: true,
                    user: {
                        select: {
                            name: true
                        }
                    }
                }
            }
        },
        orderBy: { bedNumber: 'asc' }
    });

    // Transform to include patient name at top level for easier access
    return beds.map(bed => ({
        ...bed,
        patient: bed.patient ? {
            id: bed.patient.id,
            name: bed.patient.user?.name || 'Unknown',
            phone: bed.patient.phone
        } : null,
        wardType: bed.ward?.name || "Unknown"
    }));
}

export async function assignBed(prevState: any, formData: FormData) {
    const currentUser = await getSessionUser();
    if (!currentUser || !currentUser.role.startsWith("STAFF")) {
        return { success: false, error: "Unauthorized" };
    }

    const bedId = formData.get("bedId") as string;
    const patientId = formData.get("patientId") as string;

    if (!bedId || !patientId) {
        return { success: false, error: "Bed and Patient are required" };
    }

    try {
        // Check if bed is available
        const bed = await prisma.bed.findUnique({
            where: { id: bedId },
            include: { ward: true }
        });

        if (!bed || bed.status === "OCCUPIED") {
            return { success: false, error: "Bed is not available" };
        }

        // Get patient details
        const patient = await prisma.patient.findUnique({
            where: { id: patientId },
            select: { name: true }
        });

        // Assign bed
        await prisma.bed.update({
            where: { id: bedId },
            data: {
                status: "OCCUPIED",
                currentPatientId: patientId,
                lastAssignedAt: new Date()
            }
        });

        // Create global notification for all users
        const users = await prisma.user.findMany({
            select: { id: true }
        });

        await prisma.notification.createMany({
            data: users.map(user => ({
                userId: user.id,
                title: "Bed Assignment",
                message: `${patient?.name || 'Patient'} has been assigned to Bed ${bed.bedNumber} (${bed.ward?.name || "Unknown Ward"})`,
                type: "INFO",
                read: false
            }))
        });

        // Generate bed capacity alerts
        const { generateBedCapacityAlerts } = await import("@/services/alert-service");
        await generateBedCapacityAlerts();

        revalidatePath("/staff/wards");
        return { success: true, message: "Bed assigned successfully" };
    } catch (error) {
        console.error("Error assigning bed:", error);
        return { success: false, error: "Failed to assign bed" };
    }
}

export async function dischargeBed(bedId: string) {
    const currentUser = await getSessionUser();
    if (!currentUser || !currentUser.role.startsWith("STAFF")) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        await prisma.bed.update({
            where: { id: bedId },
            data: {
                status: "AVAILABLE",
                currentPatientId: null,
                lastAssignedAt: null
            }
        });

        // Regenerate bed capacity alerts (may resolve critical alerts)
        const { generateBedCapacityAlerts } = await import("@/services/alert-service");
        await generateBedCapacityAlerts();

        revalidatePath("/staff/wards");
        return { success: true, message: "Patient discharged successfully" };
    } catch (error) {
        console.error("Error discharging bed:", error);
        return { success: false, error: "Failed to discharge patient" };
    }
}

export async function getWardStats() {
    const beds = await prisma.bed.findMany({ include: { ward: true } });

    const stats = {
        total: beds.length,
        occupied: beds.filter(b => b.status === "OCCUPIED").length,
        available: beds.filter(b => b.status === "AVAILABLE" || b.status === "CLEANING").length,
        icu: beds.filter(b => b.ward?.name === "ICU").length,
        general: beds.filter(b => b.ward?.name === "General").length,
        private: beds.filter(b => b.ward?.name === "Private").length
    };

    return stats;
}

/**
 * Create Bed - Admin only
 */
export async function createBed(formData: FormData) {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }

    const bedNumber = formData.get("bedNumber") as string;
    const wardType = formData.get("wardType") as string;

    if (!bedNumber || !wardType) {
        return { success: false, error: "Missing required fields" };
    }

    try {
        // Find ward
        const ward = await prisma.ward.findUnique({
            where: { name: wardType }
        });

        let targetWardId = ward?.id;

        // Let's create the ward if missing just in case
        if (!ward) {
            const newWard = await prisma.ward.create({
                data: {
                    name: wardType,
                    capacity: 50,
                    createdBy: user.userId
                }
            });
            targetWardId = newWard.id;
        }

        const bedCode = `${wardType}-${bedNumber}`;

        // Check if bed number already exists
        const existing = await prisma.bed.findUnique({
            where: { bedCode }
        });

        if (existing) {
            return { success: false, error: "Bed code already exists" };
        }

        const bed = await prisma.bed.create({
            data: {
                bedNumber,
                bedCode,
                wardId: targetWardId!,
                status: "AVAILABLE"
            }
        });

        // Create audit log
        await prisma.auditLog.create({
            data: {
                userId: user.userId,
                action: "BED_CREATE",
                entity: "BED",
                entityId: bed.id,
                newValue: JSON.stringify({ bedNumber, wardType })
            }
        });

        revalidatePath("/admin/beds");
        revalidatePath("/staff/wards");
        return { success: true, message: "Bed created successfully" };
    } catch (error) {
        console.error("Error creating bed:", error);
        return { success: false, error: "Failed to create bed" };
    }
}

/**
 * Delete Bed - Admin only
 */
export async function deleteBed(bedId: string) {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const bed = await prisma.bed.findUnique({
            where: { id: bedId },
            include: { ward: true }
        });
        if (!bed) {
            return { success: false, error: "Bed not found" };
        }

        if (bed.status === "OCCUPIED") {
            return { success: false, error: "Cannot delete occupied bed" };
        }

        await prisma.bed.delete({ where: { id: bedId } });

        // Create audit log
        await prisma.auditLog.create({
            data: {
                userId: user.userId,
                action: "BED_DELETE",
                entity: "BED",
                entityId: bedId,
                oldValue: JSON.stringify({ bedNumber: bed.bedNumber, wardType: bed.ward?.name })
            }
        });

        revalidatePath("/admin/beds");
        revalidatePath("/staff/wards");
        return { success: true, message: "Bed deleted successfully" };
    } catch (error) {
        console.error("Error deleting bed:", error);
        return { success: false, error: "Failed to delete bed" };
    }
}
