"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "super-secret-key-change-in-prod");

export async function getCurrentUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as { userId: string; role: string };
    } catch (e) {
        return null;
    }
}

export async function signup(prevState: any, formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as string;
    const specialization = formData.get("specialization") as string;

    if (!name || !email || !password || !role) {
        return { success: false, error: "All fields are required" };
    }

    // Validate Doctor specialization
    if (role === "DOCTOR" && !specialization) {
        return { success: false, error: "Specialization is required for doctors" };
    }

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return { success: false, error: "Email already registered" };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // CRITICAL: Admin users must be auto-activated
        const isAdmin = role === "ADMIN";

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash: hashedPassword,
                role,
                isApproved: isAdmin, // Auto-approve admins
                status: isAdmin ? "ACTIVE" : "PENDING" // Auto-activate admins
            },
        });

        // Create Doctor profile if role is DOCTOR
        if (role === "DOCTOR") {
            const newDoctor = await prisma.doctor.create({
                data: {
                    userId: newUser.id,
                    qualification: "", // Can be updated later
                    availability: "{}" // Empty JSON, can be set later
                }
            });

            // Upsert the department
            const department = await prisma.department.upsert({
                where: { name: specialization },
                update: {},
                create: {
                    name: specialization,
                    description: `${specialization} Department`,
                    isActive: true
                }
            });

            // Link Doctor and Department
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
                    phone: "", // Can be updated later
                    dob: new Date(), // Placeholder, should be updated
                    gender: "Other" // Placeholder
                }
            });
        }

        // Notify all admins about new signup (except if the new user is admin)
        if (!isAdmin) {
            const admins = await prisma.user.findMany({
                where: { role: "ADMIN" }
            });

            if (admins.length > 0) {
                const notificationMessage = role === "DOCTOR"
                    ? `${name} (Doctor - ${specialization}) has signed up and is awaiting approval.`
                    : `${name} (${role}) has signed up and is awaiting approval.`;

                await prisma.notification.createMany({
                    data: admins.map(admin => ({
                        userId: admin.id,
                        title: "New User Signup",
                        message: notificationMessage,
                        type: "INFO",
                        relatedEntity: "USER",
                        relatedEntityId: newUser.id,
                        actionUrl: "/admin/users"
                    }))
                });
            }
        }

        const message = isAdmin
            ? "Admin account created! You can log in immediately."
            : "Account created! Awaiting admin approval.";

        return { success: true, message };
    } catch (error) {
        console.error("Signup error:", error);
        return { success: false, error: "Something went wrong" };
    }
}

export async function login(prevState: any, formData: FormData) {
    console.log("Login action started");
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        console.log("Login failed: Missing credentials");
        return { success: false, error: "Email and password required" };
    }

    try {
        console.log(`Attempting login for: ${email}`);
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            console.log("Login failed: User not found");
            return { success: false, error: "Invalid credentials" };
        }

        console.log("User found, verifying password...");
        const isValid = await bcrypt.compare(password, user.passwordHash);

        if (!isValid) {
            console.log("Login failed: Invalid password");
            return { success: false, error: "Invalid credentials" };
        }

        if (!user.isApproved) {
            console.log("Login failed: Not approved");
            return { success: false, error: "Account pending approval. Contact Admin." };
        }

        // Check user status
        if (user.status !== "ACTIVE") {
            console.log(`Login failed: Status is ${user.status}`);
            const statusMessages: Record<string, string> = {
                PENDING: "Account is pending activation. Contact Admin.",
                INACTIVE: "Account has been deactivated. Contact Admin.",
                SUSPENDED: "Account has been suspended. Contact Admin for details."
            };
            return { success: false, error: statusMessages[user.status] || "Account is not active." };
        }

        console.log("Login successful, generating token...");
        // Generate JWT
        const token = await new SignJWT({ userId: user.id, role: user.role })
            .setProtectedHeader({ alg: "HS256" })
            .setExpirationTime("24h")
            .sign(JWT_SECRET);

        // Set Cookie
        console.log("Setting cookie...");
        const cookieStore = await cookies();
        cookieStore.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            sameSite: "strict",
        });

        // Determine redirect path based on role
        let redirectPath = "/login";
        switch (user.role) {
            case "ADMIN": redirectPath = "/admin"; break;
            case "DOCTOR": redirectPath = "/doctor"; break;
            case "PATIENT": redirectPath = "/patient"; break;
            case "STAFF_NURSE":
            case "STAFF_RECEPTION":
            case "STAFF_LAB":
            case "STAFF_PHARMACY": redirectPath = "/staff"; break;
        }

        console.log(`Redirecting to: ${redirectPath}`);
        // Return success with redirect path for client-side navigation
        return { success: true, redirectTo: redirectPath };
    } catch (error) {
        console.error("Login error (CAUGHT):", error);
        return { success: false, error: "Something went wrong during login" };
    }
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete("token");
    redirect("/login");
}
