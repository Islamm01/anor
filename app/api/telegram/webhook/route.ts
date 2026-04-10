// app/api/telegram/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { answerCallbackQuery, updateOrderMessage, TelegramOrderPayload } from "@/lib/telegram/bot";

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false });
  }

  // Handle callback_query (button press)
  if (body.callback_query) {
    const query           = body.callback_query;
    const callbackQueryId = query.id as string;
    const data            = (query.data ?? "") as string;

    // Expected format: "status:<orderId>:<newStatus>"
    const parts     = data.split(":");
    const prefix    = parts[0];
    const orderId   = parts[1];
    const newStatus = parts[2];

    if (prefix !== "status" || !orderId || !newStatus) {
      await answerCallbackQuery(callbackQueryId, "Неверная команда");
      return NextResponse.json({ ok: true });
    }

    try {
      const order = await prisma.order.update({
        where: { id: orderId },
        data: {
          status: newStatus as any,
          ...(newStatus === "DELIVERED" ? { completedAt: new Date() } : {}),
        },
        include: { items: true },
      });

      await prisma.orderStatusLog.create({
        data: {
          orderId:   order.id,
          status:    newStatus as any,
          note:      "Обновлено через Telegram",
          createdBy: "telegram_bot",
        },
      });

      const payload: TelegramOrderPayload = {
        orderId:         order.id,
        orderNumber:     order.orderNumber,
        customerName:    order.customerName,
        customerPhone:   order.customerPhone,
        deliveryAddress: order.deliveryAddress,
        notes:           order.notes,
        totalAmount:     Number(order.totalAmount),
        status:          order.status,
        items: order.items.map((i) => ({
          productName: i.productName,
          quantity:    Number(i.quantity),
          unitPrice:   Number(i.unitPrice),
          totalPrice:  Number(i.totalPrice),
          unit:        i.unit,
        })),
      };

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
      console.error("[Anjir] Telegram webhook error:", err);
      await answerCallbackQuery(callbackQueryId, "⚠️ Ошибка обновления");
    }
  }

  return NextResponse.json({ ok: true });
}