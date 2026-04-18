// POST { message, history?, profile? } → { reply, profileDelta, shouldEscalate, suggestedProduct? }
// Also accepts legacy shape { userText, conversationId, persona } for backward compat with chat UI
import { NextRequest } from "next/server";
import { processConversationTurn, type ProfileSlots } from "@/lib/ai/agents/conversational";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    // New API
    message?: string;
    history?: Array<{ role: "user" | "assistant"; text: string }>;
    profile?: ProfileSlots;
    // Legacy API (chat UI)
    userText?: string;
    conversationId?: string;
    persona?: string;
  };

  // Accept either field name
  const message = body.message ?? body.userText;
  if (!message) {
    return new Response(JSON.stringify({ error: "message required" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  try {
    const result = await processConversationTurn(message, body.history ?? [], body.profile ?? {});

    // Return shape compatible with both the new API and the legacy chat UI
    return new Response(
      JSON.stringify({
        // New API fields
        reply: result.reply,
        profileDelta: result.profileDelta,
        shouldEscalate: result.shouldEscalate,
        suggestedProduct: result.suggestedProduct,
        // Legacy chat UI fields
        assistantText: result.reply,
        profileSnapshot: result.profileDelta,
        escalation: result.shouldEscalate ? true : null,
        suggestions: result.suggestedProduct ? [result.suggestedProduct] : [],
      }),
      { headers: { "content-type": "application/json" } },
    );
  } catch (err) {
    const errMsg = String(err);
    // Graceful fallback when no API key (demo mode)
    if (errMsg.includes("API key") || errMsg.includes("authentication") || errMsg.includes("401")) {
      const fallback = {
        reply: "Marhba! Sanad yhebek tchouf winak fel financial journey dyalek. Chnou smitk?",
        profileDelta: {},
        shouldEscalate: false,
        suggestedProduct: null,
        assistantText:
          "Marhba! Sanad yhebek tchouf winak fel financial journey dyalek. Chnou smitk?",
        profileSnapshot: {},
        escalation: null,
        suggestions: [],
      };
      return new Response(JSON.stringify(fallback), {
        headers: { "content-type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ error: errMsg }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
