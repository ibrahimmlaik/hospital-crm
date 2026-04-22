"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function createFirstAdmin(prevState: any, formData: FormData) {
    try {
        // Check if any users exist
        const userCount = await prisma.user.count();
        if (userCount > 0) {
            return { success: false, error: "System already initialized. Please login instead." };
        }

        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        // Validation
        if (!name || !email || !password || !confirmPassword) {
            return { success: false, error: "All fields are required" };
        }

        if (password !== confirmPassword) {
            return { success: false, error: "Passwords do not match" };
        }

        if (password.length < 8) {
            return { success: false, error: "Password must be at least 8 characters" };
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return { success: false, error: "Invalid email address" };
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create admin user
        await prisma.user.create({
            data: {
                name,
                email: email.toLowerCase(),
                passwordHash,
                role: "ADMIN",
                status: "ACTIVE",
                isApproved: true,
            },
        });

        return {
            success: true,
            message: "Admin account created successfully! Redirecting to login..."
        };
    } catch (error: any) {
        console.error("Setup error:", error);

        if (error.code === "P2002") {
            return { success: false, error: "Email already exists" };
        }

        return { success: false, error: "Failed to create admin account. Please try again." };
    }
}

export async function checkSystemSetup() {
    try {
        const userCount = await prisma.user.count();
        return { needsSetup: userCount === 0 };
    } catch (error) {
        console.error("Error checking setup:", error);
        return { needsSetup: true };
    }
}
