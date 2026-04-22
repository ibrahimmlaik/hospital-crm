"use client";

import { useEffect, useState, useActionState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Calendar, Plus, User, Clock } from "lucide-react";
import { createAppointment, getAllDoctors, getStaffAppointments } from "@/actions/staff-appointments";
import { getAllPatients } from "@/actions/staff-vitals";
import { motion } from "framer-motion";

export default function StaffAppointmentsPage() {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [patients, setPatients] = useState<any[]>([]);
    const [doctors, setDoctors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [state, formAction, isPending] = useActionState(createAppointment, null);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (state?.success) {
            loadData();
            setShowCreateForm(false);
        }
    }, [state]);

    const loadData = async () => {
        try {
            const [appointmentsData, patientsData, doctorsData] = await Promise.all([
                getStaffAppointments(),
                getAllPatients(),
                getAllDoctors()
            ]);
            setAppointments(appointmentsData);
            setPatients(patientsData);
            setDoctors(doctorsData);
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Appointments</h1>
                    <p className="text-indigo-200">Schedule and manage patient appointments</p>
                </div>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-white rounded-lg font-bold transition-colors"
                >
                    <Plus size={18} />
                    Book Appointment
                </button>
            </div>

            {/* Create Appointment Form */}
            {showCreateForm && (
                <GlassCard>
                    <h2 className="text-xl font-bold text-white mb-6">Book New Appointment</h2>
                    <form action={formAction} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-indigo-300 mb-2 block">Patient</label>
                                <select
                                    name="patientId"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500/50"
                                >
                                    <option value="">Select patient...</option>
                                    {patients.map(patient => (
                                        <option key={patient.id} value={patient.id} className="bg-[#0f172a]">
                                            {patient.name} - {patient.phone}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-indigo-300 mb-2 block">Doctor</label>
                                <select
                                    name="doctorId"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500/50"
                                >
                                    <option value="">Select doctor...</option>
                                    {doctors.map(doctor => (
                                        <option key={doctor.id} value={doctor.id} className="bg-[#0f172a]">
                                            Dr. {doctor.user.name} - {doctor.specialization}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-indigo-300 mb-2 block">Date</label>
                                <input
                                    type="date"
                                    name="date"
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500/50"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-indigo-300 mb-2 block">Time</label>
                                <input
                                    type="time"
                                    name="time"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500/50"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-indigo-300 mb-2 block">Service</label>
                            <select
                                name="service"
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500/50"
                            >
                                <option value="">Select service...</option>

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

                        <div>
                            <label className="text-sm font-medium text-indigo-300 mb-2 block">Reason (Optional)</label>
                            <textarea
                                name="reason"
                                rows={3}
                                placeholder="Reason for visit..."
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500/50"
                            />
                        </div>

                        {state?.error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-200 rounded-lg text-sm">
                                {state.error}
                            </div>
                        )}
                        {state?.success && (
                            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 rounded-lg text-sm">
                                {state.message}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowCreateForm(false)}
                                className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isPending}
                                className="flex-1 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-white rounded-lg font-bold transition-colors disabled:opacity-50"
                            >
                                {isPending ? "Booking..." : "Book Appointment"}
                            </button>
                        </div>
                    </form>
                </GlassCard>
            )}

            {/* Appointments List */}
            <GlassCard>
                <h2 className="text-xl font-bold text-white mb-4">Recent Appointments</h2>
                {loading ? (
                    <div className="text-center py-8 text-indigo-300">Loading...</div>
                ) : appointments.length === 0 ? (
                    <div className="text-center py-8 text-indigo-300">No appointments found</div>
                ) : (
                    <div className="space-y-3">
                        {appointments.map((appointment, index) => (
                            <motion.div
                                key={appointment.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.02 }}
                                className="p-4 bg-white/5 rounded-xl border border-white/10"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex gap-3 flex-1">
                                        <div className="p-2 bg-teal-500/20 rounded-lg">
                                            <User className="text-teal-300" size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-white">{appointment.patient.name}</h3>
                                            <p className="text-sm text-indigo-300">
                                                Dr. {appointment.doctor.user.name}
                                            </p>
                                            <div className="flex items-center gap-2 mt-2 text-xs text-indigo-400">
                                                <Calendar size={14} />
                                                {new Date(appointment.date).toLocaleDateString()}
                                                <Clock size={14} className="ml-2" />
                                                {new Date(appointment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            {appointment.reason && (
                                                <p className="text-sm text-indigo-200 mt-2 bg-white/5 p-2 rounded">
                                                    {appointment.reason}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${appointment.status === "SCHEDULED" ? "bg-blue-500/20 text-blue-300" :
                                        appointment.status === "COMPLETED" ? "bg-emerald-500/20 text-emerald-300" :
                                            "bg-red-500/20 text-red-300"
                                        }`}>
                                        {appointment.status}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </GlassCard>
        </div>
    );
}
