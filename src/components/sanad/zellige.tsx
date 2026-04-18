// src/components/sanad/zellige.tsx
// Animated Islamic geometric motif — renders as a decorative SVG backdrop.
"use client";

import * as React from "react";

interface Props {
  size?: number;
  className?: string;
  stroke?: string;
  spin?: number;
  opacity?: number;
}

export function Zellige({
  size = 180,
  className,
  stroke = "currentColor",
  spin = 0,
  opacity = 0.5,
}: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.48;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      aria-hidden="true"
      style={{
        opacity,
        animation: spin ? `sanad-spin ${spin}s linear infinite` : undefined,
      }}
    >
      <defs>
        <style>{`
          @keyframes sanad-spin {
            from { transform: rotate(0deg); transform-origin: center; }
            to   { transform: rotate(360deg); transform-origin: center; }
          }
        `}</style>
      </defs>
      <g
        fill="none"
        stroke={stroke}
        strokeWidth="0.6"
        style={{ transformOrigin: "center", transformBox: "fill-box" }}
      >
        {/* 12-pointed star */}
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i * Math.PI) / 6;
          const x = cx + Math.cos(a) * r;
          const y = cy + Math.sin(a) * r;
          return <line key={i} x1={cx} y1={cy} x2={x} y2={y} />;
        })}
        {/* Concentric rings */}
        {[0.2, 0.35, 0.5, 0.7, 0.85].map((f, i) => (
          <circle key={i} cx={cx} cy={cy} r={r * f} />
        ))}
        {/* 8-fold rosette */}
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i * Math.PI) / 4;
          const x1 = cx + Math.cos(a) * r * 0.35;
          const y1 = cy + Math.sin(a) * r * 0.35;
          const x2 = cx + Math.cos(a + Math.PI / 4) * r * 0.7;
          const y2 = cy + Math.sin(a + Math.PI / 4) * r * 0.7;
          return <line key={`r${i}`} x1={x1} y1={y1} x2={x2} y2={y2} />;
        })}
        {/* Outer polygon */}
        <polygon
          points={Array.from({ length: 12 })
            .map((_, i) => {
              const a = (i * Math.PI) / 6;
              return `${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`;
            })
            .join(" ")}
        />
      </g>
    </svg>
  );
}

/** Corner flourish — four small marks in page corners. */
export function CornerMarks({ color = "var(--linear-accent)" }: { color?: string }) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-40">
      <svg className="absolute top-6 left-6 size-8" viewBox="0 0 32 32" fill="none" stroke={color} strokeWidth="1">
        <path d="M 2 2 L 2 14 M 2 2 L 14 2" strokeLinecap="round" />
      </svg>
      <svg className="absolute top-6 right-6 size-8" viewBox="0 0 32 32" fill="none" stroke={color} strokeWidth="1">
        <path d="M 30 2 L 30 14 M 30 2 L 18 2" strokeLinecap="round" />
      </svg>
      <svg className="absolute bottom-6 left-6 size-8" viewBox="0 0 32 32" fill="none" stroke={color} strokeWidth="1">
        <path d="M 2 30 L 2 18 M 2 30 L 14 30" strokeLinecap="round" />
      </svg>
      <svg className="absolute bottom-6 right-6 size-8" viewBox="0 0 32 32" fill="none" stroke={color} strokeWidth="1">
        <path d="M 30 30 L 30 18 M 30 30 L 18 30" strokeLinecap="round" />
      </svg>
    </div>
  );
}

/** Hairline grid overlay — 12-col, editorial reference. */
export function HairlineGrid({ cols = 12 }: { cols?: number }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 mx-auto max-w-[1440px] opacity-[0.04]"
      style={{
        backgroundImage: `repeating-linear-gradient(90deg, currentColor 0, currentColor 1px, transparent 1px, transparent calc(100% / ${cols}))`,
        color: "var(--linear-accent)",
      }}
    />
  );
}
