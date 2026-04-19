"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/use-auth";

function roleNavLink(role: string): { href: string; label: string } | null {
  if (role === "individual") return { href: "/chat", label: "Chat" };
  if (role === "sme") return { href: "/dashboard", label: "Dashboard" };
  if (role === "bank") return { href: "/bank", label: "Leads" };
  return null;
}

export function SiteNav() {
  const router = useRouter();
  const { user, ready, logout } = useAuth();

  function handleLogout() {
    logout();
    router.push("/");
  }

  const navLink = user ? roleNavLink(user.role) : null;

  return (
    <>
      {/* Skip to main content — visible on focus only */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <header
        className="sticky top-0 z-40 w-full border-b"
        style={{
          background: "var(--cream-200)",
          borderColor: "var(--cream-300)",
        }}
      >
        <nav
          aria-label="Main navigation"
          className="mx-auto flex h-12 max-w-6xl items-center justify-between px-6"
        >
          <Link
            href="/"
            className="flex items-center focus-visible:outline-2 focus-visible:outline-offset-4"
            aria-label="Finnovo — home"
          >
            <Image
              src="/logo.svg"
              alt="Finnovo"
              width={110}
              height={61}
              priority
              className="h-8 w-auto"
            />
          </Link>

          <div className="flex items-center gap-0.5">
            {/* Only render after hydration to avoid mismatch */}
            {ready && (
              user ? (
                <>
                  {navLink && (
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="text-[13px] hover:bg-[#26397A]/10"
                      style={{ color: "var(--navy-800)", fontWeight: 510 }}
                    >
                      <Link href={navLink.href}>{navLink.label}</Link>
                    </Button>
                  )}
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
                      className="gap-1.5 text-[13px] hover:bg-[#26397A]/10"
                      style={{ color: "var(--navy-500)", fontWeight: 510 }}
                      aria-label="Log out"
                    >
                      <LogOut aria-hidden="true" className="size-3.5" />
                      <span className="hidden sm:inline">Log out</span>
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="text-[13px] hover:bg-[#26397A]/10"
                    style={{ color: "var(--navy-800)", fontWeight: 510 }}
                  >
                    <Link href="/login">Log in</Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    className="rounded-[6px] px-4 text-[13px] font-medium"
                    style={{
                      background: "var(--navy-800)",
                      color: "var(--cream-200)",
                      boxShadow: "0 1px 3px rgba(38,57,122,0.3)",
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
