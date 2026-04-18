import { NextRequest } from "next/server";
import { z } from "zod";
import { buildGraph, exampleSpecialists } from "@/lib/ai/agents/supervisor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  prompt: z.string().min(1).max(4000),
});

/**
 * POST /api/agents
 *
 * Runs the multi-agent graph and streams the agent trace as Server-Sent Events.
 * Front-end subscribes and visualizes each agent's step live — the demo wow.
 */
export async function POST(req: NextRequest) {
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.message }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const graph = buildGraph(exampleSpecialists);

        send("start", { prompt: parsed.data.prompt });

        const state = await graph.invoke(
          { input: parsed.data.prompt },
          {
            callbacks: [
              {
                handleLLMEnd: () => send("llm_end", { at: Date.now() }),
              },
            ],
          },
        );

        for (const step of state.trace) send("trace", step);
        send("final", { output: state.output });
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
