// Layer 3 matching engine — rule filter + soft-scoring
// TODO §9: implement full matching logic
export type MatchResult = { score: number; reasons: string[] };

export function matchSubject(
  _criteria: Record<string, unknown>,
  _subject: Record<string, unknown>,
): MatchResult {
  // stub
  return { score: 0, reasons: ["Not yet implemented"] };
}
