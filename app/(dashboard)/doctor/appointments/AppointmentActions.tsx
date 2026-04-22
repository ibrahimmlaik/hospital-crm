"use client";

import { useTransition } from "react";
import { updateAppointmentStatus } from "@/actions/doctor-appointments";
import { Check, FileText, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function AppointmentActions({ appointmentId, patientId }: { appointmentId: string, patientId?: string }) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleComplete = () => {
        startTransition(async () => {
            const res = await updateAppointmentStatus(appointmentId, "COMPLETED");
            if (res.success) {
                router.refresh();
            } else {
                alert(res.error || "Failed to mark as completed");
            }
        });
    };

    const handleViewEMR = () => {
        if (patientId) {
            router.push(`/doctor/patients/${patientId}/history`);
        } else {
            alert("No patient record found to view EMR.");
        }
    };

    return (
        <div className="mt-6 flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-white/10">
            <button
                onClick={handleComplete}
                disabled={isPending}
                className="flex-1 flex justify-center items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors disabled:opacity-70"
            >
                {isPending ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Updating...
                    </>
                ) : (
                    <>
                        <Check className="h-4 w-4" />
                        Mark Completed
                    </>
                )}
            </button>
            <button
                onClick={handleViewEMR}
                className="flex-1 flex justify-center items-center gap-2 rounded-lg border border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-colors"
            >
                <FileText className="h-4 w-4" />
                View EMR
            </button>
        </div>
    );
}
