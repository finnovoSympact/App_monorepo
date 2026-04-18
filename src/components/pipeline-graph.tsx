// Visualizes the 5-node LangGraph pipeline with live status + Framer Motion
// TODO §5: implement animated node graph with HITL highlight
"use client";

export type NodeStatus = "pending" | "running" | "completed" | "awaiting_human" | "failed";
export type PipelineNode = { key: string; label: string; status: NodeStatus; latencyMs?: number };

interface Props {
  nodes: PipelineNode[];
}

export function PipelineGraph({ nodes }: Props) {
  return (
    <div className="border-border/60 flex flex-col gap-3 rounded-lg border p-6">
      {nodes.map((n) => (
        <div
          key={n.key}
          className="border-border/40 bg-card flex items-center gap-3 rounded-md border p-3 text-sm"
        >
          <span
            className={`size-2 rounded-full ${n.status === "running" ? "bg-brand-500 animate-pulse" : n.status === "completed" ? "bg-emerald-500" : n.status === "awaiting_human" ? "animate-pulse bg-amber-500" : "bg-muted"}`}
          />
          <span className="font-medium">{n.label}</span>
          <span className="text-muted-foreground ml-auto text-xs capitalize">{n.status}</span>
        </div>
      ))}
    </div>
  );
}
