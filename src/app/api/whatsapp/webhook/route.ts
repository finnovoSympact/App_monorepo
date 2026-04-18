// Meta WhatsApp Cloud API webhook
// TODO §8: verify HMAC, parse message, delegate to conversational agent
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  // Meta webhook verification handshake
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge ?? "", { status: 200 });
  }
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function POST() {
  // TODO §8: process incoming message
  return NextResponse.json({ status: "ok" });
}
