"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { getSpecializations, getDoctorsBySpecialization, bookAppointment } from "@/actions/appointments";
import { Calendar, Clock, Stethoscope, User, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BookAppointmentForm() {
    const [specializations, setSpecializations] = useState<string[]>([]);
    const [doctors, setDoctors] = useState<any[]>([]);
    const [selectedSpec, setSelectedSpec] = useState("");
    const [selectedDoctor, setSelectedDoctor] = useState("");
    const [date, setDate] = useState("");
    const [timeSlot, setTimeSlot] = useState("");
    const [loading, setLoading] = useState(false);
    const [bookingStatus, setBookingStatus] = useState<{ success: boolean; message?: string; error?: string } | null>(null);
    const router = useRouter();

    useEffect(() => {
        getSpecializations().then(setSpecializations);
    }, []);

    useEffect(() => {
        if (selectedSpec) {
            getDoctorsBySpecialization(selectedSpec).then(setDoctors);
            setSelectedDoctor("");
        } else {
            setDoctors([]);
        }
    }, [selectedSpec]);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setBookingStatus(null);

        const result = await bookAppointment(formData);

        setBookingStatus(result);
        setLoading(false);

        if (result.success) {
            setTimeout(() => {
                router.push("/patient/appointments");
                router.refresh();
            }, 2000);
        }
    }

    // Generate mock time slots (real implementation would define these in DB or constant)
    const timeSlots = [
        "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
        "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
    ];

    return (
        <GlassCard className="max-w-3xl mx-auto p-8">
            <h2 className="text-2xl font-bold text-white mb-2">Book an Appointment</h2>
            <p className="text-indigo-200 mb-8">Schedule a consultation with our specialists.</p>

            {bookingStatus && (
                <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${bookingStatus.success ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
                    {bookingStatus.success ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <p>{bookingStatus.message || bookingStatus.error}</p>
                </div>
            )}

            <form action={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Specialization */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-indigo-300 flex items-center gap-2">
                            <Stethoscope size={16} /> Department
                        </label>
                        <select
                            value={selectedSpec}
                            onChange={(e) => setSelectedSpec(e.target.value)}
                            className="w-full bg-[#0f172a]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500/50 transition-colors"
                            required
                        >
                            <option value="">Select Department</option>
                            {specializations.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                    {/* Doctor */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-indigo-300 flex items-center gap-2">
                            <User size={16} /> Doctor
                        </label>
                        <select
                            name="doctorId"
                            value={selectedDoctor}
                            onChange={(e) => setSelectedDoctor(e.target.value)}
                            className="w-full bg-[#0f172a]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500/50 transition-colors disabled:opacity-50"
                            disabled={!selectedSpec}
                            required
                        >
                            <option value="">Select Doctor</option>
                            {doctors.map(doc => (
                                <option key={doc.id} value={doc.id}>Dr. {doc.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Date */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-indigo-300 flex items-center gap-2">
                            <Calendar size={16} /> Preferred Date
                        </label>
                        <input
                            type="date"
                            name="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full bg-[#0f172a]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500/50 transition-colors calendar-picker-indicator-white"
                            required
                        />
                    </div>

                    {/* Time Slot */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-indigo-300 flex items-center gap-2">
                            <Clock size={16} /> Time Slot
                        </label>
                        <select
                            name="timeSlot"
                            value={timeSlot}
                            onChange={(e) => setTimeSlot(e.target.value)}
                            className="w-full bg-[#0f172a]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500/50 transition-colors"
                            required
                        >
                            <option value="">Select Time</option>
                            {timeSlots.map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Service */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-indigo-300 flex items-center gap-2">
                        <Stethoscope size={16} /> Service Required
                    </label>
                    <select
                        name="service"
                        className="w-full bg-[#0f172a]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500/50 transition-colors"
                        required
                    >
                        <option value="">Select Service</option>
                        <optgroup label="Core Clinical Services">
                            <option value="Emergency Department (Casualty)">Emergency Department (Casualty)</option>
                            <option value="Inpatient Services (IPD)">Inpatient Services (IPD)</option>
                            <option value="Outpatient Services (OPD)">Outpatient Services (OPD)</option>
                            <option value="General Consultation">General Consultation</option>
                            <option value="Surgical Services">Surgical Services</option>
                            <option value="Intensive Care Unit (ICU)">Intensive Care Unit (ICU)</option>
                            <option value="Maternity & Gynecology">Maternity &amp; Gynecology</option>
                            <option value="Pediatrics & Child Health">Pediatrics &amp; Child Health</option>
                        </optgroup>
                        <optgroup label="Specialized Medical Services">
                            <option value="Cardiology & Cardiac Surgery">Cardiology &amp; Cardiac Surgery</option>
                            <option value="Oncology (Cancer Treatment)">Oncology (Cancer Treatment)</option>
                            <option value="Neurology & Neurosurgery">Neurology &amp; Neurosurgery</option>
                            <option value="Orthopedics (Bone & Joint)">Orthopedics (Bone &amp; Joint)</option>
                            <option value="Psychiatry & Mental Health">Psychiatry &amp; Mental Health</option>
                            <option value="Gastroenterology">Gastroenterology</option>
                            <option value="Dermatology">Dermatology</option>
                            <option value="ENT (Ear, Nose, Throat)">ENT (Ear, Nose, Throat)</option>
                            <option value="Ophthalmology (Eye Care)">Ophthalmology (Eye Care)</option>
                            <option value="Urology">Urology</option>
                            <option value="Nephrology (Kidney)">Nephrology (Kidney)</option>
                            <option value="Pulmonology (Lungs)">Pulmonology (Lungs)</option>
                            <option value="Endocrinology (Diabetes/Hormones)">Endocrinology (Diabetes/Hormones)</option>
                        </optgroup>
                        <optgroup label="Diagnostic & Supportive Services">
                            <option value="X-Ray">X-Ray</option>
                            <option value="MRI Scan">MRI Scan</option>
                            <option value="CT Scan">CT Scan</option>
                            <option value="Ultrasound">Ultrasound</option>
                            <option value="Blood Test (Lab)">Blood Test (Lab)</option>
                            <option value="Pathology & Lab Services">Pathology &amp; Lab Services</option>
                            <option value="Pharmacy Services">Pharmacy Services</option>
                            <option value="Physical Therapy / Rehabilitation">Physical Therapy / Rehabilitation</option>
                            <option value="Nutrition & Dietetics">Nutrition &amp; Dietetics</option>
                            <option value="Dental Services">Dental Services</option>
                        </optgroup>
                    </select>
                </div>

                {/* Reason */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-indigo-300 flex items-center gap-2">
                        <FileText size={16} /> Reason for Visit
                    </label>
                    <textarea
                        name="reason"
                        rows={3}
                        className="w-full bg-[#0f172a]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500/50 transition-colors resize-none"
                        placeholder="Briefly describe your symptoms or reason for consultation..."
                        required
                    />
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Processing Information..." : "Confirm Appointment Request"}
                    </button>
                </div>
            </form>
        </GlassCard>
    );
}
