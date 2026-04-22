"use client";

import AdminFilterWrapper from "@/components/admin/AdminFilterWrapper";

const ROLE_FILTERS = [
    { value: "ADMIN", label: "Admin" },
    { value: "DOCTOR", label: "Doctor" },
    { value: "STAFF_NURSE", label: "Staff (Nurse)" },
    { value: "STAFF_RECEPTION", label: "Staff (Reception)" },
    { value: "STAFF_LAB", label: "Staff (Lab)" },
    { value: "STAFF_PHARMACY", label: "Staff (Pharmacy)" },
];

const STATUS_FILTERS = [
    { value: "PRESENT", label: "Present" },
    { value: "LATE", label: "Late" },
    { value: "ABSENT", label: "Absent" },
];

export default function AttendanceTableClient({ attendance }: { attendance: any[] }) {
    return (
        <AdminFilterWrapper
            data={attendance}
            searchKeys={["user.name", "user.role"]}
            searchPlaceholder="Search by employee name or role..."
            filters={[
                { label: "All Roles", key: "user.role", options: ROLE_FILTERS },
                { label: "All Statuses", key: "status", options: STATUS_FILTERS },
            ]}
        >
            {(filteredData) => (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 text-indigo-200 text-sm uppercase tracking-wider">
                                <th className="p-5 font-medium">Employee</th>
                                <th className="p-5 font-medium">Role</th>
                                <th className="p-5 font-medium">Date</th>
                                <th className="p-5 font-medium">Clock In</th>
                                <th className="p-5 font-medium">Clock Out</th>
                                <th className="p-5 font-medium">Hours</th>
                                <th className="p-5 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-12 text-center text-indigo-300">
                                        No attendance records match your filters
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((record: any) => (
                                    <tr key={record.id} className="hover:bg-white/5 transition-colors text-slate-300">
                                        <td className="p-5 font-medium text-white">{record.user.name}</td>
                                        <td className="p-5">
                                            <span className="px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded text-xs font-medium">
                                                {record.user.role}
                                            </span>
                                        </td>
                                        <td className="p-5">{new Date(record.date).toLocaleDateString()}</td>
                                        <td className="p-5">{new Date(record.clockIn).toLocaleTimeString()}</td>
                                        <td className="p-5">
                                            {record.clockOut ? new Date(record.clockOut).toLocaleTimeString() : "-"}
                                        </td>
                                        <td className="p-5 font-bold text-teal-300">
                                            {record.totalHours ? `${record.totalHours} hrs` : "-"}
                                        </td>
                                        <td className="p-5">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${record.status === "PRESENT" ? "bg-emerald-500/20 text-emerald-300" :
                                                record.status === "LATE" ? "bg-yellow-500/20 text-yellow-300" :
                                                    "bg-red-500/20 text-red-300"
                                                }`}>
                                                {record.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </AdminFilterWrapper>
    );
}
