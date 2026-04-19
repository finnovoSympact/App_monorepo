"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Zellige } from "@/components/sanad/zellige";
import { DisplayTitle, BigNumber, Stamp, Hairline } from "@/components/sanad/type";
import { useAuth, roleRedirect } from "@/lib/use-auth";

const stats = [
  { value: 2000000, suffix: "+", label: "individuals in Tunisia have no bank accounts", tone: "gold" as const },
  { value: 5, suffix: " min", label: "upload to credit passport", tone: "terra" as const },
  { value: 5, suffix: "-node", label: "AI agent pipeline", tone: "teal" as const },
];

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const { user, ready } = useAuth();
  const ctaHref = ready && user ? roleRedirect(user.role) : "/signup";
  const ctaLabel = ready && user ? "Go to dashboard" : "Get started";

  return (
    <section
      className="relative overflow-hidden px-6 pb-20 pt-14 sm:pt-20 lg:pt-24"
      aria-labelledby="hero-heading"
    >
      {/* ── Zellige backdrop — top-right corner ── */}
      <div aria-hidden className="pointer-events-none absolute -top-20 -right-24 -z-10">
        <Zellige size={520} stroke="var(--linear-accent)" opacity={0.04} spin={120} />
      </div>
      <div aria-hidden className="pointer-events-none absolute -bottom-40 -left-32 -z-10">
        <Zellige size={380} stroke="rgba(255,255,255,0.12)" opacity={0.6} />
      </div>

      {/* ── Indigo radial glow ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-16 -z-10 h-[600px] w-[700px] rounded-full"
        style={{ background: "radial-gradient(ellipse at 30% 30%, rgba(38,57,122,0.08), transparent 65%)" }}
      />

      <div className="mx-auto max-w-6xl">

        {/* ── Logo + tagline ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease }}
          className="mb-8 flex items-center gap-4"
        >
          <Image src="/logo.svg" alt="Finnovo" width={120} height={67} priority className="h-9 w-auto" />
          <span className="h-px w-8 bg-[#26397A]/30" />
          <span
            className="font-mono text-[11px] tracking-[0.18em] uppercase"
            style={{ color: "var(--navy-500, #5a7299)", fontWeight: 510 }}
          >
            Credit Passport Platform · Tunisia
          </span>
        </motion.div>

        {/* ── Two-column layout ── */}
        <div className="grid items-start gap-14 lg:grid-cols-[1fr_280px] lg:gap-20">

          {/* LEFT: headline + sub + CTA */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease }}
            >
              <DisplayTitle as="h1" id="hero-heading" size="xxl" italic="Instant credit.">
                One passport.<br />Every bank.
              </DisplayTitle>
            </motion.div>

            <motion.p
              className="mt-6 mb-8 max-w-[52ch] text-lg leading-relaxed"
              style={{ color: "var(--muted-foreground)" }}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.24, ease }}
            >
              Finnovo speaks Darija, reads invoices, and delivers a signed Credit Passport in
              minutes&nbsp;&mdash; not days. Built for Tunisia&rsquo;s&nbsp;2&nbsp;million
              unbanked individuals.
            </motion.p>

            <motion.div
              className="flex flex-wrap items-center gap-4"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.36, ease }}
            >
              <Button
                asChild
                size="lg"
                className="rounded-[8px] px-8 text-base font-medium transition-all hover:scale-[1.02]"
                style={{
                  background: "var(--navy-800, #26397A)",
                  color: "#fff",
                  boxShadow: "0 1px 4px rgba(38,57,122,0.3), 0 4px 16px rgba(38,57,122,0.2)",
                }}
              >
                <Link href={ctaHref}>
                  {ctaLabel}
                  <ArrowRight aria-hidden className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-[8px] px-6 text-base font-medium transition-all hover:scale-[1.01]"
              >
                <Link href="#pricing" className="flex items-center gap-2">
                  <TrendingUp aria-hidden className="size-4 text-emerald-500" />
                  <span>65% win rate</span>
                  <span className="font-mono text-[11px] opacity-60">→ pricing</span>
                </Link>
              </Button>
              <Stamp label="Ed25519 signed" tone="gold" />
            </motion.div>
          </div>

          {/* RIGHT: floating stats */}
          <motion.aside
            aria-label="Key statistics"
            className="hidden lg:block"
            initial={{ opacity: 0, x: 24, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease }}
          >
            <div
              className="rounded-2xl border p-7 shadow-2xl shadow-black/40"
              style={{ borderColor: "var(--linear-border)", background: "var(--linear-bg-3)" }}
            >
              <Hairline label="at a glance" className="mb-6" />
              <dl className="space-y-6">
                {stats.map(({ value, suffix, label, tone }, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 0.4 }}
                  >
                    <dd>
                      <BigNumber value={value} suffix={suffix} tone={tone} size="lg" duration={1.4 + i * 0.2} />
                    </dd>
                    <dt
                      className="mt-1 font-mono text-[11px] tracking-[0.12em] uppercase"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      {label}
                    </dt>
                  </motion.div>
                ))}
              </dl>
              <Hairline className="mt-6" />
            </div>
          </motion.aside>
        </div>
      </div>
    </section>
  );
}
