// POST { smeId, goal } → streams SSE trace events from the 5-node pipeline
import { NextRequest } from "next/server";
import { buildPipelineGraph } from "@/lib/ai/agents/pipeline";
import { runGraphs } from "@/app/api/pipeline/hitl/route";
import { readFileSync } from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { smeId?: string; goal?: string; offline?: boolean };
  if (!body.smeId) {
    return new Response(JSON.stringify({ error: "smeId required" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const encoder = new TextEncoder();
  const offline = body.offline ?? req.nextUrl.searchParams.get("offline") === "1";

  // ── Offline / canned replay mode ────────────────────────────────────────────
  if (offline) {
    const stream = new ReadableStream({
      async start(controller) {
        const send = (event: string, data: unknown) => {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        };
        try {
          const cannedPath = path.join(process.cwd(), "public/demo/canned-trace.json");
          const canned = JSON.parse(readFileSync(cannedPath, "utf-8")) as {
            steps: Array<{ delayMs: number; event: unknown }>;
            passport: { id: string } & Record<string, unknown>;
          };
          const runId = `run_offline_${Date.now()}`;
          send("start", { runId, smeId: body.smeId });
          for (const step of canned.steps) {
            await new Promise((r) => setTimeout(r, step.delayMs));
            send("trace", { ...(step.event as Record<string, unknown>), runId });
          }
          send("passport", { ...canned.passport, runId });
          send("done", { runId, passportId: canned.passport.id });
        } catch (err) {
          send("error", { message: String(err) });
        } finally {
          controller.close();
        }
      },
    });
    return new Response(stream, {
      headers: {
        "content-type": "text/event-stream",
        "cache-control": "no-store",
        "x-accel-buffering": "no",
      },
    });
  }

  // ── Live pipeline mode — real LangGraph streaming ──────────────────────────
  const runId = `run_${Date.now()}`;
  const graph = buildPipelineGraph();
  const config = { configurable: { thread_id: runId } };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let sseController: ReadableStreamDefaultController<any> | undefined;

  // Register graph so /api/pipeline/hitl can resume it after an interrupt
  runGraphs.set(runId, { graph, get sseController() { return sseController; }, set sseController(v) { sseController = v; } });

  const stream = new ReadableStream({
    async start(controller) {
      sseController = controller;
      // Update the stored entry with the real controller
      const entry = runGraphs.get(runId);
      if (entry) (entry as Record<string, unknown>).sseController = controller;

      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      try {
        send("start", { runId, smeId: body.smeId });

        const graphStream = graph.stream(
          {
            smeId: body.smeId!,
            goal: body.goal ?? "General credit assessment",
            documents: [],
          },
          { ...config, streamMode: "updates" },
        );

        for await (const chunk of await graphStream) {
          const chunkRecord = chunk as Record<string, unknown>;
          const nodeKey = Object.keys(chunkRecord)[0];

          // LangGraph uses "__interrupt__" key when graph hits an interrupt()
          if (nodeKey === "__interrupt__") {
            const interruptData = chunkRecord["__interrupt__"] as Array<{ value: unknown }>;
            send("hitl", {
              runId,
              nodeKey: "c_executor",
              payload: interruptData?.[0]?.value ?? {},
            });
            // SSE stays open — client will POST to /api/pipeline/hitl to resume
            return;
          }

          const nodeOutput = chunkRecord[nodeKey] as Record<string, unknown>;

          if (Array.isArray(nodeOutput.trace)) {
            for (const event of nodeOutput.trace as unknown[]) {
              send("trace", { ...(event as object), runId });
            }
          }

          send("node_done", { nodeKey, runId });

          if (nodeKey === "e_finalizer" && nodeOutput.passportId) {
            send("passport", {
              id: nodeOutput.passportId,
              creditScore: (nodeOutput.draft as Record<string, unknown>)?.creditScore,
              runId,
            });
          }
        }

        send("done", { runId });
        runGraphs.delete(runId);
      } catch (err) {
        send("error", { message: String(err) });
        runGraphs.delete(runId);
      } finally {
        // Only close if not waiting for HITL (hitl handler closes it)
        if (!runGraphs.has(runId)) {
          controller.close();
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream",
      "cache-control": "no-store",
      "x-accel-buffering": "no",
    },
  });
}
