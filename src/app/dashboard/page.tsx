"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NumberTicker } from "@/components/number-ticker";
import { FinanceChart } from "@/components/finance-chart";
import { formatTND, formatCompact } from "@/lib/utils";
import { TrendingUp, Wallet, PiggyBank, AlertTriangle } from "lucide-react";

// Demo-seed data. Replace with real queries tomorrow.
const monthlySpend = [
  { label: "Jan", value: 2400 },
  { label: "Feb", value: 2180 },
  { label: "Mar", value: 2620 },
  { label: "Apr", value: 2450 },
  { label: "May", value: 2890 },
  { label: "Jun", value: 3100 },
];

const kpis = [
  { icon: Wallet, label: "Net worth", value: 48520, formatter: (v: number) => formatTND(v, 0) },
  { icon: PiggyBank, label: "Savings rate", value: 24, formatter: (v: number) => `${v}%` },
  { icon: TrendingUp, label: "Portfolio YoY", value: 12, formatter: (v: number) => `+${v}%` },
  { icon: AlertTriangle, label: "Flags this week", value: 3, formatter: (v: number) => `${v}` },
];

export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 pt-12 pb-20">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="text-muted-foreground mb-8 text-sm">
        A placeholder finance dashboard. Wire real queries to{" "}
        <code className="bg-muted rounded px-1.5 py-0.5 text-xs">src/lib/db</code> tomorrow.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} className="border-border/60">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-muted-foreground text-sm">{k.label}</CardTitle>
              <k.icon className="text-muted-foreground size-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold tracking-tight">
                <NumberTicker value={k.value} formatter={k.formatter} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <FinanceChart title="Monthly spend (TND)" data={monthlySpend} />
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Agent insights</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-3 text-sm">
            <p>
              Your grocery spend is up <span className="text-foreground font-semibold">18%</span> vs
              last quarter. Agent suggests a commitment contract.
            </p>
            <p>
              Based on your new FX-account eligibility, reallocating{" "}
              <span className="text-foreground font-semibold">{formatCompact(5000)} TND</span> to
              EUR could hedge 7% downside.
            </p>
            <p className="text-xs">Run the playground to explore more.</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
