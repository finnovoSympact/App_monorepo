// src/components/sanad/arabic-mark.tsx
// The Sanad wordmark — stylized Arabic "سند" in SVG.
"use client";

import * as React from "react";

export function ArabicMark({
  size = 80,
  color = "var(--linear-accent)",
  filled = true,
  className,
}: {
  size?: number;
  color?: string;
  filled?: boolean;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size * 0.45}
      viewBox="0 0 820 370"
      className={className}
      aria-label="Sanad"
    >
      <g
        stroke={color}
        fill={filled ? color : "none"}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* د (dal) */}
        <path d="M 720 120 Q 760 120 760 160 Q 760 220 700 220 L 620 220" fill="none" />
        {/* ن (nun) */}
        <path d="M 580 120 Q 540 120 520 160 Q 500 200 520 220 L 600 220" fill="none" />
        <circle cx="540" cy="95" r="10" />
        {/* س (sin) */}
        <path d="M 460 160 L 460 220 L 440 200 L 420 220 L 400 200 L 380 220 L 360 200 L 340 220 L 320 220
                 Q 290 220 290 190 Q 290 160 320 160 L 460 160 Z" />
        {/* baseline */}
        <path d="M 260 245 L 780 245" fill="none" />
      </g>
    </svg>
  );
}

export function ArabicGlyph({
  char = "س",
  size = 36,
  color = "var(--linear-accent)",
  bg = "var(--foreground)",
}: {
  char?: string;
  size?: number;
  color?: string;
  bg?: string;
}) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full font-instrument italic"
      style={{
        width: size,
        height: size,
        background: color,
        color: bg,
        fontSize: size * 0.7,
        lineHeight: 1,
        paddingTop: size * 0.05,
      }}
      aria-hidden
    >
      {char}
    </span>
  );
}
