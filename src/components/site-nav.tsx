"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/use-auth";
import { ArabicGlyph } from "@/components/sanad/arabic-mark";

export function SiteNav() {
  const router = useRouter();
  const { user, ready, logout } = useAuth();

  function handleLogout() {
    logout();
    router.push("/");
  }

  return (
    <>
      {/* Skip to main content — visible on focus only */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <header
        className="sticky top-0 z-40 w-full border-b"
        style={{
          background: "var(--linear-bg-2)",
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        <nav
          aria-label="Main navigation"
          className="mx-auto flex h-12 max-w-6xl items-center justify-between px-6"
        >
          <Link
            href="/"
            className="flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-4"
            aria-label="Sanad — home"
            style={{ fontWeight: 510 }}
          >
            <ArabicGlyph char="س" size={26} />
            <span style={{ color: "var(--linear-text-1)", fontSize: 15 }}>Sanad</span>
          </Link>

          <div className="flex items-center gap-0.5">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-[13px] hover:bg-white/5"
              style={{ color: "var(--linear-text-2)", fontWeight: 510 }}
            >
              <Link href="/chat">Chat</Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-[13px] hover:bg-white/5"
              style={{ color: "var(--linear-text-2)", fontWeight: 510 }}
            >
              <Link href="/dashboard">Dashboard</Link>
            </Button>

            {/* Auth controls — only render after hydration to avoid mismatch */}
            {ready && (
              user ? (
                <div className="ml-3 flex items-center gap-2">
                  <span
                    className="hidden font-mono text-[11px] uppercase tracking-[0.1em] sm:block"
                    style={{ color: "var(--linear-text-3)" }}
                  >
                    {user.name}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="gap-1.5 text-[13px] hover:bg-white/5"
                    style={{ color: "var(--linear-text-3)", fontWeight: 510 }}
                    aria-label="Log out"
                  >
                    <LogOut aria-hidden="true" className="size-3.5" />
                    <span className="hidden sm:inline">Log out</span>
                  </Button>
                </div>
              ) : (
                <div className="ml-3 flex items-center gap-2">
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="text-[13px] hover:bg-white/5"
                    style={{ color: "var(--linear-text-2)", fontWeight: 510 }}
                  >
                    <Link href="/login">Log in</Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    className="rounded-[6px] px-4 text-[13px] font-medium"
                    style={{
                      background: "var(--linear-brand)",
                      color: "#fff",
                      boxShadow: "0 0 0 1px rgba(94,106,210,0.4), 0 2px 8px rgba(94,106,210,0.25)",
                    }}
                  >
                    <Link href="/signup">Get passport</Link>
                  </Button>
                </div>
              )
            )}
          </div>
        </nav>
      </header>
    </>
  );
}
