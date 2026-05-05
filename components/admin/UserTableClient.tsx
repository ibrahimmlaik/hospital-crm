"use client";

import AdminFilterWrapper from "@/components/admin/AdminFilterWrapper";
import { approveUser, deleteUser } from "@/actions/admin";
import { CheckCircle, Edit, Trash2 } from "lucide-react";
import Link from "next/link";

const ROLE_FILTERS = [
    { value: "ADMIN", label: "Admin" },
    { value: "DOCTOR", label: "Doctor" },
    { value: "STAFF_NURSE", label: "Staff (Nurse)" },
    { value: "STAFF_RECEPTION", label: "Staff (Reception)" },
    { value: "STAFF_LAB", label: "Staff (Lab)" },
    { value: "STAFF_PHARMACY", label: "Staff (Pharmacy)" },
    { value: "PATIENT", label: "Patient" },
];

const STATUS_FILTERS = [
    { value: "ACTIVE", label: "Active" },
    { value: "PENDING", label: "Pending" },
    { value: "INACTIVE", label: "Inactive" },
    { value: "SUSPENDED", label: "Suspended" },
];

export default function UserTableClient({ users }: { users: any[] }) {
    return (
        <AdminFilterWrapper
            data={users}
            searchKeys={["name", "email", "role"]}
            searchPlaceholder="Search by name, email, or role..."
            filters={[
                { label: "All Roles", key: "role", options: ROLE_FILTERS },
                { label: "All Statuses", key: "status", options: STATUS_FILTERS },
            ]}
        >
            {(filteredUsers) => (
                <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                        <tr className="bg-white/5 text-indigo-200 text-sm uppercase tracking-wider">
                            <th className="p-4 sm:p-5 font-medium">Name</th>
                            <th className="p-4 sm:p-5 font-medium">Role</th>
                            <th className="p-4 sm:p-5 font-medium hidden sm:table-cell">Email</th>
                            <th className="p-4 sm:p-5 font-medium">Status</th>
                            <th className="p-4 sm:p-5 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredUsers.map((user: any) => (
                            <tr key={user.id} className="hover:bg-white/5 transition-colors text-slate-300">
                                <td className="p-4 sm:p-5 font-medium text-white">{user.name}</td>
                                <td className="p-4 sm:p-5">
                                    <span className="px-2 py-1 rounded text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 whitespace-nowrap">
                                        {user.role.replace(/_/g, ' ')}
                                    </span>
                                </td>
                                <td className="p-4 sm:p-5 text-sm hidden sm:table-cell">{user.email}</td>
                                <td className="p-4 sm:p-5">
                                    {(() => {
                                        const status = user.status || (user.isApproved ? "ACTIVE" : "PENDING");
                                        const config: Record<string, { color: string, label: string }> = {
                                            ACTIVE: { color: "text-emerald-400 bg-emerald-400", label: "Active" },
                                            PENDING: { color: "text-amber-400 bg-amber-400 animate-pulse", label: "Pending" },
                                            INACTIVE: { color: "text-slate-400 bg-slate-400", label: "Inactive" },
                                            SUSPENDED: { color: "text-red-400 bg-red-400", label: "Suspended" },
                                        };
                                        const { color, label } = config[status] || config["PENDING"];
                                        const dotColor = color.split(' ')[1];
                                        const textColor = color.split(' ')[0];
                                        return (
                                            <span className={`flex items-center gap-1.5 ${textColor} text-xs font-medium`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span> {label}
                                            </span>
                                        );
                                    })()}
                                </td>
                                <td className="p-4 sm:p-5 text-right">
                                    <div className="flex justify-end gap-1 sm:gap-2">
                                        {!user.isApproved && (
                                            <form action={approveUser as any}>
                                                <input type="hidden" name="userId" value={user.id} />
                                                <button type="submit" className="p-2 hover:bg-emerald-500/20 rounded-lg text-emerald-400 hover:text-emerald-300 transition-colors" title="Approve">
                                                    <CheckCircle size={16} />
                                                </button>
                                            </form>
                                        )}
                                        <Link href={`/admin/users/${user.id}/edit`} className="p-2 hover:bg-blue-500/20 rounded-lg text-blue-400 hover:text-blue-300 transition-colors" title="Edit">
                                            <Edit size={16} />
                                        </Link>
                                        <form action={deleteUser as any}>
                                            <input type="hidden" name="userId" value={user.id} />
                                            <button type="submit" className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 hover:text-red-300 transition-colors" title="Delete">
                                                <Trash2 size={16} />
                                            </button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredUsers.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-indigo-300">No users match your filters.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
                </div>
            )}
        </AdminFilterWrapper>
    );
}
