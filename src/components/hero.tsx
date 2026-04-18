import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Gradient hero section. Use this as the default landing opener and swap
 * the copy to match the chosen idea tomorrow.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-20 sm:pt-28">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-[520px] bg-gradient-to-b from-brand-500/15 via-transparent to-transparent blur-3xl"
      />
      <div
        aria-hidden
        className="absolute left-1/2 top-1/3 -z-10 size-[460px] -translate-x-1/2 rounded-full bg-brand-gold/10 blur-3xl"
      />

      <div className="mx-auto max-w-4xl text-center">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
          <Sparkles className="size-3.5 text-brand-600" />
          Multi-agent finance, built for Tunisia
        </div>

        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
          Finnovo —{" "}
          <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-brand-gold bg-clip-text text-transparent">
            finance that thinks
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
          A crew of specialized AI agents collaborates to answer your financial
          questions. Watch them reason, critique each other, and compose a
          grounded answer — in real time.
        </p>

        <div className="mt-9 flex items-center justify-center gap-3">
          <Button asChild size="lg" className="rounded-full">
            <Link href="/playground">
              Open playground
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full">
            <Link href="#how">How it works</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
