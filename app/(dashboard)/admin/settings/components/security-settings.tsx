"use client";

import { useState } from "react";
import { updateSecuritySettings } from "@/app/actions/settings";
import { Lock } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";

interface SecuritySettingsProps {
    userId: string;
    initialData: {
        twoFactorEnabled: boolean;
        passwordExpiry: boolean;
    };
}

export function SecuritySettings({ userId, initialData }: SecuritySettingsProps) {
    const [settings, setSettings] = useState(initialData);
    const [loading, setLoading] = useState(false);

    const handleToggle = async (key: keyof typeof settings) => {
        const newValue = !settings[key];
        setSettings(prev => ({ ...prev, [key]: newValue }));
        setLoading(true);

        try {
            await updateSecuritySettings(userId, { [key]: newValue });
        } catch (error) {
            console.error(error);
            // Revert on error
            setSettings(prev => ({ ...prev, [key]: !newValue }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <GlassCard>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Lock size={20} className="text-teal-400" /> Security Settings
            </h2>
            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                    <div>
                        <h3 className="text-white font-medium">Two-Factor Authentication</h3>
                        <p className="text-xs text-indigo-300">Add an extra layer of security to your account</p>
                    </div>
                    <button
                        onClick={() => handleToggle('twoFactorEnabled')}
                        disabled={loading}
                        className={`w-12 h-6 rounded-full border flex items-center px-1 transition-all ${settings.twoFactorEnabled
                            ? 'bg-teal-500/20 border-teal-500/30'
                            : 'bg-slate-700/50 border-white/10'
                            }`}
                    >
                        <div className={`w-4 h-4 rounded-full shadow-lg transition-all ${settings.twoFactorEnabled
                            ? 'bg-teal-400 shadow-teal-500/50 translate-x-6'
                            : 'bg-slate-500 ml-0'
                            }`} />
                    </button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                    <div>
                        <h3 className="text-white font-medium">Password Expiry</h3>
                        <p className="text-xs text-indigo-300">Force users to update password every 90 days</p>
                    </div>
                    <button
                        onClick={() => handleToggle('passwordExpiry')}
                        disabled={loading}
                        className={`w-12 h-6 rounded-full border flex items-center px-1 transition-all ${settings.passwordExpiry
                            ? 'bg-teal-500/20 border-teal-500/30'
                            : 'bg-slate-700/50 border-white/10'
                            }`}
                    >
                        <div className={`w-4 h-4 rounded-full shadow-lg transition-all ${settings.passwordExpiry
                            ? 'bg-teal-400 shadow-teal-500/50 translate-x-6'
                            : 'bg-slate-500 ml-0'
                            }`} />
                    </button>
                </div>
            </div>
        </GlassCard>
    );
}
