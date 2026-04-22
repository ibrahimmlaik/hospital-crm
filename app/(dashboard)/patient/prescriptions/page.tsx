"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { Download, Pill } from "lucide-react";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/actions/auth";

interface Prescription {
    id: string;
    createdAt: Date;
    medicines: string;
    status: string;
    doctor: {
        user: {
            name: string;
        };
    };
}

export default function MyPrescriptions() {
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadPrescriptions() {
            try {
                const response = await fetch("/api/patient/prescriptions");
                if (response.ok) {
                    const data = await response.json();
                    setPrescriptions(data);
                }
            } catch (error) {
                console.error("Failed to load prescriptions:", error);
            } finally {
                setLoading(false);
            }
        }
        loadPrescriptions();
    }, []);

    const handleDownloadPDF = async (prescriptionId: string) => {
        try {
            const response = await fetch(`/api/prescriptions/${prescriptionId}/pdf`);

            if (!response.ok) {
                alert("Failed to generate PDF");
                return;
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `prescription-${prescriptionId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Download error:", error);
            alert("Failed to download PDF");
        }
    };

    if (loading) {
        return (
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">My Prescriptions</h1>
                    <p className="text-indigo-200">History of medications and doctor notes</p>
                </div>
                <div className="text-center text-indigo-300">Loading...</div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white">My Prescriptions</h1>
                <p className="text-indigo-200">History of medications and doctor notes</p>
            </div>

            <div className="space-y-4">
                {prescriptions.length === 0 ? (
                    <div className="text-center text-indigo-300 py-8">
                        No prescriptions found
                    </div>
                ) : (
                    prescriptions.map((rx) => {
                        const medicines = JSON.parse(rx.medicines);
                        const date = new Date(rx.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        });

                        return (
                            <GlassCard key={rx.id} className="flex flex-col md:flex-row gap-6 md:items-center justify-between group">
                                <div className="flex items-start gap-4">
                                    <div className="p-4 bg-white/5 rounded-xl text-indigo-300 group-hover:bg-teal-500/20 group-hover:text-teal-300 transition-colors">
                                        <Pill size={24} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-lg font-bold text-white">{date}</h3>
                                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${rx.status === 'PENDING'
                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                    : 'bg-white/5 text-slate-400 border-white/10'
                                                }`}>
                                                {rx.status}
                                            </span>
                                        </div>
                                        <p className="text-indigo-200 text-sm mb-2">
                                            Prescribed by Dr. {rx.doctor.user.name}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {medicines.map((m: any, idx: number) => (
                                                <span key={idx} className="px-2 py-1 rounded bg-white/5 text-xs text-slate-300">
                                                    {m.name} - {m.dosage}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleDownloadPDF(rx.id)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-indigo-300 hover:text-white transition-colors text-sm font-medium"
                                >
                                    <Download size={16} /> Download PDF
                                </button>
                            </GlassCard>
                        );
                    })
                )}
            </div>
        </div>
    );
}
