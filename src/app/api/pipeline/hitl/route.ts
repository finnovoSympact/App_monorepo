// POST { runId, nodeKey, mode, feedback?, override? } → acknowledges HITL action
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    runId?: string;
    nodeKey?: string;
    mode?: string;
    feedback?: string;
    override?: unknown;
  };
  if (!body.runId || !body.nodeKey) {
    return new Response(JSON.stringify({ error: "runId and nodeKey required" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const modeLabel =
    body.mode === "approve"
      ? "approved"
      : body.mode === "refine"
        ? "queued for refinement"
        : "taken over";

  return new Response(
    JSON.stringify({
      ok: true,
      runId: body.runId,
      nodeKey: body.nodeKey,
      mode: body.mode ?? "approve",
      message: `Node ${body.nodeKey} ${modeLabel}`,
    }),
    { headers: { "content-type": "application/json" } },
  );
}
