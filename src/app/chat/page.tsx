"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Briefcase,
  Building2,
  Target,
  TrendingUp,
  Wifi,
  WifiOff,
  X,
  ArrowRight,
} from "lucide-react";
import { WhatsappChat, type ChatMessage } from "@/components/whatsapp-chat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Persona = "Yassine" | "Amira" | "Karim";

interface ProfileSnapshot {
  identity?: { name?: string; age_band?: string; city?: string };
  employment?: { type?: string; income_band?: string };
  banking?: { has_account?: boolean; wallet?: string };
  goals?: { short_term?: string };
  sme_signal?: number;
}

// ---------------------------------------------------------------------------
// Offline fixture — 6 turns of Yassine's conversation (Darija-French mix)
// ---------------------------------------------------------------------------

const YASSINE_TURNS: Array<{
  user: string;
  assistant: string;
  profile: ProfileSnapshot;
  escalate?: boolean;
}> = [
  {
    user: "salam, chneya ta3mel sanad?",
    assistant:
      "Marhba Yassine! Sanad yhebek tchouf winak fel financial journey dyalek. Nsa3dek t3ref wضعيتك w kifesh tحسنha. Chnou smitk o fin saken?",
    profile: {},
  },
  {
    user: "ana Yassine, saken f Tunis, 28 ans",
    assistant:
      "Mezyan Yassine! Tunis, 28 ans — bon profil. Ta3mel chi 7aja? CDI, freelance, wella commerce propre?",
    profile: { identity: { name: "Yassine", age_band: "25–34", city: "Tunis" } },
  },
  {
    user: "3endi commerce sghir, nbii9 accessoires f Instagram w Jumia",
    assistant:
      "Waw, bonne initiative! Instagram + Jumia = 3lametein kbar 3la activité régulière. Qaddech tjibed par mois taqriban?",
    profile: {
      identity: { name: "Yassine", age_band: "25–34", city: "Tunis" },
      employment: { type: "Micro-commerce", income_band: "?" },
      sme_signal: 1,
    },
  },
  {
    user: "environ 1200-1800 TND par mois, 7aseb el mois",
    assistant:
      "Profil clair! Revenu variable 1200–1800 TND — c'est solide pour un démarrage. T3awed testa3mel compte bancaire wella Flouci/D17?",
    profile: {
      identity: { name: "Yassine", age_band: "25–34", city: "Tunis" },
      employment: { type: "Micro-commerce", income_band: "1 200–1 800 TND" },
      banking: { has_account: false, wallet: "D17 / Flouci" },
      sme_signal: 1,
    },
  },
  {
    user: "D17 w chi mara Flouci, mafamach compte bancaire classique",
    assistant:
      "Parfait — wallets actifs, ça confirme tout. Objectif dyalek fil court terme? Crédit stock, local, wella chi 7aja okhra?",
    profile: {
      identity: { name: "Yassine", age_band: "25–34", city: "Tunis" },
      employment: { type: "Micro-commerce", income_band: "1 200–1 800 TND" },
      banking: { has_account: false, wallet: "D17 / Flouci" },
      goals: { short_term: "Crédit stock" },
      sme_signal: 2,
    },
    escalate: true,
  },
  {
    user: "nheb nakhod credit bach nzid stock w nwase3 l produits",
    assistant:
      "Mzyan! Avec ton profil — activité régulière, wallets, 28 ans — t9der tchouf Daiyn qui propose des micro-financements adaptés. Nwarilek el détails?",
    profile: {
      identity: { name: "Yassine", age_band: "25–34", city: "Tunis" },
      employment: { type: "Micro-commerce", income_band: "1 200–1 800 TND" },
      banking: { has_account: false, wallet: "D17 / Flouci" },
      goals: { short_term: "Crédit stock / expansion" },
      sme_signal: 2,
    },
    escalate: true,
  },
];

// ---------------------------------------------------------------------------
// Sub-component: profile slot row
// ---------------------------------------------------------------------------

