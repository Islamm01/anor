// lib/actions/admin-orders.ts
"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { updateOrderMessage, TelegramOrderPayload } from "@/lib/telegram/bot";

function canManageOrders(session: any): boolean {
  const role = session?.user?.role;
  return ["ADMIN", "MANAGER"].includes(role);
}

export async function updateOrderStatus(orderId: string, newStatus: string) {
  const session = await getServerSession(authOptions);
  if (!canManageOrders(session)) throw new Error("Unauthorized");

  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: newStatus as any,
      ...(newStatus === "DELIVERED" ? { completedAt: new Date() } : {}),
    },
    include: { items: true },
  });

  // Log status change
  await prisma.orderStatusLog.create({
    data: {
      orderId: order.id,
      status: newStatus as any,
      note: "Обновлено из панели администратора",
      createdBy: (session?.user as any)?.email ?? "admin",
    },
  });

  // Update Telegram message if exists
  if (order.tgMessageId) {
    const payload: TelegramOrderPayload = {
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      deliveryAddress: order.deliveryAddress,
      notes: order.notes,
      totalAmount: Number(order.totalAmount),
      status: order.status,
      items: order.items.map((i) => ({
        productName: i.productName,
        quantity: Number(i.quantity),
        unitPrice: Number(i.unitPrice),
        totalPrice: Number(i.totalPrice),
        unit: i.unit,
      })),
    };
    await updateOrderMessage(order.tgMessageId, payload);
  }

  revalidatePath("/admin/orders");
  revalidatePath("/admin/dashboard");
}

export async function assignCourier(orderId: string, courierId: string) {
  const session = await getServerSession(authOptions);
  if (!canManageOrders(session)) throw new Error("Unauthorized");

  await prisma.order.update({
    where: { id: orderId },
    data: { courierId },
  });

  revalidatePath("/admin/orders");
}
