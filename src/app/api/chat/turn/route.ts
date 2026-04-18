// POST { conversationId, userText, persona? } → { assistantText, profileSnapshot, suggestions, escalation? }
// TODO §8: implement real conversational agent; for now echoes fixture turns
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    conversationId?: string;
    userText?: string;
    persona?: string;
  };
  if (!body.userText) return NextResponse.json({ error: "userText required" }, { status: 400 });
  // Stub: echo back so §7 UI can work before §8 is done
  return NextResponse.json({
    assistantText: `[Stub] You said: ${body.userText}`,
    profileSnapshot: {},
    suggestions: [],
    escalation: null,
  });
}
