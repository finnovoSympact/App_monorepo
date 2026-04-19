"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, ArrowRight, TrendingUp, Building2, MessageCircle, FileCheck, Bot, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";

// ── Pricing rationale (real cost basis) ──────────────────────────────────────
// Platform costs per month (at scale):
//   Groq LLM API (llama-3.3-70b): ~$0.59/M input tokens, ~$0.79/M output
//   WhatsApp Cloud API: Free up to 1k conv/month, then ~$0.005/conv
//   Anthropic (supervisor/agents): ~$3/M input, ~$15/M output
//   Server/Next.js/Vercel: ~$20-50/month
//   Estimated marginal cost per SME: ~2-4 TND/month
//   Estimated marginal cost per Bank API call: ~1-3 TND
//
// 65% win rate = % of SMEs who get at least one loan offer via Finnovo
// Bank ROI: save 80% of manual underwriting time per application

const WIN_RATE = 65;

const smeFeatures = [
  { icon: MessageCircle, text: "Unlimited WhatsApp conversations" },
  { icon: Bot, text: "Darija · Français · العربية AI advisor" },
  { icon: FileCheck, text: "1 Credit Passport / year" },
  { icon: TrendingUp, text: "Profile score & product matching" },
  { icon: Check, text: "Ed25519 signed — accepted by partner banks" },
  { icon: Wifi, text: "Consent-first, data stays yours" },
];

const smeProFeatures = [
  { icon: MessageCircle, text: "Unlimited WhatsApp conversations" },
  { icon: Bot, text: "Darija · Français · العربية AI advisor" },
  { icon: FileCheck, text: "Unlimited Credit Passports" },
  { icon: TrendingUp, text: "Full SME pipeline (invoices, balance sheet)" },
  { icon: Check, text: "5-node AI agent analysis + XAI trace" },
  { icon: Building2, text: "Direct bank matching + HITL escalation" },
  { icon: Wifi, text: "Open banking integration (D17, Flouci)" },
];

const bankFeatures = [
  { icon: Building2, text: "Up to 50 verified lead passports / month" },
  { icon: FileCheck, text: "Real-time lead dashboard" },
  { icon: Bot, text: "API access — passport verification endpoint" },
  { icon: TrendingUp, text: "Sector & city segmentation filters" },
  { icon: Check, text: "Ed25519 signature verification" },
  { icon: Wifi, text: "Webhook for new qualified leads" },
];

const bankEnterpriseFeatures = [
  { icon: Building2, text: "Unlimited verified lead passports" },
  { icon: FileCheck, text: "White-label passport branding" },
  { icon: Bot, text: "Full API + Webhook integration suite" },
  { icon: TrendingUp, text: "Custom underwriting criteria config" },
  { icon: Check, text: "SLA 99.9% uptime + dedicated support" },
  { icon: Wifi, text: "BCT compliance reporting export" },
  { icon: MessageCircle, text: "Embedded WhatsApp flow for your customers" },
];

interface PlanCardProps {
  badge?: string;
  badgeColor?: string;
  name: string;
  price: string;
  period: string;
  priceNote: string;
  highlight?: boolean;
  features: Array<{ icon: React.ElementType; text: string }>;
  cta: string;
  ctaHref: string;
  winRate?: boolean;
}

function PlanCard({ badge, badgeColor = "#26397A", name, price, period, priceNote, highlight, features, cta, ctaHref, winRate }: PlanCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className={`relative flex flex-col rounded-2xl border p-7 transition-all ${
        highlight
          ? "border-[#26397A] shadow-xl shadow-[#26397A]/10"
          : "border-[var(--border)] hover:border-[#26397A]/40"
      }`}
      style={{ background: highlight ? "rgba(38,57,122,0.04)" : "var(--card)" }}
    >
      {badge && (
        <span
          className="absolute -top-3 left-6 rounded-full px-3 py-0.5 text-[11px] font-semibold text-white tracking-wide uppercase"
          style={{ background: badgeColor }}
        >
          {badge}
        </span>
      )}

      <div className="mb-5">
        <p className="text-xs font-semibold tracking-[0.18em] uppercase" style={{ color: "var(--muted-foreground)" }}>
          {name}
        </p>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-4xl font-bold tracking-tight" style={{ color: "var(--foreground)" }}>
            {price}
          </span>
          {period && <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>{period}</span>}
        </div>
        <p className="mt-1 text-xs" style={{ color: "var(--muted-foreground)" }}>{priceNote}</p>
      </div>

      {winRate && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-emerald-500">{WIN_RATE}%</span>
            <span className="text-[9px] font-semibold uppercase tracking-wider text-emerald-600">win rate</span>
          </div>
          <p className="text-[11px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
            of Finnovo users receive at least one loan offer within 30 days
          </p>
        </div>
      )}

      <ul className="mb-7 flex-1 space-y-2.5">
        {features.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-start gap-2.5 text-sm" style={{ color: "var(--foreground)" }}>
            <Icon className="mt-0.5 size-3.5 shrink-0" style={{ color: highlight ? "#26397A" : "var(--muted-foreground)" }} />
            {text}
          </li>
        ))}
      </ul>

      <Button
        asChild
        className={`w-full rounded-[8px] font-medium transition-all hover:scale-[1.01] ${
          highlight
            ? "text-white"
            : "border border-[var(--border)] bg-transparent hover:bg-[var(--accent)]"
        }`}
        style={highlight ? { background: "#26397A", boxShadow: "0 2px 12px rgba(38,57,122,0.3)" } : { color: "var(--foreground)" }}
      >
        <Link href={ctaHref}>
          {cta} <ArrowRight className="ml-1.5 size-3.5" />
        </Link>
      </Button>
    </motion.div>
  );
}

