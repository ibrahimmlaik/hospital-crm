"use client";

import { deleteBed } from "@/actions/staff-wards";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteBedButton({ bedId, bedNumber }: { bedId: string; bedNumber: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete bed ${bedNumber}?`)) {
            return;
        }

        setLoading(true);
        const result = await deleteBed(bedId);

        if (result.success) {
            router.refresh();
        } else {
            alert(result.error);
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
            <Trash2 size={16} />
            {loading ? "Deleting..." : "Delete Bed"}
        </button>
    );
}
