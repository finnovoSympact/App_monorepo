"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ArrowRight, MessageCircle, Shield, Zap, User, MapPin, Briefcase, Banknote, Target, ChevronRight, Phone, Wifi, WifiOff, X } from "lucide-react";
import { useAuth } from "@/lib/use-auth";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Message {
  role: "user" | "assistant";
  text: string;
  ts: number;
}

interface Profile {
  consent?: boolean;
  identity?: { name?: string; age_band?: string; city?: string };
  employment?: { type?: string; income_band?: string };
  banking?: { has_account?: boolean; wallet?: string };
  goals?: { short_term?: string };
  sme_signal?: number;
}

interface WaMessage {
  role: "user" | "assistant";
  text: string;
  ts: string;
}

interface WaLead {
  phone: string;
  profile: Profile;
  lastMessage: string;
  lastSeen: string;
  messageCount: number;
  suggestedProduct: string | null;
  history: WaMessage[];
}

// ── Typing bubble ─────────────────────────────────────────────────────────────
function TypingBubble() {
  return (
    <div className="flex items-end gap-2 px-4 py-1">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#005c4b] text-xs font-bold text-white">
        S
      </div>
      <div className="rounded-2xl rounded-bl-sm bg-[#202c33] px-4 py-3">
        <div className="flex items-center gap-1">
          {[0, 0.2, 0.4].map((d) => (
            <motion.div
              key={d}
              className="h-2 w-2 rounded-full bg-[#8696a0]"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: d, ease: "easeInOut" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Message bubble ────────────────────────────────────────────────────────────
function Bubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  const time = new Date(msg.ts).toLocaleTimeString("fr-TN", { hour: "2-digit", minute: "2-digit" });

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.15 }}
      className={`flex items-end gap-2 px-4 py-1 ${isUser ? "flex-row-reverse" : ""}`}
    >
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#005c4b] text-xs font-bold text-white">
          S
        </div>
      )}
      <div
        className={`max-w-[72%] rounded-2xl px-4 py-2.5 shadow-sm ${
          isUser
            ? "rounded-br-sm bg-[#005c4b] text-white"
            : "rounded-bl-sm bg-[#202c33] text-[#e9edef]"
        }`}
      >
        <p className="text-[0.9rem] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
        <p className={`mt-1 text-right text-[10px] ${isUser ? "text-white/60" : "text-[#8696a0]"}`}>
          {time}
        </p>
      </div>
    </motion.div>
  );
}

