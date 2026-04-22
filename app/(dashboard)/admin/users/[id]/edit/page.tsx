import UserForm from "@/components/admin/UserForm";
import { updateUser } from "@/actions/admin";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getAllDepartments } from "@/actions/departments";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const [user, departments] = await Promise.all([
        prisma.user.findUnique({
            where: { id },
            include: { doctorProfile: true }
        }),
        getAllDepartments()
    ]);

    if (!user) {
        notFound();
    }

    const deptList = departments.map((d: any) => ({ id: d.id, name: d.name }));

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white">Edit User</h1>
                <p className="text-indigo-200">Update account details and permissions</p>
            </div>

            <UserForm
                action={updateUser}
                user={{
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    status: user.status,
                    specialization: (user as any).doctorProfile?.specialization || ""
                }}
                title="Edit User Details"
                departments={deptList}
            />
        </div>
    );
}
