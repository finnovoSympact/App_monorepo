import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Gradient hero section. Use this as the default landing opener and swap
 * the copy to match the chosen idea tomorrow.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-20 pb-24 sm:pt-28">
      <div
        aria-hidden
        className="from-brand-500/15 absolute inset-x-0 top-0 -z-10 h-[520px] bg-gradient-to-b via-transparent to-transparent blur-3xl"
      />
      <div
        aria-hidden
        className="bg-brand-gold/10 absolute top-1/3 left-1/2 -z-10 size-[460px] -translate-x-1/2 rounded-full blur-3xl"
      />

      <div className="mx-auto max-w-4xl text-center">
        <div className="border-border/60 bg-background/60 text-muted-foreground mx-auto mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium backdrop-blur">
          <Sparkles className="text-brand-600 size-3.5" />
          Multi-agent finance, built for Tunisia
        </div>

        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
          Finnovo —{" "}
          <span className="from-brand-600 via-brand-500 to-brand-gold bg-gradient-to-r bg-clip-text text-transparent">
            finance that thinks
          </span>
        </h1>

        <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg text-pretty">
          A crew of specialized AI agents collaborates to answer your financial questions. Watch
          them reason, critique each other, and compose a grounded answer — in real time.
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
