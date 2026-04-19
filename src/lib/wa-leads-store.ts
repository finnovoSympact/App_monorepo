// Shared in-memory store for WhatsApp conversation leads.
// Survives hot-reloads in dev because Node module cache persists.
// Resets on cold start — fine for hackathon demo.

import type { ProfileSlots } from "@/lib/ai/agents/conversational";

export interface WaMessage {
  role: "user" | "assistant";
  text: string;
  ts: string; // ISO
}

export interface WaLead {
  phone: string;
  profile: ProfileSlots;
  lastMessage: string;
  lastSeen: string; // ISO
  messageCount: number;
  suggestedProduct: string | null;
  history: WaMessage[];
}

// Singleton map persisted across HMR via globalThis
const globalStore = globalThis as typeof globalThis & { __waLeads?: Map<string, WaLead> };
if (!globalStore.__waLeads) globalStore.__waLeads = new Map();
const store = globalStore.__waLeads;

export function upsertLead(
  phone: string,
  update: {
    profile: ProfileSlots;
    lastMessage: string;
    suggestedProduct: string | null;
    userText?: string;
    assistantText?: string;
  },
): void {
  const existing = store.get(phone);
  const newHistory: WaMessage[] = [...(existing?.history ?? [])];
  if (update.userText) newHistory.push({ role: "user", text: update.userText, ts: new Date().toISOString() });
  if (update.assistantText) newHistory.push({ role: "assistant", text: update.assistantText, ts: new Date().toISOString() });
  store.set(phone, {
    phone,
    profile: { ...(existing?.profile ?? {}), ...update.profile },
    lastMessage: update.lastMessage,
    lastSeen: new Date().toISOString(),
    messageCount: (existing?.messageCount ?? 0) + 1,
    suggestedProduct: update.suggestedProduct ?? existing?.suggestedProduct ?? null,
    history: newHistory,
  });
}

export function getAllLeads(): WaLead[] {
  return Array.from(store.values()).sort(
    (a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime(),
  );
}
