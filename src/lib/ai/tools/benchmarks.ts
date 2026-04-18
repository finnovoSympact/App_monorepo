// queryPeerBenchmarks — returns sector benchmark fixtures
export interface PeerBenchmarks {
  sector: string;
  size: string;
  grossMarginAvg: number;
  currentRatioAvg: number;
  debtToEquityAvg: number;
  sampleSize: number;
}

const BENCHMARKS: Record<string, PeerBenchmarks> = {
  food_micro: {
    sector: "food",
    size: "micro",
    grossMarginAvg: 31.4,
    currentRatioAvg: 1.4,
    debtToEquityAvg: 0.6,
    sampleSize: 42,
  },
  retail_micro: {
    sector: "retail",
    size: "micro",
    grossMarginAvg: 28.2,
    currentRatioAvg: 1.2,
    debtToEquityAvg: 0.8,
    sampleSize: 31,
  },
  services_micro: {
    sector: "services",
    size: "micro",
    grossMarginAvg: 44.1,
    currentRatioAvg: 1.8,
    debtToEquityAvg: 0.3,
    sampleSize: 28,
  },
  ecommerce_micro: {
    sector: "ecommerce",
    size: "micro",
    grossMarginAvg: 22.8,
    currentRatioAvg: 1.1,
    debtToEquityAvg: 1.1,
    sampleSize: 19,
  },
  construction_micro: {
    sector: "construction",
    size: "micro",
    grossMarginAvg: 18.5,
    currentRatioAvg: 0.9,
    debtToEquityAvg: 1.4,
    sampleSize: 15,
  },
};

export function queryPeerBenchmarks(sector: string, size: string): PeerBenchmarks {
  const key = `${sector.toLowerCase()}_${size.toLowerCase()}`;
  return (
    BENCHMARKS[key] ?? {
      sector,
      size,
      grossMarginAvg: 30,
      currentRatioAvg: 1.3,
      debtToEquityAvg: 0.7,
      sampleSize: 0,
    }
  );
}
