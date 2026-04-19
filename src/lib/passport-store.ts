// In-memory passport store — shared between the pipeline route handler and passport pages.
// Works for demo (single Node.js process). Swap for Redis/DB in production.

import type { PassportBody } from "@/lib/signing/passport";

export interface StoredPassport extends PassportBody {
  signature: string;
  verifyUrl: string;
}

// Module-level singleton — persists for the lifetime of the dev server process
const store = new Map<string, StoredPassport>();

export function storePassport(passport: StoredPassport): void {
  store.set(passport.id, passport);
}

export function getPassport(id: string): StoredPassport | undefined {
  return store.get(id);
}
