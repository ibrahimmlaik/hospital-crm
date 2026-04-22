"use client";

import { assignDoctorToDepartment, removeDoctorFromDepartment } from "@/actions/departments";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, X, Plus } from "lucide-react";

interface DoctorAssignmentListProps {
    departmentId: string;
    assignedDoctors: any[];
    availableDoctors: any[];
}

export function DoctorAssignmentList({ departmentId, assignedDoctors, availableDoctors }: DoctorAssignmentListProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState("");
    const [error, setError] = useState("");

    const handleAssign = async () => {
        if (!selectedDoctor) {
            setError("Please select a doctor");
            return;
        }

        setError("");
        startTransition(async () => {
            const result = await assignDoctorToDepartment(departmentId, selectedDoctor);

            if (result.success) {
                setShowAddForm(false);
                setSelectedDoctor("");
                router.refresh();
            } else {
                setError(result.error || "Failed to assign doctor");
            }
        });
    };

    const handleRemove = async (doctorId: string) => {
        if (!confirm("Are you sure you want to remove this doctor from the department?")) {
            return;
        }

        startTransition(async () => {
            const result = await removeDoctorFromDepartment(departmentId, doctorId);

            if (result.success) {
                router.refresh();
            } else {
                setError(result.error || "Failed to remove doctor");
            }
        });
    };

    // Filter out already assigned doctors
    const assignedDoctorIds = assignedDoctors.map(ad => ad.doctorId);
    const unassignedDoctors = availableDoctors.filter(d => !assignedDoctorIds.includes(d.id));

    return (
        <div className="space-y-4">
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {/* Assigned Doctors List */}
            {assignedDoctors.length === 0 ? (
                <div className="text-center py-8 text-indigo-300">
                    <UserPlus className="mx-auto mb-2" size={32} />
                    <p>No doctors assigned to this department yet</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {assignedDoctors.map((assignment) => (
                        <div key={assignment.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                            <div>
                                <p className="font-medium text-white">{assignment.doctor.user.name}</p>
                                <p className="text-sm text-indigo-300">{assignment.doctor.user.email}</p>
                                <p className="text-xs text-indigo-400 mt-1">Qualification: {assignment.doctor.qualification || "General"}</p>
                            </div>
                            <button
                                onClick={() => handleRemove(assignment.doctorId)}
                                disabled={isPending}
                                className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-all disabled:opacity-50"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Doctor Button/Form */}
            {!showAddForm ? (
                <button
                    onClick={() => setShowAddForm(true)}
                    className="w-full py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg border border-blue-500/30 transition-all flex items-center justify-center gap-2"
                >
                    <Plus size={20} />
                    Assign Doctor
                </button>
            ) : (
                <div className="p-4 bg-white/5 rounded-lg border border-white/10 space-y-4">
                    <h3 className="font-medium text-white">Assign New Doctor</h3>

                    {unassignedDoctors.length === 0 ? (
                        <p className="text-indigo-300 text-sm">All available doctors are already assigned</p>
                    ) : (
                        <>
                            <select
                                value={selectedDoctor}
                                onChange={(e) => setSelectedDoctor(e.target.value)}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select a doctor...</option>
                                {unassignedDoctors.map((doctor) => (
                                    <option key={doctor.id} value={doctor.id}>
                                        {doctor.user.name} - {doctor.qualification || "General"}
                                    </option>
                                ))}
                            </select>

                            <div className="flex gap-2">
                                <button
                                    onClick={handleAssign}
                                    disabled={isPending}
                                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-all disabled:cursor-not-allowed"
                                >
                                    {isPending ? "Assigning..." : "Assign"}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowAddForm(false);
                                        setSelectedDoctor("");
                                        setError("");
                                    }}
                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
