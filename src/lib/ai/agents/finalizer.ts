// Layer 2 node e — signs passport + writes XAI log
// TODO §4: call signing/passport.ts, render printable PDF, write explainability log
export type SanadPassport = {
  id: string;
  smeId: string;
  runId: string;
  body: Record<string, unknown>;
  signature: string;
  issuedAt: string;
  expiresAt: string;
  verifyUrl: string;
};
export {};
