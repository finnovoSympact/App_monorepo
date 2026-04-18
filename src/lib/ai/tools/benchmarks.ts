// queryPeerBenchmarks — sector + size_band → benchmark ranges from seeded fixtures
// TODO §4: load from public/demo/banks/seed.json or Postgres
export type SizeBand = "micro" | "small" | "medium";

export async function queryPeerBenchmarks(
  _sector: string,
  _sizeBand: SizeBand,
): Promise<Record<string, number>> {
  // stub
  return {};
}
