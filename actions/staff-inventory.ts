"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function getInventory() {
    const items = await prisma.inventory.findMany({
        orderBy: { itemName: 'asc' }
    });

    return items;
}

export async function updateStock(prevState: any, formData: FormData) {
    const currentUser = await getSessionUser();
    if (!currentUser || !currentUser.role.startsWith("STAFF")) {
        return { success: false, error: "Unauthorized" };
    }

    const itemId = formData.get("itemId") as string;
    const quantity = formData.get("quantity") as string;

    if (!itemId || !quantity) {
        return { success: false, error: "Item and quantity are required" };
    }

    try {
        await prisma.inventory.update({
            where: { id: itemId },
            data: {
                quantity: parseInt(quantity),
                lastRestocked: new Date()
            }
        });

        revalidatePath("/staff/inventory");
        return { success: true, message: "Stock updated successfully" };
    } catch (error) {
        console.error("Error updating stock:", error);
        return { success: false, error: "Failed to update stock" };
    }
}

export async function addInventoryItem(prevState: any, formData: FormData) {
    const currentUser = await getSessionUser();
    if (!currentUser || !currentUser.role.startsWith("STAFF")) {
        return { success: false, error: "Unauthorized" };
    }

    const itemName = formData.get("itemName") as string;
    const category = formData.get("category") as string;
    const quantity = formData.get("quantity") as string;
    const unit = formData.get("unit") as string;
    const reorderLevel = formData.get("reorderLevel") as string;

    if (!itemName || !category || !quantity || !unit || !reorderLevel) {
        return { success: false, error: "All fields are required" };
    }

    try {
        await prisma.inventory.create({
            data: {
                itemName,
                category,
                quantity: parseInt(quantity),
                unit,
                reorderLevel: parseInt(reorderLevel)
            }
        });

        revalidatePath("/staff/inventory");
        return { success: true, message: "Item added successfully" };
    } catch (error) {
        console.error("Error adding inventory item:", error);
        return { success: false, error: "Failed to add item" };
    }
}

export async function getLowStockItems() {
    // Removed failing Prisma native comparison as it's not supported
    // The manual filter below correctly handles this.

    // Manual filter since Prisma doesn't support field comparison in where clause
    const allItems = await prisma.inventory.findMany();
    const lowStock = allItems.filter(item => item.quantity <= item.reorderLevel);

    return lowStock;
}
