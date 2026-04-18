// flagRisk — adds a risk item to the draft passport risk register
// TODO §4: integrate into Executor tool loop
export type RiskSeverity = "low" | "medium" | "high" | "critical";

export type RiskFlag = {
  kind: string;
  severity: RiskSeverity;
  evidence: string;
  flaggedAt: string;
};

export function flagRisk(kind: string, severity: RiskSeverity, evidence: string): RiskFlag {
  return { kind, severity, evidence, flaggedAt: new Date().toISOString() };
}
