"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { ChapterMark } from "@/components/sanad/type";

interface Pack {
  id: string;
  name: string;
  sector: string;
  city: string;
  status: string;
  creditScore: number;
}

interface RecentRun {
  id: string;
  sme: string;
  goal: string;
  status: "completed" | "running" | "pending";
  startedAt: string;
}

const ease = [0.22, 1, 0.36, 1] as const;

export default function DashboardPage() {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/demo/packs/index.json")
      .then((r) => r.json())
      .then((data) => {
        setPacks(data.packs || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const recentRuns: RecentRun[] = [
    {
      id: "demo-run-001",
      sme: "Café El Wafa SARL",
      goal: "Working capital 30k TND",
      status: "completed",
      startedAt: "2026-04-18T09:30:00Z",
    },
    {
      id: "demo-run-002",
      sme: "SouqDigital Marketplace",
      goal: "Expansion loan 50k TND",
      status: "completed",
      startedAt: "2026-04-17T14:20:00Z",
    },
  ];

  const avgScore =
    packs.length > 0
      ? Math.round(packs.reduce((sum, p) => sum + p.creditScore, 0) / packs.length)
      : null;

  const statCols = [
    { label: "Active runs", value: "2", unit: null, delta: null },
    { label: "Passports issued", value: packs.length || "—", unit: null, delta: "+2 this week" },
    { label: "Avg credit score", value: avgScore ?? "—", unit: "/100", delta: null },
    { label: "Days until expiry", value: "89", unit: "d", delta: "Renews Jul 17" },
  ];

  return (
    <main id="main-content">

      {/* ── Status bar ── */}
      <div className="border-b border-white/8">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-2.5 font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
          <span className="flex items-center gap-2">
            <span
              className="inline-block size-1.5 rounded-full"
              style={{ background: "var(--linear-brand)", boxShadow: "0 0 0 3px rgba(94,106,210,0.25)" }}
              aria-hidden="true"
            />
            Daiyn Console — v1
          </span>
          <span className="text-white/20">/</span>
          <span>SME Credit Intelligence</span>
          <span className="ml-auto">
            {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
          </span>
        </div>
      </div>

      {/* ── Hero ── */}
      <motion.div
        className="border-b border-white/8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease }}
      >
        <div className="mx-auto max-w-6xl px-6 pb-0 pt-14">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: "var(--linear-text-3)" }}>
            Dashboard
          </p>
          <h1 className="font-instrument mt-4 text-[clamp(3rem,6vw,5.5rem)] leading-[0.97] tracking-tight">
            {loading ? (
              "Daiyn."
            ) : (
              <>
                {packs[0]?.name?.split(" ")[0] || "Entrepreneur"}.
                <br />
                <span className="italic" style={{ color: "var(--linear-accent)" }}>
                  Credit intelligence.
                </span>
              </>
            )}
          </h1>

          {/* ── Stat grid — hairline column separators, no cards ── */}
          <div className="mt-14 grid grid-cols-2 border-t border-white/8 lg:grid-cols-4">
            {statCols.map((s, i) => (
              <motion.div
                key={s.label}
                className="border-b border-r border-white/8 py-6 pr-6 last:border-r-0 lg:border-b-0"
                style={{ borderRight: i === statCols.length - 1 ? "none" : undefined }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 + i * 0.07, duration: 0.4 }}
              >
                <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
                  {s.label}
                </p>
                {loading ? (
                  <Skeleton className="mt-3 h-12 w-20" />
                ) : (
                  <>
                    <p className="font-instrument mt-3 text-[3.2rem] leading-none tracking-tight">
                      {s.value}
                      {s.unit && (
                        <span className="font-mono text-lg text-muted-foreground ml-1">{s.unit}</span>
                      )}
                    </p>
                    {s.delta && (
                      <p className="mt-2 font-mono text-[12px] text-muted-foreground">{s.delta}</p>
                    )}
                  </>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="mx-auto max-w-6xl px-6">

        {/* ── Section 01 — Recent Runs ── */}
        <motion.section
          className="border-b border-white/8 py-14"
          aria-labelledby="runs-heading"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25, ease }}
        >
          <div className="mb-8 flex items-baseline gap-5">
            <ChapterMark num="01" label="Recent runs" tone="terra" />
            <div className="ml-auto">
              <Button asChild size="sm" className="rounded-full px-5">
                <Link href="/dashboard/upload">
                  Start new file
                  <ArrowRight aria-hidden="true" className="size-3.5" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Timetable layout — editorial rows */}
          <div className="border-t border-white/8">
            {loading ? (
              <div className="space-y-0">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="border-b border-white/8 py-5">
                    <Skeleton className="h-6 w-64" />
                  </div>
                ))}
              </div>
            ) : recentRuns.length === 0 ? (
              <div className="py-12 text-center">
                <p className="font-instrument text-xl italic text-muted-foreground">
                  No runs yet — start your first credit file above.
                </p>
              </div>
            ) : (
              recentRuns.map((run) => (
                <motion.div
                  key={run.id}
                  className="group grid items-baseline gap-4 border-b border-white/8 py-5 transition-colors hover:bg-white/[0.02] md:grid-cols-[160px_1fr_auto_180px]"
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.15 }}
                >
                  <p className="font-mono text-[13px] tracking-[0.02em] text-muted-foreground">
                    <span style={{ color: "var(--linear-text-3)" }}>
                      {new Date(run.startedAt).toLocaleDateString("en-GB", { weekday: "short" }).toUpperCase()}
                    </span>{" "}
                    {new Date(run.startedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </p>
                  <p className="font-instrument text-[1.4rem] leading-snug">{run.sme}</p>
                  <p className="text-sm text-muted-foreground hidden md:block">{run.goal}</p>
                  <div className="flex items-center justify-end gap-3">
                    <Badge
                      variant={run.status === "completed" ? "default" : "secondary"}
                      className="font-mono text-[10px] uppercase tracking-widest"
                    >
                      {run.status}
                    </Badge>
                    <Button asChild variant="ghost" size="sm" className="font-mono text-[11px] uppercase tracking-widest">
                      <Link href={`/dashboard/pipeline/${run.id}?offline=1`}>
                        View <ArrowUpRight aria-hidden="true" className="size-3" />
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.section>

        {/* ── Section 02 — Passports ── */}
        <motion.section
          className="py-14"
          aria-labelledby="passports-heading"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35, ease }}
        >
          <div className="mb-8 flex items-baseline gap-5">
            <ChapterMark num="02" label="Your passports" tone="gold" />
          </div>

          {loading ? (
            <div className="grid gap-0 border-t border-white/8 sm:grid-cols-2">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="border-b border-r border-white/8 p-7 last:border-r-0">
                  <Skeleton className="mb-3 h-4 w-24" />
                  <Skeleton className="h-7 w-48" />
                </div>
              ))}
            </div>
          ) : packs.length === 0 ? (
            <div className="border-t border-white/8 py-12 text-center">
              <p className="font-instrument text-xl italic text-muted-foreground">
                No passports yet. Complete your first pipeline run to get started.
              </p>
              <Button asChild className="mt-6 rounded-full px-6">
                <Link href="/dashboard/upload">Start now</Link>
              </Button>
            </div>
          ) : (
            /* File-index grid — editorial layout from the reference */
            <div className="grid border-t border-white/8 sm:grid-cols-2">
              {packs.map((pack, idx) => (
                <motion.div
                  key={pack.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 + idx * 0.07, duration: 0.35 }}
                >
                  <Link
                    href={`/passport/${pack.id}`}
                    className="group block border-b border-r border-white/8 p-7 transition-colors hover:bg-white/[0.025] odd:[&:nth-child(2n)]:border-r-0"
                  >
                    <p className="font-mono text-[10.5px] uppercase tracking-[0.15em]" style={{ color: "var(--linear-text-3)" }}>
                      {pack.sector}
                    </p>
                    <p className="font-instrument mt-2 flex items-center gap-3 text-[1.6rem] leading-snug tracking-tight">
                      {pack.name}
                      <ArrowUpRight
                        aria-hidden="true"
                        className="size-4 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </p>
                    <p className="mt-2.5 text-sm text-muted-foreground">{pack.city}</p>
                    <div className="mt-4 flex items-center gap-4 font-mono text-[11px] text-muted-foreground">
                      <span>
                        Score:{" "}
                        <span
                          className="tabular-nums"
                          style={{ color: pack.creditScore >= 70 ? "var(--linear-success)" : "var(--linear-text-3)" }}
                        >
                          {pack.creditScore}
                        </span>
                      </span>
                      <span>Expires Jul 17, 2026</span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>
      </div>
    </main>
  );
}
