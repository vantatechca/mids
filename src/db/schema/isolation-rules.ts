import { pgTable, text, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";

export const isolationRules = pgTable("isolation_rules", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  ruleName: text("rule_name").notNull(),
  assetType: text("asset_type").notNull(),
  scope: text("scope").notNull(),
  allowSharing: boolean("allow_sharing").default(false).notNull(),
  maxUses: integer("max_uses"),
  exceptionConditions: jsonb("exception_conditions").$type<Record<string, unknown>>(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
