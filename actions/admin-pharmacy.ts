"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { revalidatePath } from "next/cache";

// ============================================
// PHARMACY CRUD
// ============================================

export async function createPharmacy(formData: FormData) {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const location = formData.get("location") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;

    if (!name) {
        return { success: false, error: "Pharmacy name is required" };
    }

    try {
        const existing = await prisma.pharmacy.findUnique({ where: { name } });
        if (existing) {
            return { success: false, error: "A pharmacy with this name already exists" };
        }

        const pharmacy = await prisma.pharmacy.create({
            data: {
                name,
                description: description || null,
                location: location || null,
                phone: phone || null,
                email: email || null,
                createdBy: user.userId,
            },
        });

        await prisma.auditLog.create({
            data: {
                userId: user.userId,
                action: "PHARMACY_CREATE",
                entity: "PHARMACY",
                entityId: pharmacy.id,
                newValue: JSON.stringify({ name, description, location, phone, email }),
            },
        });

        revalidatePath("/admin/pharmacy");
        return { success: true, message: "Pharmacy created successfully", pharmacy };
    } catch (error) {
        console.error("Error creating pharmacy:", error);
        return { success: false, error: "Failed to create pharmacy" };
    }
}

export async function updatePharmacy(pharmacyId: string, formData: FormData) {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const location = formData.get("location") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;
    const isActive = formData.get("isActive") === "true";

    if (!name) {
        return { success: false, error: "Pharmacy name is required" };
    }

    try {
        const oldPharmacy = await prisma.pharmacy.findUnique({ where: { id: pharmacyId } });
        if (!oldPharmacy) {
            return { success: false, error: "Pharmacy not found" };
        }

        const pharmacy = await prisma.pharmacy.update({
            where: { id: pharmacyId },
            data: {
                name,
                description: description || null,
                location: location || null,
                phone: phone || null,
                email: email || null,
                isActive,
            },
        });

        await prisma.auditLog.create({
            data: {
                userId: user.userId,
                action: "PHARMACY_UPDATE",
                entity: "PHARMACY",
                entityId: pharmacyId,
                oldValue: JSON.stringify(oldPharmacy),
                newValue: JSON.stringify(pharmacy),
            },
        });

        revalidatePath("/admin/pharmacy");
        revalidatePath(`/admin/pharmacy/${pharmacyId}`);
        return { success: true, message: "Pharmacy updated successfully" };
    } catch (error) {
        console.error("Error updating pharmacy:", error);
        return { success: false, error: "Failed to update pharmacy" };
    }
}

export async function deletePharmacy(pharmacyId: string) {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const pharmacy = await prisma.pharmacy.findUnique({ where: { id: pharmacyId } });
        if (!pharmacy) {
            return { success: false, error: "Pharmacy not found" };
        }

        await prisma.pharmacy.update({
            where: { id: pharmacyId },
            data: { isActive: false },
        });

        await prisma.auditLog.create({
            data: {
                userId: user.userId,
                action: "PHARMACY_DELETE",
                entity: "PHARMACY",
                entityId: pharmacyId,
                oldValue: JSON.stringify(pharmacy),
            },
        });

        revalidatePath("/admin/pharmacy");
        return { success: true, message: "Pharmacy deactivated successfully" };
    } catch (error) {
        console.error("Error deleting pharmacy:", error);
        return { success: false, error: "Failed to delete pharmacy" };
    }
}

export async function permanentlyDeletePharmacy(pharmacyId: string) {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }

    try {
        await prisma.pharmacy.delete({ where: { id: pharmacyId } });

        await prisma.auditLog.create({
            data: {
                userId: user.userId,
                action: "PHARMACY_PERMANENT_DELETE",
                entity: "PHARMACY",
                entityId: pharmacyId,
            },
        });

        revalidatePath("/admin/pharmacy");
        return { success: true, message: "Pharmacy permanently deleted" };
    } catch (error) {
        console.error("Error permanently deleting pharmacy:", error);
        return { success: false, error: "Failed to permanently delete pharmacy" };
    }
}

export async function getAllPharmacies(includeInactive = false) {
    const user = await getCurrentUser();
    if (!user) return [];

    try {
        const pharmacies = await prisma.pharmacy.findMany({
            where: includeInactive ? undefined : { isActive: true },
            include: {
                _count: { select: { products: true } },
            },
            orderBy: { name: "asc" },
        });
        return pharmacies;
    } catch (error) {
        console.error("Error fetching pharmacies:", error);
        return [];
    }
}

