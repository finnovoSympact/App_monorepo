// src/components/sanad/type.tsx
// Typographic primitives + micro-components used across Sanad pages.
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// ── Chapter mark: "01 — The problem" —————————————————————————————
// Uses Linear's "micro label" pattern: 12px, weight 510, subtle muted color
export function ChapterMark({
  num,
  label,
  className,
  tone = "gold",
}: {
  num: string;
  label: string;
  className?: string;
  tone?: "gold" | "terra" | "teal";
}) {
  // All tones map to cool grays in Linear system; accent only on gold
  const color =
    tone === "terra"
      ? "var(--linear-text-3)"
      : tone === "teal"
        ? "var(--linear-text-3)"
        : "var(--linear-accent)";
  return (
    <div
      className={cn(
        "flex items-center gap-4 text-[12px] tracking-[0.18em] uppercase font-mono",
        className,
      )}
      style={{ color, fontWeight: 510 }}
    >
      <span>{num}</span>
      <span className="h-px w-8" style={{ background: color, opacity: 0.4 }} />
      <span style={{ color: "var(--linear-text-2)" }}>{label}</span>
    </div>
  );
}

// ── Editorial kicker — section label above a big title ———————————————
export function Kicker({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "font-mono text-[11px] tracking-[0.2em] uppercase",
        className,
      )}
      style={{ color: "var(--linear-text-3)", fontWeight: 510 }}
    >
      {children}
    </p>
  );
}

// ── DisplayTitle — Inter Variable 510 weight, tight tracking ——————————
// Linear’s display rule: -0.022em letter-spacing at all display sizes
export function DisplayTitle({
  children,
  italic,
  className,
  as: Tag = "h1" as React.ElementType,
  size = "xl",
  ...rest
}: {
  children: React.ReactNode;
  italic?: React.ReactNode;
  className?: string;
  as?: React.ElementType;
  size?: "sm" | "md" | "lg" | "xl" | "xxl";
  id?: string;
  [key: string]: unknown;
}) {
  const sizeCls =
    size === "xxl"
      ? "text-[clamp(3.5rem,7vw,4.5rem)]"
      : size === "xl"
        ? "text-[clamp(2.8rem,5.5vw,4rem)]"
        : size === "lg"
          ? "text-[clamp(2rem,4vw,3rem)]"
          : size === "md"
            ? "text-[clamp(1.6rem,3vw,2.25rem)]"
            : "text-[clamp(1.3rem,2.2vw,1.75rem)]";

  return (
    <Tag
      className={cn(
        "font-instrument leading-[1.0] tracking-display",
        sizeCls,
        className,
      )}
      style={{ fontWeight: 510 }}
      {...rest}
    >
      {children}
      {italic && (
        <>
          <br />
          <span
            className="italic"
            style={{ color: "var(--linear-accent)", fontWeight: 400 }}
          >
            {italic}
          </span>
        </>
      )}
    </Tag>
  );
}

// ── BigNumber — huge serif tabular figure, counts up on mount —————————
export function BigNumber({
  value,
  suffix = "",
  prefix = "",
  duration = 1.6,
  className,
  tone = "paper",
  size = "xl",
  decimals = 0,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
  tone?: "paper" | "gold" | "terra" | "teal";
  size?: "md" | "lg" | "xl" | "xxl";
  decimals?: number;
}) {
  const [n, setN] = React.useState(0);
  const startRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    let raf = 0;
    const tick = (t: number) => {
      if (startRef.current == null) startRef.current = t;
      const p = Math.min(1, (t - startRef.current) / (duration * 1000));
      const eased = 1 - Math.pow(1 - p, 3);
      setN(value * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  // Linear: brand indigo replaces gold/teal, cool gray replaces terracotta
  const color =
    tone === "gold"
      ? "var(--linear-accent)"
      : tone === "terra"
        ? "var(--linear-text-2)"
        : tone === "teal"
          ? "var(--linear-brand)"
          : "var(--linear-text-1)";

  const sizeCls =
    size === "xxl"
      ? "text-[clamp(4rem,10vw,10rem)]"
      : size === "xl"
        ? "text-[clamp(3rem,7vw,7rem)]"
        : size === "lg"
          ? "text-[clamp(2.2rem,4.5vw,4.5rem)]"
          : "text-[clamp(1.6rem,2.8vw,2.8rem)]";

  return (
    <span
      className={cn("leading-none tabular-nums tracking-display", sizeCls, className)}
      style={{ color, fontWeight: 510 }}
    >
      {prefix}
      {n.toLocaleString("fr-TN", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}

// ── Marquee — horizontal ticker for logo strips, status rails ——————————
export function Marquee({
  children,
  speed = 40,
  className,
}: {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div
        className="flex gap-16 whitespace-nowrap"
        style={{
          animation: `sanad-marquee ${speed}s linear infinite`,
          width: "max-content",
        }}
      >
        {children}
        {children}
      </div>
      <style jsx>{`
        @keyframes sanad-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

// ── StatusDot — animated pulse dot —————————————————————————————————
export function StatusDot({ tone = "teal" }: { tone?: "teal" | "gold" | "terra" | "danger" }) {
  const colors = {
    teal: "var(--linear-brand)",
    gold: "var(--linear-accent)",
    terra: "var(--linear-text-2)",
    danger: "#ef4444",
  } as const;
  const c = colors[tone];
  return (
    <span className="relative inline-flex size-2">
      <span
        className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
        style={{ background: c }}
      />
      <span className="relative inline-flex size-2 rounded-full" style={{ background: c }} />
    </span>
  );
}

// ── Hairline — editorial horizontal separator with optional label —————
export function Hairline({
  label,
  className,
}: {
  label?: string;
  className?: string;
}) {
  if (!label) {
    return (
      <div
        className={cn("h-px w-full", className)}
        style={{ background: "var(--border)" }}
      />
    );
  }
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div className="h-px flex-1" style={{ background: "var(--border)" }} />
      <span
        className="font-mono text-[10px] tracking-[0.2em] uppercase"
        style={{ color: "var(--muted-foreground)" }}
      >
        {label}
      </span>
      <div className="h-px flex-1" style={{ background: "var(--border)" }} />
    </div>
  );
}

// ── Stamp — Ed25519 / verified / signed mark ——————————————————————
// Linear style: neutral pill, rgba border, muted text
export function Stamp({
  label,
  sub,
  tone = "gold",
}: {
  label: string;
  sub?: string;
  tone?: "gold" | "teal" | "terra";
}) {
  const accentColor =
    tone === "teal"
      ? "var(--linear-brand)"
      : tone === "terra"
        ? "var(--linear-text-3)"
        : "var(--linear-accent)";
  return (
    <div
      className="inline-flex items-center gap-2.5 rounded-full border px-4 py-1.5"
      style={{
        borderColor: "rgba(255,255,255,0.12)",
        color: "var(--linear-text-2)",
        background: "rgba(255,255,255,0.02)",
      }}
    >
      <svg width="13" height="13" viewBox="0 0 14 14" fill="none" style={{ color: accentColor }}>
        <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1" />
        <path d="M 4 7 L 6 9 L 10 5" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="font-mono text-[11px] tracking-[0.14em] uppercase" style={{ fontWeight: 510 }}>{label}</span>
      {sub && (
        <span className="font-mono text-[10px] tracking-[0.08em] opacity-50">{sub}</span>
      )}
    </div>
  );
}
