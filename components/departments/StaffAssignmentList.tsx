"use client";

import { assignStaffToDepartment, removeStaffFromDepartment } from "@/actions/departments";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Users, X, Plus } from "lucide-react";

interface StaffAssignmentListProps {
    departmentId: string;
    assignedStaff: any[];
    availableStaff: any[];
}

export function StaffAssignmentList({ departmentId, assignedStaff, availableStaff }: StaffAssignmentListProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState("");
    const [error, setError] = useState("");

    const handleAssign = async () => {
        if (!selectedStaff) {
            setError("Please select a staff member");
            return;
        }

        setError("");
        startTransition(async () => {
            const result = await assignStaffToDepartment(departmentId, selectedStaff);

            if (result.success) {
                setShowAddForm(false);
                setSelectedStaff("");
                router.refresh();
            } else {
                setError(result.error || "Failed to assign staff");
            }
        });
    };

    const handleRemove = async (userId: string) => {
        if (!confirm("Are you sure you want to remove this staff member from the department?")) {
            return;
        }

        startTransition(async () => {
            const result = await removeStaffFromDepartment(departmentId, userId);

            if (result.success) {
                router.refresh();
            } else {
                setError(result.error || "Failed to remove staff");
            }
        });
    };

    // Filter out already assigned staff
    const assignedStaffIds = assignedStaff.map(as => as.userId);
    const unassignedStaff = availableStaff.filter(s => !assignedStaffIds.includes(s.id));

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case "STAFF_NURSE":
                return "bg-pink-500/20 text-pink-300";
            case "STAFF_RECEPTION":
                return "bg-blue-500/20 text-blue-300";
            case "STAFF_LAB":
                return "bg-purple-500/20 text-purple-300";
            case "STAFF_PHARMACY":
                return "bg-green-500/20 text-green-300";
            default:
                return "bg-gray-500/20 text-gray-300";
        }
    };

    const formatRole = (role: string) => {
        return role.replace("STAFF_", "").replace("_", " ");
    };

    return (
        <div className="space-y-4">
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {/* Assigned Staff List */}
            {assignedStaff.length === 0 ? (
                <div className="text-center py-8 text-indigo-300">
                    <Users className="mx-auto mb-2" size={32} />
                    <p>No staff assigned to this department yet</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {assignedStaff.map((assignment) => (
                        <div key={assignment.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="font-medium text-white">{assignment.user.name}</p>
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getRoleBadgeColor(assignment.user.role)}`}>
                                        {formatRole(assignment.user.role)}
                                    </span>
                                </div>
                                <p className="text-sm text-indigo-300">{assignment.user.email}</p>
                            </div>
                            <button
                                onClick={() => handleRemove(assignment.userId)}
                                disabled={isPending}
                                className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-all disabled:opacity-50"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Staff Button/Form */}
            {!showAddForm ? (
                <button
                    onClick={() => setShowAddForm(true)}
                    className="w-full py-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg border border-purple-500/30 transition-all flex items-center justify-center gap-2"
                >
                    <Plus size={20} />
                    Assign Staff
                </button>
            ) : (
                <div className="p-4 bg-white/5 rounded-lg border border-white/10 space-y-4">
                    <h3 className="font-medium text-white">Assign New Staff</h3>

                    {unassignedStaff.length === 0 ? (
                        <p className="text-indigo-300 text-sm">All available staff are already assigned</p>
                    ) : (
                        <>
                            <select
                                value={selectedStaff}
                                onChange={(e) => setSelectedStaff(e.target.value)}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="">Select a staff member...</option>
                                {unassignedStaff.map((staff) => (
                                    <option key={staff.id} value={staff.id}>
                                        {staff.name} - {formatRole(staff.role)}
                                    </option>
                                ))}
                            </select>

                            <div className="flex gap-2">
                                <button
                                    onClick={handleAssign}
                                    disabled={isPending}
                                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-all disabled:cursor-not-allowed"
                                >
                                    {isPending ? "Assigning..." : "Assign"}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowAddForm(false);
                                        setSelectedStaff("");
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
