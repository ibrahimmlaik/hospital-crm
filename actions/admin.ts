"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hash } from "bcryptjs";

export async function approveUser(formData: FormData) {
    const userId = formData.get("userId") as string;
    if (!userId) return { success: false, error: "User ID is required" };

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return { success: false, error: "User not found" };

        await prisma.user.update({
            where: { id: userId },
            data: {
                isApproved: true,
                status: "ACTIVE"
            },
        });

        // Notify user of approval
        await prisma.notification.create({
            data: {
                userId: user.id,
                title: "Account Approved",
                message: "Your account has been approved! You can now log in and access the system.",
                type: "SUCCESS",
                relatedEntity: "USER",
                relatedEntityId: user.id,
                actionUrl: "/login"
            }
        });

        revalidatePath("/admin/users");
        return { success: true, message: "User approved successfully" };
    } catch (error) {
        console.error("Failed to approve user:", error);
        return { success: false, error: "Failed to approve user" };
    }
}

export async function deleteUser(formData: FormData) {
    const userId = formData.get("userId") as string;
    if (!userId) return { success: false, error: "User ID is required" };

    try {
        await prisma.user.delete({
            where: { id: userId },
        });
        revalidatePath("/admin/users");
        return { success: true, message: "User deleted successfully" };
    } catch (error) {
        console.error("Failed to delete user:", error);
        return { success: false, error: "Failed to delete user" };
    }
}

export async function createUser(formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as string;
    const specialization = formData.get("specialization") as string;

    if (!name || !email || !password || !role) {
        return { success: false, error: "Missing required fields" };
    }

    // Validate department for non-patient roles
    if (role !== "PATIENT" && !specialization) {
        return { success: false, error: "Department is required" };
    }

    try {
        const hashedPassword = await hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash: hashedPassword,
                role,
                isApproved: true, // Admin-created users are pre-approved
                status: "ACTIVE"  // All admin-created users start active
            },
        });

        // Create Doctor profile + department link if role is DOCTOR
        if (role === "DOCTOR" && specialization) {
            const newDoctor = await prisma.doctor.create({
                data: {
                    userId: newUser.id,
                    qualification: "MD",
                    availability: "{}"
                }
            });

            // Find or create the department
            const department = await prisma.department.upsert({
                where: { name: specialization },
                update: {},
                create: {
                    name: specialization,
                    description: `${specialization} Department`,
                    isActive: true
                }
            });

            // Link Doctor to Department
            await prisma.doctorDepartment.create({
                data: {
                    doctorId: newDoctor.id,
                    departmentId: department.id,
                    isPrimary: true
                }
            });
        }

        // Create Patient profile if role is PATIENT
        if (role === "PATIENT") {
            await prisma.patient.create({
                data: {
                    userId: newUser.id,
                    name: name,
                    phone: "",
                    dob: new Date(),
                    gender: "Other"
                }
            });
        }

        // Notify new user
        await prisma.notification.create({
            data: {
                userId: newUser.id,
                title: "Account Created",
                message: `Welcome to Nexus Health CRM! Your ${role} account has been created by an administrator. You can now log in with your credentials.`,
                type: "SUCCESS",
                relatedEntity: "USER",
                relatedEntityId: newUser.id,
                actionUrl: "/login"
            }
        });

        // Notify all admins
        const admins = await prisma.user.findMany({
            where: { role: "ADMIN", id: { not: newUser.id } }
        });

        if (admins.length > 0) {
            await prisma.notification.createMany({
                data: admins.map(admin => ({
                    userId: admin.id,
                    title: "New User Created",
                    message: `${name} (${role}${specialization ? ` - ${specialization}` : ''}) has been added to the system.`,
                    type: "INFO",
                    relatedEntity: "USER",
                    relatedEntityId: newUser.id,
                    actionUrl: "/admin/users"
                }))
            });
        }

        revalidatePath("/admin/users");
        revalidatePath("/admin/departments");
        return { success: true, message: "User created successfully" };
    } catch (error) {
        console.error("Failed to create user:", error);
        return { success: false, error: "Failed to create user" };
    }
}

export async function updateUser(formData: FormData) {
    const userId = formData.get("userId") as string;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const role = formData.get("role") as string;
    const status = formData.get("status") as string;
    const specialization = formData.get("specialization") as string;

    // Optional password update
    const password = formData.get("password") as string;

    if (!userId || !name || !email || !role || !status) {
        return { success: false, error: "Missing required fields" };
    }

    // Validate Doctor specialization
    if (role === "DOCTOR" && !specialization) {
        return { success: false, error: "Specialization is required for doctors" };
    }

    try {
        const data: any = {
            name,
            email,
            role,
            status,
        };

        // If setting to ACTIVE, ensure isApproved is true.
        // If setting to INACTIVE/SUSPENDED, should we revoke approval? 
        // Typically approval is a one-time gate. Status controls ongoing access.
        if (status === "ACTIVE") {
            data.isApproved = true;
        }

        if (password && password.trim() !== "") {
            data.passwordHash = await hash(password, 10);
        }

        await prisma.user.update({
            where: { id: userId },
            data,
        });

        // Handle Doctor profile update/creation
        if (role === "DOCTOR" && specialization) {
            let doctorProfile = await prisma.doctor.findUnique({
                where: { userId }
            });

            if (!doctorProfile) {
                // Create new doctor profile
                doctorProfile = await prisma.doctor.create({
                    data: {
                        userId,
                        qualification: "MD",
                        availability: "{}"
                    }
                });
            }

            // Find or create the department
            const department = await prisma.department.upsert({
                where: { name: specialization },
                update: {},
                create: {
                    name: specialization,
                    description: `${specialization} Department`,
                    isActive: true
                }
            });

            // Remove ALL old department links for this doctor
            await prisma.doctorDepartment.deleteMany({
                where: {
                    doctorId: doctorProfile.id
                }
            });

            // Create new primary department link
            await prisma.doctorDepartment.create({
                data: {
                    doctorId: doctorProfile.id,
                    departmentId: department.id,
                    isPrimary: true
                }
            });
        }

        revalidatePath("/admin/users");
        revalidatePath(`/admin/users/${userId}/edit`);
        revalidatePath("/admin/departments");
        return { success: true, message: "User updated successfully" };
    } catch (error: any) {
        console.error("Failed to update user:", error);
        return { success: false, error: `Failed to update user: ${error?.message || "Unknown error"}` };
    }
}

export async function getAdminStats() {
    const revenue = await prisma.bill.aggregate({
        _sum: { amount: true }
    });
    const appointments = await prisma.appointment.count({
        where: {
            date: {
                gte: new Date(new Date().setHours(0, 0, 0, 0)), // Today
            }
        }
    });
    const doctors = await prisma.user.count({ where: { role: 'DOCTOR' } });

    // Mock bed occupancy as we don't have a Bed model yet fully fleshed out in schema (using hardcoded visual grid in FE)
    // We could map it to Admitted patients if we had that field.

    return {
        revenue: revenue._sum.amount || 0,
        appointments,
        doctors,
        occupiedBeds: 12 // data shim
    };
}
