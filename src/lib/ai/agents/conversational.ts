// Layer 1 — Sanad Chat conversational agent
// Incrementally extracts financial profile slots from natural language (Darija/FR/EN)
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import type { BaseMessage } from "@langchain/core/messages";
import { getLangchainModel } from "@/lib/ai/client";

export interface ProfileSlots {
  identity?: { name?: string; age_band?: string; city?: string; language?: string };
  employment?: { type?: string; income_band?: string; stability_months?: number };
  banking?: { has_account?: boolean; wallet?: string; bank_name?: string };
  credit_history?: { past_loans?: number; delinquency_12m?: boolean };
  goals?: { short_term?: string; long_term?: string };
  sme_signal?: number;
  escalated?: boolean;
}

export interface TurnResult {
  reply: string;
  profileDelta: Partial<ProfileSlots>;
  shouldEscalate: boolean;
  suggestedProduct?: string | null;
}

const SYSTEM_PROMPT = `You are Sanad Chat — a friendly financial advisor embedded in WhatsApp for Tunisian users.

Your mission: have a warm, natural conversation in the user's language (Darija, French, or Arabic — mirror what they use), and gradually learn their financial situation.

Profile slots to collect (collect naturally, not as a form):
- identity: name, age band (18-24, 25-34, 35-44, 45-54, 55+), city
- employment: type (salaried/CDI, gig/freelance, micro-commerce, informal, student, unemployed), monthly income band
- banking: has bank account (BNA/BIAT/STB/Attijari/UIB/BT), or mobile wallet (D17/Flouci/Ooredoo Money/Paymee)
- goals: short-term (3-12mo), long-term

SME escalation: if user mentions selling goods regularly, hiring people, separate business wallet → increment sme_signal. At sme_signal ≥ 2: propose Daiyn upgrade.

Always respond in the SAME language/script the user uses. Darija in Latin script (3arabizi). Be warm, concise, 1-2 sentences max per reply.

Return a JSON object with:
{
  "reply": "your response text",
  "profileDelta": { /* only the slots you just learned */ },
  "shouldEscalate": false,
  "suggestedProduct": null | "micro_loan" | "bnpl" | "savings" | "sme_upgrade"
}`;

export async function processConversationTurn(
  userMessage: string,
  history: Array<{ role: "user" | "assistant"; text: string }>,
  currentProfile: ProfileSlots,
): Promise<TurnResult> {
  const model = getLangchainModel("smart");

  const messages: BaseMessage[] = [
    new SystemMessage(
      SYSTEM_PROMPT + `\n\nCurrent profile so far: ${JSON.stringify(currentProfile)}`,
    ),
    ...history
      .slice(-10)
      .map((m) => (m.role === "user" ? new HumanMessage(m.text) : new AIMessage(m.text))),
    new HumanMessage(userMessage),
  ];

  const response = await model.invoke(messages);
  const text = typeof response.content === "string" ? response.content : "";

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]) as TurnResult;
      return {
        reply: parsed.reply ?? text,
        profileDelta: parsed.profileDelta ?? {},
        shouldEscalate: parsed.shouldEscalate ?? false,
        suggestedProduct: parsed.suggestedProduct ?? null,
      };
    } catch {
      /* fall through */
    }
  }

  return { reply: text, profileDelta: {}, shouldEscalate: false, suggestedProduct: null };
}
