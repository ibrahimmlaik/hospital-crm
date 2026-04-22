"use client";

import { useActionState, useState } from "react";
import { registerPatient } from "@/actions/staff";
import { GlassCard } from "@/components/ui/glass-card";
import { User, Phone, MapPin, Calendar, CheckCircle, AlertCircle, Stethoscope, Users } from "lucide-react";

export default function RegistrationClient({ doctors }: { doctors: any[] }) {
    const [state, formAction, isPending] = useActionState(registerPatient, null);
    const [isDoctorFamily, setIsDoctorFamily] = useState(false);

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white">New Patient Registration</h1>
                <p className="text-indigo-200">Enter patient details to generate ID</p>
            </div>

            <GlassCard>
                <form action={formAction} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Personal Info */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-indigo-100 ml-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 text-indigo-400 w-5 h-5" />
                                <input name="name" type="text" required className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-teal-500/50" placeholder="John Doe" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-indigo-100 ml-1">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 text-indigo-400 w-5 h-5" />
                                <input name="phone" type="tel" required className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-teal-500/50" placeholder="+1 234 567 890" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-indigo-100 ml-1">Date of Birth</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3 text-indigo-400 w-5 h-5" />
                                <input name="dob" type="date" required className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-teal-500/50" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-indigo-100 ml-1">Gender</label>
                            <select name="gender" className="w-full bg-[#0f172a]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500/50 appearance-none">
                                <option>Male</option>
                                <option>Female</option>
                                <option>Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-indigo-100 ml-1">Address</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 text-indigo-400 w-5 h-5" />
                            <textarea name="address" className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-teal-500/50 h-24" placeholder="123 Main St, City..." />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/10">
                        <div className="flex items-center gap-3 mb-4">
                            <input
                                type="checkbox"
                                id="isDoctorFamily"
                                checked={isDoctorFamily}
                                onChange={(e) => setIsDoctorFamily(e.target.checked)}
                                className="w-5 h-5 rounded border-white/10 bg-white/5 text-teal-500 focus:ring-teal-500 focus:ring-offset-[#0f172a]"
                            />
                            <label htmlFor="isDoctorFamily" className="text-sm font-medium text-indigo-100">
                                This patient is a Doctor or a Doctor's Family Member
                            </label>
                        </div>

                        {isDoctorFamily && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-white/5 rounded-xl border border-white/10">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-indigo-100 ml-1">Select Doctor</label>
                                    <div className="relative">
                                        <Stethoscope className="absolute left-3 top-3 text-indigo-400 w-5 h-5 pointer-events-none" />
                                        <select name="relatedDoctorId" className="w-full bg-[#0f172a]/80 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-teal-500/50 appearance-none">
                                            <option value="">Select a doctor...</option>
                                            {doctors.map(doc => (
                                                <option key={doc.id} value={doc.id}>
                                                    Dr. {doc.user?.name} {doc.licenseNumber ? `(${doc.licenseNumber})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-indigo-100 ml-1">Family Title / Relation (Optional)</label>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-3 text-indigo-400 w-5 h-5" />
                                        <input name="familyMemberName" type="text" className="w-full bg-[#0f172a]/80 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-teal-500/50" placeholder="e.g. Spouse, Son, Mother" />
                                    </div>
                                    <p className="text-xs text-indigo-300 ml-1">Leave blank if the patient is the doctor themselves.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {state?.error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-200 rounded-xl flex items-center gap-2 text-sm">
                            <AlertCircle size={16} /> {state.error}
                        </div>
                    )}
                    {state?.success && (
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 rounded-xl flex items-center gap-2 text-sm">
                            <CheckCircle size={16} /> {state.message}
                        </div>
                    )}

                    <div className="pt-4 flex gap-4">
                        <button type="button" onClick={() => window.history.back()} className="flex-1 py-3 rounded-xl border border-white/10 text-white hover:bg-white/5 font-medium transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={isPending} className="flex-1 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-bold shadow-lg shadow-teal-500/20 transition-colors disabled:opacity-50">
                            {isPending ? "Registering..." : "Register Patient"}
                        </button>
                    </div>
                </form>
            </GlassCard>
        </div>
    );
}
