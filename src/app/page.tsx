"use client";

import { Hero } from "@/components/hero";
import { motion } from "framer-motion";
import { MessageSquare, FileCheck } from "lucide-react";
import { ChapterMark, Kicker, DisplayTitle, Hairline, Stamp } from "@/components/sanad/type";
import { ArabicGlyph } from "@/components/sanad/arabic-mark";

const layers = [
  {
    num: "01",
    icon: MessageSquare,
    label: "Sanad Chat",
    title: "Talk to your bank in Darija",
    desc: "WhatsApp conversations in Tunisian Arabic or French. Build your profile, get product suggestions — no paperwork.",
    tone: "teal" as const,
  },
  {
    num: "02",
    icon: FileCheck,
    label: "Daiyn — SME Pipeline",
    title: "Upload. Analyze. Passport in minutes.",
    desc: "Our 5-node AI pipeline processes invoices, bank statements, and open-banking feeds — and delivers a signed Credit Passport.",
    tone: "gold" as const,
  },
];

const features = [
  {
    glyph: "ص",
    title: "Ed25519 Signed",
    desc: "Every passport cryptographically signed and publicly verifiable.",
  },
  {
    glyph: "س",
    title: "Minutes, Not Weeks",
    desc: "From document upload to signed passport in under 5 minutes.",
  },
  {
    glyph: "ت",
    title: "Tunisia-First",
    desc: "Darija conversations, TND-native numbers, Tunisian SME benchmarks.",
  },
  {
    glyph: "ذ",
    title: "Explainable AI",
    desc: "Every credit score ships with a full audit trail and reasoning trace.",
  },
];

export default function HomePage() {
  return (
    <main id="main-content">
      <Hero />

      {/* ── 2-layer story ── */}
      <section
        id="how"
        aria-labelledby="how-heading"
        className="mx-auto max-w-6xl px-6 pb-28 pt-4"
      >
        <Hairline className="mb-16" />
        <ChapterMark num="01" label="How it works" tone="terra" className="mb-6" />
        <DisplayTitle as="h2" id="how-heading" size="lg" italic="Two layers. One passport.">
          Close the credit gap
        </DisplayTitle>
        <p className="mt-5 mb-14 max-w-xl text-base leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
          From conversation to signed passport — two AI systems working together.
        </p>

        <ol className="grid gap-5 md:grid-cols-2" aria-label="Sanad layers">
          {layers.map((layer, idx) => {
        const accentColor = layer.tone === "teal" ? "var(--linear-brand)" : "var(--linear-accent)";
            return (
              <motion.li
                key={layer.num}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.3 }}
                className="list-none"
              >
                <div
                  className="h-full rounded-2xl border p-8 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30"
                  style={{ borderColor: "var(--border)", borderLeftColor: accentColor, borderLeftWidth: 3 }}
                >
                  <div className="flex items-start justify-between mb-6">
                    <layer.icon aria-hidden className="size-6" style={{ color: accentColor }} />
                    <span
                      className="font-mono text-3xl font-bold tabular-nums"
                      style={{ color: "var(--border)" }}
                    >
                      {layer.num}
                    </span>
                  </div>
                  <Kicker className="mb-2">{layer.label}</Kicker>
                  <h3 className="font-instrument text-xl leading-snug mb-3">{layer.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                    {layer.desc}
                  </p>
                </div>
              </motion.li>
            );
          })}
        </ol>
      </section>

      {/* ── Features ── */}
      <section
        aria-labelledby="features-heading"
        className="border-t px-6 py-24"
        style={{ borderColor: "var(--border)", background: "var(--card)" }}
      >
        <div className="mx-auto max-w-6xl">
          <ChapterMark num="02" label="Why Sanad" tone="gold" className="mb-6" />
          <DisplayTitle as="h2" id="features-heading" size="md" italic="built for trust.">
            Open, signed,
          </DisplayTitle>

          <dl className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, idx) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.07, duration: 0.25 }}
                className="flex flex-col gap-4"
              >
                <ArabicGlyph char={f.glyph} size={36} />
                <dt className="font-instrument text-lg">{f.title}</dt>
                <dd className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{f.desc}</dd>
              </motion.div>
            ))}
          </dl>

          <div className="mt-14 flex flex-wrap gap-4">
            <Stamp label="Ed25519 signed" tone="gold" />
            <Stamp label="Open Banking" tone="teal" />
            <Stamp label="Tunisia-native" tone="terra" />
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t px-6 py-10" style={{ borderColor: "var(--border)" }}>
        <div className="mx-auto max-w-6xl flex flex-col items-center gap-1 text-center sm:flex-row sm:justify-between">
          <p className="font-mono text-[11px] tracking-[0.14em] uppercase" style={{ color: "var(--muted-foreground)" }}>
            Sanad &mdash; One passport. Every bank. Instant credit.
          </p>
          <p className="font-mono text-[10px] tracking-[0.1em]" style={{ color: "var(--muted-foreground)" }}>
            Sanad Hackathon · INSAT · April&nbsp;18,&nbsp;2026
          </p>
        </div>
      </footer>
    </main>
  );
}

