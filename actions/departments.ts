"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { revalidatePath } from "next/cache";

/**
 * Create Department
 */
export async function createDepartment(formData: FormData) {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const headId = formData.get("headId") as string;

    if (!name) {
        return { success: false, error: "Department name is required" };
    }

    try {
        // Check if department already exists
        const existing = await prisma.department.findUnique({
            where: { name }
        });

        if (existing) {
            return { success: false, error: "Department with this name already exists" };
        }

        const department = await prisma.department.create({
            data: {
                name,
                description: description || null,
                headId: headId || null,
                isActive: true
            }
        });

        // Create audit log
        await prisma.auditLog.create({
            data: {
                userId: user.userId,
                action: "DEPARTMENT_CREATE",
                entity: "DEPARTMENT",
                entityId: department.id,
                newValue: JSON.stringify({ name, description, headId })
            }
        });

        revalidatePath("/admin/departments");
        return { success: true, message: "Department created successfully", department };
    } catch (error) {
        console.error("Error creating department:", error);
        return { success: false, error: "Failed to create department" };
    }
}

/**
 * Update Department
 */
export async function updateDepartment(departmentId: string, formData: FormData) {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const headId = formData.get("headId") as string;
    const isActive = formData.get("isActive") === "true";

    if (!name) {
        return { success: false, error: "Department name is required" };
    }

    try {
        const oldDepartment = await prisma.department.findUnique({
            where: { id: departmentId }
        });

        if (!oldDepartment) {
            return { success: false, error: "Department not found" };
        }

        const department = await prisma.department.update({
            where: { id: departmentId },
            data: {
                name,
                description: description || null,
                headId: headId || null,
                isActive
            }
        });

        // Create audit log
        await prisma.auditLog.create({
            data: {
                userId: user.userId,
                action: "DEPARTMENT_UPDATE",
                entity: "DEPARTMENT",
                entityId: departmentId,
                oldValue: JSON.stringify(oldDepartment),
                newValue: JSON.stringify(department)
            }
        });

        revalidatePath("/admin/departments");
        return { success: true, message: "Department updated successfully" };
    } catch (error) {
        console.error("Error updating department:", error);
        return { success: false, error: "Failed to update department" };
    }
}

/**
 * Delete Department
 */
export async function deleteDepartment(departmentId: string) {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const department = await prisma.department.findUnique({
            where: { id: departmentId }
        });

        if (!department) {
            return { success: false, error: "Department not found" };
        }

        // Soft delete by marking as inactive
        await prisma.department.update({
            where: { id: departmentId },
            data: { isActive: false }
        });

        // Create audit log
        await prisma.auditLog.create({
            data: {
                userId: user.userId,
                action: "DEPARTMENT_DELETE",
                entity: "DEPARTMENT",
                entityId: departmentId,
                oldValue: JSON.stringify(department)
            }
        });

        revalidatePath("/admin/departments");
        return { success: true, message: "Department deleted successfully" };
    } catch (error) {
        console.error("Error deleting department:", error);
        return { success: false, error: "Failed to delete department" };
    }
}

/**
 * Get All Departments
 */
export async function getAllDepartments(includeInactive = false) {
    const user = await getSessionUser();
    if (!user) {
        return [];
    }

    try {
        const departments = await prisma.department.findMany({
            where: includeInactive ? undefined : { isActive: true },
            include: {
                _count: {
                    select: {
                        doctors: true,
                        staff: true
                    }
                }
            },
            orderBy: { name: 'asc' }
        });

        return departments;
    } catch (error) {
        console.error("Error fetching departments:", error);
        return [];
    }
}

/**
 * Get Department by ID with details
 */
export async function getDepartmentById(departmentId: string) {
    const user = await getSessionUser();
    if (!user) {
        return null;
    }

    try {
        const department = await prisma.department.findUnique({
            where: { id: departmentId },
            include: {
                doctors: {
                    include: {
                        doctor: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true,
                                        status: true
                                    }
                                }
                            }
                        }
                    }
                },
                staff: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                role: true,
                                status: true
                            }
                        }
                    }
                }
            }
        });

        return department;
    } catch (error) {
        console.error("Error fetching department:", error);
        return null;
    }
}

/**
 * Assign Doctor to Department
 */
export async function assignDoctorToDepartment(departmentId: string, doctorId: string, isPrimary = false) {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }

    try {
        // Check if already assigned
        const existing = await prisma.doctorDepartment.findUnique({
            where: {
                doctorId_departmentId: {
                    doctorId,
                    departmentId
                }
            }
        });

        if (existing) {
            return { success: false, error: "Doctor already assigned to this department" };
        }

        await prisma.doctorDepartment.create({
            data: {
                doctorId,
                departmentId,
                isPrimary
            }
        });

        // Create audit log
        await prisma.auditLog.create({
            data: {
                userId: user.userId,
                action: "DOCTOR_ASSIGN_DEPARTMENT",
                entity: "DEPARTMENT",
                entityId: departmentId,
                newValue: JSON.stringify({ doctorId, isPrimary })
            }
        });

        revalidatePath("/admin/departments");
        return { success: true, message: "Doctor assigned successfully" };
    } catch (error) {
        console.error("Error assigning doctor:", error);
        return { success: false, error: "Failed to assign doctor" };
    }
}

