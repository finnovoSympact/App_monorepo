"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Users,
  Flame,
  Banknote,
  ArrowRight,
  Building2,
  MapPin,
  Award,
  ExternalLink,
} from "lucide-react";

interface Lead {
  id: string;
  name: string;
  kind: "individual" | "sme";
  sector: string;
  city: string;
  creditScore: number;
  matchScore: number;
  status: "new" | "contacted" | "converted";
}

export default function BankPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load demo leads
    fetch("/demo/packs/index.json")
      .then((r) => r.json())
      .then((data) => {
        const demoLeads: Lead[] = data.packs.map(
          (pack: {
            id: string;
            name: string;
            sector: string;
            city: string;
            creditScore: number;
          }) => ({
            id: pack.id,
            name: pack.name,
            kind: "sme" as const,
            sector: pack.sector,
            city: pack.city,
            creditScore: pack.creditScore,
            matchScore: pack.creditScore >= 70 ? 85 : pack.creditScore >= 60 ? 68 : 45,
            status: pack.creditScore >= 70 ? "new" : "contacted",
          }),
        );
        setLeads(demoLeads);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const kpis = [
    {
      icon: Users,
      label: "New leads today",
      value: leads.filter((l) => l.status === "new").length.toString(),
      color: "text-blue-600",
    },
    {
      icon: Flame,
      label: "Hot leads",
      value: leads.filter((l) => l.matchScore >= 70).length.toString(),
      color: "text-orange-600",
    },
    {
      icon: TrendingUp,
      label: "Converted this month",
      value: "7",
      color: "text-emerald-600",
    },
    {
      icon: Banknote,
      label: "Revenue earned",
      value: "315 TND",
      color: "text-[#26397A]",
    },
  ];

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 70) return "default";
    if (score >= 50) return "secondary";
    return "outline";
  };

  const getMatchColor = (score: number) => {
    if (score >= 70) return "text-orange-600";
    if (score >= 50) return "text-amber-600";
    return "text-muted-foreground";
  };

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
            className="flex items-center gap-2 rounded-lg bg-orange-500/10 px-3 py-2 text-sm font-medium text-orange-600"
            aria-current="page"
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
            className="text-muted-foreground hover:bg-muted flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
          >
            <Award aria-hidden="true" className="size-4" />
            Criteria
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <main id="main-content" className="flex-1 p-8">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
        >
          <div className="mb-8">
            <h1 className="mb-1 font-instrument text-[clamp(2rem,4vw,3rem)] leading-tight tracking-tight">Welcome back, Officer</h1>
            <p className="text-muted-foreground text-sm">
              Your qualified leads dashboard — powered by Sanad Credit Passports
            </p>
          </div>

          {/* KPI strip */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {kpis.map((kpi, idx) => (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.18 }}
              >
                <Card className="border-border/60">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-muted-foreground text-xs font-medium uppercase tracking-wide">{kpi.label}</CardTitle>
                    <kpi.icon aria-hidden="true" className={`size-4 ${kpi.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="tabular-nums text-3xl font-bold tracking-tight">{kpi.value}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Quick actions */}
          <div className="mb-8 flex gap-3">
            <Button asChild>
              <Link href="/bank/leads">
                View All Leads
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/bank/criteria">Configure criteria</Link>
            </Button>
          </div>

          {/* Incoming leads table */}
          <Card className="border-border/60">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-instrument">Incoming leads</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/bank/leads">
                    View all
                    <ArrowRight className="size-3" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground py-8 text-center text-sm">Loading…</p>
              ) : leads.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center text-sm">
                  No leads yet. They will appear here once SMEs complete their credit passports.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-border/60 text-muted-foreground border-b text-left text-xs">
                        <th className="pb-2 font-medium">Company</th>
                        <th className="pb-2 font-medium">Type</th>
                        <th className="pb-2 font-medium">Score</th>
                        <th className="pb-2 font-medium">Match</th>
                        <th className="pb-2 font-medium">Status</th>
                        <th className="pb-2 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-border/60 divide-y">
                      {leads.slice(0, 5).map((lead) => (
                        <tr key={lead.id} className="group">
                          <td className="py-3">
                            <div>
                              <p className="font-medium">{lead.name}</p>
                              <div className="text-muted-foreground mt-0.5 flex items-center gap-3 text-xs">
                                <span className="flex items-center gap-1">
                                  <Building2 aria-hidden="true" className="size-3" />
                                  {lead.sector}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin aria-hidden="true" className="size-3" />
                                  {lead.city}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3">
                            <Badge variant="outline" className="capitalize">
                              {lead.kind}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <Badge variant={getScoreBadgeVariant(lead.creditScore)}>
                              {lead.creditScore}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <span className={`font-semibold ${getMatchColor(lead.matchScore)}`}>
                              {lead.matchScore}%
                            </span>
                          </td>
                          <td className="py-3">
                            <Badge
                              variant={lead.status === "new" ? "default" : "secondary"}
                              className="capitalize"
                            >
                              {lead.status}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
                                Contact
                              </Button>
                              <Button variant="ghost" size="sm">
                                <ExternalLink className="size-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
