import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/actions/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const userPayload = await getCurrentUser();

        let userId = "";
        let userSettings = { twoFactorEnabled: false, passwordExpiry: false };

        if (userPayload) {
            userId = userPayload.userId;
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { twoFactorEnabled: true, passwordExpiry: true }
            });
            if (user) userSettings = user;
        }

        const systemSettings = await prisma.systemSettings.findFirst();

        return NextResponse.json({
            userId,
            userSettings,
            hospitalName: systemSettings?.hospitalName || "Nexus Health CRM"
        });
    } catch (error) {
        console.error("Error fetching settings:", error);
        return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
    }
}
