"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Building2, User, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth, type UserRole, roleRedirect } from "@/lib/use-auth";

const ease = [0.22, 1, 0.36, 1] as const;

const roles: { id: UserRole; label: string; sub: string; icon: typeof User }[] = [
  { id: "individual", label: "Individual", sub: "Personal finance & credit", icon: User },
  { id: "sme", label: "Business", sub: "SME credit passport", icon: Briefcase },
  { id: "bank", label: "Bank / Lender", sub: "Qualified lead pipeline", icon: Building2 },
];

export default function SignupPage() {
  const router = useRouter();
  const { user, ready, login } = useAuth();
  const [role, setRole] = useState<UserRole>("sme");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (ready && user) router.replace(roleRedirect(user.role));
  }, [ready, user, router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) { setError("Name is required."); return; }
    if (!email.trim()) { setError("Email is required."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setSubmitting(true);
    setTimeout(() => {
      login(email.trim(), role, name.trim());
      router.push(roleRedirect(role));
    }, 600);
  }

  return (
    <div className="flex min-h-[calc(100vh-56px)]">

      {/* LEFT — brand statement */}
      <motion.aside
        className="hidden lg:flex lg:w-[45%] flex-col justify-between border-r border-white/8 px-14 py-16"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease }}
      >
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: "var(--linear-text-3)" }}>
            Sanad — Credit Intelligence
          </p>
        </div>
        <div>
          <div className="pl-6" style={{ borderLeft: "3px solid var(--linear-accent)" }}>
            <p className="font-instrument text-[2.5rem] leading-[1.08] tracking-tight">
              Your credit passport. Built in&nbsp;minutes, trusted by banks.
            </p>
            <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
              — Sanad Platform, 2026
            </p>
          </div>
          <dl className="mt-14 grid grid-cols-3 border-t border-white/8">
            {[
              { value: "100%", label: "Free to start" },
              { value: "3 min", label: "onboarding" },
              { value: "DITP", label: "data standards" },
            ].map(({ value, label }) => (
              <div key={label} className="border-r border-white/8 py-5 pr-5 last:border-r-0">
                <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{label}</dt>
                <dd className="font-instrument mt-2 text-2xl leading-none" style={{ color: "var(--linear-accent)" }}>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
          Sanad Hackathon &middot; INSAT &middot; April 18, 2026
        </p>
      </motion.aside>

      {/* RIGHT — form */}
      <motion.div
        className="flex flex-1 flex-col justify-center px-8 py-16 sm:px-16 lg:px-20"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.1, ease }}
      >
        <div className="mx-auto w-full max-w-sm">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: "var(--linear-text-3)" }}>
            Get started
          </p>
          <h1 className="font-instrument mt-4 text-[2.8rem] leading-[1.02] tracking-tight">
            Create account.
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Already have one?{" "}
            <Link href="/login" className="underline underline-offset-4 hover:text-foreground transition-colors">
              Sign in
            </Link>
          </p>

          {/* Role selector */}
          <div className="mt-10">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.15em] text-muted-foreground mb-3">I am a</p>
            <div className="grid grid-cols-3 gap-2">
              {roles.map((r) => {
                const Icon = r.icon;
                const active = role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-4 text-center transition-all ${
                      active
                        ? "border-[var(--linear-accent)] bg-[var(--linear-accent)]/8 text-foreground"
                        : "border-white/10 text-muted-foreground hover:border-white/20 hover:bg-white/[0.03]"
                    }`}
                  >
                    <Icon aria-hidden="true" className={`size-5 ${active ? "text-[var(--linear-accent)]" : ""}`} />
                    <span className="font-mono text-[10px] uppercase tracking-wider leading-tight">{r.label}</span>
                  </button>
                );
              })}
            </div>
            <AnimatePresence mode="wait">
              <motion.p
                key={role}
                className="mt-2 font-mono text-[11px] text-muted-foreground"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                → {roles.find((r) => r.id === role)?.sub}
              </motion.p>
            </AnimatePresence>
          </div>

          <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-0">
            <div className="border-b border-white/12">
              <label htmlFor="name" className="block font-mono text-[10.5px] uppercase tracking-[0.15em] text-muted-foreground mb-2">
                Full name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Karim Mansouri"
                className="w-full bg-transparent pb-3 text-base outline-none placeholder:text-muted-foreground/40"
              />
            </div>
            <div className="mt-6 border-b border-white/12">
              <label htmlFor="email" className="block font-mono text-[10.5px] uppercase tracking-[0.15em] text-muted-foreground mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-transparent pb-3 text-base outline-none placeholder:text-muted-foreground/40"
              />
            </div>
            <div className="mt-6 border-b border-white/12">
              <label htmlFor="password" className="block font-mono text-[10.5px] uppercase tracking-[0.15em] text-muted-foreground mb-2">
                Password
              </label>
              <div className="relative flex items-center">
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full bg-transparent pb-3 pr-10 text-base outline-none placeholder:text-muted-foreground/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-0 bottom-3 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}
                </button>
              </div>
            </div>
            <div className="mt-6 border-b border-white/12">
              <label htmlFor="confirm" className="block font-mono text-[10.5px] uppercase tracking-[0.15em] text-muted-foreground mb-2">
                Confirm password
              </label>
              <input
                id="confirm"
                type={showPw ? "text" : "password"}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent pb-3 text-base outline-none placeholder:text-muted-foreground/40"
              />
            </div>

            {error && (
              <motion.p
                className="mt-4 font-mono text-[12px] uppercase tracking-wide"
                style={{ color: "var(--linear-text-3)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}>
                {error}
              </motion.p>
            )}

            <div className="mt-10">
              <Button type="submit" size="lg" className="w-full rounded-full" disabled={submitting}>
                {submitting ? (
                  <span className="font-mono text-sm uppercase tracking-widest">Creating account…</span>
                ) : (
                  <>Create account <ArrowRight aria-hidden="true" className="size-4" /></>
                )}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}


