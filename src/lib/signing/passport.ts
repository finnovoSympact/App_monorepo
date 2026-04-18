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
