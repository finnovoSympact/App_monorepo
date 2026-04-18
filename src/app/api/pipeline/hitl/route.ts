// POST { runId, nodeKey, mode, feedback?, override? } → resumes pipeline after HITL checkpoint
// TODO §4: resume LangGraph checkpointer
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json() as { runId?: string; nodeKey?: string; mode?: string };
  if (!body.runId || !body.nodeKey || !body.mode) {
    return NextResponse.json({ error: "runId, nodeKey, mode required" }, { status: 400 });
  }
  // TODO §4: resume pipeline
  return NextResponse.json({ status: "resumed" });
}
