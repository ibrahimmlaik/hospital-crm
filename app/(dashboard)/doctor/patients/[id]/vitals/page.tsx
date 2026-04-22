import { getPatientDetailsForDoctor } from "@/actions/patients";
import { GlassCard } from "@/components/ui/glass-card";
import { ArrowLeft, Activity, Heart, Thermometer, Wind, AlertTriangle, Info } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import RecordVitalsClient from "./RecordVitalsClient";

export default async function PatientVitalsPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const patientDetails = await getPatientDetailsForDoctor(resolvedParams.id);

    if (!patientDetails) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/doctor/patients" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-indigo-300 hover:text-white">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Vital Signs</h1>
                    </div>
                </div>
                <GlassCard className="text-center py-12">
                    <AlertTriangle className="mx-auto text-red-500 mb-4 h-12 w-12 opacity-50" />
                    <h3 className="text-xl font-bold text-white">Patient Not Found</h3>
                    <p className="text-indigo-300 mt-2">The requested patient vital records could not be loaded.</p>
                </GlassCard>
            </div>
        );
    }

    const vitals = patientDetails.vitals || [];
    const latestVital = vitals.length > 0 ? vitals[0] : null;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/doctor/patients" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-indigo-300 hover:text-white">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Vital Signs</h1>
                        <p className="text-indigo-200">Patient: {patientDetails.name}</p>
                    </div>
                </div>

                <RecordVitalsClient patientId={patientDetails.id} />
            </div>

            {latestVital ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <GlassCard className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-rose-500/20 text-rose-400">
                            <Heart size={24} />
                        </div>
                        <div>
                            <p className="text-xs text-indigo-300">Heart Rate</p>
                            <h3 className="text-2xl font-bold text-white">{latestVital.pulse || "--"} <span className="text-sm font-normal text-slate-400">bpm</span></h3>
                        </div>
                    </GlassCard>
                    <GlassCard className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-amber-500/20 text-amber-400">
                            <Thermometer size={24} />
                        </div>
                        <div>
                            <p className="text-xs text-indigo-300">Body Temp</p>
                            <h3 className="text-2xl font-bold text-white">{latestVital.temperature || "--"} <span className="text-sm font-normal text-slate-400">°{latestVital.temperature ? 'C' : ''}</span></h3>
                        </div>
                    </GlassCard>
                    <GlassCard className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-emerald-500/20 text-emerald-400">
                            <Activity size={24} />
                        </div>
                        <div>
                            <p className="text-xs text-indigo-300">Blood Pressure</p>
                            <h3 className="text-2xl font-bold text-white">{latestVital.bloodPressure || "--/--"}</h3>
                        </div>
                    </GlassCard>
                    <GlassCard className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-indigo-500/20 text-indigo-400">
                            <Info size={24} />
                        </div>
                        <div>
                            <p className="text-xs text-indigo-300">Recorded At</p>
                            <h3 className="text-lg font-bold text-white">{format(new Date(latestVital.recordedAt), "MMM dd, hh:mm a")}</h3>
                        </div>
                    </GlassCard>
                </div>
            ) : (
                <GlassCard className="bg-white/5 border border-white/10 text-center py-12">
                    <p className="text-indigo-300">No recorded vitals available for this patient.</p>
                </GlassCard>
            )}

            <GlassCard>
                <h3 className="font-bold text-white mb-4">Vitals History Timeline</h3>

                {vitals.length === 0 ? (
                    <div className="text-center py-8 text-indigo-300/50">
                        <Activity className="mx-auto mb-4 opacity-50" size={32} />
                        <p>Awaiting patient vital log recordings</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {vitals.map(v => (
                            <div key={v.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 transition-colors hover:bg-white/10">
                                <span className="text-white font-medium mb-2 md:mb-0">
                                    {format(new Date(v.recordedAt), "MMM dd, yyyy • hh:mm a")}
                                </span>
                                <div className="flex gap-4 flex-wrap text-sm">
                                    <span className="bg-rose-500/10 text-rose-300 px-3 py-1 rounded-full flex items-center gap-1"><Heart size={14} /> {v.pulse || "N/A"} bpm</span>
                                    <span className="bg-amber-500/10 text-amber-300 px-3 py-1 rounded-full flex items-center gap-1"><Thermometer size={14} /> {v.temperature || "N/A"} °C</span>
                                    <span className="bg-emerald-500/10 text-emerald-300 px-3 py-1 rounded-full flex items-center gap-1"><Activity size={14} /> {v.bloodPressure || "N/A"} mmHg</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </GlassCard>
        </div>
    );
}
