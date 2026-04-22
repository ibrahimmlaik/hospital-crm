"use client";

import AdminFilterWrapper from "@/components/admin/AdminFilterWrapper";
import { TestTube2, Package, MapPin, Phone } from "lucide-react";
import Link from "next/link";

export default function LabGridClient({ labs }: { labs: any[] }) {
    return (
        <AdminFilterWrapper
            data={labs}
            searchKeys={["name", "description", "location"]}
            searchPlaceholder="Search labs by name, location..."
            filters={[
                {
                    label: "All Statuses", key: "isActive", options: [
                        { value: "true", label: "Active" },
                        { value: "false", label: "Inactive" },
                    ]
                },
            ]}
        >
            {(filteredLabs) => (
                <div className="p-6">
                    {filteredLabs.length === 0 ? (
                        <div className="text-center py-12 text-indigo-300">
                            <TestTube2 className="mx-auto mb-4 opacity-50" size={48} />
                            <p>No labs match your search</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredLabs.map((lab: any) => (
                                <Link key={lab.id} href={`/admin/labs/${lab.id}`}>
                                    <div className="p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all cursor-pointer h-full group">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="p-3 bg-cyan-500/20 rounded-full group-hover:bg-cyan-500/30 transition-colors">
                                                <TestTube2 className="text-cyan-300" size={24} />
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${lab.isActive
                                                ? "bg-emerald-500/20 text-emerald-300"
                                                : "bg-red-500/20 text-red-300"
                                                }`}>
                                                {lab.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-bold text-white mb-2">{lab.name}</h3>
                                        <p className="text-sm text-indigo-300 mb-4 line-clamp-2">
                                            {lab.description || "No description"}
                                        </p>

                                        <div className="space-y-2 text-sm">
                                            {lab.location && (
                                                <div className="flex items-center gap-2 text-blue-300">
                                                    <MapPin size={14} />
                                                    <span className="truncate">{lab.location}</span>
                                                </div>
                                            )}
                                            {lab.phone && (
                                                <div className="flex items-center gap-2 text-purple-300">
                                                    <Phone size={14} />
                                                    <span>{lab.phone}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 text-amber-300">
                                                <Package size={14} />
                                                <span>{lab._count?.products || 0} Tests/Services</span>
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
