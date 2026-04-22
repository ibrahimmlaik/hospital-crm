"use client";

import { useState } from "react";
import { updateSystemSettings } from "@/actions/settings";
import { Globe, Save, Loader2, AlertTriangle, X, ShieldAlert } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { useRouter } from "next/navigation";

interface SystemPreferencesProps {
    initialHospitalName: string;
}

export function SystemPreferences({ initialHospitalName }: SystemPreferencesProps) {
    const router = useRouter();
    const [hospitalName, setHospitalName] = useState(initialHospitalName);
    const [saving, setSaving] = useState(false);
    const [confirmStep, setConfirmStep] = useState(0); // 0 = none, 1 = first confirm, 2 = second confirm
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const hasChanges = hospitalName.trim() !== initialHospitalName;

    const handleSaveClick = () => {
        if (!hospitalName.trim()) {
            setErrorMessage("Hospital name cannot be empty");
            return;
        }
        if (!hasChanges) {
            setErrorMessage("No changes to save");
            return;
        }
        setErrorMessage("");
        setSuccessMessage("");
        setConfirmStep(1); // Show first confirmation
    };

    const handleFirstConfirm = () => {
        setConfirmStep(2); // Show second confirmation
    };

    const handleSecondConfirm = async () => {
        setConfirmStep(0);
        setSaving(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            await updateSystemSettings({ hospitalName: hospitalName.trim() });
            setSuccessMessage(`Hospital name changed to "${hospitalName.trim()}" successfully!`);
            router.refresh(); // This refreshes the server components (sidebar)
        } catch (error) {
            console.error(error);
            setErrorMessage("Failed to update settings. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setConfirmStep(0);
    };

    return (
        <>
            <GlassCard>
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Globe size={20} className="text-blue-400" /> System Preferences
                </h2>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-indigo-300">Hospital Name</label>
                        <input
                            value={hospitalName}
                            onChange={(e) => {
                                setHospitalName(e.target.value);
                                setSuccessMessage("");
                                setErrorMessage("");
                            }}
                            className="w-full bg-[#0f172a]/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500/50 transition-all"
                        />
                        {hasChanges && (
                            <div className="flex items-center gap-2 text-xs">
                                <span className="text-indigo-400">Current:</span>
                                <span className="text-indigo-300 font-medium">{initialHospitalName}</span>
                                <span className="text-indigo-400">→</span>
                                <span className="text-teal-300 font-medium">{hospitalName.trim()}</span>
                            </div>
                        )}
                    </div>

                    {successMessage && (
                        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-center gap-2">
                            <span>✓</span>
                            {successMessage}
                        </div>
                    )}

                    {errorMessage && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-center gap-2">
                            <AlertTriangle size={14} />
                            {errorMessage}
                        </div>
                    )}

                    <div className="flex justify-end mt-4">
                        <button
                            onClick={handleSaveClick}
                            disabled={saving || !hasChanges}
                            className="bg-blue-500 hover:bg-blue-400 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </GlassCard>

            {/* FIRST CONFIRMATION MODAL */}
            {confirmStep === 1 && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCancel} />
                    <div className="relative bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200">
                        <button onClick={handleCancel} className="absolute top-4 right-4 text-indigo-300 hover:text-white transition-colors">
                            <X size={20} />
                        </button>

                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle size={32} className="text-amber-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Confirm Name Change</h3>
                            <p className="text-indigo-300 text-sm mb-4">
                                You are about to change the hospital name. This will be reflected across the entire system.
                            </p>

                            <div className="bg-white/5 rounded-lg p-4 mb-6 text-left">
                                <div className="flex items-center gap-2 text-sm mb-2">
                                    <span className="text-indigo-400">From:</span>
                                    <span className="text-red-300 font-medium line-through">{initialHospitalName}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-indigo-400">To:</span>
                                    <span className="text-emerald-300 font-bold">{hospitalName.trim()}</span>
                                </div>
                            </div>

                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={handleCancel}
                                    className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-indigo-200 hover:text-white font-medium transition-all border border-white/10"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleFirstConfirm}
                                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold shadow-lg shadow-amber-500/20 transition-all"
                                >
                                    Yes, Continue
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* SECOND (FINAL) CONFIRMATION MODAL */}
            {confirmStep === 2 && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCancel} />
                    <div className="relative bg-[#1e293b] border border-red-500/20 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200">
                        <button onClick={handleCancel} className="absolute top-4 right-4 text-indigo-300 hover:text-white transition-colors">
                            <X size={20} />
                        </button>

                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                                <ShieldAlert size={32} className="text-red-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Final Confirmation</h3>
                            <p className="text-indigo-300 text-sm mb-2">
                                Are you <span className="text-white font-bold">absolutely sure</span> you want to rename the hospital?
                            </p>
                            <p className="text-red-300/80 text-xs mb-4">
                                This change will take effect immediately across all pages, the sidebar, and for all users.
                            </p>

                            <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-4 mb-6">
                                <p className="text-sm text-indigo-300">New hospital name:</p>
                                <p className="text-lg font-bold text-white mt-1">{hospitalName.trim()}</p>
                            </div>

                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={handleCancel}
                                    className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-indigo-200 hover:text-white font-medium transition-all border border-white/10"
                                >
                                    Go Back
                                </button>
                                <button
                                    onClick={handleSecondConfirm}
                                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold shadow-lg shadow-red-500/20 transition-all"
                                >
                                    Confirm & Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
