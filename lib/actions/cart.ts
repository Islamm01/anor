// lib/actions/cart.ts
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

/** Get cart items for the current logged-in user */
export async function getCart() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return [];

  return prisma.cartItem.findMany({
    where: { userId: (session.user as any).id },
    include: {
      product: {
        select: {
          id: true, nameRu: true, nameTj: true, slug: true,
          pricePerKg: true, unit: true, imageUrl: true,
          stockQuantity: true, isActive: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

/** Get number of items in cart for the current user (for Navbar badge) */
export async function getCartCount(): Promise<number> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return 0;

  const result = await prisma.cartItem.aggregate({
    where: { userId: (session.user as any).id },
    _sum: { quantity: true },
  });

  return Number(result._sum.quantity ?? 0);
}

/** Add or update a cart item for the current user */
export async function upsertCartItem(productId: string, quantity: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Не авторизован");

  const userId = (session.user as any).id;

  if (quantity <= 0) {
    await prisma.cartItem.deleteMany({ where: { userId, productId } });
    return;
  }

  await prisma.cartItem.upsert({
    where: { userId_productId: { userId, productId } },
    update: { quantity },
    create: { userId, productId, quantity },
  });
}

/** Remove one item from the cart */
export async function removeCartItem(productId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Не авторизован");

  await prisma.cartItem.deleteMany({
    where: { userId: (session.user as any).id, productId },
  });
}

/** Clear the entire cart for the current user */
export async function clearCart() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Не авторизован");

  await prisma.cartItem.deleteMany({
    where: { userId: (session.user as any).id },
  });
}
