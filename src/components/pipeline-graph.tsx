// Visualizes the 5-node LangGraph pipeline with live status + Framer Motion
// TODO §5: implement animated node graph with HITL highlight
"use client";

export type NodeStatus = "pending" | "running" | "completed" | "awaiting_human" | "failed";
export type PipelineNode = { key: string; label: string; status: NodeStatus; latencyMs?: number };

interface Props { nodes: PipelineNode[] }

export function PipelineGraph({ nodes }: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border/60 p-6">
      {nodes.map((n) => (
        <div key={n.key} className="flex items-center gap-3 rounded-md border border-border/40 bg-card p-3 text-sm">
          <span className={`size-2 rounded-full ${n.status === "running" ? "animate-pulse bg-brand-500" : n.status === "completed" ? "bg-emerald-500" : n.status === "awaiting_human" ? "bg-amber-500 animate-pulse" : "bg-muted"}`} />
          <span className="font-medium">{n.label}</span>
          <span className="ml-auto text-xs text-muted-foreground capitalize">{n.status}</span>
        </div>
      ))}
    </div>
  );
}
