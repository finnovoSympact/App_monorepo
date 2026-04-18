"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { PipelineGraph, type PipelineNode } from "@/components/pipeline-graph";
import { HitlPanel } from "@/components/hitl-panel";
import { AgentTrace, type TraceEvent } from "@/components/agent-trace";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, Award, Clock } from "lucide-react";

interface HitlState {
  nodeKey: string;
  nodeLabel: string;
  summary: string;
}

import { Suspense } from "react";

function PipelinePageInner({ params }: { params: { runId: string } }) {
  const searchParams = useSearchParams();
  const smeId = searchParams.get("smeId") || "demo-sme";
  const goal = searchParams.get("goal") || "Credit assessment";
  const isOffline = searchParams.get("offline") === "1";

  const [nodes, setNodes] = useState<PipelineNode[]>([
    { key: "a_formatter", label: "Formatter", status: "pending" },
    { key: "b_orchestrator", label: "Orchestrator", status: "pending" },
    { key: "c_executor", label: "Executor", status: "pending" },
    { key: "d_reviewer", label: "Reviewer", status: "pending" },
    { key: "e_finalizer", label: "Finalizer", status: "pending" },
  ]);

  const [traceEvents, setTraceEvents] = useState<TraceEvent[]>([]);
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [hitlState, setHitlState] = useState<HitlState | null>(null);
  const [passportId, setPassportId] = useState<string | null>(null);
  const [creditScore, setCreditScore] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    if (!isOffline) {
      // TODO: Real SSE streaming when API is ready
      setTimeout(() => setIsRunning(false), 0);
      return;
    }

    // Load canned trace for offline demo
    fetch("/demo/canned-trace.json")
      .then((r) => r.json())
      .then((data) => {
        let cumulativeDelay = 0;

        data.steps.forEach(
          (
            step: {
              delayMs: number;
              nodeKey: string;
              event: {
                agent: string;
                summary: string;
                kind: string;
                status: string;
              };
            },
            idx: number,
          ) => {
            cumulativeDelay += step.delayMs;

            setTimeout(() => {
              const { nodeKey, event } = step;

              // Update node status
              setNodes((prev) =>
                prev.map((n) =>
                  n.key === nodeKey ? { ...n, status: event.status as PipelineNode["status"] } : n,
                ),
              );

              setActiveNode(nodeKey);

              // Add trace event
              if (event.kind !== "hitl") {
                setTraceEvents((prev) => [
                  {
                    agent: event.agent,
                    summary: event.summary,
                    at: Date.now(),
                    kind: "out",
                  },
                  ...prev,
                ]);
              }

              // Handle HITL checkpoint
              if (event.kind === "hitl") {
                setHitlState({
                  nodeKey,
                  nodeLabel: nodes.find((n) => n.key === nodeKey)?.label || nodeKey,
                  summary: event.summary,
                });
              }

              // Handle finalizer completion
              if (nodeKey === "e_finalizer" && event.status === "completed") {
                setPassportId(data.passport.id);
                setCreditScore(data.passport.creditScore);
                setIsRunning(false);
              }

              // Last step
              if (idx === data.steps.length - 1) {
                setTimeout(() => setActiveNode(null), 1000);
              }
            }, cumulativeDelay);
          },
        );
      })
      .catch((err) => {
        console.error("Failed to load canned trace:", err);
        setIsRunning(false);
      });
  }, [isOffline]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleHitlAction = async (action: "approve" | "refine" | "takeover", feedback?: string) => {
    console.log("HITL action:", action, feedback);
    // Clear HITL state and continue
    setHitlState(null);

    // Update node to completed
    if (hitlState) {
      setNodes((prev) =>
        prev.map((n) =>
          n.key === hitlState.nodeKey
            ? {
                ...n,
                status: "completed",
                hitlMode:
                  action === "approve" ? "ai" : action === "refine" ? "ai_refined" : "manual",
              }
            : n,
        ),
      );
    }
  };

  return (
    <main className="relative mx-auto min-h-screen max-w-7xl px-6 pt-12 pb-32">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="mb-1 text-2xl font-semibold tracking-tight">Pipeline Run</h1>
            <p className="text-muted-foreground text-sm">
              {smeId} · {goal}
            </p>
          </div>
          {isRunning && (
            <Badge variant="secondary" className="flex items-center gap-1.5">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-blue-500" />
              </span>
              Running
            </Badge>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left column - Pipeline + Trace log */}
          <div className="space-y-6 lg:col-span-2">
            <PipelineGraph nodes={nodes} activeNode={activeNode} />

            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="size-4" />
                  Live execution log
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-3">
                  {traceEvents.length === 0 ? (
                    <div className="flex h-[400px] items-center justify-center">
                      <div className="text-center">
                        <Clock className="text-muted-foreground/40 mx-auto mb-2 size-8" />
                        <p className="text-muted-foreground text-sm">
                          {isRunning ? "Waiting for events..." : "No events recorded"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <AnimatePresence>
                        {traceEvents.map((event, idx) => (
                          <motion.div
                            key={`${event.at}-${idx}`}
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.18 }}
                            className="border-border/40 bg-card/50 flex items-start gap-3 rounded-lg border p-3"
                          >
                            <div className="bg-[var(--linear-brand)]/10 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full">
                              <span className="bg-[var(--linear-brand)] size-2 rounded-full" />
                            </div>
                            <div className="flex-1">
                              <div className="mb-1 flex items-center gap-2">
                                <Badge variant="outline" className="text-[10px] uppercase">
                                  {event.agent}
                                </Badge>
                                <span className="text-muted-foreground text-xs">
                                  {new Date(event.at).toLocaleTimeString("fr-TN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit",
                                  })}
                                </span>
                              </div>
                              <p className="text-sm leading-relaxed">{event.summary}</p>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Right column - Agent trace + Results */}
          <div className="space-y-6">
            <AgentTrace events={traceEvents.slice(0, 10)} />

            {creditScore !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
              >
                <Card className="border-emerald-500/40 bg-emerald-500/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base text-emerald-700 dark:text-emerald-400">
                      <Award className="size-5" />
                      Credit Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 text-center">
                      <div className="text-5xl font-semibold tracking-tight text-emerald-600 dark:text-emerald-500">
                        {creditScore}
                      </div>
                      <div className="text-muted-foreground text-sm">out of 100</div>
                    </div>

                    {passportId && (
                      <Button asChild variant="default" className="w-full">
                        <Link href={`/verify/${passportId}`}>
                          View Sanad Passport
                          <ExternalLink className="size-4" />
                        </Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {isRunning && !creditScore && (
              <Card className="border-border/60">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </motion.div>

      {/* HITL Panel */}
      <AnimatePresence>
        {hitlState && (
          <HitlPanel
            runId={params.runId}
            nodeKey={hitlState.nodeKey}
            nodeLabel={hitlState.nodeLabel}
            summary={hitlState.summary}
            onAction={handleHitlAction}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

export default function PipelinePage({ params }: { params: { runId: string } }) {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center text-sm text-muted-foreground">Loading pipeline…</div>}>
      <PipelinePageInner params={params} />
    </Suspense>
  );
}
