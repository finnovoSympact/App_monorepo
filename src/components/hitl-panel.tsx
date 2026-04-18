"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Sparkles, Edit3, PauseCircle } from "lucide-react";
import * as React from "react";

interface Props {
  nodeKey: string;
  nodeLabel: string;
  summary: string;
  runId: string;
  onAction: (action: "approve" | "refine" | "takeover", feedback?: string) => void;
}

export function HitlPanel({ nodeLabel, summary, onAction }: Props) {
  const [mode, setMode] = React.useState<"idle" | "refine" | "takeover">("idle");
  const [feedback, setFeedback] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function handleAction(action: "approve" | "refine" | "takeover") {
    setIsSubmitting(true);
    try {
      await onAction(action, feedback);
      setFeedback("");
      setMode("idle");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.div
      role="dialog"
      aria-labelledby="hitl-heading"
      aria-modal="false"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-amber-500/40 bg-amber-50/95 backdrop-blur dark:bg-amber-950/95"
    >
      <div className="mx-auto max-w-6xl px-6 py-6">
        <div className="flex items-start gap-3">
          <div aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-500/15">
            <PauseCircle aria-hidden="true" className="size-5 text-amber-600" />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <h3 id="hitl-heading" className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                ⏸ Awaiting your review — {nodeLabel}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-amber-800/90 dark:text-amber-200/80">
                {summary}
              </p>
            </div>

            {mode === "refine" && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
              >
                <Textarea
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide feedback for AI refinement (e.g., 'Use a more conservative estimate for Q4 revenue')"
                  className="border-amber-500/30 bg-white/50 text-sm dark:bg-black/20"
                />
              </motion.div>
            )}

            {mode === "takeover" && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
              >
                <Textarea
                  rows={4}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Write your manual override here. This will replace the node output entirely."
                  className="border-amber-500/30 bg-white/50 font-mono text-xs dark:bg-black/20"
                />
              </motion.div>
            )}

            <div className="flex flex-wrap gap-2">
              {mode === "idle" && (
                <>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleAction("approve")}
                    disabled={isSubmitting}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <CheckCircle aria-hidden="true" className="size-4" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setMode("refine")}
                    className="border-amber-500/30"
                  >
                    <Sparkles aria-hidden="true" className="size-4" />
                    Refine with AI
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setMode("takeover")}
                    className="border-amber-500/30"
                  >
                    <Edit3 aria-hidden="true" className="size-4" />
                    Take Over
                  </Button>
                </>
              )}

              {mode === "refine" && (
                <>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleAction("refine")}
                    disabled={isSubmitting || !feedback.trim()}
                  >
                    <Sparkles className="size-4" />
                    Submit feedback
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setMode("idle");
                      setFeedback("");
                    }}
                  >
                    Cancel
                  </Button>
                </>
              )}

              {mode === "takeover" && (
                <>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleAction("takeover")}
                    disabled={isSubmitting || !feedback.trim()}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    <Edit3 className="size-4" />
                    Submit override
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setMode("idle");
                      setFeedback("");
                    }}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
