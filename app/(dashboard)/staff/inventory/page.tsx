"use client";

import { useEffect, useState, useActionState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Package, AlertTriangle, Plus, Edit, TrendingDown } from "lucide-react";
import { getInventory, updateStock, addInventoryItem } from "@/actions/staff-inventory";
import { motion } from "framer-motion";

export default function InventoryPage() {
    const [inventory, setInventory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [addState, addAction, addPending] = useActionState(addInventoryItem, null);
    const [updateState, updateAction, updatePending] = useActionState(updateStock, null);

    useEffect(() => {
        loadInventory();
    }, []);

    useEffect(() => {
        if (addState?.success || updateState?.success) {
            loadInventory();
            setShowAddForm(false);
            setEditingItem(null);
        }
    }, [addState, updateState]);

    const loadInventory = async () => {
        try {
            const data = await getInventory();
            setInventory(data);
        } catch (error) {
            console.error("Error loading inventory:", error);
        } finally {
            setLoading(false);
        }
    };

    const lowStockItems = inventory.filter(item => item.quantity <= item.reorderLevel);
    const stats = {
        total: inventory.length,
        lowStock: lowStockItems.length,
        medicines: inventory.filter(i => i.category === "MEDICINE").length,
        equipment: inventory.filter(i => i.category === "EQUIPMENT").length
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Inventory Management</h1>
                    <p className="text-indigo-200">Track medicines, equipment, and supplies</p>
                </div>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-white rounded-lg font-bold transition-colors"
                >
                    <Plus size={18} />
                    Add Item
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <GlassCard className="bg-teal-500/10 border-teal-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-teal-500/20 text-teal-300">
                            <Package size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-indigo-200">Total Items</p>
                            <h3 className="text-2xl font-bold text-white">{stats.total}</h3>
                        </div>
                    </div>
                </GlassCard>
                <GlassCard className="bg-red-500/10 border-red-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-red-500/20 text-red-300">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-indigo-200">Low Stock</p>
                            <h3 className="text-2xl font-bold text-white">{stats.lowStock}</h3>
                        </div>
                    </div>
                </GlassCard>
                <GlassCard className="bg-purple-500/10 border-purple-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-purple-500/20 text-purple-300">
                            <Package size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-indigo-200">Medicines</p>
                            <h3 className="text-2xl font-bold text-white">{stats.medicines}</h3>
                        </div>
                    </div>
                </GlassCard>
                <GlassCard className="bg-blue-500/10 border-blue-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-blue-500/20 text-blue-300">
                            <Package size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-indigo-200">Equipment</p>
                            <h3 className="text-2xl font-bold text-white">{stats.equipment}</h3>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Low Stock Alert */}
            {lowStockItems.length > 0 && (
                <GlassCard className="bg-red-500/10 border-red-500/30">
                    <div className="flex items-center gap-3 mb-3">
                        <AlertTriangle className="text-red-300" size={20} />
                        <h3 className="font-bold text-white">Low Stock Alert</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {lowStockItems.map(item => (
                            <div key={item.id} className="p-3 bg-white/5 rounded-lg border border-red-500/20">
                                <p className="font-bold text-white text-sm">{item.itemName}</p>
                                <p className="text-xs text-red-300">
                                    Only {item.quantity} {item.unit} remaining
                                </p>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            )}

            {/* Add Item Form */}
            {showAddForm && (
                <GlassCard>
                    <h2 className="text-xl font-bold text-white mb-4">Add New Item</h2>
                    <form action={addAction} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-indigo-300 mb-2 block">Item Name</label>
                                <input
                                    type="text"
                                    name="itemName"
                                    placeholder="e.g., Paracetamol 500mg"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500/50"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-indigo-300 mb-2 block">Category</label>
                                <select
                                    name="category"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500/50"
                                >
                                    <option value="">Select...</option>
                                    <option value="MEDICINE" className="bg-[#0f172a]">Medicine</option>
                                    <option value="EQUIPMENT" className="bg-[#0f172a]">Equipment</option>
                                    <option value="SUPPLIES" className="bg-[#0f172a]">Supplies</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="text-sm font-medium text-indigo-300 mb-2 block">Quantity</label>
                                <input
                                    type="number"
                                    name="quantity"
                                    placeholder="100"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500/50"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-indigo-300 mb-2 block">Unit</label>
                                <input
                                    type="text"
                                    name="unit"
                                    placeholder="tablets"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500/50"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-indigo-300 mb-2 block">Reorder Level</label>
                                <input
                                    type="number"
                                    name="reorderLevel"
                                    placeholder="20"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500/50"
                                />
                            </div>
                        </div>
                        {addState?.error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-200 rounded-lg text-sm">
                                {addState.error}
                            </div>
                        )}
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowAddForm(false)}
                                className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={addPending}
                                className="flex-1 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-white rounded-lg font-bold transition-colors disabled:opacity-50"
                            >
                                {addPending ? "Adding..." : "Add Item"}
                            </button>
                        </div>
                    </form>
                </GlassCard>
            )}

            {/* Inventory Table */}
            <GlassCard>
                <h2 className="text-xl font-bold text-white mb-4">All Items</h2>
                {loading ? (
                    <div className="text-center py-8 text-indigo-300">Loading...</div>
                ) : inventory.length === 0 ? (
                    <div className="text-center py-8 text-indigo-300">No items in inventory</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left py-3 px-4 text-sm font-bold text-indigo-300">Item Name</th>
                                    <th className="text-left py-3 px-4 text-sm font-bold text-indigo-300">Category</th>
                                    <th className="text-left py-3 px-4 text-sm font-bold text-indigo-300">Quantity</th>
                                    <th className="text-left py-3 px-4 text-sm font-bold text-indigo-300">Reorder Level</th>
                                    <th className="text-left py-3 px-4 text-sm font-bold text-indigo-300">Status</th>
                                    <th className="text-left py-3 px-4 text-sm font-bold text-indigo-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inventory.map((item, index) => (
                                    <motion.tr
                                        key={item.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: index * 0.02 }}
                                        className="border-b border-white/5 hover:bg-white/5"
                                    >
                                        <td className="py-3 px-4 text-white font-medium">{item.itemName}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${item.category === "MEDICINE" ? "bg-purple-500/20 text-purple-300" :
                                                    item.category === "EQUIPMENT" ? "bg-blue-500/20 text-blue-300" :
                                                        "bg-gray-500/20 text-gray-300"
                                                }`}>
                                                {item.category}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-white">
                                            {item.quantity} {item.unit}
                                        </td>
                                        <td className="py-3 px-4 text-indigo-300">{item.reorderLevel}</td>
                                        <td className="py-3 px-4">
                                            {item.quantity <= item.reorderLevel ? (
                                                <span className="flex items-center gap-1 text-red-300 text-sm">
                                                    <TrendingDown size={14} />
                                                    Low Stock
                                                </span>
                                            ) : (
                                                <span className="text-emerald-300 text-sm">In Stock</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <button
                                                onClick={() => setEditingItem(item)}
                                                className="flex items-center gap-1 px-3 py-1 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 rounded text-sm font-medium transition-colors"
                                            >
                                                <Edit size={14} />
                                                Update
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </GlassCard>

            {/* Update Stock Modal */}
            {editingItem && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setEditingItem(null)}>
                    <GlassCard className="max-w-md w-full mx-4" onClick={(e: any) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-white mb-4">Update Stock: {editingItem.itemName}</h3>
                        <form action={updateAction} className="space-y-4">
                            <input type="hidden" name="itemId" value={editingItem.id} />
                            <div>
                                <label className="text-sm font-medium text-indigo-300 mb-2 block">New Quantity</label>
                                <input
                                    type="number"
                                    name="quantity"
                                    defaultValue={editingItem.quantity}
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500/50"
                                />
                                <p className="text-xs text-indigo-400 mt-1">Current: {editingItem.quantity} {editingItem.unit}</p>
                            </div>
                            {updateState?.error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-200 rounded-lg text-sm">
                                    {updateState.error}
                                </div>
                            )}
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setEditingItem(null)}
                                    className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={updatePending}
                                    className="flex-1 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-white rounded-lg font-bold transition-colors disabled:opacity-50"
                                >
                                    {updatePending ? "Updating..." : "Update Stock"}
                                </button>
                            </div>
                        </form>
                    </GlassCard>
                </div>
            )}
        </div>
    );
}
