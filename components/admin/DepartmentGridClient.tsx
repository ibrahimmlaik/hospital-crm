"use client";

import AdminFilterWrapper from "@/components/admin/AdminFilterWrapper";
import { Building2, UserPlus, Users } from "lucide-react";
import Link from "next/link";

export default function DepartmentGridClient({ departments }: { departments: any[] }) {
    return (
        <AdminFilterWrapper
            data={departments}
            searchKeys={["name", "description"]}
            searchPlaceholder="Search departments by name..."
            filters={[
                {
                    label: "All Statuses", key: "isActive", options: [
                        { value: "true", label: "Active" },
                        { value: "false", label: "Inactive" },
                    ]
                },
            ]}
        >
            {(filteredDepts) => (
                <div className="p-6">
                    {filteredDepts.length === 0 ? (
                        <div className="text-center py-12 text-indigo-300">
                            <Building2 className="mx-auto mb-4 opacity-50" size={48} />
                            <p>No departments match your search</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredDepts.map((dept: any) => (
                                <Link key={dept.id} href={`/admin/departments/${dept.id}`}>
                                    <div className="p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all cursor-pointer h-full">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="p-3 bg-teal-500/20 rounded-full">
                                                <Building2 className="text-teal-300" size={24} />
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${dept.isActive
                                                ? "bg-emerald-500/20 text-emerald-300"
                                                : "bg-red-500/20 text-red-300"
                                                }`}>
                                                {dept.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-bold text-white mb-2">{dept.name}</h3>
                                        <p className="text-sm text-indigo-300 mb-4 line-clamp-2">
                                            {dept.description || "No description"}
                                        </p>

                                        <div className="flex gap-4 text-sm">
                                            <div className="flex items-center gap-2 text-blue-300">
                                                <UserPlus size={16} />
                                                <span>{dept._count?.doctors || 0} Doctors</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-purple-300">
                                                <Users size={16} />
                                                <span>{dept._count?.staff || 0} Staff</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </AdminFilterWrapper>
    );
}
