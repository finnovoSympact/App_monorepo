// POST { runId, nodeKey, mode, feedback?, override? } → resumes paused graph with HITL response
import { NextRequest } from "next/server";
import { Command, type PipelineGraph } from "@/lib/ai/agents/pipeline";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Shared in-memory store of running graph instances keyed by runId.
// Populated by /api/pipeline/run when a live run starts.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const runGraphs = new Map<string, { graph: PipelineGraph; sseController?: ReadableStreamDefaultController<any> }>();

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    runId?: string;
    nodeKey?: string;
    mode?: "approve" | "refine" | "takeover";
    feedback?: string;
    override?: string;
  };

  if (!body.runId || !body.nodeKey) {
    return new Response(JSON.stringify({ error: "runId and nodeKey required" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const entry = runGraphs.get(body.runId);
  if (!entry) {
    return new Response(JSON.stringify({ error: "Run not found — may have expired or restarted" }), {
      status: 404,
      headers: { "content-type": "application/json" },
    });
  }

  const resumeValue = {
    mode: body.mode ?? "approve",
    feedback: body.feedback ?? body.override ?? "",
  };

  // Resume the interrupted graph by passing Command({ resume }) as input.
  // The MemorySaver checkpointer restores state from the thread_id checkpoint.
  const config = { configurable: { thread_id: body.runId } };

  try {
    // Stream resumed events back to the SSE controller if it's still open
    const encoder = new TextEncoder();
    const send = (event: string, data: unknown) => {
      try {
        entry.sseController?.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
        );
      } catch {
        /* SSE stream may be closed */
      }
    };

    // Resume graph — runs remaining nodes after the interrupt
    const resumeStream = entry.graph.stream(new Command({ resume: resumeValue }), {
      ...config,
      streamMode: "updates",
    });

    // Process resumed stream asynchronously — SSE keeps flowing to the client
    (async () => {
      try {
        for await (const chunk of await resumeStream) {
          const chunkRecord = chunk as Record<string, unknown>;
          const nodeKey = Object.keys(chunkRecord)[0];
          const nodeOutput = chunkRecord[nodeKey] as Record<string, unknown>;

          if (Array.isArray(nodeOutput.trace)) {
            for (const event of nodeOutput.trace as unknown[]) {
              send("trace", { ...(event as object), runId: body.runId });
            }
          }
          send("node_done", { nodeKey, runId: body.runId });

          // Demo pacing — match the drip speed from the initial run
          await new Promise((r) => setTimeout(r, 1800));

          if (nodeKey === "e_finalizer" && nodeOutput.passportId) {
            send("passport", {
              id: nodeOutput.passportId,
              creditScore: (nodeOutput.draft as Record<string, unknown>)?.creditScore,
              runId: body.runId,
            });
          }
        }
        send("done", { runId: body.runId });
        entry.sseController?.close();
        runGraphs.delete(body.runId!);
      } catch (err) {
        send("error", { message: String(err) });
      }
    })();

    return new Response(JSON.stringify({ ok: true, runId: body.runId, mode: resumeValue.mode }), {
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
