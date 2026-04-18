// Meta WhatsApp Cloud API webhook
import { NextResponse } from "next/server";
import * as crypto from "crypto";
import { processConversationTurn } from "@/lib/ai/agents/conversational";
import { sendText, markAsRead } from "@/lib/whatsapp/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ── GET: Meta webhook verification handshake ─────────────────────────────────
export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge ?? "", { status: 200 });
  }
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// ── POST: incoming message ────────────────────────────────────────────────────
export async function POST(req: Request) {
  // HMAC-SHA256 verification (skip in dev when APP_SECRET not set)
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (appSecret) {
    const sig = req.headers.get("x-hub-signature-256") ?? "";
    const rawBody = await req.text();
    const expected = "sha256=" + crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex");
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
      return NextResponse.json({ error: "Bad signature" }, { status: 401 });
    }
    // Parse after signature check
    let body: unknown;
    try { body = JSON.parse(rawBody); } catch { return NextResponse.json({ ok: true }); }
    return handlePayload(body);
  }

  // Dev mode — no signature required
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

  for (const msg of messages) {
    if (msg.type !== "text" || !msg.text?.body) continue;
    const from = msg.from;
    const userText = msg.text.body;

    // Mark as read (best effort)
    markAsRead(msg.id).catch(() => {});

    const session = getSession(from);

    try {
      const result = await processConversationTurn(userText, session.history, session.profile as never);

      // Update session
      session.history.push({ role: "user", text: userText });
      session.history.push({ role: "assistant", text: result.reply });
      if (session.history.length > 20) session.history = session.history.slice(-20);
      Object.assign(session.profile, result.profileDelta);

      await sendText(from, result.reply);

      // Escalation nudge
      if (result.shouldEscalate && result.suggestedProduct === "sme_upgrade") {
        await sendText(
          from,
          "🎯 Prêt à aller plus loin? Répondez OUI pour accéder à Daiyn — votre passeport crédit PME.",
        );
      }
    } catch (err) {
      console.error("[WhatsApp webhook]", err);
      await sendText(from, "Désolé, une erreur technique. Réessayez dans un instant.").catch(() => {});
    }
  }

  // Meta requires 200 OK immediately
  return NextResponse.json({ ok: true });
}

