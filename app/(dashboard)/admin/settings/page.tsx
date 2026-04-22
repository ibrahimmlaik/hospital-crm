"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { SecuritySettings } from "./components/security-settings";
import { SystemPreferences } from "./components/system-preferences";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("General");
    const [userId, setUserId] = useState("");
    const [userSettings, setUserSettings] = useState({ twoFactorEnabled: false, passwordExpiry: false });
    const [hospitalName, setHospitalName] = useState("Nexus Health CRM");

    useEffect(() => {
        // Fetch user settings on mount
        fetch('/api/user/settings')
            .then(res => res.json())
            .then(data => {
                if (data.userId) {
                    setUserId(data.userId);
                    setUserSettings(data.userSettings);
                }
                if (data.hospitalName) {
                    setHospitalName(data.hospitalName);
                }
            })
            .catch(err => console.error("Error loading settings:", err));
    }, []);

    const tabs = ['General', 'Security', 'Notifications', 'Appearance'];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white">Settings</h1>
                <p className="text-indigo-200">Manage system preferences and configuration</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Sidebar Navigation */}
                <GlassCard className="h-fit space-y-2">
                    {tabs.map((item) => (
                        <button
                            key={item}
                            onClick={() => setActiveTab(item)}
                            className={`w-full text-left px-4 py-2 rounded-lg transition-colors font-medium ${activeTab === item
                                ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                                : "text-indigo-200 hover:bg-white/5 hover:text-white"
                                }`}
                        >
                            {item}
                        </button>
                    ))}
                </GlassCard>

                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    {activeTab === "General" && (
                        <GlassCard>
                            <h2 className="text-xl font-bold text-white mb-4">General Settings</h2>
                            <SystemPreferences initialHospitalName={hospitalName} />
                        </GlassCard>
                    )}

                    {activeTab === "Security" && (
                        <>
                            {userId ? (
                                <SecuritySettings userId={userId} initialData={userSettings} />
                            ) : (
                                <GlassCard>
                                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded text-red-200">
                                        You must be logged in to view security settings.
                                    </div>
                                </GlassCard>
                            )}
                        </>
                    )}

                    {activeTab === "Notifications" && (
                        <GlassCard>
                            <h2 className="text-xl font-bold text-white mb-4">Notification Preferences</h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                                    <div>
                                        <h3 className="font-medium text-white">Email Notifications</h3>
                                        <p className="text-sm text-indigo-300">Receive updates via email</p>
                                    </div>
                                    <input type="checkbox" className="w-5 h-5" defaultChecked />
                                </div>
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                                    <div>
                                        <h3 className="font-medium text-white">Appointment Reminders</h3>
                                        <p className="text-sm text-indigo-300">Get notified about upcoming appointments</p>
                                    </div>
                                    <input type="checkbox" className="w-5 h-5" defaultChecked />
                                </div>
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                                    <div>
                                        <h3 className="font-medium text-white">Lab Results</h3>
                                        <p className="text-sm text-indigo-300">Alerts when lab results are ready</p>
                                    </div>
                                    <input type="checkbox" className="w-5 h-5" defaultChecked />
                                </div>
                            </div>
                        </GlassCard>
                    )}

                    {activeTab === "Appearance" && (
                        <GlassCard>
                            <h2 className="text-xl font-bold text-white mb-4">Appearance Settings</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-indigo-300 mb-2 block">Theme</label>
                                    <select className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white">
                                        <option value="dark">Dark</option>
                                        <option value="light">Light</option>
                                        <option value="auto">Auto</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-indigo-300 mb-2 block">Accent Color</label>
                                    <div className="flex gap-3">
                                        {['teal', 'blue', 'purple', 'pink'].map(color => (
                                            <button
                                                key={color}
                                                className={`w-12 h-12 rounded-lg bg-${color}-500 hover:ring-2 ring-white/50 transition-all`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    )}
                </div>
            </div>
        </div>
    );
}
