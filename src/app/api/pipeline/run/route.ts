// POST { smeId, goal } → streams SSE trace events from the 5-node pipeline
import { NextRequest } from "next/server";
import { buildPipelineGraph } from "@/lib/ai/agents/pipeline";
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

  // Offline / canned replay mode
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

  // Live pipeline mode
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };
      try {
        const runId = `run_${Date.now()}`;
        send("start", { runId, smeId: body.smeId });

        const graph = buildPipelineGraph();
        const finalState = await graph.invoke({
          smeId: body.smeId!,
          goal: body.goal ?? "General credit assessment",
          documents: [],
        });

        for (const event of finalState.trace) {
          send("trace", { ...event, runId });
          await new Promise((r) => setTimeout(r, 200));
        }

        if (finalState.passportId) {
          send("passport", {
            id: finalState.passportId,
            creditScore: finalState.draft?.creditScore,
            runId,
          });
        }
        send("done", { runId, passportId: finalState.passportId });
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
