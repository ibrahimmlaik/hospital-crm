"use client";

import BookAppointmentForm from "@/components/patient/BookAppointmentForm";

export default function PatientAppointmentsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white">Book Appointment</h1>
                <p className="text-indigo-200">Schedule a consultation with our doctors</p>
            </div>

            <BookAppointmentForm />
        </div>
    );
}
