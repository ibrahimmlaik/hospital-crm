"use client";

import React, { createContext, useContext, useState } from "react";

interface AppState {
    state: {
        stats: {
            revenueToday: number;
            todayAppointments: number;
            occupiedBeds: number;
            totalBeds: number;
        };
    };
    sidebarOpen: boolean;
    toggleSidebar: () => void;
}

const defaultStats = {
    revenueToday: 12500,
    todayAppointments: 42,
    occupiedBeds: 18,
    totalBeds: 24,
};

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const toggleSidebar = () => setSidebarOpen((prev) => !prev);

    return (
        <AppContext.Provider
            value={{
                state: { stats: defaultStats },
                sidebarOpen,
                toggleSidebar,
            }}
        >
            {children}
        </AppContext.Provider>
    );
}

export function useAppStore() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error("useAppStore must be used within an AppProvider");
    }
    return context;
}
