// Per-node HITL controls: Approve / Refine with AI / Take over manually
// TODO §5: wire to /api/pipeline/hitl
"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import * as React from "react";

interface Props {
  runId: string;
  nodeKey: string;
  nodeOutput: unknown;
  onResume?: () => void;
}

export function HitlPanel({ runId, nodeKey, nodeOutput, onResume }: Props) {
  const [feedback, setFeedback] = React.useState("");
  const [mode, setMode] = React.useState<"idle" | "refine" | "takeover">("idle");

  async function submit(hitlMode: "approve" | "refine" | "takeover", override?: unknown) {
    await fetch("/api/pipeline/hitl", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ runId, nodeKey, mode: hitlMode, feedback, override }),
    });
    onResume?.();
  }

  return (
    <div className="space-y-4 rounded-lg border border-amber-500/40 bg-amber-50/5 p-4">
      <p className="text-sm font-medium text-amber-600">Awaiting human review — node <code>{nodeKey}</code></p>
      <pre className="max-h-48 overflow-auto rounded bg-muted p-3 text-xs">{JSON.stringify(nodeOutput, null, 2)}</pre>

      {mode === "refine" && (
        <Textarea rows={3} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Feedback for AI refinement…" />
      )}

      <div className="flex gap-2">
        <Button size="sm" variant="default" onClick={() => submit("approve")}>Approve</Button>
        <Button size="sm" variant="outline" onClick={() => mode === "refine" ? submit("refine") : setMode("refine")}>
          {mode === "refine" ? "Send feedback" : "Refine with AI"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setMode("takeover")}>Take over</Button>
      </div>
    </div>
  );
}
