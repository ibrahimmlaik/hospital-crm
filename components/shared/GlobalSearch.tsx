"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, User, FileText, Calendar, ArrowRight, Building2, Stethoscope, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { globalSearch } from "@/actions/global-search";

export function GlobalSearch() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<NodeJS.Timeout>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Debounced search
    const performSearch = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setResults([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const data = await globalSearch(searchQuery);
            setResults(data);
        } catch (err) {
            console.error("Search failed:", err);
            setResults([]);
        }
        setLoading(false);
    }, []);

    const handleChange = (value: string) => {
        setQuery(value);
        setIsOpen(true);

        // Debounce: wait 300ms after user stops typing
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            performSearch(value);
        }, 300);
    };

    const handleSelect = (url: string) => {
        if (url === "#") return;
        setIsOpen(false);
        setQuery("");
        setResults([]);
        router.push(url);
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "patient": return <User size={18} />;
            case "doctor": return <Stethoscope size={18} />;
            case "department": return <Building2 size={18} />;
            case "appointment": return <Calendar size={18} />;
            case "invoice": return <FileText size={18} />;
            default: return <User size={18} />;
        }
    };

    const getIconColor = (type: string) => {
        switch (type) {
            case "patient": return "bg-teal-500/20 text-teal-300";
            case "doctor": return "bg-purple-500/20 text-purple-300";
            case "department": return "bg-blue-500/20 text-blue-300";
            case "appointment": return "bg-amber-500/20 text-amber-300";
            case "invoice": return "bg-emerald-500/20 text-emerald-300";
            default: return "bg-indigo-500/20 text-indigo-300";
        }
    };

    return (
        <div className="relative w-full max-w-xs sm:max-w-sm lg:max-w-xl" ref={containerRef}>
            <div className="relative group z-50">
                <Search className="absolute left-3 top-2.5 text-indigo-400 w-4 h-4 sm:w-5 sm:h-5 group-focus-within:text-teal-400 transition-colors" />
                <input
                    type="text"
                    placeholder="Search..."
                    className="w-full bg-[#0f172a]/50 border border-white/10 rounded-xl pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 text-sm text-indigo-100 placeholder-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/40 transition-all"
                    value={query}
                    onChange={(e) => handleChange(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                />
                {query && (
                    <button onClick={() => { setQuery(""); setResults([]); setIsOpen(false); }} className="absolute right-3 top-2.5 text-indigo-400 hover:text-white">
                        <X size={16} />
                    </button>
                )}
            </div>

            <AnimatePresence>
                {isOpen && query && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-[#1e293b] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[60]"
                    >
                        {loading ? (
                            <div className="p-6 flex items-center justify-center gap-2 text-indigo-300">
                                <Loader2 size={18} className="animate-spin" />
                                <span className="text-sm">Searching...</span>
                            </div>
                        ) : results.length > 0 ? (
                            <div className="p-2">
                                <div className="text-xs font-bold text-indigo-300 uppercase px-3 py-2">
                                    {results.length} Result{results.length !== 1 ? "s" : ""} Found
                                </div>
                                {results.map((r, i) => (
                                    <div
                                        key={i}
                                        onClick={() => handleSelect(r.url)}
                                        className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg cursor-pointer group transition-colors"
                                    >
                                        <div className={`p-2 rounded-lg ${getIconColor(r.type)}`}>
                                            {getIcon(r.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-white font-medium text-sm group-hover:text-teal-300 transition-colors truncate">{r.title}</h4>
                                            <p className="text-xs text-indigo-400 truncate">{r.subtitle}</p>
                                        </div>
                                        <ArrowRight size={16} className="text-indigo-500 group-hover:text-white opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 flex-shrink-0" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-indigo-300">
                                <Search size={24} className="mx-auto mb-2 opacity-40" />
                                <p className="text-sm">No results found for "{query}"</p>
                                <p className="text-xs text-indigo-400 mt-1">Try searching by name, email, or department</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
