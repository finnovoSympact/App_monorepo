import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SiteNav() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/70 backdrop-blur">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex size-7 items-center justify-center rounded-md bg-brand-500/15 text-brand-600">
            <Sparkles className="size-4" />
          </span>
          Finnovo
        </Link>
        <div className="flex items-center gap-1">
          <Button asChild variant="ghost" size="sm">
            <Link href="/playground">Playground</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
          <Button asChild size="sm" className="ml-2">
            <Link href="/playground">Try the agents</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}
