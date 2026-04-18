import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

/**
 * Postgres client. Uses a lazy singleton so hot-reload doesn't leak connections
 * during `next dev`.
 */
const globalForDb = globalThis as unknown as {
  __pgClient?: ReturnType<typeof postgres>;
};

const connectionString = process.env.DATABASE_URL;

export const db = connectionString
  ? drizzle(globalForDb.__pgClient ?? (globalForDb.__pgClient = postgres(connectionString, { prepare: false })))
  : null;

/**
 * Guard helper: call this in API routes that need the DB. Returns 503-friendly
 * error when DATABASE_URL is not set, so the app still boots with no DB
 * configured (useful for demo day).
 */
export function requireDb() {
  if (!db) throw new Error("DATABASE_URL not set — add it to .env.local");
  return db;
}
