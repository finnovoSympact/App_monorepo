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
import { ExternalLink, Award, Clock, X, Brain } from "lucide-react";

interface HitlState {
  nodeKey: string;
  nodeLabel: string;
  summary: string;
}

interface NodeDetailState {
  node: PipelineNode;
  events: TraceEvent[];
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
  // Server-assigned runId (from SSE "start" event) — needed to resume graph after HITL
  const [liveRunId, setLiveRunId] = useState<string | null>(null);
  // Per-node event map for the detail panel
  const [nodeEvents, setNodeEvents] = useState<Map<string, TraceEvent[]>>(new Map());
  const [nodeDetail, setNodeDetail] = useState<NodeDetailState | null>(null);

  useEffect(() => {
    if (isOffline) {
      // ── Offline: load canned trace ─────────────────────────────────────────
      fetch("/demo/canned-trace.json")
        .then((r) => r.json())
        .then((data) => {
          let cumulativeDelay = 0;
          data.steps.forEach(
            (
              step: { delayMs: number; nodeKey: string; event: { agent: string; summary: string; kind: string; status: string } },
              idx: number,
            ) => {
              cumulativeDelay += step.delayMs;
              setTimeout(() => {
                const { nodeKey, event } = step;
                setNodes((prev) =>
                  prev.map((n) =>
                    n.key === nodeKey ? { ...n, status: event.status as PipelineNode["status"] } : n,
                  ),
                );
                setActiveNode(nodeKey);
                if (event.kind !== "hitl") {
                  const ev: TraceEvent = { agent: event.agent, summary: event.summary, at: Date.now(), kind: "out", nodeKey };
                  setTraceEvents((prev) => [ev, ...prev]);
                  setNodeEvents((prev) => {
                    const updated = new Map(prev);
                    updated.set(nodeKey, [...(updated.get(nodeKey) ?? []), ev]);
                    return updated;
                  });
                }
                if (event.kind === "hitl") {
                  setHitlState({ nodeKey, nodeLabel: nodes.find((n) => n.key === nodeKey)?.label || nodeKey, summary: event.summary });
                }
                if (nodeKey === "e_finalizer" && event.status === "completed") {
                  setPassportId(data.passport.id);
                  setCreditScore(data.passport.creditScore);
                  setIsRunning(false);
                }
                if (idx === data.steps.length - 1) setTimeout(() => setActiveNode(null), 1000);
              }, cumulativeDelay);
            },
          );
        })
        .catch((err) => { console.error("Failed to load canned trace:", err); setIsRunning(false); });
      return;
    }

    // ── Live: real SSE from /api/pipeline/run ─────────────────────────────────
    let aborted = false;

    async function startLiveStream() {
      try {
        const res = await fetch("/api/pipeline/run", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ smeId, goal }),
        });
        if (!res.body) { setIsRunning(false); return; }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";

        while (!aborted) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });

          // Parse SSE frames
          const frames = buf.split("\n\n");
          buf = frames.pop() ?? "";

          for (const frame of frames) {
            const eventMatch = frame.match(/^event: (\w+)/m);
            const dataMatch = frame.match(/^data: (.+)$/m);
            if (!eventMatch || !dataMatch) continue;
            const eventType = eventMatch[1];
            let payload: Record<string, unknown>;
            try { payload = JSON.parse(dataMatch[1]); } catch { continue; }

            if (eventType === "start") {
              setLiveRunId(payload.runId as string);
            } else if (eventType === "trace") {
              const nodeKey = payload.nodeKey as string;
              setActiveNode(nodeKey);
              setNodes((prev) =>
                prev.map((n) => n.key === nodeKey ? { ...n, status: payload.status as PipelineNode["status"] ?? "running" } : n),
              );
              const newEvent: TraceEvent = {
                agent: payload.agent as string,
                summary: payload.summary as string,
                at: Date.now(),
                kind: "out",
                nodeKey,
                reasoning: payload.reasoning as string | undefined,
              };
              setTraceEvents((prev) => [newEvent, ...prev]);
              // Bucket per node for detail panel
              setNodeEvents((prev) => {
                const updated = new Map(prev);
                updated.set(nodeKey, [...(updated.get(nodeKey) ?? []), newEvent]);
                return updated;
              });
            } else if (eventType === "node_done") {
              const nodeKey = payload.nodeKey as string;
              setNodes((prev) =>
                prev.map((n) => n.key === nodeKey ? { ...n, status: "completed" } : n),
              );
            } else if (eventType === "hitl") {
              const nodeKey = (payload.nodeKey as string) ?? "c_executor";
              const hitlPayload = payload.payload as Record<string, unknown>;
              setNodes((prev) =>
                prev.map((n) => n.key === nodeKey ? { ...n, status: "waiting" } : n),
              );
              setHitlState({
                nodeKey,
                nodeLabel: nodes.find((n) => n.key === nodeKey)?.label || nodeKey,
                summary: (hitlPayload?.question as string) ?? "Review required before continuing",
              });
            } else if (eventType === "passport") {
              setPassportId(payload.id as string);
              setCreditScore(payload.creditScore as number);
            } else if (eventType === "done") {
              setIsRunning(false);
              setActiveNode(null);
            } else if (eventType === "error") {
              console.error("Pipeline error:", payload.message);
              setIsRunning(false);
            }
          }
        }
      } catch (err) {
        if (!aborted) { console.error("SSE error:", err); setIsRunning(false); }
      }
    }

    startLiveStream();
    return () => { aborted = true; };
  }, [isOffline]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleHitlAction = async (action: "approve" | "refine" | "takeover", feedback?: string) => {
    const currentHitl = hitlState;
    setHitlState(null);

    if (currentHitl) {
      setNodes((prev) =>
        prev.map((n) =>
          n.key === currentHitl.nodeKey
            ? { ...n, status: "completed", hitlMode: action === "approve" ? "ai" : action === "refine" ? "ai_refined" : "manual" }
            : n,
        ),
      );
    }

    // POST to HITL endpoint to resume the paused graph
    const runIdToUse = liveRunId ?? params.runId;
    if (!isOffline && runIdToUse) {
      try {
        await fetch("/api/pipeline/hitl", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            runId: runIdToUse,
            nodeKey: currentHitl?.nodeKey ?? "c_executor",
            mode: action,
            feedback: feedback ?? "",
          }),
        });
      } catch (err) {
        console.error("HITL resume failed:", err);
      }
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
            <PipelineGraph
              nodes={nodes}
              activeNode={activeNode}
              onNodeClick={(node) => setNodeDetail({ node, events: nodeEvents.get(node.key) ?? [] })}
            />

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

      {/* Node Detail Drawer — click any completed node to inspect */}
      <AnimatePresence>
        {nodeDetail && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setNodeDetail(null)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            />
            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col border-l border-border/60 bg-card shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-border/40 px-6 py-4">
                <div className="flex items-center gap-3">
                  <Brain className="size-5 text-indigo-400" />
                  <div>
                    <p className="font-semibold">{nodeDetail.node.label}</p>
                    <p className="text-muted-foreground text-xs capitalize">{nodeDetail.node.status}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setNodeDetail(null)}>
                  <X className="size-4" />
                </Button>
              </div>

              <ScrollArea className="flex-1 px-6 py-4">
                {nodeDetail.events.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No events recorded for this node yet.</p>
                ) : (
                  <div className="space-y-6">
                    {nodeDetail.events.map((ev, i) => (
                      <div key={i} className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] uppercase">{ev.agent}</Badge>
                          <span className="text-muted-foreground text-xs">
                            {new Date(ev.at).toLocaleTimeString("fr-TN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed">{ev.summary}</p>
                        {ev.reasoning && (
                          <details open className="mt-2">
                            <summary className="cursor-pointer text-xs font-medium text-indigo-400 hover:text-indigo-300 select-none">
                              🤖 LLM reasoning ▸
                            </summary>
                            <pre className="mt-2 overflow-x-auto rounded-md bg-muted/50 p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap text-muted-foreground">
                              {ev.reasoning}
                            </pre>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </motion.div>
          </>
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
