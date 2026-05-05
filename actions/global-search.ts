"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function globalSearch(query: string) {
    const user = await getSessionUser();
    if (!user || !query || query.trim().length < 1) {
        return [];
    }

    const q = query.trim();
    const results: {
        type: string;
        title: string;
        subtitle: string;
        url: string;
    }[] = [];

    try {
        // Search Users (doctors, staff, admins)
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { name: { contains: q } },
                    { email: { contains: q } },
                    { role: { contains: q } },
                ],
            },
            take: 5,
            orderBy: { name: "asc" },
        });

        for (const u of users) {
            const roleLabel = u.role === "DOCTOR" ? "Doctor" :
                u.role === "PATIENT" ? "Patient" :
                    u.role === "ADMIN" ? "Admin" : "Staff";
            results.push({
                type: u.role === "DOCTOR" ? "doctor" : u.role === "PATIENT" ? "patient" : "user",
                title: u.role === "DOCTOR" ? `Dr. ${u.name}` : u.name,
                subtitle: `${roleLabel} • ${u.email}`,
                url: user.role === "ADMIN" ? `/admin/users/${u.id}/edit` : "#",
            });
        }

        // Search Patients
        const patients = await prisma.patient.findMany({
            where: {
                OR: [
                    { name: { contains: q } },
                    { phone: { contains: q } },
                ],
            },
            include: { user: { select: { email: true } } },
            take: 5,
            orderBy: { name: "asc" },
        });

        for (const p of patients) {
            // Avoid duplicates if patient was already found via user search
            if (!results.some(r => r.title === p.name && r.type === "patient")) {
                results.push({
                    type: "patient",
                    title: p.name,
                    subtitle: `Patient • ${p.phone || p.user?.email || "No contact"}`,
                    url: user.role === "DOCTOR" ? `/doctor/patients` :
                        user.role === "ADMIN" ? `/admin/users` : `/staff/registration`,
                });
            }
        }

        // Search Departments
        const departments = await prisma.department.findMany({
            where: {
                OR: [
                    { name: { contains: q } },
                    { description: { contains: q } },
                ],
                isActive: true,
            },
            include: { _count: { select: { doctors: true, staff: true } } },
            take: 5,
            orderBy: { name: "asc" },
        });

        for (const d of departments) {
            results.push({
                type: "department",
                title: d.name,
                subtitle: `Department • ${d._count.doctors} doctors, ${d._count.staff} staff`,
                url: `/admin/departments/${d.id}`,
            });
        }

        // Search Appointments (by reason or patient name)
        const appointments = await prisma.appointment.findMany({
            where: {
                OR: [
                    { reason: { contains: q } },
                    { patient: { name: { contains: q } } },
                ],
            },
            include: {
                patient: { select: { name: true } },
                doctor: { include: { user: { select: { name: true } } } },
            },
            take: 5,
            orderBy: { date: "desc" },
        });

        for (const a of appointments) {
            results.push({
                type: "appointment",
                title: `${a.patient.name} - ${a.reason || "Consultation"}`,
                subtitle: `${a.status} • Dr. ${a.doctor.user.name} • ${new Date(a.date).toLocaleDateString()}`,
                url: user.role === "DOCTOR" ? `/doctor/appointments` :
                    user.role === "ADMIN" ? `/admin` : `/staff/appointments`,
            });
        }

        // Search Bills/Invoices
        const bills = await prisma.bill.findMany({
            where: {
                OR: [
                    { items: { contains: q } },
                    { patient: { name: { contains: q } } },
                ],
            },
            include: { patient: { select: { name: true } } },
            take: 3,
            orderBy: { date: "desc" },
        });

        for (const b of bills) {
            results.push({
                type: "invoice",
                title: `Invoice - ${b.patient.name}`,
                subtitle: `PKR ${b.amount.toLocaleString()} • ${b.status} • ${new Date(b.date).toLocaleDateString()}`,
                url: `/staff/billing`,
            });
        }

        return results.slice(0, 10); // Cap at 10 results
    } catch (error) {
        console.error("Global search error:", error);
        return [];
    }
}
