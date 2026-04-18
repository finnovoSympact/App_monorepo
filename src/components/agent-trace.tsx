"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export type TraceEvent = {
  agent: string;
  summary: string;
  at: number;
  kind: "in" | "out";
};

const agentColor: Record<string, string> = {
  supervisor: "bg-brand-500/15 text-brand-600",
  fundamentals: "bg-blue-500/15 text-blue-600",
  news: "bg-amber-500/15 text-amber-700",
  risk: "bg-red-500/15 text-red-600",
  critic: "bg-purple-500/15 text-purple-700",
  composer: "bg-emerald-500/15 text-emerald-700",
};

/**
 * AgentTrace — the live "watch the agents work" panel.
 * This is the demo wow. Keep it visible on the main playground page.
 */
export function AgentTrace({ events }: { events: TraceEvent[] }) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          Agent trace
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[420px] pr-3">
          <ol className="space-y-2">
            <AnimatePresence initial={false}>
              {events.map((e, i) => (
                <motion.li
                  key={`${e.at}-${i}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="flex items-start gap-3"
                >
                  <Badge
                    variant="outline"
                    className={cn(
                      "shrink-0 font-mono text-[10px] uppercase",
                      agentColor[e.agent] ?? "",
                    )}
                  >
                    {e.agent}
                  </Badge>
                  <p className="text-muted-foreground text-sm leading-snug">{e.summary}</p>
                </motion.li>
              ))}
            </AnimatePresence>
            {events.length === 0 && (
              <p className="text-muted-foreground text-sm">
                No events yet. Ask something to see the agents work.
              </p>
            )}
          </ol>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
