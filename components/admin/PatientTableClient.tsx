"use client";

import { useState, useMemo } from "react";
import { Search, Filter, X, User, Phone, Calendar, MapPin, Stethoscope } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";

interface Patient {
    id: string;
    name: string;
    phone: string;
    dob: string;
    gender: string;
    address: string | null;
    medicalHistory: string | null;
    relatedDoctorId: string | null;
    familyMemberName: string | null;
    user: { email: string; status: string; createdAt: string } | null;
    _count: {
        appointments: number;
        prescriptions: number;
        bills: number;
        labTests: number;
    };
}

export default function PatientTableClient({ patients }: { patients: Patient[] }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [genderFilter, setGenderFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const filteredPatients = useMemo(() => {
        let result = patients;

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(q) ||
                p.phone.toLowerCase().includes(q) ||
                p.user?.email?.toLowerCase().includes(q) ||
                p.address?.toLowerCase().includes(q)
            );
        }

        if (genderFilter) {
            result = result.filter(p => p.gender === genderFilter);
        }

        if (statusFilter) {
            result = result.filter(p => p.user?.status === statusFilter);
        }

        return result;
    }, [patients, searchQuery, genderFilter, statusFilter]);

    const activeFiltersCount = [genderFilter, statusFilter].filter(Boolean).length;

    const clearFilters = () => {
        setSearchQuery("");
        setGenderFilter("");
        setStatusFilter("");
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-PK", { year: "numeric", month: "short", day: "numeric" });
    };

    const calculateAge = (dobStr: string) => {
        const dob = new Date(dobStr);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
        return age;
    };

    return (
        <div className="space-y-6">
            {/* Search & Filters */}
            <GlassCard className="!p-4">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-2.5 text-indigo-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name, phone, email, address..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#0f172a]/50 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500/50 transition-colors"
                        />
                    </div>

                    <div className="flex gap-2 items-center">
                        <select
                            value={genderFilter}
                            onChange={(e) => setGenderFilter(e.target.value)}
                            className="bg-[#0f172a]/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500/50"
                        >
                            <option value="">All Genders</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-[#0f172a]/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500/50"
                        >
                            <option value="">All Statuses</option>
                            <option value="ACTIVE">Active</option>
                            <option value="PENDING">Pending</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>

                        {(searchQuery || activeFiltersCount > 0) && (
                            <button
                                onClick={clearFilters}
                                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-red-500/10 text-red-300 text-sm hover:bg-red-500/20 transition-colors border border-red-500/20"
                            >
                                <X size={14} /> Clear
                            </button>
                        )}
                    </div>
                </div>

                <div className="mt-3 text-xs text-indigo-400">
                    Showing {filteredPatients.length} of {patients.length} patients
                    {activeFiltersCount > 0 && ` • ${activeFiltersCount} filter${activeFiltersCount > 1 ? 's' : ''} active`}
                </div>
            </GlassCard>

            {/* Patients Table */}
            <GlassCard className="p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 text-indigo-200 text-xs uppercase tracking-wider">
                                <th className="p-5 font-medium">Patient</th>
                                <th className="p-5 font-medium">Contact</th>
                                <th className="p-5 font-medium">Age / DOB</th>
                                <th className="p-5 font-medium">Gender</th>
                                <th className="p-5 font-medium">Status</th>
                                <th className="p-5 font-medium text-center">Appointments</th>
                                <th className="p-5 font-medium text-center">Prescriptions</th>
                                <th className="p-5 font-medium text-center">Bills</th>
                                <th className="p-5 font-medium">Registered</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm text-slate-300">
                            {filteredPatients.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="p-12 text-center">
                                        <User className="mx-auto mb-3 opacity-30" size={40} />
                                        <p className="text-indigo-300">No patients found</p>
                                        <p className="text-xs text-indigo-400 mt-1">Try adjusting your search or filters</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredPatients.map((patient) => (
                                    <tr key={patient.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500/30 to-blue-500/30 flex items-center justify-center text-teal-300 font-bold text-sm border border-teal-500/20">
                                                    {patient.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white">{patient.name}</p>
                                                    {patient.address && (
                                                        <p className="text-xs text-indigo-400 flex items-center gap-1 mt-0.5">
                                                            <MapPin size={10} /> {patient.address}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="space-y-1">
                                                {patient.phone && (
                                                    <p className="flex items-center gap-1.5 text-white">
                                                        <Phone size={12} className="text-indigo-400" /> {patient.phone}
                                                    </p>
                                                )}
                                                {patient.user?.email && (
                                                    <p className="text-xs text-indigo-400">{patient.user.email}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <p className="text-white font-medium">{calculateAge(patient.dob)} yrs</p>
                                            <p className="text-xs text-indigo-400">{formatDate(patient.dob)}</p>
                                        </td>
                                        <td className="p-5">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${patient.gender === "Male"
                                                    ? "bg-blue-500/10 text-blue-300 border-blue-500/20"
                                                    : patient.gender === "Female"
                                                        ? "bg-pink-500/10 text-pink-300 border-pink-500/20"
                                                        : "bg-purple-500/10 text-purple-300 border-purple-500/20"
                                                }`}>
                                                {patient.gender}
                                            </span>
                                        </td>
                                        <td className="p-5">
                                            {patient.user ? (
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${patient.user.status === "ACTIVE"
                                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                        : patient.user.status === "PENDING"
                                                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                                            : "bg-red-500/10 text-red-400 border-red-500/20"
                                                    }`}>
                                                    {patient.user.status}
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20">
                                                    Walk-in
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-5 text-center">
                                            <span className="text-white font-bold">{patient._count.appointments}</span>
                                        </td>
                                        <td className="p-5 text-center">
                                            <span className="text-white font-bold">{patient._count.prescriptions}</span>
                                        </td>
                                        <td className="p-5 text-center">
                                            <span className="text-white font-bold">{patient._count.bills}</span>
                                        </td>
                                        <td className="p-5 text-indigo-300 text-xs">
                                            {patient.user?.createdAt
                                                ? formatDate(patient.user.createdAt)
                                                : "—"
                                            }
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
        </div>
    );
}
