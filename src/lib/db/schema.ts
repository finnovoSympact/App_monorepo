import { pgTable, uuid, text, timestamp, jsonb, numeric } from "drizzle-orm/pg-core";

/**
 * Minimal starter schema. Replace/extend tomorrow based on the spec.
 * Kept intentionally generic so any of the IDEAS.md concepts can plug in.
 */

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  locale: text("locale").default("fr-TN"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const agentRuns = pgTable("agent_runs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  prompt: text("prompt").notNull(),
  output: text("output"),
  trace: jsonb("trace").$type<Array<Record<string, unknown>>>().default([]),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  finishedAt: timestamp("finished_at"),
});

export const transactions = pgTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  occurredAt: timestamp("occurred_at").notNull(),
  amount: numeric("amount", { precision: 14, scale: 3 }).notNull(),
  currency: text("currency").default("TND").notNull(),
  category: text("category"),
  counterparty: text("counterparty"),
  rawDescription: text("raw_description"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
});
