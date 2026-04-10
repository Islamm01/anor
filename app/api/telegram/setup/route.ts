// app/api/telegram/setup/route.ts
import { NextRequest, NextResponse } from "next/server";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const AUTH_SECRET = process.env.NEXTAUTH_SECRET;

export async function GET(req: NextRequest) {
  // Auth check
  const authHeader  = req.headers.get("authorization");
  const querySecret = req.nextUrl.searchParams.get("secret");
  const provided    = authHeader?.replace("Bearer ", "") ?? querySecret;

  if (!AUTH_SECRET || provided !== AUTH_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!BOT_TOKEN) {
    return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN not set" }, { status: 500 });
  }

  const appUrl = process.env.NEXTAUTH_URL ?? `https://${process.env.VERCEL_URL}`;
  if (!appUrl || appUrl === "https://undefined") {
    return NextResponse.json({ error: "NEXTAUTH_URL not set" }, { status: 500 });
  }

  const webhookUrl = `${appUrl}/api/telegram/webhook`;

  // Register webhook WITHOUT a secret_token so Telegram doesn't need to send one.
  // The HTTPS URL itself is the security boundary.
  const res  = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url:             webhookUrl,
      allowed_updates: ["callback_query", "message"],
      drop_pending_updates: true,   // clear any queued updates from before
    }),
  });

  const data = await res.json();

  return NextResponse.json({
    ok:         data.ok,
    webhookUrl,
    telegram:   data,
  });
}