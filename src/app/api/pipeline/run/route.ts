// POST { smeId, goal } → starts pipeline, returns { runId }, streams SSE trace events
// TODO §4: wire LangGraph pipeline + Postgres checkpointer
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json() as { smeId?: string; goal?: string };
  if (!body.smeId) return NextResponse.json({ error: "smeId required" }, { status: 400 });
  // TODO §4: start pipeline
  return NextResponse.json({ runId: `run_${Date.now()}`, status: "started" });
}