// ── Profile Panel ─────────────────────────────────────────────────────────────
const PRODUCT_LABELS: Record<string, { label: string; color: string }> = {
  micro_loan: { label: "Micro-crédit", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  bnpl: { label: "BNPL", color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
  savings: { label: "Épargne", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  sme_upgrade: { label: "PME Daiyn", color: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
};

function ProfileSlot({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string }) {
  if (!value) return null;
  return (
    <motion.div
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-2 rounded-lg bg-[#2a3942] px-3 py-2"
    >
      <Icon className="mt-0.5 size-3.5 shrink-0 text-[#00a884]" />
      <div className="min-w-0">
        <p className="text-[10px] text-[#8696a0]">{label}</p>
        <p className="truncate text-[0.78rem] font-medium text-[#e9edef]">{value}</p>
      </div>
    </motion.div>
  );
}

function ProfilePanel({ profile, suggestedProduct }: { profile: Profile; suggestedProduct?: string | null }) {
  const hasAny = profile.consent || profile.identity?.name || profile.identity?.city ||
    profile.employment?.type || profile.goals?.short_term;

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto p-4">
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#00a884]" />
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8696a0]">Profile en cours</p>
      </div>

      {!hasAny ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center">
          <div className="rounded-full bg-[#2a3942] p-3">
            <User className="size-5 text-[#8696a0]" />
          </div>
          <p className="text-[0.75rem] text-[#8696a0]">Les infos extraites<br />apparaîtront ici</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {profile.consent && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center gap-1.5 rounded-lg bg-[#005c4b]/20 px-3 py-1.5 text-[0.75rem] text-[#00a884]">
              <Shield className="size-3" /> Consentement ✓
            </motion.div>
          )}
          <ProfileSlot icon={User} label="Prénom" value={profile.identity?.name} />
          <ProfileSlot icon={MapPin} label="Ville" value={profile.identity?.city} />
          <ProfileSlot icon={Briefcase} label="Emploi" value={profile.employment?.type} />
          <ProfileSlot icon={Banknote} label="Revenu" value={profile.employment?.income_band} />
          <ProfileSlot icon={Target} label="Objectif" value={profile.goals?.short_term} />
          {profile.banking?.has_account !== undefined && (
            <ProfileSlot icon={Banknote} label="Banque"
              value={profile.banking.has_account ? (profile.banking.wallet ?? "Compte bancaire") : "Non bancarisé"} />
          )}
          {(profile.sme_signal ?? 0) > 0 && (
            <ProfileSlot icon={Briefcase} label="Signal PME" value={`${profile.sme_signal}/3`} />
          )}
        </div>
      )}

      {suggestedProduct && PRODUCT_LABELS[suggestedProduct] && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
          className={`mt-auto rounded-xl border px-3 py-2 text-center text-sm font-semibold ${PRODUCT_LABELS[suggestedProduct].color}`}>
          Produit suggéré<br />
          <span className="text-base">{PRODUCT_LABELS[suggestedProduct].label}</span>
        </motion.div>
      )}
    </div>
  );
}

// ── WA Thread Modal ───────────────────────────────────────────────────────────
function WaThreadModal({ lead, onClose }: { lead: WaLead; onClose: () => void }) {
  const name = lead.profile.identity?.name ?? `+${lead.phone.slice(-4)}`;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 16 }}
        className="relative flex h-[70vh] w-full max-w-md flex-col rounded-2xl shadow-2xl"
        style={{ background: "#0b141a" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center gap-3 rounded-t-2xl border-b px-4 py-3" style={{ background: "#202c33", borderColor: "#ffffff10" }}>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#005c4b] text-sm font-bold text-white">
            {name[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#e9edef]">{name}</p>
            <p className="text-[10px] text-[#8696a0]">{lead.phone} · {lead.messageCount} messages</p>
          </div>
          <button onClick={onClose} className="text-[#8696a0] hover:text-[#e9edef]"><X className="size-4" /></button>
        </div>
        {/* Profile pills */}
        <div className="flex shrink-0 flex-wrap gap-1.5 border-b px-4 py-2.5" style={{ borderColor: "#ffffff10" }}>
          {lead.profile.identity?.city && <span className="rounded-full bg-[#2a3942] px-2 py-0.5 text-[10px] text-[#8696a0]">📍 {lead.profile.identity.city}</span>}
          {lead.profile.employment?.type && <span className="rounded-full bg-[#2a3942] px-2 py-0.5 text-[10px] text-[#8696a0]">💼 {lead.profile.employment.type}</span>}
          {lead.suggestedProduct && PRODUCT_LABELS[lead.suggestedProduct] && (
            <span className={`rounded-full border px-2 py-0.5 text-[10px] ${PRODUCT_LABELS[lead.suggestedProduct].color}`}>
              {PRODUCT_LABELS[lead.suggestedProduct].label}
            </span>
          )}
        </div>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-2">
          {lead.history.map((msg, i) => {
            const isUser = msg.role === "user";
            return (
              <div key={i} className={`flex items-end gap-2 px-4 py-1 ${isUser ? "flex-row-reverse" : ""}`}>
                {!isUser && (
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#005c4b] text-[10px] font-bold text-white">F</div>
                )}
                <div className={`max-w-[78%] rounded-2xl px-3 py-2 text-[0.82rem] shadow-sm ${isUser ? "rounded-br-sm bg-[#005c4b] text-white" : "rounded-bl-sm bg-[#202c33] text-[#e9edef]"}`}>
                  <p className="whitespace-pre-wrap leading-snug">{msg.text}</p>
                  <p className={`mt-0.5 text-right text-[9px] ${isUser ? "text-white/50" : "text-[#8696a0]"}`}>
                    {new Date(msg.ts).toLocaleTimeString("fr-TN", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── WA Sidebar ────────────────────────────────────────────────────────────────
function WaSidebar({ onSelect }: { onSelect: (lead: WaLead) => void }) {
  const [leads, setLeads] = React.useState<WaLead[]>([]);
  const [online, setOnline] = React.useState(true);

  React.useEffect(() => {
    const fetch_ = () =>
      fetch("/api/wa-leads")
        .then((r) => r.json())
        .then((d) => { setLeads(d.leads ?? []); setOnline(true); })
        .catch(() => setOnline(false));
    fetch_();
    const id = setInterval(fetch_, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center gap-2 border-b px-4 py-3" style={{ borderColor: "#ffffff10" }}>
        <Phone className="size-3.5 text-[#8696a0]" />
        <p className="flex-1 text-[11px] font-semibold uppercase tracking-wider text-[#8696a0]">WhatsApp Live</p>
        {online ? (
          <Wifi className="size-3 text-emerald-400" />
        ) : (
          <WifiOff className="size-3 text-red-400" />
        )}
      </div>
      {leads.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center">
          <Phone className="size-5 text-[#8696a0]" />
          <p className="text-[0.72rem] text-[#8696a0]">En attente de<br />messages WhatsApp</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {leads.map((lead) => {
            const name = lead.profile.identity?.name ?? `+${lead.phone.slice(-4)}`;
            const product = lead.suggestedProduct ? PRODUCT_LABELS[lead.suggestedProduct] : null;
            return (
              <button
                key={lead.phone}
                onClick={() => onSelect(lead)}
                className="flex w-full items-start gap-2.5 border-b px-4 py-3 text-left transition-colors hover:bg-[#202c33]"
                style={{ borderColor: "#ffffff08" }}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#005c4b] text-xs font-bold text-white">
                  {name[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <p className="flex-1 truncate text-[0.8rem] font-medium text-[#e9edef]">{name}</p>
                    {product && (
                      <span className={`rounded-full border px-1.5 py-0 text-[9px] ${product.color}`}>{product.label}</span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-[0.72rem] text-[#8696a0]">{lead.lastMessage}</p>
                  <p className="mt-0.5 text-[9px] text-[#8696a0]/60">{lead.messageCount} msgs</p>
                </div>
                <ChevronRight className="mt-1 size-3 shrink-0 text-[#8696a0]" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Welcome screen (before first message) ────────────────────────────────────
function WelcomeScreen({ userName }: { userName: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-12 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#005c4b]">
        <span className="text-4xl font-bold text-white">س</span>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-[#e9edef]">Sanad Chat</h2>
        <p className="mt-1 text-sm text-[#8696a0]">
          مرحبا {userName} — Parlez-moi de votre situation financière
        </p>
      </div>

      <div className="grid w-full max-w-sm gap-3 text-left">
        {[
          { icon: MessageCircle, title: "Darija · Français · العربية", sub: "I reply in your language" },
          { icon: Shield, title: "Credit profile built live", sub: "Your data stays on your device" },
          { icon: Zap, title: "SME upgrade path", sub: "Get a signed Credit Passport" },
        ].map(({ icon: Icon, title, sub }) => (
          <div key={title} className="flex items-start gap-3 rounded-xl bg-[#202c33] px-4 py-3">
            <Icon className="mt-0.5 size-4 shrink-0 text-[#00a884]" />
            <div>
              <p className="text-[0.8rem] font-medium text-[#e9edef]">{title}</p>
              <p className="text-[0.75rem] text-[#8696a0]">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-[#8696a0]">
        Type anything below to start ↓
      </p>
    </div>
  );
}

// ── SME escalation banner ─────────────────────────────────────────────────────
function EscalationBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ y: -56, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -56, opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="flex items-center justify-between gap-3 border-b border-[#005c4b]/40 bg-[#005c4b]/15 px-4 py-2.5"
    >
      <p className="text-sm text-[#e9edef]">
        Vous gérez une activité ?{" "}
        <a href="/dashboard/upload" className="font-semibold text-[#00a884] hover:underline">
          Débloquez Daiyn →
        </a>{" "}
        passeport crédit en 5 min.
      </p>
      <button onClick={onDismiss} className="shrink-0 text-[#8696a0] hover:text-[#e9edef]">
        <ArrowRight className="size-4 rotate-90" />
      </button>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ChatPage() {
  const { user } = useAuth();
  const userName = user?.name ?? "there";

  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);
  const [profile, setProfile] = React.useState<Profile>({});
  const [suggestedProduct, setSuggestedProduct] = React.useState<string | null>(null);
  const [showEscalation, setShowEscalation] = React.useState(false);
  const [selectedWaLead, setSelectedWaLead] = React.useState<WaLead | null>(null);
  const [rightTab, setRightTab] = React.useState<"profile" | "whatsapp">("profile");
  const historyRef = React.useRef<Array<{ role: "user" | "assistant"; text: string }>>([]);
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  // Auto-scroll
  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const send = React.useCallback(async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: Message = { role: "user", text: text.trim(), ts: Date.now() };
    setMessages((p) => [...p, userMsg]);
    historyRef.current.push({ role: "user", text: text.trim() });
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat/turn", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          history: historyRef.current.slice(-10),
          profile,
        }),
      });
      const data = (await res.json()) as {
        reply?: string;
        assistantText?: string;
        profileDelta?: Profile;
        profileSnapshot?: Profile;
        shouldEscalate?: boolean;
        escalation?: boolean | null;
        suggestedProduct?: string | null;
      };

      const reply = data.reply ?? data.assistantText ?? "…";
      const aMsg: Message = { role: "assistant", text: reply, ts: Date.now() };
      setMessages((p) => [...p, aMsg]);
      historyRef.current.push({ role: "assistant", text: reply });

      const delta = data.profileDelta ?? data.profileSnapshot ?? {};
      setProfile((p) => ({ ...p, ...delta }));
      if (data.suggestedProduct) setSuggestedProduct(data.suggestedProduct);

      if (data.shouldEscalate || data.escalation) setShowEscalation(true);
    } catch {
      setMessages((p) => [
        ...p,
        { role: "assistant", text: "Désolé, une erreur. Réessayez dans un instant.", ts: Date.now() },
      ]);
    } finally {
      setIsTyping(false);
    }
  }, [isTyping, profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    send(input);
    setInput("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex h-[calc(100vh-3rem)]" style={{ background: "#0b141a" }}>

      {/* ── Left: Chat column ── */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Header */}
        <div className="flex shrink-0 items-center gap-3 border-b px-4 py-3" style={{ background: "#202c33", borderColor: "#ffffff10" }}>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#005c4b] text-lg font-bold text-white">س</div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#e9edef]">Finnovo Assistant</p>
            <p className="text-[11px] text-[#8696a0]">{isTyping ? "typing…" : "online"}</p>
          </div>
          {(profile.sme_signal ?? 0) > 0 && (
            <div className="flex items-center gap-1 rounded-full bg-[#005c4b]/30 px-3 py-1 text-[11px] text-[#00a884]">
              <span>SME</span><span className="font-bold">{profile.sme_signal}/3</span>
            </div>
          )}
        </div>

        {/* Escalation banner */}
        <AnimatePresence>
          {showEscalation && <EscalationBanner onDismiss={() => setShowEscalation(false)} />}
        </AnimatePresence>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-2">
          {!hasMessages ? (
            <WelcomeScreen userName={userName} />
          ) : (
            <>
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => <Bubble key={`${msg.ts}-${i}`} msg={msg} />)}
              </AnimatePresence>
              {isTyping && <TypingBubble />}
            </>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <form onSubmit={handleSubmit} className="flex shrink-0 items-end gap-3 border-t px-4 py-3" style={{ background: "#202c33", borderColor: "#ffffff10" }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message"
            rows={1}
            className="flex-1 resize-none rounded-xl bg-[#2a3942] px-4 py-2.5 text-[0.9rem] text-[#e9edef] placeholder:text-[#8696a0] outline-none focus:ring-1 focus:ring-[#00a884]/40"
            style={{ maxHeight: "8rem", minHeight: "2.6rem" }}
          />
          <button type="submit" disabled={!input.trim() || isTyping}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#00a884] text-white transition-all hover:bg-[#009977] disabled:opacity-40">
            <Send className="size-4" />
          </button>
        </form>
      </div>

      {/* ── Right: Intelligence panel ── */}
      <div className="flex w-72 shrink-0 flex-col border-l" style={{ background: "#111b21", borderColor: "#ffffff10" }}>
        {/* Tab switcher */}
        <div className="flex shrink-0 border-b" style={{ borderColor: "#ffffff10" }}>
          <button
            onClick={() => setRightTab("profile")}
            className={`flex-1 py-3 text-[11px] font-semibold uppercase tracking-wider transition-colors ${
              rightTab === "profile" ? "border-b-2 border-[#00a884] text-[#00a884]" : "text-[#8696a0] hover:text-[#e9edef]"
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setRightTab("whatsapp")}
            className={`flex-1 py-3 text-[11px] font-semibold uppercase tracking-wider transition-colors ${
              rightTab === "whatsapp" ? "border-b-2 border-[#00a884] text-[#00a884]" : "text-[#8696a0] hover:text-[#e9edef]"
            }`}
          >
            WhatsApp
          </button>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-hidden">
          {rightTab === "profile" ? (
            <ProfilePanel profile={profile} suggestedProduct={suggestedProduct} />
          ) : (
            <WaSidebar onSelect={setSelectedWaLead} />
          )}
        </div>
      </div>

      {/* ── WA Thread modal ── */}
      <AnimatePresence>
        {selectedWaLead && (
          <WaThreadModal lead={selectedWaLead} onClose={() => setSelectedWaLead(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
