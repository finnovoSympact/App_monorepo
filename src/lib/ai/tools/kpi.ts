// computeKPI — deterministic math over the FormattedCorpus
// TODO §4: implement gross_margin, current_ratio, debt_to_equity, cash_runway_days
import type { FormattedCorpus } from "@/lib/ai/agents/formatter";

export type KPIMetric = "gross_margin" | "current_ratio" | "debt_to_equity" | "cash_runway_days";

export function computeKPI(_corpus: FormattedCorpus, _metric: KPIMetric, _windowMonths: number): number {
  // stub — returns 0 until implemented
  return 0;
}
