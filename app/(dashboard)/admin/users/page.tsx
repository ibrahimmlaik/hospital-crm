import { prisma } from "@/lib/prisma";
import { GlassCard } from "@/components/ui/glass-card";
import { Plus } from "lucide-react";
import Link from "next/link";
import UserTableClient from "@/components/admin/UserTableClient";

export default async function UserManagement() {
    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' }
    });

    // Serialize dates for client component
    const serializedUsers = users.map(u => ({
        ...u,
        createdAt: u.createdAt.toISOString(),
        updatedAt: u.updatedAt.toISOString(),
    }));

    return (
        <div className="space-y-6 sm:space-y-8">
            <div className="flex flex-wrap justify-between items-start gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">User Management</h1>
                    <p className="text-indigo-200 text-sm sm:text-base">Manage doctors, staff, and access roles</p>
                </div>
                <Link href="/admin/users/new" className="bg-teal-500 hover:bg-teal-400 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors text-sm whitespace-nowrap">
                    <Plus size={18} /> Add User
                </Link>
            </div>

            <GlassCard className="p-0 overflow-hidden">
                <UserTableClient users={serializedUsers} />
            </GlassCard>
        </div>
    );
}
