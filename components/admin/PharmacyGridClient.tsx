"use client";

import AdminFilterWrapper from "@/components/admin/AdminFilterWrapper";
import { Pill, Package, MapPin, Phone } from "lucide-react";
import Link from "next/link";

export default function PharmacyGridClient({ pharmacies }: { pharmacies: any[] }) {
    return (
        <AdminFilterWrapper
            data={pharmacies}
            searchKeys={["name", "description", "location"]}
            searchPlaceholder="Search pharmacies by name, location..."
            filters={[
                {
                    label: "All Statuses", key: "isActive", options: [
                        { value: "true", label: "Active" },
                        { value: "false", label: "Inactive" },
                    ]
                },
            ]}
        >
            {(filteredPharmacies) => (
                <div className="p-6">
                    {filteredPharmacies.length === 0 ? (
                        <div className="text-center py-12 text-indigo-300">
                            <Pill className="mx-auto mb-4 opacity-50" size={48} />
                            <p>No pharmacies match your search</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredPharmacies.map((pharmacy: any) => (
                                <Link key={pharmacy.id} href={`/admin/pharmacy/${pharmacy.id}`}>
                                    <div className="p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all cursor-pointer h-full group">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="p-3 bg-rose-500/20 rounded-full group-hover:bg-rose-500/30 transition-colors">
                                                <Pill className="text-rose-300" size={24} />
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${pharmacy.isActive
                                                ? "bg-emerald-500/20 text-emerald-300"
                                                : "bg-red-500/20 text-red-300"
                                                }`}>
                                                {pharmacy.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-bold text-white mb-2">{pharmacy.name}</h3>
                                        <p className="text-sm text-indigo-300 mb-4 line-clamp-2">
                                            {pharmacy.description || "No description"}
                                        </p>

                                        <div className="space-y-2 text-sm">
                                            {pharmacy.location && (
                                                <div className="flex items-center gap-2 text-blue-300">
                                                    <MapPin size={14} />
                                                    <span className="truncate">{pharmacy.location}</span>
                                                </div>
                                            )}
                                            {pharmacy.phone && (
                                                <div className="flex items-center gap-2 text-purple-300">
                                                    <Phone size={14} />
                                                    <span>{pharmacy.phone}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 text-amber-300">
                                                <Package size={14} />
                                                <span>{pharmacy._count?.products || 0} Products</span>
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
