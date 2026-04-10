// lib/telegram/bot.ts
// Anjir Agro Platform — Telegram Bot Integration

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID!;
const BASE_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

export interface TelegramOrderPayload {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress?: string | null;
  notes?: string | null;
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    unit: string;
  }>;
  totalAmount: number;
  status: string;
}

const STATUS_EMOJI: Record<string, string> = {
  NEW_ORDER:          "🆕",
  ACCEPTED:           "✅",
  PREPARING:          "🔄",
  READY_FOR_DELIVERY: "📦",
  OUT_FOR_DELIVERY:   "🚚",
  DELIVERED:          "🎉",
  CANCELLED:          "❌",
};

const STATUS_RU: Record<string, string> = {
  NEW_ORDER:          "Новый заказ",
  ACCEPTED:           "Принят",
  PREPARING:          "Готовится",
  READY_FOR_DELIVERY: "Готов к доставке",
  OUT_FOR_DELIVERY:   "Доставляется",
  DELIVERED:          "Доставлен",
  CANCELLED:          "Отменён",
};

function buildOrderMessage(order: TelegramOrderPayload): string {
  const emoji = STATUS_EMOJI[order.status] ?? "📋";
  const statusText = STATUS_RU[order.status] ?? order.status;

  const itemLines = order.items
    .map((i) => `  • ${i.productName}: ${i.quantity} ${i.unit} × ${i.unitPrice.toFixed(2)} = ${i.totalPrice.toFixed(2)} сом.`)
    .join("\n");

  return [
    `${emoji} <b>Anjir — ${statusText.toUpperCase()}</b>`,
    ``,
    `🔢 <b>Заказ №:</b> <code>${order.orderNumber}</code>`,
    ``,
    `📦 <b>Состав заказа:</b>`,
    itemLines,
    ``,
    `💰 <b>ИТОГО:</b> ${order.totalAmount.toFixed(2)} сомони`,
    ``,
    `👤 <b>Клиент:</b> ${order.customerName}`,
    `📞 <b>Телефон:</b> ${order.customerPhone}`,
    order.deliveryAddress ? `📍 <b>Адрес:</b> ${order.deliveryAddress}` : "",
    order.notes ? `💬 <b>Комментарий:</b> ${order.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function buildInlineKeyboard(orderId: string, currentStatus: string) {
  // Only show relevant next-action buttons
  const allButtons = [
    { text: "✅ Принять",        callback_data: `status:${orderId}:ACCEPTED` },
    { text: "🔄 Готовится",      callback_data: `status:${orderId}:PREPARING` },
    { text: "📦 Готов",          callback_data: `status:${orderId}:READY_FOR_DELIVERY` },
    { text: "🚚 Доставляется",   callback_data: `status:${orderId}:OUT_FOR_DELIVERY` },
    { text: "🎉 Доставлен",      callback_data: `status:${orderId}:DELIVERED` },
    { text: "❌ Отменить",       callback_data: `status:${orderId}:CANCELLED` },
  ];

  const skipStatuses: Record<string, string[]> = {
    NEW_ORDER:          ["PREPARING", "READY_FOR_DELIVERY", "OUT_FOR_DELIVERY", "DELIVERED"],
    ACCEPTED:           ["ACCEPTED"],
    PREPARING:          ["ACCEPTED", "PREPARING"],
    READY_FOR_DELIVERY: ["ACCEPTED", "PREPARING", "READY_FOR_DELIVERY"],
    OUT_FOR_DELIVERY:   ["ACCEPTED", "PREPARING", "READY_FOR_DELIVERY", "OUT_FOR_DELIVERY"],
    DELIVERED:          ["ACCEPTED", "PREPARING", "READY_FOR_DELIVERY", "OUT_FOR_DELIVERY", "DELIVERED"],
    CANCELLED:          ["ACCEPTED", "PREPARING", "READY_FOR_DELIVERY", "OUT_FOR_DELIVERY", "DELIVERED"],
  };

  const skip = skipStatuses[currentStatus] ?? [];
  const visible = allButtons.filter((b) => {
    const targetStatus = b.callback_data.split(":")[2];
    return !skip.includes(targetStatus);
  });

  // Group buttons into rows of 2
  const rows: typeof allButtons[] = [];
  for (let i = 0; i < visible.length; i += 2) {
    rows.push(visible.slice(i, i + 2));
  }

  return { inline_keyboard: rows };
}

/** Send a new order notification to the admin Telegram chat */
export async function sendOrderNotification(order: TelegramOrderPayload): Promise<string | null> {
  if (!BOT_TOKEN || !ADMIN_CHAT_ID) {
    console.warn("ANJIR Telegram: BOT_TOKEN or ADMIN_CHAT_ID not set");
    return null;
  }

  const text = buildOrderMessage(order);
  const reply_markup = buildInlineKeyboard(order.orderId, order.status);

  try {
    const res = await fetch(`${BASE_URL}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: ADMIN_CHAT_ID,
        text,
        parse_mode: "HTML",
        reply_markup,
      }),
    });

    const data = await res.json();
    if (data.ok) {
      return String(data.result.message_id);
    }
    console.error("ANJIR Telegram sendMessage error:", data);
    return null;
  } catch (err) {
    console.error("ANJIR Telegram network error:", err);
    return null;
  }
}

/** Edit an existing Telegram message when order status changes */
export async function updateOrderMessage(
  messageId: string,
  order: TelegramOrderPayload
): Promise<boolean> {
  if (!BOT_TOKEN || !ADMIN_CHAT_ID) return false;

  const text = buildOrderMessage(order);
  const reply_markup = buildInlineKeyboard(order.orderId, order.status);

  try {
    const res = await fetch(`${BASE_URL}/editMessageText`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: ADMIN_CHAT_ID,
        message_id: Number(messageId),
        text,
        parse_mode: "HTML",
        reply_markup,
      }),
    });

    const data = await res.json();
    return data.ok;
  } catch {
    return false;
  }
}

/** Answer a callback query (removes loading spinner in Telegram) */
export async function answerCallbackQuery(
  callbackQueryId: string,
  text?: string
): Promise<void> {
  if (!BOT_TOKEN) return;
  await fetch(`${BASE_URL}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callback_query_id: callbackQueryId, text }),
  });
}

/** Register the webhook with Telegram (call once during setup) */
// AFTER:
export async function setWebhook(webhookUrl: string): Promise<boolean> {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const res = await fetch(`${BASE_URL}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: webhookUrl,
      allowed_updates: ["callback_query"],
      // Tell Telegram to send this secret in every request header.
      // Must match TELEGRAM_WEBHOOK_SECRET in your .env exactly.
      ...(secret ? { secret_token: secret } : {}),
    }),
  });
  const data = await res.json();
  return data.ok;
}