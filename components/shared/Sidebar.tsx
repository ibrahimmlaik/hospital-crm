"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard, Users, Activity, FileText,
    Archive, CreditCard, Settings,
    BedDouble, TestTube2, Pill, Clock, Wallet, Building2, TrendingUp, HeartPulse, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useSidebar } from "@/lib/sidebar-context";
import { useEffect } from "react";

const ROLE_LINKS: Record<string, any[]> = {
    ADMIN: [
        { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { label: "User Management", href: "/admin/users", icon: Users },
        { label: "Patients", href: "/admin/patients", icon: HeartPulse },
        { label: "Departments", href: "/admin/departments", icon: Building2 },
        { label: "Beds", href: "/admin/beds", icon: BedDouble },
        { label: "Labs", href: "/admin/labs", icon: TestTube2 },
        { label: "Pharmacy", href: "/admin/pharmacy", icon: Pill },
        { label: "Attendance", href: "/admin/attendance", icon: Clock },
        { label: "Salary Structure", href: "/admin/salary-structure", icon: Wallet },
        { label: "Payroll", href: "/admin/payroll", icon: CreditCard },
        { label: "Doctor Payments", href: "/admin/doctor-payments", icon: Wallet },
        { label: "Revenue", href: "/admin/revenue", icon: TrendingUp },
        { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
    DOCTOR: [
        { label: "Dashboard", href: "/doctor", icon: LayoutDashboard },
        { label: "My Patients", href: "/doctor/patients", icon: Users },
        { label: "Appointments", href: "/doctor/appointments", icon: Activity },
        { label: "Prescriptions", href: "/doctor/prescriptions/create", icon: Pill },
    ],
    PATIENT: [
        { label: "Dashboard", href: "/patient", icon: LayoutDashboard },
        { label: "My History", href: "/patient/history", icon: FileText },
        { label: "Prescriptions", href: "/patient/prescriptions", icon: Pill },
    ],
    STAFF_NURSE: [
        { label: "Dashboard", href: "/staff", icon: LayoutDashboard },
        { label: "Ward Management", href: "/staff/wards", icon: BedDouble },
        { label: "Vitals", href: "/staff/vitals", icon: Activity },
    ],
    STAFF_RECEPTION: [
        { label: "Dashboard", href: "/staff", icon: LayoutDashboard },
        { label: "Appointments", href: "/staff/appointments", icon: Activity },
        { label: "Registration", href: "/staff/registration", icon: Users },
        { label: "Patient Billing", href: "/staff/billing", icon: FileText },
    ],
    STAFF_LAB: [
        { label: "Dashboard", href: "/staff", icon: LayoutDashboard },
        { label: "Lab Tests", href: "/staff/labs", icon: TestTube2 },
    ],
    STAFF_PHARMACY: [
        { label: "Dashboard", href: "/staff", icon: LayoutDashboard },
        { label: "Inventory", href: "/staff/inventory", icon: Archive },
    ]
};

function SidebarContent({ currentUser, hospitalName, onClose }: {
    currentUser: any;
    hospitalName: string;
    onClose?: () => void;
}) {
    const nameParts = hospitalName.trim().split(/\s+/);
    const titlePart = nameParts[0] || "Nexus";
    const subtitlePart = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "Health CRM";
    const pathname = usePathname();
    const links = ROLE_LINKS[currentUser.role] || [];

    return (
        <div className="flex flex-col h-full">
            {/* Logo Area */}
            <div className="p-5 flex items-center gap-3 border-b border-white/5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-blue-600 flex items-center justify-center shadow-lg shadow-teal-500/20 flex-shrink-0">
                    <Activity className="text-white w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                    <h1 className="text-lg font-bold text-white tracking-tight truncate">{titlePart}</h1>
                    <p className="text-[10px] text-indigo-300 truncate">{subtitlePart}</p>
                </div>
                {/* Close button — mobile only */}
                {onClose && (
                    <button
                        onClick={onClose}
                        className="lg:hidden ml-auto p-1.5 rounded-lg hover:bg-white/10 text-indigo-300 hover:text-white transition-colors flex-shrink-0"
                        aria-label="Close menu"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>

            {/* Navigation - Scrollable */}
            <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
                {links.map((link) => {
                    const isActive = pathname === link.href;
                    const Icon = link.icon;

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={onClose}
                        >
                            <div
                                className={cn(
                                    "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden text-sm",
                                    isActive
                                        ? "bg-gradient-to-r from-teal-500/20 to-blue-500/20 text-teal-300 border border-teal-500/30"
                                        : "text-indigo-200 hover:bg-white/5 hover:text-white"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="active-nav"
                                        className="absolute left-0 top-0 w-1 h-full bg-teal-400 rounded-r-full"
                                    />
                                )}
                                <Icon size={18} className={cn("transition-colors flex-shrink-0", isActive ? "text-teal-400" : "text-indigo-400 group-hover:text-white")} />
                                <span className="font-medium truncate">{link.label}</span>
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile */}
            <div className="p-3 border-t border-white/10 mx-3 mb-3">
                <div className="flex items-center gap-3 px-1">
                    <div className="w-9 h-9 rounded-full border border-teal-500/30 bg-gradient-to-br from-teal-600 to-blue-700 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-bold">
                            {currentUser.name?.charAt(0)?.toUpperCase() ?? "?"}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{currentUser.name}</p>
                        <p className="text-[10px] text-teal-400 font-medium truncate">{currentUser.role.replace(/_/g, ' ')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Sidebar({ currentUser, hospitalName = "Nexus Health CRM" }: {
    currentUser: any;
    hospitalName?: string;
}) {
    const { isOpen, close } = useSidebar();

    // Close drawer on route change
    const pathname = usePathname();
    useEffect(() => {
        close();
    }, [pathname, close]);

    // Prevent body scroll when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    if (!currentUser) return null;

    return (
        <>
            {/* ── DESKTOP: fixed sidebar (lg+) ── */}
            <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-[#0f172a]/95 backdrop-blur-xl border-r border-white/10 flex-col z-50">
                <SidebarContent currentUser={currentUser} hospitalName={hospitalName} />
            </aside>

            {/* ── MOBILE: slide-in drawer (< lg) ── */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            key="backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                            onClick={close}
                        />
                        {/* Drawer panel */}
                        <motion.aside
                            key="drawer"
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="lg:hidden fixed left-0 top-0 h-screen w-72 max-w-[85vw] bg-[#0f172a] border-r border-white/10 flex flex-col z-50 shadow-2xl"
                        >
                            <SidebarContent
                                currentUser={currentUser}
                                hospitalName={hospitalName}
                                onClose={close}
                            />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
