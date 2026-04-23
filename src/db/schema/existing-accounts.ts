import { pgTable, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { companies } from "./companies";
import { domains } from "./domains";

export const existingAccounts = pgTable("existing_accounts", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  platform: text("platform").notNull(),
  accountName: text("account_name"),
  accountEmail: text("account_email"),
  accountId: text("account_id"),
  companyId: integer("company_id").references(() => companies.id),
  domainId: integer("domain_id").references(() => domains.id),
  phoneLineId: integer("phone_line_id"),
  status: text("status").default("active").notNull(),
  paymentProcessorConnected: text("payment_processor_connected"),
  monthlyVolume: text("monthly_volume"),
  notes: text("notes"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  tags: jsonb("tags").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
