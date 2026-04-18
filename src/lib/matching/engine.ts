/**
 * Rule-based lead matching engine for Sanad for Banks.
 * Matches credit passport candidates against bank lending criteria.
 */

export interface BankCriteria {
  subjectKinds: string[]; // ["individual", "sme", "all"]
  ticketRange: { min: number; max: number; currency: string };
  maxPD: number; // max probability of default (%)
  sectors: string[]; // ["food", "tech", "all"]
  regions: string[]; // ["tunis", "sfax", "all"]
  minCreditScore: number;
}

export interface Candidate {
  id: string;
  kind: "individual" | "sme";
  creditScore: number;
  sector: string;
  city: string;
  goal?: string;
  ticketAmountEUR?: number;
  pd?: number; // probability of default
}

/**
 * Computes a 0-100 match score for a candidate against bank criteria.
 * Returns 0 if the candidate fails hard constraints.
 */
export function matchScore(candidate: Candidate, criteria: BankCriteria): number {
  // Hard constraints
  if (!criteria.subjectKinds.includes("all") && !criteria.subjectKinds.includes(candidate.kind)) {
    return 0;
  }

  if (candidate.creditScore < criteria.minCreditScore) {
    return 0;
  }

  if (candidate.pd && candidate.pd > criteria.maxPD) {
    return 0;
  }

  const sectorMatch =
    criteria.sectors.includes("all") ||
    criteria.sectors.some((s) => candidate.sector.toLowerCase().includes(s.toLowerCase()));

  if (!sectorMatch) {
    return 0;
  }

  const regionMatch =
    criteria.regions.includes("all") ||
    criteria.regions.some((r) => candidate.city.toLowerCase().includes(r.toLowerCase()));

  if (!regionMatch) {
    return 0;
  }

  // Soft scoring (0-100)
  let score = 50; // base

  // Credit score bonus (max +30)
  const scoreBonus = Math.min(30, (candidate.creditScore - criteria.minCreditScore) * 2);
  score += scoreBonus;

  // Sector match bonus (+20 if perfect match)
  if (sectorMatch) {
    score += 20;
  }

  return Math.min(100, Math.round(score));
}

/**
 * Filters and ranks candidates by match score.
 */
export function filterLeads(
  candidates: Candidate[],
  criteria: BankCriteria,
): Array<Candidate & { matchScore: number }> {
  return candidates
    .map((c) => ({ ...c, matchScore: matchScore(c, criteria) }))
    .filter((c) => c.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Categorizes leads by temperature.
 */
export function categorizeLeads(leads: Array<Candidate & { matchScore: number }>) {
  return {
    hot: leads.filter((l) => l.matchScore >= 70),
    warm: leads.filter((l) => l.matchScore >= 50 && l.matchScore < 70),
    cold: leads.filter((l) => l.matchScore < 50),
  };
}
