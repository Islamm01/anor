// app/api/telegram/webhook/route.ts
// Handles Telegram callback_query when manager presses order status buttons

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { answerCallbackQuery, updateOrderMessage, TelegramOrderPayload } from "@/lib/telegram/bot";

// Verify the request comes from Telegram using a secret token
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  // Optional: verify secret header
  if (WEBHOOK_SECRET) {
    const secret = req.headers.get("x-telegram-bot-api-secret-token");
    if (secret !== WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false });
  }

  // Handle callback_query (button press)
  if (body.callback_query) {
    const query = body.callback_query;
    const callbackQueryId: string = query.id;
    const data: string = query.data ?? "";

    // Expected format: "status:<orderId>:<newStatus>"
    const [prefix, orderId, newStatus] = data.split(":");

    if (prefix !== "status" || !orderId || !newStatus) {
      await answerCallbackQuery(callbackQueryId, "Неверная команда");
      return NextResponse.json({ ok: true });
    }

    try {
      // Update order status in DB
      const order = await prisma.order.update({
        where: { id: orderId },
        data: {
          status: newStatus as any,
          updatedAt: new Date(),
          ...(newStatus === "DELIVERED" ? { completedAt: new Date() } : {}),
        },
        include: {
          items: true,
        },
      });

      // Log the status change
      await prisma.orderStatusLog.create({
        data: {
          orderId: order.id,
          status: newStatus as any,
          note: "Обновлено через Telegram",
          createdBy: "telegram_bot",
        },
      });

      // Build payload to update the Telegram message
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

      // Edit the Telegram message to reflect new status
      if (order.tgMessageId) {
        await updateOrderMessage(order.tgMessageId, payload);
      }

      const statusRu: Record<string, string> = {
        ACCEPTED:           "✅ Принят",
        PREPARING:          "🔄 Готовится",
        READY_FOR_DELIVERY: "📦 Готов к доставке",
        OUT_FOR_DELIVERY:   "🚚 Доставляется",
        DELIVERED:          "🎉 Доставлен",
        CANCELLED:          "❌ Отменён",
      };

      await answerCallbackQuery(callbackQueryId, statusRu[newStatus] ?? "Статус обновлён");
    } catch (err) {
      console.error("ANJIR Telegram webhook error:", err);
      await answerCallbackQuery(callbackQueryId, "⚠️ Ошибка обновления");
    }
  }

  return NextResponse.json({ ok: true });
}
