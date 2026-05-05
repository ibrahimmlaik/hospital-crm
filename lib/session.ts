import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";
import { cache } from "react";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "super-secret-key-change-in-prod");

/**
 * Fast auth check — reads JWT only, NO database query.
 * Use this in server actions for authorization guards.
 * Returns { userId, role } from the JWT payload.
 */
export const getSessionUser = cache(async (): Promise<{ userId: string; role: string } | null> => {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        if (!payload.userId || !payload.role) return null;
        return { userId: payload.userId as string, role: payload.role as string };
    } catch {
        return null;
    }
});

/**
 * Full user lookup — verifies JWT then queries database.
 * Use this only when you need name/email (e.g. layout, profile).
 * Cached per request via React cache() to avoid duplicate DB calls.
 */
export const getCurrentUser = cache(async () => {
    const session = await getSessionUser();
    if (!session) return null;

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { id: true, name: true, email: true, role: true }
        });

        if (!user) return null;

        return {
            ...user,
            userId: user.id
        };
    } catch {
        return null;
    }
});

