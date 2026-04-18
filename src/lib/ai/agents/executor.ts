// Layer 2 node c — builds DraftPassport via tool calling
// TODO §4: bind computeKPI / queryPeerBenchmarks / flagRisk / renderPassportSection
export type DraftPassport = {
  smeId: string;
  claims: Array<{
    section: string;
    value: unknown;
    source_doc_id: string;
    transaction_id?: string;
  }>;
  risks: Array<{ kind: string; severity: string; evidence: string }>;
  kpis: Record<string, number>;
};
export {};
