// §2 — Complete Drizzle schema for all 3 layers + infra
import { pgTable, uuid, text, integer, timestamp, jsonb, numeric } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Layer 1 — Sanad Chat (individuals)
// ---------------------------------------------------------------------------

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  whatsappId: text("whatsapp_id").unique(),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
});

export const profiles = pgTable("profiles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  slots: jsonb("slots").notNull().default({}),
  score: integer("score"),
  smeSignalCount: integer("sme_signal_count").notNull().default(0),
  escalatedAt: timestamp("escalated_at"),
  updatedAt: timestamp("updated_at"),
});

export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  startedAt: timestamp("started_at")
    .notNull()
    .default(sql`now()`),
});

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  text: text("text").notNull(),
  lang: text("lang"),
  meta: jsonb("meta"),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
});

// ---------------------------------------------------------------------------
// Layer 2 — Daiyn (SMEs)
// ---------------------------------------------------------------------------

export const smeAccounts = pgTable("sme_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  companyName: text("company_name"),
  sector: text("sector"),
  city: text("city"),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
});

export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  smeId: uuid("sme_id")
    .notNull()
    .references(() => smeAccounts.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(),
  storageKey: text("storage_key"),
  mime: text("mime"),
  bytes: integer("bytes"),
  originChannel: text("origin_channel").notNull().default("web"),
  uploadedAt: timestamp("uploaded_at")
    .notNull()
    .default(sql`now()`),
});

export const pipelineRuns = pgTable("pipeline_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  smeId: uuid("sme_id")
    .notNull()
    .references(() => smeAccounts.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("running"),
  startedAt: timestamp("started_at")
    .notNull()
    .default(sql`now()`),
  endedAt: timestamp("ended_at"),
});

export const runNodes = pgTable("run_nodes", {
  id: uuid("id").primaryKey().defaultRandom(),
  runId: uuid("run_id")
    .notNull()
    .references(() => pipelineRuns.id, { onDelete: "cascade" }),
  nodeKey: text("node_key").notNull(),
  input: jsonb("input"),
  output: jsonb("output"),
  hitlMode: text("hitl_mode").notNull().default("ai"),
  operatorUserId: uuid("operator_user_id"),
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
});

export const passports = pgTable("passports", {
  id: uuid("id").primaryKey().defaultRandom(),
  smeId: uuid("sme_id").references(() => smeAccounts.id),
  subjectUserId: uuid("subject_user_id").references(() => users.id),
  runId: uuid("run_id")
    .notNull()
    .references(() => pipelineRuns.id),
  body: jsonb("body").notNull(),
  signature: text("signature").notNull(),
  issuedAt: timestamp("issued_at")
    .notNull()
    .default(sql`now()`),
  expiresAt: timestamp("expires_at"),
  revokedAt: timestamp("revoked_at"),
});

// ---------------------------------------------------------------------------
// Layer 3 — Sanad for Banks
// ---------------------------------------------------------------------------

export const banks = pgTable("banks", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  criteria: jsonb("criteria").notNull().default({}),
  apiKey: text("api_key"),
  webhookUrl: text("webhook_url"),
});

export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  bankId: uuid("bank_id")
    .notNull()
    .references(() => banks.id, { onDelete: "cascade" }),
  subjectKind: text("subject_kind").notNull(),
  subjectId: uuid("subject_id").notNull(),
  score: integer("score"),
  status: text("status").notNull().default("new"),
  surfacedAt: timestamp("surfaced_at")
    .notNull()
    .default(sql`now()`),
});

export const leadEvents = pgTable("lead_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  leadId: uuid("lead_id")
    .notNull()
    .references(() => leads.id, { onDelete: "cascade" }),
  actorId: uuid("actor_id"),
  action: text("action").notNull(),
  meta: jsonb("meta"),
  ts: timestamp("ts")
    .notNull()
    .default(sql`now()`),
});

export const billingEvents = pgTable("billing_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  bankId: uuid("bank_id")
    .notNull()
    .references(() => banks.id),
  leadId: uuid("lead_id")
    .notNull()
    .references(() => leads.id),
  amountEur: numeric("amount_eur", { precision: 10, scale: 2 }).notNull(),
  billedAt: timestamp("billed_at")
    .notNull()
    .default(sql`now()`),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type User = typeof users.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type SmeAccount = typeof smeAccounts.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type PipelineRun = typeof pipelineRuns.$inferSelect;
export type RunNode = typeof runNodes.$inferSelect;
export type Passport = typeof passports.$inferSelect;
export type Bank = typeof banks.$inferSelect;
export type Lead = typeof leads.$inferSelect;
