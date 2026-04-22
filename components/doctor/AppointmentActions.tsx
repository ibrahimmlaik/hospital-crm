"use client";

import { useState } from "react";
import { updateAppointmentStatus } from "@/actions/doctor-appointments";
import { CheckCircle, XCircle, Pill } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface AppointmentActionsProps {
    appointmentId: string;
    patientId: string;
}

export default function AppointmentActions({ appointmentId, patientId }: AppointmentActionsProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleStatusUpdate = async (status: string) => {
        setLoading(true);
        try {
            const result = await updateAppointmentStatus(appointmentId, status);
            if (result.success) {
                // Force refresh to get updated data
                router.refresh();
            } else {
                alert(result.error || "Failed to update appointment");
            }
        } catch (error) {
            console.error("Error updating status:", error);
            alert("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
            <button
                onClick={() => handleStatusUpdate("COMPLETED")}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
            >
                <CheckCircle size={16} />
                Mark Complete
            </button>
            <Link href={`/doctor/prescriptions/create?patientId=${patientId}`}>
                <button className="flex items-center gap-2 px-4 py-2 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 rounded-lg transition-colors text-sm font-medium">
                    <Pill size={16} />
                    Create Prescription
                </button>
            </Link>
            <button
                onClick={() => handleStatusUpdate("CANCELLED")}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
            >
                <XCircle size={16} />
                Cancel
            </button>
        </div>
    );
}
