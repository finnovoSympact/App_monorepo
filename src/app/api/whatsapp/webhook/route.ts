// Meta WhatsApp Cloud API webhook
import { NextResponse } from "next/server";
import * as crypto from "crypto";
import { processConversationTurn } from "@/lib/ai/agents/conversational";
import { sendText, markAsRead } from "@/lib/whatsapp/client";
import { upsertLead } from "@/lib/wa-leads-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ── GET: Meta webhook verification handshake ─────────────────────────────────
export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  console.log("[WA webhook] GET verify", { mode, token, challenge, expected: process.env.WHATSAPP_VERIFY_TOKEN });
  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log("[WA webhook] ✅ verification OK");
    return new Response(challenge ?? "", { status: 200 });
  }
  console.error("[WA webhook] ❌ verification FAILED — token mismatch");
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// ── POST: incoming message ────────────────────────────────────────────────────
export async function POST(req: Request) {
  console.log("[WA webhook] POST received, WHATSAPP_LIVE =", process.env.WHATSAPP_LIVE);

  // HMAC-SHA256 verification (skip in dev when APP_SECRET not set)
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (appSecret) {
    const rawBody = await req.text();
    const sig = req.headers.get("x-hub-signature-256") ?? "";
    const expected = "sha256=" + crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex");
    console.log("[WA webhook] signature check", { sig: sig.slice(0, 20), expected: expected.slice(0, 20), match: sig === expected });

    // Use length check first to avoid timingSafeEqual crash on mismatched lengths
    if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
      console.error("[WA webhook] ❌ Bad signature — dropping");
      return NextResponse.json({ error: "Bad signature" }, { status: 401 });
    }
    let body: unknown;
    try { body = JSON.parse(rawBody); } catch { return NextResponse.json({ ok: true }); }
    return handlePayload(body);
  }

  // No app secret — accept all (dev/ngrok)
  const body = await req.json().catch(() => null);
  return handlePayload(body);
}

// ── In-memory session store (resets on cold start — fine for demo) ────────────
type Session = {
  history: Array<{ role: "user" | "assistant"; text: string }>;
  profile: Record<string, unknown>;
};
const sessions = new Map<string, Session>();

function getSession(from: string): Session {
  if (!sessions.has(from)) sessions.set(from, { history: [], profile: {} });
  return sessions.get(from)!;
}

async function handlePayload(body: unknown): Promise<Response> {
  const payload = body as {
    object?: string;
    entry?: Array<{
      changes?: Array<{
        value?: {
          messages?: Array<{ id: string; from: string; type: string; text?: { body: string } }>;
        };
      }>;
    }>;
  };

  const messages = payload?.entry?.[0]?.changes?.[0]?.value?.messages ?? [];
  console.log("[WA webhook] payload messages count:", messages.length, "| raw keys:", Object.keys(payload?.entry?.[0]?.changes?.[0]?.value ?? {}));

  if (messages.length === 0) {
    // Status update (read/delivered) — log and ack
    console.log("[WA webhook] no messages — likely a status update, acking");
    return NextResponse.json({ ok: true });
  }

  for (const msg of messages) {
    console.log("[WA webhook] message", { id: msg.id, from: msg.from, type: msg.type, text: msg.text?.body });
    if (msg.type !== "text" || !msg.text?.body) {
      console.log("[WA webhook] skipping non-text message type:", msg.type);
      continue;
    }
    const from = msg.from;
    const userText = msg.text.body;

    // Mark as read (best effort)
    markAsRead(msg.id).catch(() => {});

    const session = getSession(from);
    console.log("[WA webhook] session history length:", session.history.length);

    try {
      console.log("[WA webhook] calling processConversationTurn for:", from);
      const result = await processConversationTurn(userText, session.history, session.profile as never);
      console.log("[WA webhook] got reply:", result.reply.slice(0, 80));

      // Update session
      session.history.push({ role: "user", text: userText });
      session.history.push({ role: "assistant", text: result.reply });
      if (session.history.length > 20) session.history = session.history.slice(-20);
      Object.assign(session.profile, result.profileDelta);

      // Persist to live leads store (dashboard reads this)
      upsertLead(from, {
        profile: session.profile as never,
        lastMessage: userText,
        suggestedProduct: result.suggestedProduct ?? null,
        userText,
        assistantText: result.reply,
      });

      console.log("[WA webhook] sending reply to", from);
      await sendText(from, result.reply);
      console.log("[WA webhook] ✅ reply sent");

      // Escalation nudge
      if (result.shouldEscalate && result.suggestedProduct === "sme_upgrade") {
        await sendText(
          from,
          "🎯 Prêt à aller plus loin? Répondez OUI pour accéder à Daiyn — votre passeport crédit PME.",
        );
      }
    } catch (err) {
      console.error("[WA webhook] ❌ error processing message:", err);
      await sendText(from, "Désolé, une erreur technique. Réessayez dans un instant.").catch(() => {});
    }
  }

  // Meta requires 200 OK immediately
  return NextResponse.json({ ok: true });
}

