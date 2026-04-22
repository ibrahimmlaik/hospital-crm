"use client";

import { useActionState, useState, useMemo, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createPrescription, getMyPatients } from "@/actions/doctor";
import { GlassCard } from "@/components/ui/glass-card";
import { Search, Plus, Trash2, Printer, Save, CheckCircle, AlertCircle, FlaskConical, Pill, FileText, ChevronDown, X, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MEDICINES_LIST, LAB_TESTS } from "@/lib/medical-data";

interface PatientOption {
    id: string;
    name: string;
    phone: string;
    gender: string;
    age: number;
}

export default function PrescriptionPad() {
    const searchParams = useSearchParams();
    const [state, formAction, isPending] = useActionState(createPrescription, null);
    const [items, setItems] = useState([{ name: "", dosage: "", freq: "", duration: "" }]);
    const [selectedPatientId, setSelectedPatientId] = useState("");
    const [notes, setNotes] = useState("");
    const [selectedLabTests, setSelectedLabTests] = useState<string[]>([]);
    const [labSearchQuery, setLabSearchQuery] = useState("");
    const [showLabDropdown, setShowLabDropdown] = useState(false);
    const [patients, setPatients] = useState<PatientOption[]>([]);
    const [loadingPatients, setLoadingPatients] = useState(true);
    const labDropdownRef = useRef<HTMLDivElement>(null);

    // Load doctor's patients
    useEffect(() => {
        getMyPatients().then(p => {
            setPatients(p);
            setLoadingPatients(false);
            // Auto-select if patient name provided via URL
            const urlPatient = searchParams.get("patient");
            if (urlPatient) {
                const found = p.find(pt => pt.name.toLowerCase() === urlPatient.toLowerCase());
                if (found) setSelectedPatientId(found.id);
            }
        });
    }, [searchParams]);

    const selectedPatient = patients.find(p => p.id === selectedPatientId);

    // Close lab dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (labDropdownRef.current && !labDropdownRef.current.contains(event.target as Node)) {
                setShowLabDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Medicine rows
    const addRow = () => setItems([...items, { name: "", dosage: "", freq: "", duration: "" }]);
    const removeRow = (i: number) => {
        if (items.length === 1) return;
        setItems(items.filter((_, idx) => idx !== i));
    };
    const updateRow = (i: number, field: string, val: string) => {
        const newItems = [...items];
        (newItems[i] as any)[field] = val;
        setItems(newItems);
    };

    // Lab test filtering
    const filteredLabTests = useMemo(() => {
        if (!labSearchQuery.trim()) return LAB_TESTS;
        const q = labSearchQuery.toLowerCase();
        return LAB_TESTS.filter(t => t.toLowerCase().includes(q));
    }, [labSearchQuery]);

    const toggleLabTest = (test: string) => {
        setSelectedLabTests(prev =>
            prev.includes(test) ? prev.filter(t => t !== test) : [...prev, test]
        );
    };

    const removeLabTest = (test: string) => {
        setSelectedLabTests(prev => prev.filter(t => t !== test));
    };

    const validMedicines = items.filter(i => i.name.trim());

    // Print handler
    const handlePrint = () => {
        const printWindow = window.open("", "_blank");
        if (!printWindow) return;

        const today = new Date().toLocaleDateString("en-PK", {
            year: "numeric", month: "long", day: "numeric"
        });

        const medicineRows = validMedicines.map((m, i) => `
            <tr>
                <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;color:#6b7280">${i + 1}</td>
                <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:600">${m.name}</td>
                <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center">${m.dosage || "—"}</td>
                <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center">${m.freq || "—"}</td>
                <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center">${m.duration || "—"}</td>
            </tr>
        `).join("");

        const labTestsList = selectedLabTests.map(t => `<li style="padding:4px 0;border-bottom:1px solid #f3f4f6">${t}</li>`).join("");

        printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
    <title>Prescription - ${selectedPatient?.name || "Patient"}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1f2937; padding: 20px; max-width: 800px; margin: 0 auto; }
        @media print { body { padding: 0; } }
    </style>
</head>
<body>
    <!-- Header -->
    <div style="border-bottom:3px solid #0d9488;padding-bottom:16px;margin-bottom:20px">
        <div style="display:flex;justify-content:space-between;align-items:center">
            <div>
                <h1 style="font-size:28px;color:#0d9488;font-weight:800;letter-spacing:-0.5px">Nexus Health CRM</h1>
                <p style="color:#6b7280;font-size:13px;margin-top:2px">Hospital & Medical Center</p>
            </div>
            <div style="text-align:right">
                <p style="font-size:12px;color:#6b7280">Date: <strong style="color:#1f2937">${today}</strong></p>
                <p style="font-size:12px;color:#6b7280;margin-top:2px">Rx #${Math.floor(10000 + Math.random() * 90000)}</p>
            </div>
        </div>
    </div>

    <!-- Patient Info -->
    <div style="background:#f0fdfa;border:1px solid #ccfbf1;border-radius:8px;padding:14px 18px;margin-bottom:20px">
        <div style="display:flex;gap:40px;font-size:13px">
            <div><span style="color:#6b7280">Patient:</span> <strong>${selectedPatient?.name || "—"}</strong></div>
            <div><span style="color:#6b7280">Age:</span> <strong>${selectedPatient?.age || "—"} yrs</strong></div>
            <div><span style="color:#6b7280">Gender:</span> <strong>${selectedPatient?.gender || "—"}</strong></div>
            <div><span style="color:#6b7280">Phone:</span> <strong>${selectedPatient?.phone || "—"}</strong></div>
        </div>
    </div>

    <!-- Rx Symbol -->
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
        <span style="font-size:32px;font-weight:800;color:#0d9488;font-family:serif">℞</span>
        <h2 style="font-size:18px;font-weight:700">Prescribed Medicines</h2>
    </div>

    ${validMedicines.length > 0 ? `
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;font-size:13px">
        <thead>
            <tr style="background:#f9fafb">
                <th style="padding:10px 12px;text-align:center;font-weight:700;color:#374151;border-bottom:2px solid #e5e7eb;width:40px">#</th>
                <th style="padding:10px 12px;text-align:left;font-weight:700;color:#374151;border-bottom:2px solid #e5e7eb">Medicine</th>
                <th style="padding:10px 12px;text-align:center;font-weight:700;color:#374151;border-bottom:2px solid #e5e7eb;width:80px">Dosage</th>
                <th style="padding:10px 12px;text-align:center;font-weight:700;color:#374151;border-bottom:2px solid #e5e7eb;width:80px">Freq</th>
                <th style="padding:10px 12px;text-align:center;font-weight:700;color:#374151;border-bottom:2px solid #e5e7eb;width:90px">Duration</th>
            </tr>
        </thead>
        <tbody>${medicineRows}</tbody>
    </table>` : ""}

    ${selectedLabTests.length > 0 ? `
    <div style="margin-bottom:24px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
            <span style="font-size:18px">🧪</span>
            <h2 style="font-size:16px;font-weight:700">Lab Tests / Investigations Ordered</h2>
        </div>
        <div style="background:#faf5ff;border:1px solid #e9d5ff;border-radius:8px;padding:12px 18px">
            <ol style="list-style:decimal;padding-left:20px;font-size:13px">${labTestsList}</ol>
        </div>
    </div>` : ""}

    ${notes ? `
    <div style="margin-bottom:24px">
        <h3 style="font-size:14px;font-weight:700;margin-bottom:8px;color:#374151">Doctor's Notes</h3>
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:12px 16px;font-size:13px;white-space:pre-wrap;line-height:1.6">${notes}</div>
    </div>` : ""}

    <!-- Signature -->
    <div style="margin-top:40px;display:flex;justify-content:flex-end">
        <div style="text-align:center;width:200px">
            <div style="border-bottom:2px solid #1f2937;padding-bottom:40px"></div>
            <p style="font-size:13px;font-weight:700;margin-top:8px">Doctor's Signature</p>
            <p style="font-size:11px;color:#6b7280">Date: ${today}</p>
        </div>
    </div>

    <!-- Footer -->
    <div style="margin-top:30px;padding-top:12px;border-top:1px solid #e5e7eb;text-align:center;font-size:10px;color:#9ca3af">
        <p>This prescription is digitally generated by Nexus Health CRM. Valid for 30 days from the date of issue.</p>
    </div>

    <script>window.onload = function() { window.print(); }</script>
</body>
</html>`);
        printWindow.document.close();
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-teal-500/20">
                            <FileText className="text-teal-400" size={28} />
                        </div>
                        Digital Prescription Pad
                    </h1>
                    <p className="text-indigo-200 mt-1">Issue e-prescriptions with medicines & lab orders</p>
                </div>
            </div>

            <form action={formAction}>
                {/* Hidden JSON inputs */}
                <input type="hidden" name="patientId" value={selectedPatientId} />
                <input type="hidden" name="medicines" value={JSON.stringify(items)} />
                <input type="hidden" name="labTests" value={JSON.stringify(selectedLabTests)} />
                <input type="hidden" name="notes" value={notes} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Main Form (2 cols) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Patient Selection */}
                        <GlassCard>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-indigo-300 uppercase font-bold tracking-wider flex items-center gap-1.5">
                                        <User size={12} /> Select Patient
                                    </label>
                                    <select
                                        value={selectedPatientId}
                                        onChange={(e) => setSelectedPatientId(e.target.value)}
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-teal-500/50 transition-colors"
                                    >
                                        <option value="">
                                            {loadingPatients ? "Loading patients..." : "Select a patient..."}
                                        </option>
                                        {patients.map(p => (
                                            <option key={p.id} value={p.id} className="bg-[#0f172a]">
                                                {p.name} — {p.gender}, {p.age}yrs ({p.phone})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-indigo-300 uppercase font-bold tracking-wider">Date</label>
                                    <input
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-indigo-300 focus:outline-none"
                                        value={new Date().toLocaleDateString("en-PK", { year: "numeric", month: "long", day: "numeric" })}
                                        disabled
                                    />
                                </div>
                            </div>
                            {selectedPatient && (
                                <div className="mt-3 flex items-center gap-4 p-2.5 rounded-lg bg-teal-500/5 border border-teal-500/10 text-sm">
                                    <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-300 font-bold text-sm">
                                        {selectedPatient.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-white font-bold">{selectedPatient.name}</span>
                                    <span className="text-indigo-400">{selectedPatient.gender}, {selectedPatient.age} yrs</span>
                                    <span className="text-indigo-400">{selectedPatient.phone}</span>
                                </div>
                            )}
                        </GlassCard>

                        {/* Medicines Section */}
                        <GlassCard>
                            <div className="flex items-center gap-2 mb-5">
                                <div className="p-1.5 rounded-lg bg-emerald-500/20">
                                    <Pill className="text-emerald-400" size={18} />
                                </div>
                                <h3 className="text-lg font-bold text-white">Prescribed Medicines</h3>
                                <span className="ml-auto text-xs text-indigo-400">{validMedicines.length} medicine(s)</span>
                            </div>

                            {/* Column headers */}
                            <div className="grid grid-cols-12 gap-2 text-[10px] text-indigo-400 font-bold uppercase mb-3 px-1">
                                <div className="col-span-5">Medicine Name</div>
                                <div className="col-span-2">Dosage</div>
                                <div className="col-span-2">Frequency</div>
                                <div className="col-span-2">Duration</div>
                                <div className="col-span-1"></div>
                            </div>

                            <div className="space-y-2">
                                <AnimatePresence>
                                    {items.map((item, i) => (
                                        <MedicineRow
                                            key={i}
                                            index={i}
                                            item={item}
                                            updateRow={updateRow}
                                            removeRow={removeRow}
                                            canRemove={items.length > 1}
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>

                            <button type="button" onClick={addRow} className="flex items-center gap-2 text-teal-300 text-sm font-bold hover:text-teal-200 mt-4 px-1">
                                <Plus size={16} /> Add Medicine
                            </button>
                        </GlassCard>

                        {/* Lab Tests Section */}
                        <GlassCard>
                            <div className="flex items-center gap-2 mb-5">
                                <div className="p-1.5 rounded-lg bg-violet-500/20">
                                    <FlaskConical className="text-violet-400" size={18} />
                                </div>
                                <h3 className="text-lg font-bold text-white">Lab Tests / Investigations</h3>
                                <span className="ml-auto text-xs text-indigo-400">{selectedLabTests.length} test(s) ordered</span>
                            </div>

                            {selectedLabTests.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {selectedLabTests.map(test => (
                                        <span key={test} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/10 text-violet-300 text-xs font-medium border border-violet-500/20">
                                            {test}
                                            <button type="button" onClick={() => removeLabTest(test)} className="hover:text-red-400 transition-colors"><X size={12} /></button>
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div ref={labDropdownRef} className="relative">
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 text-indigo-400" size={16} />
                                    <input
                                        type="text"
                                        value={labSearchQuery}
                                        onChange={(e) => setLabSearchQuery(e.target.value)}
                                        onFocus={() => setShowLabDropdown(true)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-colors"
                                        placeholder="Search lab tests (CBC, LFT, X-Ray, MRI...)"
                                    />
                                    <button type="button" onClick={() => setShowLabDropdown(!showLabDropdown)} className="absolute right-2 top-2 p-1 text-indigo-400 hover:text-white transition-colors">
                                        <ChevronDown size={16} className={`transition-transform ${showLabDropdown ? 'rotate-180' : ''}`} />
                                    </button>
                                </div>

                                {showLabDropdown && (
                                    <div className="absolute z-30 w-full mt-1 bg-[#1e293b] border border-white/10 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                                        {filteredLabTests.length === 0 ? (
                                            <div className="p-3 text-center text-indigo-400 text-sm">No tests found</div>
                                        ) : (
                                            filteredLabTests.map(test => {
                                                const isSelected = selectedLabTests.includes(test);
                                                return (
                                                    <button key={test} type="button" onClick={() => toggleLabTest(test)}
                                                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 transition-colors flex items-center gap-3 border-b border-white/5 last:border-0 ${isSelected ? 'text-violet-300 bg-violet-500/5' : 'text-white'}`}>
                                                        <div className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${isSelected ? 'bg-violet-500 border-violet-500' : 'border-white/20'}`}>
                                                            {isSelected && <CheckCircle size={10} className="text-white" />}
                                                        </div>
                                                        {test}
                                                    </button>
                                                );
                                            })
                                        )}
                                    </div>
                                )}
                            </div>
                        </GlassCard>
                    </div>

                    {/* Right: Notes + Actions (1 col) */}
                    <div className="space-y-6">
                        <GlassCard>
                            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                <FileText size={18} className="text-teal-400" />
                                Doctor&apos;s Notes
                            </h3>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full h-40 bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-teal-500/50 resize-none transition-colors"
                                placeholder="Diagnosis, clinical findings, patient instructions, follow-up advice..."
                            />
                            <p className="text-[10px] text-indigo-400 mt-2">These notes will appear on the printed prescription</p>
                        </GlassCard>

                        <GlassCard className="bg-gradient-to-br from-teal-500/5 to-violet-500/5 border-teal-500/20">
                            <h3 className="text-sm font-bold text-indigo-200 mb-3">Prescription Summary</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-indigo-400">Patient</span>
                                    <span className="text-white font-bold">{selectedPatient?.name || "—"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-indigo-400">Medicines</span>
                                    <span className="text-white font-bold">{validMedicines.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-indigo-400">Lab Tests</span>
                                    <span className="text-white font-bold">{selectedLabTests.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-indigo-400">Notes</span>
                                    <span className="text-white font-bold">{notes ? "Yes" : "—"}</span>
                                </div>
                            </div>
                        </GlassCard>

                        {state?.error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-200 rounded-xl flex items-center gap-2 text-sm">
                                <AlertCircle size={16} /> {state.error}
                            </div>
                        )}
                        {state?.success && (
                            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 rounded-xl flex items-center gap-2 text-sm">
                                <CheckCircle size={16} /> {state.message}
                            </div>
                        )}

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handlePrint}
                                disabled={isPending || validMedicines.length === 0}
                                type="button"
                                className="bg-white/10 hover:bg-white/20 text-white w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-40"
                            >
                                <Printer size={18} /> Print Prescription
                            </button>
                            <button
                                disabled={isPending || !selectedPatientId || validMedicines.length === 0}
                                type="submit"
                                className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 transition-all disabled:opacity-40"
                            >
                                {isPending ? "Issuing..." : "Issue Prescription"}
                                {!isPending && <Save size={18} />}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

/* ---- Medicine Row with searchable dropdown ---- */
function MedicineRow({
    index, item, updateRow, removeRow, canRemove,
}: {
    index: number;
    item: { name: string; dosage: string; freq: string; duration: string };
    updateRow: (i: number, field: string, val: string) => void;
    removeRow: (i: number) => void;
    canRemove: boolean;
}) {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const suggestions = useMemo(() => {
        if (!item.name || item.name.length < 2) return [];
        const q = item.name.toLowerCase();
        return MEDICINES_LIST.filter(m => m.toLowerCase().includes(q)).slice(0, 8);
    }, [item.name]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-12 gap-2 items-center group"
        >
            <div className="col-span-5 relative" ref={wrapperRef}>
                <input
                    value={item.name}
                    onChange={e => { updateRow(index, 'name', e.target.value); setShowSuggestions(true); }}
                    onFocus={() => item.name.length >= 2 && setShowSuggestions(true)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                    placeholder="Type medicine name..."
                    required
                />
                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-20 w-full mt-1 bg-[#1e293b] border border-white/10 rounded-lg shadow-2xl max-h-48 overflow-y-auto">
                        {suggestions.map(med => (
                            <button key={med} type="button" onClick={() => { updateRow(index, 'name', med); setShowSuggestions(false); }}
                                className="w-full text-left px-3 py-2 text-sm text-white hover:bg-teal-500/10 hover:text-teal-300 transition-colors border-b border-white/5 last:border-0">
                                {med}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            <div className="col-span-2">
                <input value={item.dosage} onChange={e => updateRow(index, 'dosage', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none" placeholder="500mg" />
            </div>
            <div className="col-span-2">
                <select value={item.freq} onChange={e => updateRow(index, 'freq', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-sm text-white focus:outline-none">
                    <option value="">Select</option>
                    <option value="1-0-0">1-0-0 (Morning)</option>
                    <option value="0-0-1">0-0-1 (Night)</option>
                    <option value="1-0-1">1-0-1 (Twice)</option>
                    <option value="1-1-1">1-1-1 (Thrice)</option>
                    <option value="1-1-1-1">1-1-1-1 (4x)</option>
                    <option value="SOS">SOS (As needed)</option>
                    <option value="STAT">STAT (Immediately)</option>
                    <option value="OD">OD (Once daily)</option>
                    <option value="BD">BD (Twice daily)</option>
                    <option value="TDS">TDS (Thrice daily)</option>
                    <option value="HS">HS (At bedtime)</option>
                </select>
            </div>
            <div className="col-span-2">
                <select value={item.duration} onChange={e => updateRow(index, 'duration', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-sm text-white focus:outline-none">
                    <option value="">Select</option>
                    <option value="1 day">1 day</option>
                    <option value="3 days">3 days</option>
                    <option value="5 days">5 days</option>
                    <option value="7 days">7 days</option>
                    <option value="10 days">10 days</option>
                    <option value="14 days">14 days</option>
                    <option value="1 month">1 month</option>
                    <option value="3 months">3 months</option>
                    <option value="Ongoing">Ongoing</option>
                </select>
            </div>
            <div className="col-span-1 text-center">
                <button type="button" onClick={() => removeRow(index)} disabled={!canRemove}
                    className="p-1.5 hover:bg-red-500/20 text-indigo-400 hover:text-red-400 rounded-lg transition-colors disabled:opacity-20">
                    <Trash2 size={14} />
                </button>
            </div>
        </motion.div>
    );
}
