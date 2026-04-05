// lib/actions/products.ts
"use server";

import prisma from "@/lib/prisma";

export async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { isFeatured: true, isActive: true },
    include: { category: { select: { nameRu: true, nameTj: true } } },
    orderBy: { createdAt: "desc" },
    take: 6,
  });
}

export async function getProducts(options?: {
  categorySlug?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const { categorySlug, search, page = 1, limit = 12 } = options ?? {};
  const where: any = { isActive: true };

  if (categorySlug) where.category = { slug: categorySlug };

  if (search) {
    where.OR = [
      { nameRu: { contains: search, mode: "insensitive" } },
      { nameTj: { contains: search, mode: "insensitive" } },
      { originRegion: { contains: search, mode: "insensitive" } },
    ];
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: { select: { nameRu: true, nameTj: true, slug: true } } },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    total,
    totalPages: Math.ceil(total / limit), // fixed: was "pages"
  };
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });
}

export async function getCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: { where: { isActive: true } } } } },
  });
}

export async function toggleProductStatus(id: string, isActive: boolean) {
  await prisma.product.update({ where: { id }, data: { isActive } });
}

export async function updateStock(id: string, quantity: number, reason: string) {
  return prisma.$transaction([
    prisma.product.update({ where: { id }, data: { stockQuantity: quantity } }),
    prisma.inventoryLog.create({
      data: { productId: id, change: quantity, reason: reason as any, note: "Ручная корректировка" },
    }),
  ]);
}
