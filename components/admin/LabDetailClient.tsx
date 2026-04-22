"use client";

import { addLabProduct, updateLabProduct, deleteLabProduct } from "@/actions/admin-labs";
import { GlassCard } from "@/components/ui/glass-card";
import { Plus, Pencil, Trash2, X, TestTube2, DollarSign, Clock, Tag } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

const LAB_CATEGORIES = [
    "BLOOD_TEST",
    "URINE_TEST",
    "IMAGING",
    "BIOPSY",
    "MICROBIOLOGY",
    "BIOCHEMISTRY",
    "HEMATOLOGY",
    "IMMUNOLOGY",
    "GENETIC",
    "OTHER",
];

export default function LabDetailClient({ lab }: { lab: any }) {
    const router = useRouter();
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleAddProduct(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);

        try {
            const result = await addLabProduct(lab.id, formData);
            if (result.success) {
                setShowAddForm(false);
                router.refresh();
            } else {
                setError(result.error || "Failed to add product");
            }
        } catch {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    }

    async function handleUpdateProduct(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!editingProduct) return;
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);

        try {
            const result = await updateLabProduct(editingProduct.id, formData);
            if (result.success) {
                setEditingProduct(null);
                router.refresh();
            } else {
                setError(result.error || "Failed to update product");
            }
        } catch {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    }

    async function handleDeleteProduct(productId: string) {
        if (!confirm("Are you sure you want to delete this test/service?")) return;
        setLoading(true);

        try {
            const result = await deleteLabProduct(productId);
            if (result.success) {
                router.refresh();
            } else {
                setError(result.error || "Failed to delete product");
            }
        } catch {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    }

    function formatCategory(cat: string) {
        return cat.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    }

    return (
        <div className="space-y-6">
            {/* Contact Info */}
            {(lab.phone || lab.email) && (
                <GlassCard>
                    <h3 className="text-lg font-bold text-white mb-3">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {lab.phone && (
                            <div>
                                <span className="text-indigo-300">Phone: </span>
                                <span className="text-white">{lab.phone}</span>
                            </div>
                        )}
                        {lab.email && (
                            <div>
                                <span className="text-indigo-300">Email: </span>
                                <span className="text-white">{lab.email}</span>
                            </div>
                        )}
                    </div>
                </GlassCard>
            )}

            {/* Products Section */}
            <GlassCard>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">Tests & Services</h3>
                    <button
                        onClick={() => { setShowAddForm(true); setEditingProduct(null); }}
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold py-2 px-4 rounded-lg shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 text-sm"
                    >
                        <Plus size={16} />
                        Add Test/Service
                    </button>
                </div>

                {error && (
                    <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-sm mb-4">
                        {error}
                    </div>
                )}

                {/* Add Product Form */}
                {showAddForm && (
                    <div className="mb-6 p-6 rounded-xl border border-cyan-500/20 bg-cyan-500/5">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-lg font-bold text-white">Add New Test/Service</h4>
                            <button onClick={() => setShowAddForm(false)} className="text-indigo-300 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddProduct} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-indigo-200 mb-1">Name *</label>
                                    <input name="name" required className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-indigo-300/50 focus:border-cyan-500/50 outline-none text-sm" placeholder="e.g. Complete Blood Count" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-indigo-200 mb-1">Category</label>
                                    <select name="category" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-cyan-500/50 outline-none text-sm">
                                        <option value="" className="bg-slate-800">Select category</option>
                                        {LAB_CATEGORIES.map(cat => (
                                            <option key={cat} value={cat} className="bg-slate-800">{formatCategory(cat)}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-indigo-200 mb-1">Description</label>
                                <textarea name="description" rows={2} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-indigo-300/50 focus:border-cyan-500/50 outline-none text-sm resize-none" placeholder="Test description..." />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-indigo-200 mb-1">Price *</label>
                                    <input name="price" type="number" step="0.01" min="0" required className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-indigo-300/50 focus:border-cyan-500/50 outline-none text-sm" placeholder="0.00" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-indigo-200 mb-1">Turnaround Time</label>
                                    <input name="turnaroundTime" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-indigo-300/50 focus:border-cyan-500/50 outline-none text-sm" placeholder="e.g. 24 hours" />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button type="submit" disabled={loading} className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-2 px-6 rounded-lg text-sm disabled:opacity-50">
                                    {loading ? "Adding..." : "Add Test/Service"}
                                </button>
                                <button type="button" onClick={() => setShowAddForm(false)} className="px-6 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm transition-all">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Edit Product Form */}
                {editingProduct && (
                    <div className="mb-6 p-6 rounded-xl border border-amber-500/20 bg-amber-500/5">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-lg font-bold text-white">Edit: {editingProduct.name}</h4>
                            <button onClick={() => setEditingProduct(null)} className="text-indigo-300 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateProduct} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-indigo-200 mb-1">Name *</label>
                                    <input name="name" defaultValue={editingProduct.name} required className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-amber-500/50 outline-none text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-indigo-200 mb-1">Category</label>
                                    <select name="category" defaultValue={editingProduct.category || ""} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-amber-500/50 outline-none text-sm">
                                        <option value="" className="bg-slate-800">Select category</option>
                                        {LAB_CATEGORIES.map(cat => (
                                            <option key={cat} value={cat} className="bg-slate-800">{formatCategory(cat)}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-indigo-200 mb-1">Description</label>
                                <textarea name="description" defaultValue={editingProduct.description || ""} rows={2} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-amber-500/50 outline-none text-sm resize-none" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-indigo-200 mb-1">Price *</label>
                                    <input name="price" type="number" step="0.01" min="0" defaultValue={editingProduct.price} required className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-amber-500/50 outline-none text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-indigo-200 mb-1">Turnaround Time</label>
                                    <input name="turnaroundTime" defaultValue={editingProduct.turnaroundTime || ""} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-amber-500/50 outline-none text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-indigo-200 mb-1">Status</label>
                                    <select name="isActive" defaultValue={editingProduct.isActive ? "true" : "false"} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-amber-500/50 outline-none text-sm">
                                        <option value="true" className="bg-slate-800">Active</option>
                                        <option value="false" className="bg-slate-800">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button type="submit" disabled={loading} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-2 px-6 rounded-lg text-sm disabled:opacity-50">
                                    {loading ? "Updating..." : "Update Test/Service"}
                                </button>
                                <button type="button" onClick={() => setEditingProduct(null)} className="px-6 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm transition-all">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Product List */}
                {lab.products.length === 0 ? (
                    <div className="text-center py-12 text-indigo-300">
                        <TestTube2 className="mx-auto mb-4 opacity-50" size={48} />
                        <p>No tests or services added yet</p>
                        <p className="text-sm mt-1">Click &quot;Add Test/Service&quot; to get started</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-indigo-300">Name</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-indigo-300">Category</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-indigo-300">Price</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-indigo-300">Turnaround</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-indigo-300">Status</th>
                                    <th className="text-right py-3 px-4 text-sm font-medium text-indigo-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lab.products.map((product: any) => (
                                    <tr key={product.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="py-3 px-4">
                                            <div>
                                                <p className="text-white font-medium">{product.name}</p>
                                                {product.description && (
                                                    <p className="text-xs text-indigo-300 mt-1 line-clamp-1">{product.description}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            {product.category ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-300 text-xs">
                                                    <Tag size={10} />
                                                    {formatCategory(product.category)}
                                                </span>
                                            ) : (
                                                <span className="text-indigo-400 text-xs">—</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="inline-flex items-center gap-1 text-emerald-300 font-medium text-sm">
                                                <DollarSign size={14} />
                                                {product.price.toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            {product.turnaroundTime ? (
                                                <span className="inline-flex items-center gap-1 text-amber-300 text-sm">
                                                    <Clock size={14} />
                                                    {product.turnaroundTime}
                                                </span>
                                            ) : (
                                                <span className="text-indigo-400 text-xs">—</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${product.isActive ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"}`}>
                                                {product.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => { setEditingProduct(product); setShowAddForm(false); }}
                                                    className="p-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 transition-all"
                                                    title="Edit"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteProduct(product.id)}
                                                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 transition-all"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </GlassCard>
        </div>
    );
}
