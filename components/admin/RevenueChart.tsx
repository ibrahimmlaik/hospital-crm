"use client";

import { motion } from "framer-motion";

interface RevenueChartProps {
    data: Array<{
        month: number;
        monthName: string;
        revenue: number;
    }>;
}

export function RevenueChart({ data }: RevenueChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="h-[300px] flex items-center justify-center text-indigo-300">
                <p>No revenue data available</p>
            </div>
        );
    }

    const maxRevenue = Math.max(...data.map(d => d.revenue), 1);
    const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
    const currentMonth = new Date().getMonth();

    return (
        <div className="space-y-4">
            {/* Total revenue summary */}
            {totalRevenue > 0 && (
                <div className="flex items-center justify-between text-sm">
                    <span className="text-indigo-300">
                        Year Total: <span className="text-emerald-400 font-bold">PKR {totalRevenue.toLocaleString()}</span>
                    </span>
                    <span className="text-indigo-400 text-xs">Hover bars for monthly detail</span>
                </div>
            )}

            <div className="flex items-end justify-between gap-1.5 h-[260px] pt-4">
                {data.map((item, i) => {
                    const heightPercent = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
                    const isCurrentMonth = i === currentMonth;
                    const hasRevenue = item.revenue > 0;

                    return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                            {/* Revenue amount label for bars with data */}
                            {hasRevenue && (
                                <span className="text-[10px] text-emerald-400 font-bold whitespace-nowrap">
                                    {item.revenue >= 1000 ? `PKR ${(item.revenue / 1000).toFixed(0)}k` : `PKR ${item.revenue.toLocaleString()}`}
                                </span>
                            )}
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: hasRevenue ? `${Math.max(heightPercent, 5)}%` : "3px" }}
                                transition={{ delay: i * 0.05, duration: 0.8, ease: "easeOut" }}
                                className={`w-full rounded-t-lg relative group cursor-pointer transition-colors ${hasRevenue
                                    ? isCurrentMonth
                                        ? "bg-gradient-to-t from-emerald-500 to-teal-400 shadow-lg shadow-emerald-500/20"
                                        : "bg-gradient-to-t from-teal-500/60 to-emerald-500/40 hover:from-teal-400/70 hover:to-emerald-400/50"
                                    : "bg-white/10"
                                    }`}
                            >
                                {/* Tooltip */}
                                <div className="absolute -top-14 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-black/90 text-white text-xs px-3 py-2 rounded-lg transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg border border-white/10">
                                    <p className="font-bold">PKR {item.revenue.toLocaleString()}</p>
                                    <p className="text-indigo-300 text-[10px]">{item.monthName} {new Date().getFullYear()}</p>
                                </div>
                            </motion.div>
                        </div>
                    );
                })}
            </div>

            {/* Month labels */}
            <div className="flex justify-between text-xs px-1">
                {data.map((item, i) => (
                    <span
                        key={i}
                        className={`flex-1 text-center ${i === currentMonth
                            ? "text-teal-300 font-bold"
                            : "text-indigo-300"
                            }`}
                    >
                        {item.monthName}
                    </span>
                ))}
            </div>
        </div>
    );
}
