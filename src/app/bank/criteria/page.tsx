"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Award, Save, RotateCcw, CheckCircle2 } from "lucide-react";

const SECTORS = [
  "Food & Beverage",
  "Retail",
  "Tech",
  "Agriculture",
  "Manufacturing",
  "Services",
  "Transport",
  "Construction",
];

const REGIONS = [
  "Tunis",
  "Sfax",
  "Sousse",
  "Bizerte",
  "Nabeul",
  "Gabès",
  "Ariana",
  "Ben Arous",
];

export default function CriteriaPage() {
  const [minScore, setMinScore] = React.useState(600);
  const [maxPD, setMaxPD] = React.useState(15);
  const [minRevenue, setMinRevenue] = React.useState(20000);
  const [maxLoan, setMaxLoan] = React.useState(150000);
  const [sectors, setSectors] = React.useState<string[]>(["Food & Beverage", "Retail", "Tech"]);
  const [regions, setRegions] = React.useState<string[]>(["Tunis", "Sfax", "Sousse"]);
  const [saved, setSaved] = React.useState(false);

  function toggleSector(s: string) {
    setSectors((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
    setSaved(false);
  }
  function toggleRegion(r: string) {
    setRegions((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));
    setSaved(false);
  }
  function handleSave() {
    // In production: PATCH /api/bank/criteria
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }
  function handleReset() {
    setMinScore(600);
    setMaxPD(15);
    setMinRevenue(20000);
    setMaxLoan(150000);
    setSectors(["Food & Beverage", "Retail", "Tech"]);
    setRegions(["Tunis", "Sfax", "Sousse"]);
    setSaved(false);
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="border-border/60 bg-card/50 w-64 border-r p-6">
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2">
            <Image src="/logo.svg" alt="Finnovo" width={90} height={50} className="h-7 w-auto" />
          </div>
          <p className="text-muted-foreground text-xs">Officer Portal</p>
        </div>
        <nav aria-label="Bank officer navigation" className="space-y-1">
          <Link
            href="/bank"
            className="text-muted-foreground hover:bg-muted flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
          >
            <TrendingUp aria-hidden="true" className="size-4" />
            Dashboard
          </Link>
          <Link
            href="/bank/leads"
            className="text-muted-foreground hover:bg-muted flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
          >
            <Users aria-hidden="true" className="size-4" />
            Leads
          </Link>
          <Link
            href="/bank/criteria"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium"
            style={{ background: "var(--primary)/10", color: "var(--primary)" }}
            aria-current="page"
          >
            <Award aria-hidden="true" className="size-4" />
            Criteria
          </Link>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          className="max-w-3xl"
        >
          <div className="mb-8">
            <h1 className="mb-1 font-instrument text-3xl leading-tight tracking-tight">
              Lead Criteria
            </h1>
            <p className="text-muted-foreground text-sm">
              Configure which credit passports surface as qualified leads for your bank.
              Only leads matching all criteria will appear in your dashboard.
            </p>
          </div>

          <div className="space-y-6">
            {/* Credit score threshold */}
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Credit Score Threshold</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <Label>Minimum score</Label>
                  <span className="font-mono font-semibold" style={{ color: "var(--primary)" }}>
                    {minScore} / 1000
                  </span>
                </div>
                <input
                  type="range"
                  min={300}
                  max={900}
                  step={10}
                  value={minScore}
                  onChange={(e) => { setMinScore(Number(e.target.value)); setSaved(false); }}
                  className="w-full accent-[#26397A]"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>300 (High risk)</span>
                  <span>900 (Prime)</span>
                </div>
              </CardContent>
            </Card>

            {/* PD threshold */}
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Max Probability of Default (12m)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <Label>Maximum PD</Label>
                  <span className="font-mono font-semibold text-amber-600">{maxPD}%</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={40}
                  step={1}
                  value={maxPD}
                  onChange={(e) => { setMaxPD(Number(e.target.value)); setSaved(false); }}
                  className="w-full accent-[#26397A]"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1% (Conservative)</span>
                  <span>40% (Permissive)</span>
                </div>
              </CardContent>
            </Card>

            {/* Loan size */}
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Loan Size Range (TND)</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <Label htmlFor="minRev">Min annual revenue</Label>
                    <span className="font-mono text-xs font-semibold">{minRevenue.toLocaleString("fr-TN")} TND</span>
                  </div>
                  <input
                    id="minRev"
                    type="range"
                    min={5000}
                    max={200000}
                    step={5000}
                    value={minRevenue}
                    onChange={(e) => { setMinRevenue(Number(e.target.value)); setSaved(false); }}
                    className="w-full accent-[#26397A]"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <Label htmlFor="maxLoan">Max loan requested</Label>
                    <span className="font-mono text-xs font-semibold">{maxLoan.toLocaleString("fr-TN")} TND</span>
                  </div>
                  <input
                    id="maxLoan"
                    type="range"
                    min={5000}
                    max={500000}
                    step={5000}
                    value={maxLoan}
                    onChange={(e) => { setMaxLoan(Number(e.target.value)); setSaved(false); }}
                    className="w-full accent-[#26397A]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Sectors */}
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Accepted Sectors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {SECTORS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSector(s)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                        sectors.includes(s)
                          ? "border-[#26397A]/40 bg-[#26397A]/10 text-[#26397A]"
                          : "border-border/60 text-muted-foreground hover:border-[#26397A]/30"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {sectors.length} of {SECTORS.length} sectors selected
                </p>
              </CardContent>
            </Card>

            {/* Regions */}
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Target Regions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {REGIONS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => toggleRegion(r)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                        regions.includes(r)
                          ? "border-[#26397A]/40 bg-[#26397A]/10 text-[#26397A]"
                          : "border-border/60 text-muted-foreground hover:border-[#26397A]/30"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {regions.length} of {REGIONS.length} regions selected
                </p>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <Button onClick={handleSave} style={{ background: "#26397A", color: "#F4E5CC" }}>
                {saved ? (
                  <>
                    <CheckCircle2 className="mr-2 size-4" />
                    Criteria saved
                  </>
                ) : (
                  <>
                    <Save className="mr-2 size-4" />
                    Save criteria
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="mr-2 size-4" />
                Reset to defaults
              </Button>
              {saved && (
                <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                  Active — leads are being filtered
                </Badge>
              )}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
