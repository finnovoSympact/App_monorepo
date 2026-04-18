// Layer 2 node d — anti-hallucination gate + consistency check
// TODO §4: verify every numeric claim cites a source; check P&L reconciles to bank flows ±5%
export type ReviewVerdict = { verdict: "APPROVED" | "NEEDS_REVISION"; reasons: string[] };
export {};
