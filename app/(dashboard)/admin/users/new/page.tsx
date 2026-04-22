import UserForm from "@/components/admin/UserForm";
import { createUser } from "@/actions/admin";
import { getAllDepartments } from "@/actions/departments";

export default async function NewUserPage() {
    const departments = await getAllDepartments();

    // Serialize for client component
    const deptList = departments.map((d: any) => ({ id: d.id, name: d.name }));

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white">Add New User</h1>
                <p className="text-indigo-200">Create a new account for a doctor, staff, or patient</p>
            </div>

            <UserForm action={createUser} title="User Details" departments={deptList} />
        </div>
    );
}
