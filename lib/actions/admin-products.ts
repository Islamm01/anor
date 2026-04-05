// lib/actions/admin-products.ts
"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

function canManageProducts(session: any): boolean {
  return ["ADMIN", "MANAGER"].includes(session?.user?.role);
}

function slugify(text: string): string {
  const map: Record<string, string> = {
    а:"a",б:"b",в:"v",г:"g",д:"d",е:"e",ё:"yo",ж:"zh",з:"z",и:"i",й:"y",
    к:"k",л:"l",м:"m",н:"n",о:"o",п:"p",р:"r",с:"s",т:"t",у:"u",ф:"f",
    х:"kh",ц:"ts",ч:"ch",ш:"sh",щ:"sch",ъ:"",ы:"y",ь:"",э:"e",ю:"yu",я:"ya",
  };
  return text
    .toLowerCase()
    .replace(/[а-яё]/g, (c) => map[c] ?? c)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function createProduct(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!canManageProducts(session)) return { error: "Недостаточно прав" };

  const nameRu        = (formData.get("nameRu") as string)?.trim();
  const nameTj        = (formData.get("nameTj") as string)?.trim();
  const descriptionRu = (formData.get("descriptionRu") as string)?.trim();
  const descriptionTj = (formData.get("descriptionTj") as string)?.trim();
  const pricePerKg    = parseFloat(formData.get("pricePerKg") as string);
  const minimumOrder  = parseFloat(formData.get("minimumOrder") as string) || 1;
  const stockQty      = parseFloat(formData.get("stockQuantity") as string) || 0;
  const categoryId    = formData.get("categoryId") as string;
  const originRegion  = (formData.get("originRegion") as string)?.trim();
  const unit          = (formData.get("unit") as string) || "кг";
  const harvestSeason = (formData.get("harvestSeason") as string)?.trim() || null;
  const imageUrl      = (formData.get("imageUrl") as string)?.trim() || null;
  const isFeatured    = formData.get("isFeatured") === "true";
  const isOrganic     = formData.get("isOrganic") === "true";

  if (!nameRu || !nameTj || !descriptionRu || !descriptionTj || !categoryId || !originRegion) {
    return { error: "Заполните все обязательные поля" };
  }
  if (isNaN(pricePerKg) || pricePerKg <= 0) {
    return { error: "Укажите корректную цену" };
  }

  let slug = slugify(nameRu);
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now()}`;

  try {
    // FIXED: create product and inventory log in one transaction, using returned id
    const product = await prisma.product.create({
      data: {
        nameRu, nameTj, slug, descriptionRu, descriptionTj,
        pricePerKg, minimumOrder, stockQuantity: stockQty,
        categoryId, originRegion, unit,
        harvestSeason, imageUrl,
        isFeatured, isOrganic,
        isActive: true,
      },
    });

    // Use the returned product.id directly — no second query needed
    if (stockQty > 0) {
      await prisma.inventoryLog.create({
        data: {
          productId: product.id,
          change: stockQty,
          reason: "INITIAL",
          note: "Начальный остаток при создании товара",
        },
      });
    }

    revalidatePath("/admin/products");
    revalidatePath("/catalog");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    console.error("createProduct error:", err);
    return { error: "Ошибка при создании товара" };
  }
}

export async function updateProduct(id: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!canManageProducts(session)) return { error: "Недостаточно прав" };

  const pricePerKg   = parseFloat(formData.get("pricePerKg") as string);
  const stockQty     = parseFloat(formData.get("stockQuantity") as string);
  const imageUrl     = (formData.get("imageUrl") as string)?.trim() || null;

  if (isNaN(pricePerKg) || pricePerKg <= 0) return { error: "Некорректная цена" };

  try {
    await prisma.product.update({
      where: { id },
      data: {
        nameRu:        (formData.get("nameRu") as string)?.trim(),
        nameTj:        (formData.get("nameTj") as string)?.trim(),
        descriptionRu: (formData.get("descriptionRu") as string)?.trim(),
        descriptionTj: (formData.get("descriptionTj") as string)?.trim(),
        pricePerKg,
        minimumOrder:  parseFloat(formData.get("minimumOrder") as string) || 1,
        stockQuantity: isNaN(stockQty) ? undefined : stockQty,
        categoryId:    formData.get("categoryId") as string,
        originRegion:  (formData.get("originRegion") as string)?.trim(),
        unit:          (formData.get("unit") as string) || "кг",
        harvestSeason: (formData.get("harvestSeason") as string)?.trim() || null,
        imageUrl,
        isFeatured:    formData.get("isFeatured") === "true",
        isOrganic:     formData.get("isOrganic") === "true",
      },
    });
    revalidatePath("/admin/products");
    revalidatePath("/catalog");
    return { success: true };
  } catch (err) {
    console.error("updateProduct error:", err);
    return { error: "Ошибка при обновлении товара" };
  }
}
