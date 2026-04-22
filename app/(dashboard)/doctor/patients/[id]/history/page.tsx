import { getPatientDetailsForDoctor } from "@/actions/patients";
import { GlassCard } from "@/components/ui/glass-card";
import { ArrowLeft, FileText, Calendar, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default async function PatientHistoryPage({ params }: { params: Promise<{ id: string }> }) {
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
                        <h1 className="text-3xl font-bold text-white">Medical History</h1>
                    </div>
                </div>
                <GlassCard className="text-center py-12">
                    <AlertTriangle className="mx-auto text-red-500 mb-4 h-12 w-12 opacity-50" />
                    <h3 className="text-xl font-bold text-white">Patient Not Found</h3>
                    <p className="text-indigo-300 mt-2">The requested patient records could not be loaded.</p>
                </GlassCard>
            </div>
        );
    }

    // Combine appointments, prescriptions, and lab tests into a single historical timeline
    const timelineEvents = [
        ...patientDetails.appointments.map(a => ({
            date: new Date(a.date),
            type: "Appointment",
            title: `Visit with Dr. ${a.doctor?.user?.name || "Unknown"}`,
            desc: a.reason || "General visit",
            status: a.status
        })),
        ...patientDetails.prescriptions.map(p => ({
            date: new Date(p.createdAt),
            type: "Prescription",
            title: "Prescription Issued",
            desc: p.notes ? p.notes : "Medication prescribed.",
            status: "ISSUED"
        })),
        ...patientDetails.labTests.map(l => ({
            date: new Date(l.date),
            type: "Lab Test",
            title: `Lab: ${l.testName}`,
            desc: l.resultUrl ? `Result Document: ${l.resultUrl}` : "Awaiting results",
            status: l.status
        }))
    ].sort((a, b) => b.date.getTime() - a.date.getTime()); // Descending order

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/doctor/patients" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-indigo-300 hover:text-white">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-white">Medical History</h1>
                    <p className="text-indigo-200">{patientDetails.name}</p>
                </div>
            </div>

            <GlassCard>
                <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300">
                    <FileText size={24} />
                    <div>
                        <h3 className="font-bold">Patient Records</h3>
                        <p className="text-xs opacity-70">Comprehensive medical timeline</p>
                    </div>
                </div>

                {timelineEvents.length === 0 ? (
                    <div className="text-center py-8 text-indigo-300">
                        <p>No historical medical records found for this patient.</p>
                    </div>
                ) : (
                    <div className="space-y-6 border-l-2 border-white/10 ml-4 pl-8 relative">
                        {timelineEvents.map((event, i) => (
                            <div key={i} className="relative">
                                <div className={`absolute -left-[41px] top-0 w-5 h-5 rounded-full border-2 flex items-center justify-center bg-slate-800 ${event.type === 'Appointment' ? 'border-teal-500' :
                                    event.type === 'Prescription' ? 'border-indigo-500' : 'border-blue-500'
                                    }`}>
                                    <div className={`w-2 h-2 rounded-full ${event.type === 'Appointment' ? 'bg-teal-500' :
                                        event.type === 'Prescription' ? 'bg-indigo-500' : 'bg-blue-500'
                                        }`}></div>
                                </div>
                                <span className="text-xs text-indigo-400 font-mono mb-1 flex items-center gap-2">
                                    <Calendar size={12} /> {format(event.date, "MMM dd, yyyy")}
                                    <span className="ml-2 px-2 py-0.5 rounded-full bg-white/5 text-[10px] uppercase border border-white/10">
                                        {event.type}
                                    </span>
                                </span>
                                <h4 className="text-white font-bold text-lg">{event.title}</h4>
                                <p className="text-slate-400 text-sm mt-1">{event.desc}</p>
                            </div>
                        ))}
                    </div>
                )}
            </GlassCard>
        </div>
    );
}
