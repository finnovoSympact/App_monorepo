import type { TraceEvent } from "@/components/agent-trace";

type CannedTrace = {
  prompt: string;
  steps: Array<{ delayMs: number; event: Omit<TraceEvent, "at"> }>;
  final: string;
};

/**
 * Offline demo mode. Use when venue Wi-Fi or the LLM provider is unreachable.
 * Triggered by `/playground?offline=1` in the UI.
 */
export async function* playCannedTrace(): AsyncGenerator<
  { kind: "trace"; event: TraceEvent } | { kind: "final"; output: string }
> {
  const res = await fetch("/demo/canned-trace.json", { cache: "no-store" });
  const data: CannedTrace = await res.json();

  for (const step of data.steps) {
    await new Promise((r) => setTimeout(r, step.delayMs));
    yield {
      kind: "trace",
      event: { ...step.event, at: Date.now() },
    };
  }

  yield { kind: "final", output: data.final };
}
