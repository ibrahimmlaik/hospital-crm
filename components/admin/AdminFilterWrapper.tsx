"use client";

import { Search, Filter, X } from "lucide-react";
import { useState, useMemo, ReactNode } from "react";

interface FilterOption {
    label: string;
    key: string;
    options: { value: string; label: string }[];
}

interface AdminFilterWrapperProps {
    data: any[];
    searchKeys: string[];      // keys to search across, supports nested like "user.name"
    searchPlaceholder?: string;
    filters?: FilterOption[];
    children: (filteredData: any[]) => ReactNode;
}

function getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
}

export default function AdminFilterWrapper({
    data,
    searchKeys,
    searchPlaceholder = "Search...",
    filters = [],
    children
}: AdminFilterWrapperProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
    const [showFilters, setShowFilters] = useState(false);

    const filteredData = useMemo(() => {
        let result = data;

        // Apply text search
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(item =>
                searchKeys.some(key => {
                    const val = getNestedValue(item, key);
                    return val && String(val).toLowerCase().includes(q);
                })
            );
        }

        // Apply dropdown filters
        Object.entries(activeFilters).forEach(([key, value]) => {
            if (value) {
                result = result.filter(item => {
                    const val = getNestedValue(item, key);
                    return val && String(val) === value;
                });
            }
        });

        return result;
    }, [data, searchQuery, activeFilters, searchKeys]);

    const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;

    const clearFilters = () => {
        setActiveFilters({});
        setSearchQuery("");
    };

    return (
        <>
            <div className="p-4 border-b border-white/10 bg-white/5 space-y-3">
                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 text-indigo-400 w-4 h-4" />
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={searchPlaceholder}
                            className="w-full bg-[#0f172a]/50 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-teal-500/50 transition-colors"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3 top-2.5 text-indigo-400 hover:text-white transition-colors"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                    {filters.length > 0 && (
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${activeFilterCount > 0
                                    ? "bg-teal-500/20 border-teal-500/30 text-teal-300"
                                    : "bg-white/5 border-white/10 text-indigo-300 hover:text-white hover:bg-white/10"
                                }`}
                        >
                            <Filter size={14} />
                            Filters
                            {activeFilterCount > 0 && (
                                <span className="bg-teal-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>
                    )}
                </div>

                {showFilters && filters.length > 0 && (
                    <div className="flex flex-wrap gap-3 pt-1">
                        {filters.map(filter => (
                            <select
                                key={filter.key}
                                value={activeFilters[filter.key] || ""}
                                onChange={(e) => setActiveFilters(prev => ({ ...prev, [filter.key]: e.target.value }))}
                                className="bg-[#0f172a]/50 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-teal-500/50"
                            >
                                <option value="">{filter.label}</option>
                                {filter.options.map(opt => (
                                    <option key={opt.value} value={opt.value} className="bg-[#0f172a]">{opt.label}</option>
                                ))}
                            </select>
                        ))}
                        {activeFilterCount > 0 && (
                            <button
                                onClick={clearFilters}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 transition-colors"
                            >
                                <X size={12} /> Clear All
                            </button>
                        )}
                    </div>
                )}

                {/* Results Count */}
                <div className="flex items-center justify-between">
                    <p className="text-xs text-indigo-400">
                        Showing {filteredData.length} of {data.length} results
                        {(searchQuery || activeFilterCount > 0) && (
                            <span className="text-teal-400 ml-1">(filtered)</span>
                        )}
                    </p>
                </div>
            </div>
            {children(filteredData)}
        </>
    );
}
