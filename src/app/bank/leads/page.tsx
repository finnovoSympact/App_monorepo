"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  MapPin,
  TrendingUp,
  Users,
  Award,
  MessageCircle,
  Flame,
  ThermometerSun,
  Snowflake,
  Wifi,
  WifiOff,
} from "lucide-react";

interface DemoLead {
  id: string;
  name: string;
  kind: "individual" | "sme";
  sector: string;
  city: string;
  creditScore: number;
  matchScore: number;
  matchReason: string;
  goal?: string;
  source: "demo";
}

interface WaLead {
  id: string;
  name: string;
  kind: "individual" | "sme";
  phone: string;
  city: string;
  employment: string;
  income: string;
  goal: string;
  matchScore: number;
  creditScore: number;
  matchReason: string;
  lastSeen: string;
  messageCount: number;
  suggestedProduct: string | null;
  source: "whatsapp";
}

type Lead = DemoLead | WaLead;
type FilterType = "all" | "hot" | "warm" | "cold";

function toWaLead(raw: {
  phone: string;
  messageCount: number;
  lastSeen: string;
  suggestedProduct: string | null;
  profile: {
    consent?: boolean;
    identity?: { name?: string; city?: string };
    employment?: { type?: string; income_band?: string };
    goals?: { short_term?: string };
    sme_signal?: number;
  };
}): WaLead {
  const profile = raw.profile ?? {};
  const name = profile.identity?.name ?? `+${raw.phone.slice(-4)}`;
  const city = profile.identity?.city ?? "—";
  const employment = profile.employment?.type ?? "—";
  const income = profile.employment?.income_band ?? "—";
  const goal = profile.goals?.short_term ?? raw.suggestedProduct ?? "Exploring options";
  const isSme = (profile.sme_signal ?? 0) >= 2;
  const baseScore = Math.min(90, 45 + raw.messageCount * 4);
  const matchScore = raw.suggestedProduct ? Math.min(95, baseScore + 10) : baseScore;
  return {
    id: raw.phone,
    name,
    kind: isSme ? "sme" : "individual",
    phone: raw.phone,
    city,
    employment,
    income,
    goal,
    creditScore: baseScore,
    matchScore,
    matchReason: isSme
      ? "Business signals detected — SME upgrade candidate"
      : raw.suggestedProduct
        ? `Product match: ${raw.suggestedProduct.replace(/_/g, " ")}`
        : `${raw.messageCount} messages exchanged, profile building`,
    lastSeen: raw.lastSeen,
    messageCount: raw.messageCount,
    suggestedProduct: raw.suggestedProduct,
    source: "whatsapp",
  };
}

