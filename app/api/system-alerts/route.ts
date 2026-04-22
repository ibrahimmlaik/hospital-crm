import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

/**
 * GET /api/system-alerts
 * Fetch active system alerts (unresolved only)
 */
export async function GET() {
    try {
        const currentUser = await getCurrentUser();

        // Only admins and staff can view system alerts
        if (!currentUser || (currentUser.role !== "ADMIN" && !currentUser.role.startsWith("STAFF"))) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const alerts = await prisma.systemAlert.findMany({
            where: { isResolved: false },
            orderBy: [
                { severity: "desc" }, // CRITICAL first
                { createdAt: "desc" }
            ]
        });

        return NextResponse.json(alerts);
    } catch (error) {
        console.error("Error fetching system alerts:", error);
        return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 });
    }
}
