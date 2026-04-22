import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser || currentUser.role !== "PATIENT") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get patient profile
        const patient = await prisma.patient.findUnique({
            where: { userId: currentUser.userId }
        });

        if (!patient) {
            return NextResponse.json({ error: "Patient profile not found" }, { status: 404 });
        }

        // Fetch prescriptions
        const prescriptions = await prisma.prescription.findMany({
            where: { patientId: patient.id },
            include: {
                doctor: {
                    include: {
                        user: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json(prescriptions);
    } catch (error) {
        console.error("Error fetching prescriptions:", error);
        return NextResponse.json({ error: "Failed to fetch prescriptions" }, { status: 500 });
    }
}
