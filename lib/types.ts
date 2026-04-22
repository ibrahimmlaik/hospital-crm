export type Role = 'ADMIN' | 'DOCTOR' | 'PATIENT' | 'STAFF_NURSE' | 'STAFF_RECEPTION' | 'STAFF_LAB' | 'STAFF_PHARMACY';

export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    avatar?: string;
    specialization?: string; // For doctors
}

export interface Patient {
    id: string;
    name: string;
    email?: string;
    phone: string;
    dob: string;
    gender: 'Male' | 'Female' | 'Other';
    bloodGroup?: string;
    address?: string;
    allergies?: string[];
    chronicConditions?: string[];
    lastVisit?: string;
    insuranceProvider?: string;
    insurancePolicyNumber?: string;
}

export interface Appointment {
    id: string;
    patientId: string;
    patientName: string; // denormalized for easier display
    doctorId: string;
    doctorName: string;
    date: string; // ISO Date
    time: string;
    type: 'Checkup' | 'Follow-up' | 'Emergency' | 'Lab Test';
    status: 'Scheduled' | 'Completed' | 'Cancelled' | 'In-Progress';
    notes?: string;
}

export interface Prescription {
    id: string;
    appointmentId: string;
    patientId: string;
    doctorId: string;
    date: string;
    medications: Medication[];
    notes?: string;
    status: 'Pending' | 'Dispensed';
}

export interface Medication {
    name: string;
    dosage: string;
    frequency: string; // e.g., "1-0-1"
    duration: string; // e.g., "5 days"
    instructions?: string; // e.g., "After food"
}

export interface Bill {
    id: string;
    patientId: string;
    patientName: string;
    date: string;
    items: BillItem[];
    totalAmount: number;
    paidAmount: number;
    status: 'Unpaid' | 'Partial' | 'Paid';
    paymentMethod?: 'Cash' | 'Card' | 'Insurance';
}

export interface BillItem {
    description: string;
    amount: number;
}

export interface LabTest {
    id: string;
    patientId: string;
    patientName: string;
    doctorId: string;
    testName: string;
    date: string;
    status: 'Pending' | 'In-Progress' | 'Completed';
    resultUrl?: string; // Mock URL for PDF/Image
    notes?: string;
}

export interface Notification {
    id: string;
    userId: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    read: boolean;
    timestamp: string;
}