/**
 * Remove Doctor from Department
 */
export async function removeDoctorFromDepartment(departmentId: string, doctorId: string) {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }

    try {
        await prisma.doctorDepartment.delete({
            where: {
                doctorId_departmentId: {
                    doctorId,
                    departmentId
                }
            }
        });

        // Create audit log
        await prisma.auditLog.create({
            data: {
                userId: user.userId,
                action: "DOCTOR_REMOVE_DEPARTMENT",
                entity: "DEPARTMENT",
                entityId: departmentId,
                oldValue: JSON.stringify({ doctorId })
            }
        });

        revalidatePath("/admin/departments");
        return { success: true, message: "Doctor removed successfully" };
    } catch (error) {
        console.error("Error removing doctor:", error);
        return { success: false, error: "Failed to remove doctor" };
    }
}

/**
 * Assign Staff to Department
 */
export async function assignStaffToDepartment(departmentId: string, userId: string) {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }

    try {
        // Check if already assigned
        const existing = await prisma.staffDepartment.findUnique({
            where: {
                userId_departmentId: {
                    userId,
                    departmentId
                }
            }
        });

        if (existing) {
            return { success: false, error: "Staff already assigned to this department" };
        }

        await prisma.staffDepartment.create({
            data: {
                userId,
                departmentId
            }
        });

        // Create audit log
        await prisma.auditLog.create({
            data: {
                userId: user.userId,
                action: "STAFF_ASSIGN_DEPARTMENT",
                entity: "DEPARTMENT",
                entityId: departmentId,
                newValue: JSON.stringify({ userId })
            }
        });

        revalidatePath("/admin/departments");
        return { success: true, message: "Staff assigned successfully" };
    } catch (error) {
        console.error("Error assigning staff:", error);
        return { success: false, error: "Failed to assign staff" };
    }
}

/**
 * Remove Staff from Department
 */
export async function removeStaffFromDepartment(departmentId: string, userId: string) {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }

    try {
        await prisma.staffDepartment.delete({
            where: {
                userId_departmentId: {
                    userId,
                    departmentId
                }
            }
        });

        // Create audit log
        await prisma.auditLog.create({
            data: {
                userId: user.userId,
                action: "STAFF_REMOVE_DEPARTMENT",
                entity: "DEPARTMENT",
                entityId: departmentId,
                oldValue: JSON.stringify({ userId })
            }
        });

        revalidatePath("/admin/departments");
        return { success: true, message: "Staff removed successfully" };
    } catch (error) {
        console.error("Error removing staff:", error);
        return { success: false, error: "Failed to remove staff" };
    }
}

/**
 * Get Department Statistics
 */
export async function getDepartmentStats(departmentId: string) {
    const user = await getSessionUser();
    if (!user) {
        return null;
    }

    try {
        const department = await prisma.department.findUnique({
            where: { id: departmentId },
            include: {
                doctors: {
                    include: {
                        doctor: {
                            include: {
                                appointments: {
                                    where: {
                                        date: {
                                            gte: new Date(new Date().setDate(1)) // This month
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                staff: true
            }
        });

        if (!department) {
            return null;
        }

        const totalDoctors = department.doctors.length;
        const totalStaff = department.staff.length;
        const totalAppointments = department.doctors.reduce(
            (sum, dd) => sum + dd.doctor.appointments.length,
            0
        );

        return {
            totalDoctors,
            totalStaff,
            totalAppointments,
            totalEmployees: totalDoctors + totalStaff
        };
    } catch (error) {
        console.error("Error fetching department stats:", error);
        return null;
    }
}

/**
 * Get Available Doctors (not assigned to a specific department)
 */
export async function getAvailableDoctors(departmentId?: string) {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
        return [];
    }

    try {
        const doctors = await prisma.doctor.findMany({
            where: {
                user: {
                    status: "ACTIVE"
                }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        return doctors;
    } catch (error) {
        console.error("Error fetching available doctors:", error);
        return [];
    }
}

/**
 * Get Available Staff (not assigned to a specific department)
 */
export async function getAvailableStaff(departmentId?: string) {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
        return [];
    }

    try {
        const staff = await prisma.user.findMany({
            where: {
                role: {
                    in: ["STAFF_NURSE", "STAFF_RECEPTION", "STAFF_LAB", "STAFF_PHARMACY"]
                },
                status: "ACTIVE"
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true
            }
        });

        return staff;
    } catch (error) {
        console.error("Error fetching available staff:", error);
        return [];
    }
}
