"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Minimal finance area chart. Expects data like:
 *   [{ label: "Jan", value: 1200 }, ...]
 *
 * Use for dashboards and demo tiles. Theme-aware via CSS variables.
 */
export function FinanceChart({
  title,
  data,
  valueKey = "value",
  labelKey = "label",
  height = 240,
}: {
  title: string;
  data: Array<Record<string, string | number>>;
  valueKey?: string;
  labelKey?: string;
  height?: number;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="brand-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--linear-accent)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="var(--linear-accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey={labelKey}
              stroke="var(--muted-foreground)"
              tickLine={false}
              axisLine={false}
              fontSize={12}
            />
            <YAxis
              stroke="var(--muted-foreground)"
              tickLine={false}
              axisLine={false}
              fontSize={12}
              width={40}
            />
            <Tooltip
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: "0.5rem",
                fontSize: 12,
                color: "var(--popover-foreground)",
              }}
            />
            <Area
              type="monotone"
              dataKey={valueKey}
              stroke="var(--linear-accent)"
              strokeWidth={2}
              fill="url(#brand-fill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
