// app/api/telegram/setup/route.ts
// GET this endpoint once after deployment to register the webhook with Telegram

import { NextRequest, NextResponse } from "next/server";
import { setWebhook } from "@/lib/telegram/bot";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.NEXTAUTH_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const appUrl = process.env.NEXTAUTH_URL ?? process.env.VERCEL_URL;
  if (!appUrl) {
    return NextResponse.json({ error: "NEXTAUTH_URL not set" }, { status: 500 });
  }

  const webhookUrl = `${appUrl}/api/telegram/webhook`;
  const ok = await setWebhook(webhookUrl);

  return NextResponse.json({ ok, webhookUrl });
}