export default function LeadsPage() {
  const [demoLeads, setDemoLeads] = useState<DemoLead[]>([]);
  const [waLeads, setWaLeads] = useState<WaLead[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    fetch("/demo/packs/index.json")
      .then((r) => r.json())
      .then((data) => {
        const leads: DemoLead[] = (data.packs ?? []).map(
          (pack: { id: string; name: string; sector: string; city: string; creditScore: number }) => {
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
                    ? "Meets minimum criteria, growing sector"
                    : "Below preferred score threshold",
              goal:
                pack.id === "cafe-el-wafa"
                  ? "Working capital 30k TND"
                  : pack.id === "souq-digital"
                    ? "Expansion loan 50k TND"
                    : "Equipment financing",
              source: "demo" as const,
            };
          },
        );
        setDemoLeads(leads);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const fetchWaLeads = useCallback(() => {
    fetch("/api/wa-leads")
      .then((r) => r.json())
      .then((data) => {
        setWaLeads((data.leads ?? []).map(toWaLead));
        setOnline(true);
      })
      .catch(() => setOnline(false));
  }, []);

  useEffect(() => {
    fetchWaLeads();
    const interval = setInterval(fetchWaLeads, 5000);
    return () => clearInterval(interval);
  }, [fetchWaLeads]);

  const allLeads: Lead[] = [...waLeads, ...demoLeads];

  const filteredLeads = allLeads.filter((lead) => {
    if (filter === "hot") return lead.matchScore >= 70;
    if (filter === "warm") return lead.matchScore >= 50 && lead.matchScore < 70;
    if (filter === "cold") return lead.matchScore < 50;
    return true;
  });

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

  const productLabel: Record<string, string> = {
    micro_loan: "Micro-crédit",
    bnpl: "BNPL",
    savings: "Épargne",
    sme_upgrade: "PME Daiyn",
  };

  return (
    <div className="flex min-h-screen">
      <aside className="border-border/60 bg-card/50 w-64 border-r p-6">
        <div className="mb-8">
          <Link href="/bank" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Finnovo" width={28} height={28} />
            <span className="font-semibold">Finnovo for Banks</span>
          </Link>
          <p className="text-muted-foreground mt-1 text-xs">Officer Portal</p>
        </div>
        <nav className="space-y-1">
          <Link href="/bank" className="text-muted-foreground hover:bg-muted flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors">
            <TrendingUp className="size-4" /> Dashboard
          </Link>
          <Link href="/bank/leads" className="flex items-center gap-2 rounded-lg bg-orange-500/10 px-3 py-2 text-sm font-medium text-orange-600" aria-current="page">
            <Users className="size-4" /> Leads
            {waLeads.length > 0 && (
              <Badge className="ml-auto bg-orange-500 px-1.5 py-0 text-[10px] text-white">{waLeads.length}</Badge>
            )}
          </Link>
          <Link href="/bank/criteria" className="text-muted-foreground hover:bg-muted flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors">
            <Award className="size-4" /> Criteria
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="mb-1 text-3xl font-bold tracking-tight">Leads Queue</h1>
              <p className="text-muted-foreground text-sm">Live WhatsApp conversations + scored pipeline</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              {online ? (
                <span className="flex items-center gap-1 text-emerald-600"><Wifi className="size-3.5" /> Live</span>
              ) : (
                <span className="flex items-center gap-1 text-red-500"><WifiOff className="size-3.5" /> Offline</span>
              )}
              <span className="text-muted-foreground">· refreshes every 5s</span>
            </div>
          </div>

          {waLeads.length > 0 && (
            <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
              <div className="mb-3 flex items-center gap-2">
                <MessageCircle className="size-4 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-700">
                  {waLeads.length} live WhatsApp conversation{waLeads.length > 1 ? "s" : ""}
                </span>
                <span className="ml-auto inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              </div>
              <div className="flex flex-wrap gap-2">
                {waLeads.map((lead) => (
                  <div key={lead.phone} className="rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-xs">
                    <span className="font-medium">{lead.name}</span>
                    <span className="text-muted-foreground ml-1">· {lead.messageCount} msgs</span>
                    {lead.suggestedProduct && (
                      <Badge className="ml-2 bg-emerald-100 text-[10px] text-emerald-700">
                        {productLabel[lead.suggestedProduct] ?? lead.suggestedProduct}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)} className="mb-6">
            <TabsList>
              <TabsTrigger value="all">All ({allLeads.length})</TabsTrigger>
              <TabsTrigger value="hot"><Flame className="mr-1 size-3.5" />Hot ({allLeads.filter((l) => l.matchScore >= 70).length})</TabsTrigger>
              <TabsTrigger value="warm"><ThermometerSun className="mr-1 size-3.5" />Warm ({allLeads.filter((l) => l.matchScore >= 50 && l.matchScore < 70).length})</TabsTrigger>
              <TabsTrigger value="cold"><Snowflake className="mr-1 size-3.5" />Cold ({allLeads.filter((l) => l.matchScore < 50).length})</TabsTrigger>
            </TabsList>
          </Tabs>

          {loading ? (
            <p className="text-muted-foreground py-12 text-center text-sm">Loading leads…</p>
          ) : filteredLeads.length === 0 ? (
            <Card className="border-border/60">
              <CardContent className="py-12">
                <p className="text-muted-foreground text-center text-sm">No leads match this filter</p>
              </CardContent>
            </Card>
          ) : (
            <AnimatePresence>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredLeads.map((lead, idx) => {
                  const MatchIcon = getMatchIcon(lead.matchScore);
                  const isWa = lead.source === "whatsapp";
                  return (
                    <motion.div
                      key={lead.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: idx * 0.04, duration: 0.18 }}
                    >
                      <Card className={`border-border/60 transition-all hover:shadow-sm ${isWa ? "border-emerald-300/50 hover:border-emerald-400/60" : "hover:border-orange-500/30"}`}>
                        <CardHeader>
                          <div className="mb-3 flex items-start justify-between">
                            <div className={`flex size-10 items-center justify-center rounded-lg ${getMatchColor(lead.matchScore)}`}>
                              <MatchIcon className="size-5" />
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              {isWa && (
                                <Badge className="bg-emerald-100 px-1.5 text-[10px] text-emerald-700">
                                  <MessageCircle className="mr-0.5 size-2.5" /> WhatsApp
                                </Badge>
                              )}
                              <Badge variant="outline" className="tabular-nums text-xs">Score: {lead.creditScore}</Badge>
                            </div>
                          </div>
                          <CardTitle className="text-base">{lead.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="space-y-1.5 text-sm">
                            {lead.source === "demo" && (
                              <div className="text-muted-foreground flex items-center gap-2">
                                <Building2 className="size-3.5" />{(lead as DemoLead).sector}
                              </div>
                            )}
                            {lead.source === "whatsapp" && (lead as WaLead).employment !== "—" && (
                              <div className="text-muted-foreground flex items-center gap-2">
                                <Building2 className="size-3.5" />{(lead as WaLead).employment}
                              </div>
                            )}
                            <div className="text-muted-foreground flex items-center gap-2">
                              <MapPin className="size-3.5" />{lead.city}
                            </div>
                            {lead.goal && (
                              <div className="text-muted-foreground text-xs">
                                <span className="font-medium">Goal:</span> {lead.goal}
                              </div>
                            )}
                          </div>
                          <div className="bg-muted/50 rounded-lg p-2 text-xs">
                            <p className="tabular-nums font-semibold text-orange-600">Match: {lead.matchScore}%</p>
                            <p className="text-muted-foreground mt-0.5">{lead.matchReason}</p>
                          </div>
                          {isWa && (lead as WaLead).suggestedProduct && (
                            <Badge className="w-full justify-center bg-[#26397A]/10 text-[#26397A]">
                              Recommended: {productLabel[(lead as WaLead).suggestedProduct!] ?? (lead as WaLead).suggestedProduct}
                            </Badge>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </AnimatePresence>
          )}
        </motion.div>
      </main>
    </div>
  );
}