export async function getPharmacyById(pharmacyId: string) {
    const user = await getCurrentUser();
    if (!user) return null;

    try {
        const pharmacy = await prisma.pharmacy.findUnique({
            where: { id: pharmacyId },
            include: {
                products: {
                    orderBy: { name: "asc" },
                },
            },
        });
        return pharmacy;
    } catch (error) {
        console.error("Error fetching pharmacy:", error);
        return null;
    }
}

// ============================================
// PHARMACY PRODUCT CRUD
// ============================================

export async function addPharmacyProduct(pharmacyId: string, formData: FormData) {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const manufacturer = formData.get("manufacturer") as string;
    const priceStr = formData.get("price") as string;
    const stockStr = formData.get("stock") as string;
    const unit = formData.get("unit") as string;

    if (!name || !priceStr) {
        return { success: false, error: "Name and price are required" };
    }

    const price = parseFloat(priceStr);
    if (isNaN(price) || price < 0) {
        return { success: false, error: "Invalid price" };
    }

    const stock = stockStr ? parseInt(stockStr) : 0;

    try {
        const product = await prisma.pharmacyProduct.create({
            data: {
                pharmacyId,
                name,
                description: description || null,
                category: category || null,
                manufacturer: manufacturer || null,
                price,
                stock,
                unit: unit || null,
            },
        });

        await prisma.auditLog.create({
            data: {
                userId: user.userId,
                action: "PHARMACY_PRODUCT_ADD",
                entity: "PHARMACY_PRODUCT",
                entityId: product.id,
                newValue: JSON.stringify({ pharmacyId, name, category, price, stock }),
            },
        });

        revalidatePath(`/admin/pharmacy/${pharmacyId}`);
        return { success: true, message: "Product added successfully", product };
    } catch (error) {
        console.error("Error adding pharmacy product:", error);
        return { success: false, error: "Failed to add product" };
    }
}

export async function updatePharmacyProduct(productId: string, formData: FormData) {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const manufacturer = formData.get("manufacturer") as string;
    const priceStr = formData.get("price") as string;
    const stockStr = formData.get("stock") as string;
    const unit = formData.get("unit") as string;
    const isActive = formData.get("isActive") === "true";

    if (!name || !priceStr) {
        return { success: false, error: "Name and price are required" };
    }

    const price = parseFloat(priceStr);
    if (isNaN(price) || price < 0) {
        return { success: false, error: "Invalid price" };
    }

    const stock = stockStr ? parseInt(stockStr) : 0;

    try {
        const oldProduct = await prisma.pharmacyProduct.findUnique({ where: { id: productId } });
        if (!oldProduct) {
            return { success: false, error: "Product not found" };
        }

        const product = await prisma.pharmacyProduct.update({
            where: { id: productId },
            data: {
                name,
                description: description || null,
                category: category || null,
                manufacturer: manufacturer || null,
                price,
                stock,
                unit: unit || null,
                isActive,
            },
        });

        await prisma.auditLog.create({
            data: {
                userId: user.userId,
                action: "PHARMACY_PRODUCT_UPDATE",
                entity: "PHARMACY_PRODUCT",
                entityId: productId,
                oldValue: JSON.stringify(oldProduct),
                newValue: JSON.stringify(product),
            },
        });

        revalidatePath(`/admin/pharmacy/${oldProduct.pharmacyId}`);
        return { success: true, message: "Product updated successfully" };
    } catch (error) {
        console.error("Error updating pharmacy product:", error);
        return { success: false, error: "Failed to update product" };
    }
}

export async function deletePharmacyProduct(productId: string) {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const product = await prisma.pharmacyProduct.findUnique({ where: { id: productId } });
        if (!product) {
            return { success: false, error: "Product not found" };
        }

        await prisma.pharmacyProduct.delete({ where: { id: productId } });

        await prisma.auditLog.create({
            data: {
                userId: user.userId,
                action: "PHARMACY_PRODUCT_DELETE",
                entity: "PHARMACY_PRODUCT",
                entityId: productId,
                oldValue: JSON.stringify(product),
            },
        });

        revalidatePath(`/admin/pharmacy/${product.pharmacyId}`);
        return { success: true, message: "Product deleted successfully" };
    } catch (error) {
        console.error("Error deleting pharmacy product:", error);
        return { success: false, error: "Failed to delete product" };
    }
}