function ProfileSlot({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | undefined;
  icon: React.ElementType;
}) {
  return (
    <div className="flex min-h-[2rem] items-start gap-2">
      <Icon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-muted-foreground mb-0.5 text-[10px] leading-none tracking-widest uppercase">
          {label}
        </p>
        <AnimatePresence mode="wait">
          {value ? (
            <motion.p
              key={value}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.22 }}
              className="text-foreground truncate font-mono text-xs"
            >
              {value}
            </motion.p>
          ) : (
            <Skeleton className="mt-0.5 h-3 w-20" />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

function ChatPageInner() {
  const searchParams = useSearchParams();
  const isOffline = searchParams.get("offline") === "1";

  const [persona, setPersona] = React.useState<Persona>("Yassine");
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = React.useState(false);
  const [profile, setProfile] = React.useState<ProfileSnapshot>({});
  const [showEscalation, setShowEscalation] = React.useState(false);
  const [conversationId] = React.useState(() => crypto.randomUUID());
  const offlineTurnRef = React.useRef(0);
  const replayInProgress = React.useRef(false);

  // Reset on persona switch
  const switchPersona = React.useCallback((p: Persona) => {
    setPersona(p);
    setMessages([]);
    setProfile({});
    setShowEscalation(false);
    offlineTurnRef.current = 0;
    replayInProgress.current = false;
  }, []);

  // Merge incoming profile snapshot
  const mergeProfile = React.useCallback((snap: ProfileSnapshot) => {
    setProfile((prev) => {
      const next = { ...prev };
      if (snap.identity) next.identity = { ...prev.identity, ...snap.identity };
      if (snap.employment) next.employment = { ...prev.employment, ...snap.employment };
      if (snap.banking) next.banking = { ...prev.banking, ...snap.banking };
      if (snap.goals) next.goals = { ...prev.goals, ...snap.goals };
      if (snap.sme_signal !== undefined) next.sme_signal = snap.sme_signal;
      return next;
    });
  }, []);

  // Offline: replay next turn
  const replayNextOfflineTurn = React.useCallback(
    async (_userText: string) => {
      if (replayInProgress.current) return;
      replayInProgress.current = true;

      const idx = offlineTurnRef.current;
      const fixture = YASSINE_TURNS[idx];
      if (!fixture) {
        replayInProgress.current = false;
        return;
      }

      // Show typing for 800–1200 ms
      setIsTyping(true);
      await new Promise((r) => setTimeout(r, 800 + Math.random() * 400));
      setIsTyping(false);

      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: fixture.assistant, ts: Date.now() },
      ]);
      mergeProfile(fixture.profile);
      if (fixture.escalate) setShowEscalation(true);

      offlineTurnRef.current = idx + 1;
      replayInProgress.current = false;
    },
    [mergeProfile],
  );

  // Live mode: POST to API
  const sendLive = React.useCallback(
    async (userText: string) => {
      setIsTyping(true);
      try {
        const res = await fetch("/api/chat/turn", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId, userText, persona }),
        });
        const data = (await res.json()) as {
          assistantText: string;
          profileSnapshot: ProfileSnapshot;
          escalation?: boolean | null;
        };
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: data.assistantText, ts: Date.now() },
        ]);
        if (data.profileSnapshot) mergeProfile(data.profileSnapshot);
        if (data.escalation) setShowEscalation(true);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: "Désolé, une erreur s'est produite. Réessayez.",
            ts: Date.now(),
          },
        ]);
      } finally {
        setIsTyping(false);
      }
    },
    [conversationId, persona, mergeProfile],
  );

  const handleSend = React.useCallback(
    (text: string) => {
      setMessages((prev) => [...prev, { role: "user", text, ts: Date.now() }]);
      if (isOffline) {
        replayNextOfflineTurn(text);
      } else {
        sendLive(text);
      }
    },
    [isOffline, replayNextOfflineTurn, sendLive],
  );

  // SME signal display
  const smeCount = profile.sme_signal ?? 0;

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col overflow-hidden">
      {/* Escalation banner */}
      <AnimatePresence>
        {showEscalation && (
          <motion.div
            initial={{ y: -56, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -56, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="bg-[var(--linear-accent)]/15 border-[var(--linear-accent)]/30 relative z-30 flex items-center justify-between gap-4 border-b px-6 py-2.5"
          >
            <p className="text-foreground text-sm font-medium">
              Vous semblez gérer une activité régulière.{" "}
              <span className="text-[var(--linear-accent)] font-semibold">Envie de débloquer Daiyn ?</span>
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEscalation(false)}
                className="h-7 px-3 text-xs"
              >
                Ignorer
              </Button>
              <Button
                size="sm"
                asChild
                className="bg-[var(--linear-brand)] hover:bg-[var(--linear-accent)] h-7 px-3 text-xs text-white"
              >
                <a href="/dashboard/upload">
                  Accéder à Daiyn
                  <ArrowRight className="ml-1 size-3" />
                </a>
              </Button>
              <button
                onClick={() => setShowEscalation(false)}
                className="text-muted-foreground hover:text-foreground ml-1 transition-colors"
                aria-label="Fermer"
              >
                <X className="size-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top bar */}
      <div className="border-border/60 bg-background/80 flex shrink-0 items-center justify-between gap-4 border-b px-6 py-3 backdrop-blur">
        {/* Persona pills */}
        <div className="flex items-center gap-1.5">
          {(["Yassine", "Amira", "Karim"] as Persona[]).map((p) => (
            <button
              key={p}
              onClick={() => switchPersona(p)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                persona === p
                    ? "bg-[var(--linear-brand)] border-[var(--linear-brand)] text-white"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Mode badge */}
        <Badge
          className={
            isOffline
              ? "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400"
              : "border-[var(--linear-brand)]/40 bg-[var(--linear-brand)]/10 text-[var(--linear-accent)]"
          }
          variant="outline"
        >
          {isOffline ? <WifiOff className="size-3" /> : <Wifi className="size-3" />}
          {isOffline ? "Offline demo" : "Live agents"}
        </Badge>
      </div>

      {/* Two-column body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: WhatsApp chat 2/3 */}
        <div className="flex-[2] overflow-hidden p-4">
          <WhatsappChat messages={messages} onSend={handleSend} isTyping={isTyping} />
        </div>

        <Separator orientation="vertical" />

        {/* Right: Profile panel 1/3 */}
        <div className="bg-background flex flex-1 flex-col gap-4 overflow-y-auto p-5">
          <div>
            <p className="text-muted-foreground mb-3 text-xs font-semibold tracking-widest uppercase">
              Profile building live
            </p>

            {/* Identity */}
            <section className="mb-4 space-y-3">
              <p className="text-[var(--linear-text-3)] text-[10px] font-semibold tracking-widest uppercase">
                Identity
              </p>
              <ProfileSlot label="Name" value={profile.identity?.name} icon={User} />
              <ProfileSlot label="Age band" value={profile.identity?.age_band} icon={User} />
              <ProfileSlot label="City" value={profile.identity?.city} icon={User} />
            </section>

            <Separator className="my-3" />

            {/* Employment */}
            <section className="mb-4 space-y-3">
              <p className="text-[var(--linear-text-3)] text-[10px] font-semibold tracking-widest uppercase">
                Employment
              </p>
              <ProfileSlot label="Type" value={profile.employment?.type} icon={Briefcase} />
              <ProfileSlot
                label="Income band"
                value={profile.employment?.income_band}
                icon={Briefcase}
              />
            </section>

            <Separator className="my-3" />

            {/* Banking */}
            <section className="mb-4 space-y-3">
              <p className="text-[var(--linear-text-3)] text-[10px] font-semibold tracking-widest uppercase">
                Banking
              </p>
              <ProfileSlot
                label="Has account"
                value={
                  profile.banking?.has_account === undefined
                    ? undefined
                    : profile.banking.has_account
                      ? "Yes"
                      : "No"
                }
                icon={Building2}
              />
              <ProfileSlot label="Wallet" value={profile.banking?.wallet} icon={Building2} />
            </section>

            <Separator className="my-3" />

            {/* Goals */}
            <section className="mb-4 space-y-3">
              <p className="text-[var(--linear-text-3)] text-[10px] font-semibold tracking-widest uppercase">
                Goals
              </p>
              <ProfileSlot label="Short-term" value={profile.goals?.short_term} icon={Target} />
            </section>

            <Separator className="my-3" />

            {/* SME Signal */}
            <section className="mb-2">
              <p className="text-[var(--linear-text-3)] mb-3 text-[10px] font-semibold tracking-widest uppercase">
                SME Signal
              </p>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="text-muted-foreground size-4" />
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={smeCount}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className="font-mono text-2xl font-semibold tracking-tight"
                    >
                      {smeCount}
                    </motion.span>
                  </AnimatePresence>
                </div>
                <AnimatePresence>
                  {smeCount >= 2 && (
                    <motion.div
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Badge className="bg-[var(--linear-brand)] border-transparent text-[10px] text-white">
                        Escalation ready
                      </Badge>
                    </motion.div>
                  )}
                  {smeCount === 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Badge variant="outline" className="border-[var(--linear-accent)]/40 text-[10px]">
                        Signal detected
                      </Badge>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <React.Suspense fallback={<div className="flex h-screen items-center justify-center text-sm text-muted-foreground">Loading…</div>}>
      <ChatPageInner />
    </React.Suspense>
  );
}
