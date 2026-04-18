"use client";

import * as React from "react";
import { toast } from "sonner";
import { Send, WifiOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AgentTrace, type TraceEvent } from "@/components/agent-trace";
import { playCannedTrace } from "@/lib/ai/canned";
import { ChapterMark, Hairline } from "@/components/sanad/type";

/**
 * Agent playground — the live demo page.
 * Left: user prompt + composed answer.
 * Right: live trace panel (the wow factor).
 */
export default function PlaygroundPage() {
  const [prompt, setPrompt] = React.useState(
    "Should I buy Banque de Tunisie (BT) stock given the new foreign-currency rules?",
  );
  const [answer, setAnswer] = React.useState("");
  const [events, setEvents] = React.useState<TraceEvent[]>([]);
  const [running, setRunning] = React.useState(false);
  const [offline, setOffline] = React.useState(false);

  // Allow ?offline=1 in the URL to force canned-trace mode (demo-day insurance).
  React.useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get("offline") === "1") setTimeout(() => setOffline(true), 0);
  }, []);

  async function runCanned() {
    setRunning(true);
    setAnswer("");
    setEvents([]);
    try {
      for await (const step of playCannedTrace()) {
        if (step.kind === "trace") {
          setEvents((prev) => [...prev, step.event]);
        } else {
          setAnswer(step.output);
        }
      }
    } catch (err) {
      toast.error(`Canned trace failed: ${String(err)}`);
    } finally {
      setRunning(false);
    }
  }

  async function run() {
    if (!prompt.trim() || running) return;
    if (offline) return runCanned();
    setRunning(true);
    setAnswer("");
    setEvents([]);

    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const chunk of parts) {
          const lines = chunk.split("\n");
          const event = lines.find((l) => l.startsWith("event: "))?.slice(7);
          const data = lines.find((l) => l.startsWith("data: "))?.slice(6);
          if (!event || !data) continue;
          const payload = JSON.parse(data);
          if (event === "trace") {
            setEvents((prev) => [...prev, payload as TraceEvent]);
          } else if (event === "final") {
            setAnswer(payload.output);
          } else if (event === "error") {
            toast.error(payload.message);
          }
        }
      }
    } catch (err) {
      toast.error(`Agent run failed: ${String(err)}`);
    } finally {
      setRunning(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-6 pt-12 pb-20">
      <ChapterMark num="سند" label="Agent Playground" tone="gold" className="mb-6" />
      <div className="mb-1 flex items-center gap-3">
        <h1 className="font-instrument text-[clamp(2rem,4vw,3.5rem)] leading-tight tracking-tight">
          Live agent crew
        </h1>
        {offline && (
          <Badge variant="outline" className="gap-1 text-amber-700">
            <WifiOff className="size-3" />
            Offline
          </Badge>
        )}
      </div>
      <p className="font-mono text-[11px] tracking-widest uppercase mt-2 mb-8 text-muted-foreground">
        Ask anything · watch the trace · see the agents collaborate
      </p>

      <Hairline className="mb-8" />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-instrument">Your question</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask a finance question…"
                disabled={running}
              />
              <Button onClick={run} disabled={running} className="w-full">
                <Send className="size-4" />
                {running ? "Running agents…" : "Run agent crew"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-instrument">Composed answer</CardTitle>
            </CardHeader>
            <CardContent>
              {answer ? (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{answer}</p>
              ) : (
                <p className="text-sm italic text-muted-foreground">
                  The final, critic-approved answer will appear here.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <AgentTrace events={events} />
      </div>
    </main>
  );
}
