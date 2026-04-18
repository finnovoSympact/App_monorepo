"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArabicGlyph } from "@/components/sanad/arabic-mark";
import {
  Building2,
  MapPin,
  TrendingUp,
  Users,
  Award,
  Mail,
  ExternalLink,
  Flame,
  ThermometerSun,
  Snowflake,
} from "lucide-react";

interface Lead {
  id: string;
  name: string;
  kind: "individual" | "sme";
  sector: string;
  city: string;
  creditScore: number;
  matchScore: number;
  matchReason: string;
  goal?: string;
}

type FilterType = "all" | "hot" | "warm" | "cold";

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
          }) => {
            const matchScore = pack.creditScore >= 70 ? 85 : pack.creditScore >= 60 ? 68 : 45;
            return {
              id: pack.id,
              name: pack.name,
              kind: "sme" as const,
              sector: pack.sector,
              city: pack.city,
              creditScore: pack.creditScore,
              matchScore,
              matchReason:
                matchScore >= 70
                  ? `Strong credit profile, ${pack.sector} sector match`
                  : matchScore >= 50
                    ? `Meets minimum criteria, growing sector`
                    : "Below preferred score threshold",
              goal:
                pack.id === "cafe-el-wafa"
                  ? "Working capital 30k TND"
                  : pack.id === "souq-digital"
                    ? "Expansion loan 50k TND"
                    : "Equipment financing",
            };
          },
        );
        setLeads(demoLeads);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredLeads = leads.filter((lead) => {
    if (filter === "hot") return lead.matchScore >= 70;
    if (filter === "warm") return lead.matchScore >= 50 && lead.matchScore < 70;
    if (filter === "cold") return lead.matchScore < 50;
    return true;
  });

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 70) return "default";
    if (score >= 50) return "secondary";
    return "outline";
  };

  const getMatchIcon = (score: number) => {
    if (score >= 70) return Flame;
    if (score >= 50) return ThermometerSun;
    return Snowflake;
  };

  const getMatchColor = (score: number) => {
    if (score >= 70) return "text-orange-600 bg-orange-500/10";
    if (score >= 50) return "text-amber-600 bg-amber-500/10";
    return "text-blue-600 bg-blue-500/10";
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="border-border/60 bg-card/50 w-64 border-r p-6">
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2">
              <ArabicGlyph char="ب" size={32} />
            <span className="font-semibold">Sanad for Banks</span>
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
            className="flex items-center gap-2 rounded-lg bg-orange-500/10 px-3 py-2 text-sm font-medium text-orange-600"
            aria-current="page"
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
      <main className="flex-1 p-8">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
        >
          <div className="mb-6">
            <h1 className="mb-1 font-instrument text-[clamp(2rem,4vw,3rem)] leading-tight tracking-tight">Leads Queue</h1>
            <p className="text-muted-foreground text-sm">
              Filtered by your bank&apos;s lending criteria
            </p>
          </div>

          {/* Filter tabs */}
          <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)} className="mb-6">
            <TabsList>
              <TabsTrigger value="all">All ({leads.length})</TabsTrigger>
              <TabsTrigger value="hot">
                <Flame aria-hidden="true" className="mr-1 size-3.5" />
                Hot ({leads.filter((l) => l.matchScore >= 70).length})
              </TabsTrigger>
              <TabsTrigger value="warm">
                <ThermometerSun aria-hidden="true" className="mr-1 size-3.5" />
                Warm ({leads.filter((l) => l.matchScore >= 50 && l.matchScore < 70).length})
              </TabsTrigger>
              <TabsTrigger value="cold">
                <Snowflake aria-hidden="true" className="mr-1 size-3.5" />
                Cold ({leads.filter((l) => l.matchScore < 50).length})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Leads grid */}
          {loading ? (
            <p className="text-muted-foreground py-12 text-center text-sm">Loading leads…</p>
          ) : filteredLeads.length === 0 ? (
            <Card className="border-border/60">
              <CardContent className="py-12">
                <p className="text-muted-foreground text-center text-sm">
                  No leads match this filter
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredLeads.map((lead, idx) => {
                const MatchIcon = getMatchIcon(lead.matchScore);
                return (
                  <motion.div
                    key={lead.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.18 }}
                  >
                    <Card className="border-border/60 transition-all hover:border-orange-500/40 hover:shadow-sm">
                      <CardHeader>
                        <div className="mb-3 flex items-start justify-between">
                          <div
                            className={`flex size-10 items-center justify-center rounded-lg ${getMatchColor(lead.matchScore)}`}
                            aria-hidden="true"
                          >
                            <MatchIcon aria-hidden="true" className="size-5" />
                          </div>
                          <Badge variant={getScoreBadgeVariant(lead.creditScore)} className="tabular-nums">
                            Score: {lead.creditScore}
                          </Badge>
                        </div>
                        <CardTitle className="text-base font-instrument">{lead.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2 text-sm">
                          <div className="text-muted-foreground flex items-center gap-2">
                            <Building2 aria-hidden="true" className="size-3.5" />
                            {lead.sector}
                          </div>
                          <div className="text-muted-foreground flex items-center gap-2">
                            <MapPin aria-hidden="true" className="size-3.5" />
                            {lead.city}
                          </div>
                          {lead.goal && (
                            <div className="text-muted-foreground">
                              <span className="font-medium">Goal:</span> {lead.goal}
                            </div>
                          )}
                        </div>

                        <div className="bg-muted/50 rounded-lg p-2 text-xs">
                          <p className="tabular-nums font-semibold text-orange-600">Match: {lead.matchScore}%</p>
                          <p className="text-muted-foreground mt-1">{lead.matchReason}</p>
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1">
                            <Mail aria-hidden="true" className="size-3.5" />
                            Contact
                          </Button>
                          <Button size="sm" variant="outline" aria-label={`View passport for ${lead.name}`}>
                            <ExternalLink aria-hidden="true" className="size-3.5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
