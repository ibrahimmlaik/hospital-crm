"use client";

import { useState } from "react";
import { Plus, X, Thermometer, Wind, Heart, Activity, Loader2 } from "lucide-react";
import { addPatientVitals } from "@/actions/patients";

export default function RecordVitalsClient({ patientId }: { patientId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsPending(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const res = await addPatientVitals(patientId, formData);

        if (res.success) {
            setIsOpen(false);
        } else {
            setError(res.error || "Failed to record vitals.");
        }
        setIsPending(false);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white px-4 py-2 rounded-lg font-medium shadow-lg shadow-teal-500/20 transition-all hover:scale-105"
            >
                <Plus size={18} /> Record New Vitals
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-[#1e293b] border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl relative">
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Activity className="text-teal-400" />
                        Log New Vitals
                    </h2>
                    <p className="text-sm text-indigo-200 mt-1">Updates the patient's medical tracking history directly.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-indigo-100 ml-1">Heart Rate (bpm)</label>
                            <div className="relative">
                                <Heart className="absolute left-3 top-3 text-rose-400 w-5 h-5 pointer-events-none" />
                                <input name="pulse" type="number" required placeholder="72" className="w-full bg-slate-800 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-teal-500/50" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-indigo-100 ml-1">Temperature (°C)</label>
                            <div className="relative">
                                <Thermometer className="absolute left-3 top-3 text-amber-500 w-5 h-5 pointer-events-none" />
                                <input name="temperature" type="number" step="0.1" required placeholder="37.0" className="w-full bg-slate-800 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-teal-500/50" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-indigo-100 ml-1">Blood Pressure</label>
                            <div className="relative">
                                <Activity className="absolute left-3 top-3 text-emerald-400 w-5 h-5 pointer-events-none" />
                                <input name="bloodPressure" type="text" required placeholder="120/80" className="w-full bg-slate-800 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-teal-500/50" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-indigo-100 ml-1">SpO2 (%) Optional</label>
                            <div className="relative">
                                <Wind className="absolute left-3 top-3 text-sky-400 w-5 h-5 pointer-events-none" />
                                <input name="oxygenLevel" type="number" placeholder="98" className="w-full bg-slate-800 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-teal-500/50" />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    <div className="pt-2 flex gap-3">
                        <button type="button" onClick={() => setIsOpen(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-white hover:bg-white/5 font-medium transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={isPending} className="flex-1 flex justify-center items-center gap-2 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-bold shadow-lg shadow-teal-500/20 transition-colors disabled:opacity-50">
                            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Vitals"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
