import { getDoctorAppointments } from "@/actions/doctor-appointments";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import {
    CalendarDays,
    Clock,
    Phone,
    User,
    CheckCircle,
    FileText,
    AlertCircle,
    Stethoscope,
    Building2
} from "lucide-react";
import { AppointmentActions } from "./AppointmentActions";

export default async function DoctorAppointmentsDashboard() {
    const currentDate = new Date();
    const formattedToday = format(currentDate, "EEEE, MMMM do, yyyy");

    try {
        const currentUser = await getCurrentUser();

        if (!currentUser || currentUser.role !== "DOCTOR") {
            return (
                <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center">
                    <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
                    <h2 className="text-xl font-semibold text-gray-800">Unauthorized Access</h2>
                    <p className="mt-2 text-sm text-gray-500">
                        You must be logged in as a Doctor to view this dashboard.
                    </p>
                </div>
            );
        }

        // Fetch the real Doctor Profile from the updated Prisma Schema
        const doctorProfile = await prisma.doctor.findUnique({
            where: { userId: currentUser.userId },
            include: {
                departments: {
                    include: { department: true }
                }
            }
        });

        if (!doctorProfile) {
            return (
                <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center">
                    <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
                    <h2 className="text-xl font-semibold text-gray-800">Doctor Profile Not Found</h2>
                    <p className="mt-2 text-sm text-gray-500">
                        Could not locate your doctor record. Please contact administration.
                    </p>
                </div>
            );
        }

        // Use the existing Server Action to get appointments!
        const allAppointments = await getDoctorAppointments();

        // Filter out completed ones to only show today's active schedule
        const activeAppointments = allAppointments.filter(app => app.status === "SCHEDULED");

        const primaryDept = doctorProfile.departments.find(d => d.isPrimary)?.department?.name ||
            doctorProfile.departments[0]?.department?.name || "General Practice";

        return (
            <div className="min-h-screen p-6 md:p-8">
                <div className="mx-auto max-w-7xl">
                    {/* Header Section */}
                    <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 dark:bg-slate-900 dark:ring-white/10">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                            My Schedule - {formattedToday}
                        </h1>

                        {/* Staff Badges (Adjusted to real schema) */}
                        <div className="mt-5 flex flex-wrap items-center gap-3">
                            <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/30">
                                <Stethoscope className="mr-1.5 h-4 w-4" />
                                {doctorProfile.qualification || "MD"}
                            </span>

                            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-inset ring-slate-500/20 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700">
                                <Building2 className="mr-1.5 h-4 w-4" />
                                Dept: {primaryDept}
                            </span>

                            <span className="inline-flex items-center rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/30 shadow-sm dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/30">
                                <CheckCircle className="mr-1.5 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                Lic: {doctorProfile.licenseNumber || "N/A"}
                            </span>
                        </div>
                    </div>

                    {/* Body Section / Empty State */}
                    {activeAppointments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 dark:border-slate-800 bg-white dark:bg-slate-900/50 py-16 text-center">
                            <div className="rounded-full bg-gray-50 dark:bg-slate-800 p-4">
                                <CalendarDays className="h-10 w-10 text-gray-400 dark:text-slate-500" />
                            </div>
                            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                                No scheduled appointments left for today
                            </h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                                You're all caught up. Take a break or catch up on patient files.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {activeAppointments.map((appointment) => {
                                const apptDate = new Date(appointment.date);

                                return (
                                    <div
                                        key={appointment.id}
                                        className="flex flex-col justify-between rounded-xl bg-white dark:bg-slate-900 p-6 shadow-md transition-shadow hover:shadow-lg ring-1 ring-gray-100 dark:ring-white/10"
                                    >
                                        {/* Card Top Row: Time */}
                                        <div className="mb-4 flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-4">
                                            <div className="flex items-center text-blue-600 dark:text-blue-400">
                                                <Clock className="mr-2 h-5 w-5" />
                                                <span className="text-xl font-bold">
                                                    {format(apptDate, "h:mm a")}
                                                </span>
                                            </div>
                                            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold tracking-wide text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 uppercase">
                                                Scheduled
                                            </span>
                                        </div>

                                        {/* Card Body: Patient Info */}
                                        <div className="flex-grow">
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white capitalize">
                                                {appointment.patient?.name}
                                            </h3>

                                            <div className="mt-4 space-y-3">
                                                <div className="flex items-center text-sm font-medium text-gray-700 dark:text-slate-300">
                                                    <Phone className="mr-2.5 h-4 w-4 text-gray-400 dark:text-slate-500" />
                                                    {appointment.patient?.phone || "No phone provided"}
                                                </div>

                                                <div className="flex items-start text-sm text-gray-500 dark:text-slate-400">
                                                    <FileText className="mr-2.5 mt-0.5 h-4 w-4 shrink-0 text-gray-400 dark:text-slate-500" />
                                                    <span className="italic line-clamp-3">
                                                        {appointment.reason || "No specific reason provided for this visit."}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Hook up the actual working Server Actions Client Component */}
                                        <AppointmentActions appointmentId={appointment.id} patientId={appointment.patient?.id} />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        );
    } catch (error) {
        console.error("Failed to load doctor appointments:", error);

        return (
            <div className="min-h-screen p-6 md:p-8">
                <div className="mx-auto max-w-7xl">
                    <div className="flex flex-col items-center justify-center rounded-2xl bg-white dark:bg-slate-900 p-12 shadow-sm ring-1 ring-red-100 dark:ring-red-900/30">
                        <div className="rounded-full bg-red-50 dark:bg-red-500/10 p-3 mb-4">
                            <AlertCircle className="h-10 w-10 text-red-500 dark:text-red-400" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Unable to Load Appointments
                        </h2>
                        <p className="mt-2 max-w-md text-center text-sm text-gray-500 dark:text-slate-400">
                            We encountered an error while trying to fetch the schedule from the database.
                        </p>
                    </div>
                </div>
            </div>
        );
    }
}
