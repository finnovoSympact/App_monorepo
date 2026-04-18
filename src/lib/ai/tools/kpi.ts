// computeKPI — deterministic math over the FormattedCorpus
import type { FormattedCorpus } from "@/lib/ai/agents/formatter";

export type KPIMetric = "gross_margin" | "current_ratio" | "debt_to_equity" | "cash_runway_days";

export function computeKPI(
  corpus: FormattedCorpus,
  metric: KPIMetric,
  windowMonths: number,
): number {
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setMonth(cutoff.getMonth() - windowMonths);

  const inWindow = corpus.transactions.filter((t) => new Date(t.date) >= cutoff);

  const totalRevenue = inWindow.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);

  const totalExpenses = inWindow
    .filter((t) => t.amount < 0)
    .reduce((s, t) => s + Math.abs(t.amount), 0);

  switch (metric) {
    case "gross_margin":
      return totalRevenue === 0
        ? 0
        : Math.round(((totalRevenue - totalExpenses * 0.6) / totalRevenue) * 1000) / 10;
    case "current_ratio":
      return totalExpenses === 0
        ? 0
        : Math.round((totalRevenue / (totalExpenses / windowMonths)) * 100) / 100;
    case "debt_to_equity":
      return totalRevenue === 0 ? 0 : Math.round((totalExpenses / totalRevenue) * 100) / 100;
    case "cash_runway_days": {
      const monthlyBurn = totalExpenses / windowMonths;
      const cashBalance = totalRevenue - totalExpenses;
      return monthlyBurn === 0 ? 999 : Math.round((cashBalance / monthlyBurn) * 30);
    }
    default:
      return 0;
  }
}
