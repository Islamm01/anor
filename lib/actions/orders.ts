// lib/actions/orders.ts
"use server";

import prisma from "@/lib/prisma";

/** Fetch a single order by its human-readable order number */
export async function getOrderByNumber(orderNumber: string) {
  return prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: {
        include: {
          product: {
            select: { nameRu: true, nameTj: true, imageUrl: true, slug: true },
          },
        },
      },
      statusLogs: {
        orderBy: { createdAt: "asc" },
      },
      courier: {
        include: { user: { select: { name: true, phone: true } } },
      },
    },
  });
}

/** Get all orders for a logged-in user */
export async function getUserOrders(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    include: {
      items: { select: { productName: true, quantity: true, unit: true, totalPrice: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}
