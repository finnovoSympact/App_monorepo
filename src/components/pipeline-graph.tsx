"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { FileText, Brain, Cog, Eye, CheckCircle, ArrowRight, CornerDownRight } from "lucide-react";

export type NodeStatus = "pending" | "running" | "completed" | "waiting" | "revised" | "approved";

export type HitlMode = "ai" | "ai_refined" | "manual";

export interface PipelineNode {
  key: string;
  label: string;
  status: NodeStatus;
  hitlMode?: HitlMode;
}

interface Props {
  nodes: PipelineNode[];
  activeNode: string | null;
}

const nodeIcons: Record<string, typeof FileText> = {
  a_formatter: FileText,
  b_orchestrator: Brain,
  c_executor: Cog,
  d_reviewer: Eye,
  e_finalizer: CheckCircle,
};

const statusColors: Record<NodeStatus, string> = {
  pending: "bg-muted-foreground/30",
  running: "bg-blue-500 animate-pulse",
  completed: "bg-emerald-500",
  waiting: "bg-amber-500 animate-pulse",
  revised: "bg-orange-500",
  approved: "bg-emerald-600",
};

export function PipelineGraph({ nodes, activeNode }: Props) {
  const showRevisionLoop =
    nodes.some((n) => n.key === "d_reviewer" && n.status === "revised") ||
    nodes.some((n) => n.key === "c_executor" && n.status === "running");

  return (
    <div className="border-border/60 bg-card rounded-lg border p-6">
      <h3 className="text-muted-foreground mb-4 text-sm font-medium">Pipeline Flow</h3>
      <div className="relative flex flex-col gap-6">
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {nodes.map((node, idx) => {
            const Icon = nodeIcons[node.key] || FileText;
            const isActive = activeNode === node.key;

            return (
              <div key={node.key} className="flex items-center gap-3">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1, duration: 0.18 }}
                  className={cn(
                    "relative flex min-w-[140px] flex-col items-center gap-2 rounded-lg border p-4 transition-all",
                    isActive
                      ? "border-indigo-500/50 bg-indigo-500/5 shadow-sm"
                      : "border-border/40 bg-card/50",
                  )}
                >
                  <div
                    className={cn(
                      "flex size-10 items-center justify-center rounded-full transition-colors",
                      isActive
                        ? "bg-indigo-500/15 text-indigo-400"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    <Icon aria-hidden="true" className="size-5" />
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-medium">{node.label}</div>
                    <div className="mt-1 flex items-center justify-center gap-1.5">
                      <span className={cn("size-2 rounded-full", statusColors[node.status])} />
                      <span className="text-muted-foreground text-[10px] capitalize">
                        {node.status}
                      </span>
                    </div>
                  </div>
                  {node.hitlMode && (
                    <div className="absolute -top-2 -right-2 rounded-full bg-amber-500/10 px-2 py-0.5 text-[9px] font-medium text-amber-600 uppercase">
                      {node.hitlMode === "ai_refined" ? "refined" : node.hitlMode}
                    </div>
                  )}
                </motion.div>

                {idx < nodes.length - 1 && (
                  <ArrowRight aria-hidden="true" className="text-muted-foreground/40 size-4 shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {showRevisionLoop && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 rounded-md border border-dashed border-orange-500/40 bg-orange-500/5 p-3 text-xs text-orange-600"
          >
            <CornerDownRight aria-hidden="true" className="size-3.5" />
            <span>Revision loop active — Reviewer sent feedback to Executor</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
