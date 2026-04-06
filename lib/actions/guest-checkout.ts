// lib/actions/guest-checkout.ts
// Anjir Agro Platform — Guest Checkout (no auth required)
"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { sendOrderNotification } from "@/lib/telegram/bot";
import { cookies } from "next/headers";

const GuestCheckoutSchema = z.object({
  customerName: z.string().min(2, "Введите ФИО (минимум 2 символа)"),
  customerPhone: z.string().min(7, "Введите корректный номер телефона"),
  deliveryAddress: z.string().min(5, "Введите адрес доставки"),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string(),
      productName: z.string(),
      quantity: z.number().positive(),
      unitPrice: z.number().positive(),
      unit: z.string(),
    })
  ).min(1, "Корзина пуста"),
});

function generateOrderNumber(): string {
  const date = new Date();
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 100000).toString().padStart(5, "0");
  return `ANJIR-${yy}${mm}${dd}-${rand}`;
}

function detectOrderType(totalKg: number): "RETAIL" | "WHOLESALE" | "BULK" | "INDUSTRIAL" {
  if (totalKg >= 1000) return "INDUSTRIAL";
  if (totalKg >= 600) return "BULK";
  if (totalKg >= 20) return "WHOLESALE";
  return "RETAIL";
}

export async function placeGuestOrder(formData: FormData) {
  // Parse items from cookie/session (client sends as JSON)
  const rawItems = formData.get("items");
  let parsedItems: any[] = [];
  try {
    parsedItems = JSON.parse(rawItems as string);
  } catch {
    return { error: "Ошибка данных корзины" };
  }

  const input = {
    customerName: (formData.get("customerName") as string)?.trim(),
    customerPhone: (formData.get("customerPhone") as string)?.trim(),
    deliveryAddress: (formData.get("deliveryAddress") as string)?.trim(),
    notes: (formData.get("notes") as string)?.trim() || undefined,
    items: parsedItems,
  };

  const parsed = GuestCheckoutSchema.safeParse(input);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message;
    return { error: firstError ?? "Проверьте введённые данные" };
  }

  const { customerName, customerPhone, deliveryAddress, notes, items } = parsed.data;

  // Fetch current prices from DB to avoid tampering
  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
  });

  const productMap = new Map(products.map((p) => [p.id, p]));

  let totalAmount = 0;
  const orderItems = items.map((item) => {
    const product = productMap.get(item.productId);
    if (!product) throw new Error(`Продукт не найден: ${item.productId}`);
    const unitPrice = Number(product.pricePerKg);
    const totalPrice = unitPrice * item.quantity;
    totalAmount += totalPrice;
    return {
      productId: item.productId,
      productName: product.nameRu,
      quantity: item.quantity,
      unitPrice,
      totalPrice,
      unit: product.unit,
    };
  });

  const totalKg = items.reduce((sum, i) => sum + i.quantity, 0);
  const orderType = detectOrderType(totalKg);
  const orderNumber = generateOrderNumber();

  try {
    const order = await prisma.order.create({
      data: {
        orderNumber,
        status: "NEW_ORDER",
        orderType,
        deliveryMethod: "LOCAL_DELIVERY",
        totalAmount,
        customerName,
        customerPhone,
        deliveryAddress,
        notes,
        items: {
          create: orderItems,
        },
        statusLogs: {
          create: {
            status: "NEW_ORDER",
            note: "Заказ создан гостем",
            createdBy: "guest",
          },
        },
      },
      include: { items: true },
    });

    // Send Telegram notification (non-blocking)
    sendOrderNotification({
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
    }).then(async (tgMessageId) => {
      if (tgMessageId) {
        await prisma.order.update({
          where: { id: order.id },
          data: { tgMessageId, tgNotifiedAt: new Date() },
        });
      }
    });

    return { success: true, orderNumber: order.orderNumber, orderId: order.id };
  } catch (err) {
    console.error("ANJIR guest checkout error:", err);
    return { error: "Ошибка создания заказа. Пожалуйста, попробуйте ещё раз." };
  }
}
