"use client";

import { Hero } from "@/components/hero";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NumberTicker } from "@/components/number-ticker";
import { formatCompact } from "@/lib/utils";
import { Bot, GitBranch, ShieldCheck, Workflow } from "lucide-react";

const features = [
  {
    icon: Workflow,
    title: "Supervisor + specialists",
    desc: "A supervisor agent plans which specialists to dispatch — fundamentals, news, risk — and fans the work out in parallel.",
  },
  {
    icon: ShieldCheck,
    title: "Built-in critic loop",
    desc: "Every answer is reviewed by a second model before it reaches the user. Hallucinations get caught, not shipped.",
  },
  {
    icon: GitBranch,
    title: "Visible reasoning trace",
    desc: "Watch each agent's step live. The panel is the product — transparency is the trust builder.",
  },
  {
    icon: Bot,
    title: "Persistent memory",
    desc: "Agents remember what you care about across sessions, so the copilot grows with you.",
  },
];

export default function HomePage() {
  return (
    <main>
      <Hero />

      <section id="how" className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm">Agents deployed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tracking-tight">
                <NumberTicker value={6} />
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm">Avg response</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tracking-tight">
                <NumberTicker value={2400} formatter={(v) => `${v} ms`} />
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm">Queries served</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tracking-tight">
                <NumberTicker value={18400} formatter={formatCompact} />
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm">Hallucinations caught</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tracking-tight text-emerald-500">
                <NumberTicker value={312} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {features.map((f) => (
            <Card key={f.title} className="border-border/60">
              <CardHeader>
                <div className="bg-brand-500/10 text-brand-600 mb-2 flex size-10 items-center justify-center rounded-lg">
                  <f.icon className="size-5" />
                </div>
                <CardTitle className="text-lg">{f.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">{f.desc}</CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
