"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { revalidatePath } from "next/cache";

// ============================================
// LAB CRUD
// ============================================

export async function createLab(formData: FormData) {
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
        return { success: false, error: "Lab name is required" };
    }

    try {
        const existing = await prisma.lab.findUnique({ where: { name } });
        if (existing) {
            return { success: false, error: "A lab with this name already exists" };
        }

        const lab = await prisma.lab.create({
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
                action: "LAB_CREATE",
                entity: "LAB",
                entityId: lab.id,
                newValue: JSON.stringify({ name, description, location, phone, email }),
            },
        });

        revalidatePath("/admin/labs");
        return { success: true, message: "Lab created successfully", lab };
    } catch (error) {
        console.error("Error creating lab:", error);
        return { success: false, error: "Failed to create lab" };
    }
}

export async function updateLab(labId: string, formData: FormData) {
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
        return { success: false, error: "Lab name is required" };
    }

    try {
        const oldLab = await prisma.lab.findUnique({ where: { id: labId } });
        if (!oldLab) {
            return { success: false, error: "Lab not found" };
        }

        const lab = await prisma.lab.update({
            where: { id: labId },
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
                action: "LAB_UPDATE",
                entity: "LAB",
                entityId: labId,
                oldValue: JSON.stringify(oldLab),
                newValue: JSON.stringify(lab),
            },
        });

        revalidatePath("/admin/labs");
        revalidatePath(`/admin/labs/${labId}`);
        return { success: true, message: "Lab updated successfully" };
    } catch (error) {
        console.error("Error updating lab:", error);
        return { success: false, error: "Failed to update lab" };
    }
}

export async function deleteLab(labId: string) {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const lab = await prisma.lab.findUnique({ where: { id: labId } });
        if (!lab) {
            return { success: false, error: "Lab not found" };
        }

        await prisma.lab.update({
            where: { id: labId },
            data: { isActive: false },
        });

        await prisma.auditLog.create({
            data: {
                userId: user.userId,
                action: "LAB_DELETE",
                entity: "LAB",
                entityId: labId,
                oldValue: JSON.stringify(lab),
            },
        });

        revalidatePath("/admin/labs");
        return { success: true, message: "Lab deactivated successfully" };
    } catch (error) {
        console.error("Error deleting lab:", error);
        return { success: false, error: "Failed to delete lab" };
    }
}

export async function permanentlyDeleteLab(labId: string) {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }

    try {
        await prisma.lab.delete({ where: { id: labId } });

        await prisma.auditLog.create({
            data: {
                userId: user.userId,
                action: "LAB_PERMANENT_DELETE",
                entity: "LAB",
                entityId: labId,
            },
        });

        revalidatePath("/admin/labs");
        return { success: true, message: "Lab permanently deleted" };
    } catch (error) {
        console.error("Error permanently deleting lab:", error);
        return { success: false, error: "Failed to permanently delete lab" };
    }
}

export async function getAllLabs(includeInactive = false) {
    const user = await getCurrentUser();
    if (!user) return [];

    try {
        const labs = await prisma.lab.findMany({
            where: includeInactive ? undefined : { isActive: true },
            include: {
                _count: { select: { products: true } },
            },
            orderBy: { name: "asc" },
        });
        return labs;
    } catch (error) {
        console.error("Error fetching labs:", error);
        return [];
    }
}

export async function getLabById(labId: string) {
    const user = await getCurrentUser();
    if (!user) return null;

    try {
        const lab = await prisma.lab.findUnique({
            where: { id: labId },
            include: {
                products: {
                    orderBy: { name: "asc" },
                },
            },
        });
        return lab;
    } catch (error) {
        console.error("Error fetching lab:", error);
        return null;
    }
}

// ============================================
// LAB PRODUCT CRUD
// ============================================

export async function addLabProduct(labId: string, formData: FormData) {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const priceStr = formData.get("price") as string;
    const turnaroundTime = formData.get("turnaroundTime") as string;

    if (!name || !priceStr) {
        return { success: false, error: "Name and price are required" };
    }

    const price = parseFloat(priceStr);
    if (isNaN(price) || price < 0) {
        return { success: false, error: "Invalid price" };
    }

    try {
        const product = await prisma.labProduct.create({
            data: {
                labId,
                name,
                description: description || null,
                category: category || null,
                price,
                turnaroundTime: turnaroundTime || null,
            },
        });

        await prisma.auditLog.create({
            data: {
                userId: user.userId,
                action: "LAB_PRODUCT_ADD",
                entity: "LAB_PRODUCT",
                entityId: product.id,
                newValue: JSON.stringify({ labId, name, category, price }),
            },
        });

        revalidatePath(`/admin/labs/${labId}`);
        return { success: true, message: "Test/service added successfully", product };
    } catch (error) {
        console.error("Error adding lab product:", error);
        return { success: false, error: "Failed to add test/service" };
    }
}

export async function updateLabProduct(productId: string, formData: FormData) {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const priceStr = formData.get("price") as string;
    const turnaroundTime = formData.get("turnaroundTime") as string;
    const isActive = formData.get("isActive") === "true";

    if (!name || !priceStr) {
        return { success: false, error: "Name and price are required" };
    }

    const price = parseFloat(priceStr);
    if (isNaN(price) || price < 0) {
        return { success: false, error: "Invalid price" };
    }

    try {
        const oldProduct = await prisma.labProduct.findUnique({ where: { id: productId } });
        if (!oldProduct) {
            return { success: false, error: "Product not found" };
        }

        const product = await prisma.labProduct.update({
            where: { id: productId },
            data: {
                name,
                description: description || null,
                category: category || null,
                price,
                turnaroundTime: turnaroundTime || null,
                isActive,
            },
        });

        await prisma.auditLog.create({
            data: {
                userId: user.userId,
                action: "LAB_PRODUCT_UPDATE",
                entity: "LAB_PRODUCT",
                entityId: productId,
                oldValue: JSON.stringify(oldProduct),
                newValue: JSON.stringify(product),
            },
        });

        revalidatePath(`/admin/labs/${oldProduct.labId}`);
        return { success: true, message: "Test/service updated successfully" };
    } catch (error) {
        console.error("Error updating lab product:", error);
        return { success: false, error: "Failed to update test/service" };
    }
}

export async function deleteLabProduct(productId: string) {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const product = await prisma.labProduct.findUnique({ where: { id: productId } });
        if (!product) {
            return { success: false, error: "Product not found" };
        }

        await prisma.labProduct.delete({ where: { id: productId } });

        await prisma.auditLog.create({
            data: {
                userId: user.userId,
                action: "LAB_PRODUCT_DELETE",
                entity: "LAB_PRODUCT",
                entityId: productId,
                oldValue: JSON.stringify(product),
            },
        });

        revalidatePath(`/admin/labs/${product.labId}`);
        return { success: true, message: "Test/service deleted successfully" };
    } catch (error) {
        console.error("Error deleting lab product:", error);
        return { success: false, error: "Failed to delete test/service" };
    }
}
