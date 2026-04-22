import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "super-secret-key-change-in-prod");

export async function getCurrentUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const user = await prisma.user.findUnique({
            where: { id: payload.userId as string },
            select: { id: true, name: true, email: true, role: true }
        });

        if (!user) return null;

        return {
            ...user,
            userId: user.id // Add userId for compatibility
        };
    } catch (error) {
        return null;
    }
}
