// Ed25519 signing for Sanad Passports
// TODO §6: implement canonicalize / sign / verify / issuePassport
import * as crypto from "crypto";

export function canonicalize(body: Record<string, unknown>): string {
  return JSON.stringify(body, Object.keys(body).sort());
}

export function sign(body: Record<string, unknown>): string {
  const privKeyHex = process.env.SANAD_SIGNING_PRIVATE_KEY;
  if (!privKeyHex) throw new Error("SANAD_SIGNING_PRIVATE_KEY not set");
  const privKey = crypto.createPrivateKey({
    key: Buffer.from(privKeyHex, "hex"),
    format: "der",
    type: "pkcs8",
  });
  return crypto.sign(null, Buffer.from(canonicalize(body)), privKey).toString("hex");
}

export function verify(body: Record<string, unknown>, signature: string): boolean {
  const pubKeyHex = process.env.SANAD_SIGNING_PUBLIC_KEY;
  if (!pubKeyHex) return false;
  const pubKey = crypto.createPublicKey({
    key: Buffer.from(pubKeyHex, "hex"),
    format: "der",
    type: "spki",
  });
  return crypto.verify(
    null,
    Buffer.from(canonicalize(body)),
    pubKey,
    Buffer.from(signature, "hex"),
  );
}

export interface PassportBody {
  id: string;
  smeId?: string;
  subjectUserId?: string;
  companyName?: string;
  sector?: string;
  city?: string;
  issuedAt: string;
  expiresAt: string;
  creditScore: number;
  scoreLabel: string;
  goal: string;
  summary: string;
  kpis: Array<{ label: string; value: string; benchmark: string; status: string }>;
  risks: Array<{ kind: string; severity: string; evidence: string }>;
  sourceDocuments: Array<{ id: string; kind: string; label: string }>;
  xaiLog: string;
}

export function issuePassport(
  body: Omit<PassportBody, "id" | "issuedAt" | "expiresAt">,
  opts?: { ttlDays?: number },
): { body: PassportBody; signature: string; verifyUrl: string } {
  const id = `pp_${Date.now()}`;
  const issuedAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + (opts?.ttlDays ?? 90) * 86400_000).toISOString();
  const fullBody: PassportBody = { ...body, id, issuedAt, expiresAt };

  let signature = "demo_unsigned";
  try {
    signature = sign(fullBody as unknown as Record<string, unknown>);
  } catch {
    // no key in env — demo mode
  }

  return { body: fullBody, signature, verifyUrl: `/verify/${id}` };
}
