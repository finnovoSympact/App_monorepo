// flagRisk — adds a risk entry to the passport risk register
export interface RiskEntry {
  kind: string;
  severity: "low" | "medium" | "high";
  evidence: string;
}

export function flagRisk(
  kind: string,
  severity: "low" | "medium" | "high",
  evidence: string,
): RiskEntry {
  return { kind, severity, evidence };
}