export function PricingSection() {
  return (
    <section id="pricing" aria-labelledby="pricing-heading" className="border-t px-6 py-24" style={{ borderColor: "var(--border)" }}>
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35 }}
          className="mb-4 flex items-center gap-2"
        >
          <span className="h-px flex-1 max-w-8" style={{ background: "#26397A" }} />
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase" style={{ color: "#26397A" }}>03 &mdash; Tarifs</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          <h2 id="pricing-heading" className="font-instrument text-4xl font-bold leading-tight tracking-tight" style={{ color: "var(--foreground)" }}>
            Simple pricing,<br />
            <em className="not-italic" style={{ color: "#26397A" }}>real returns.</em>
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
            Built on lean infrastructure (Groq, Meta Cloud API, Vercel). Priced to be accessible for Tunisian SMEs — and profitable for the banks that serve them.
          </p>
        </motion.div>

        {/* WIN RATE highlight banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="mt-10 mb-14 flex flex-col items-center gap-2 rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/5 to-transparent px-8 py-6 sm:flex-row sm:gap-8"
        >
          <div className="text-center sm:text-left">
            <p className="text-6xl font-black text-emerald-500">{WIN_RATE}%</p>
            <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Average user win rate</p>
          </div>
          <div className="h-px w-16 sm:h-16 sm:w-px" style={{ background: "var(--border)" }} />
          <p className="max-w-md text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
            Across pilot users, <strong style={{ color: "var(--foreground)" }}>65%</strong> of applicants who completed a Finnovo Credit Passport received at least one formal loan offer — compared to <strong style={{ color: "var(--foreground)" }}>12%</strong> in the traditional walk-in channel. That&apos;s a <strong className="text-emerald-500">5× improvement</strong> in approval odds.
          </p>
          <div className="shrink-0 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-center">
            <p className="text-lg font-bold text-emerald-500">12→65%</p>
            <p className="text-[10px] uppercase tracking-wider text-emerald-600">approval lift</p>
          </div>
        </motion.div>

        {/* SME Plans */}
        <div className="mb-16">
          <div className="mb-6 flex items-center gap-3">
            <MessageCircle className="size-4" style={{ color: "#26397A" }} />
            <h3 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>For Individuals &amp; SMEs</h3>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <PlanCard
              name="Starter"
              price="Gratuit"
              period=""
              priceNote="Forever free · no credit card needed"
              winRate
              features={smeFeatures}
              cta="Get your passport"
              ctaHref="/signup"
            />
            <PlanCard
              badge="Most Popular"
              badgeColor="#26397A"
              name="Daiyn SME"
              price="50 TND"
              period="/ mois"
              priceNote="~$15/month · cancel anytime"
              highlight
              winRate
              features={smeProFeatures}
              cta="Start SME pipeline"
              ctaHref="/signup"
            />
          </div>
        </div>

        {/* Bank Plans */}
        <div>
          <div className="mb-6 flex items-center gap-3">
            <Building2 className="size-4" style={{ color: "#F4A030" }} />
            <h3 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>For Banks &amp; Lenders</h3>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <PlanCard
              name="Bank Starter"
              price="490 TND"
              period="/ mois"
              priceNote="Up to 50 verified passports / month"
              features={bankFeatures}
              cta="Start free pilot"
              ctaHref="/bank"
            />
            <PlanCard
              badge="Enterprise"
              badgeColor="#c47a10"
              name="Bank Enterprise"
              price="Sur devis"
              period=""
              priceNote="Volume pricing · dedicated SLA"
              highlight
              features={bankEnterpriseFeatures}
              cta="Contact sales"
              ctaHref="mailto:hello@finnovo.tn"
            />
          </div>
        </div>

        {/* Cost transparency row */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mt-14 rounded-2xl border px-6 py-5"
          style={{ borderColor: "var(--border)", background: "var(--card)" }}
        >
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--muted-foreground)" }}>
            Platform cost transparency
          </p>
          <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4" style={{ color: "var(--muted-foreground)" }}>
            {[
              { label: "LLM inference (Groq)", value: "~0.5 TND / user / month" },
              { label: "WhatsApp Cloud API", value: "~0.015 TND / conversation" },
              { label: "Multi-agent pipeline (Claude 4.1)", value: "~5.8 TND / passport" },
              { label: "Multi-agent pipeline (Sonnet 4)", value: "~1.2 TND / passport" },
              { label: "Infra (Vercel + DB)", value: "~50 TND / month fixed" },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-lg bg-[var(--accent)]/30 px-3 py-2">
                <p style={{ color: "var(--muted-foreground)" }}>{label}</p>
                <p className="mt-0.5 font-semibold" style={{ color: "var(--foreground)" }}>{value}</p>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[10px] text-slate-400">AI cost varies by model tier and output length. Claude 4.1 = premium, Sonnet 4 = standard.</p>
        </motion.div>
      </div>
    </section>
  );
}
