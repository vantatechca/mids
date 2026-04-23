import { pgTable, text, integer, timestamp, jsonb, boolean, decimal } from "drizzle-orm/pg-core";

export type ProcessorField = {
  fieldName: string;
  fieldLabel: string;
  fieldType: "text" | "select" | "date" | "file" | "textarea" | "number" | "checkbox";
  required: boolean;
  options?: string[];
  mapsTo?: string;
  section?: string;
  description?: string;
};

export type TransactionFees = {
  percentage?: number;
  perTransaction?: number;
  monthlyFee?: number;
  setupFee?: number;
};

export const processors = pgTable("processors", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  websiteUrl: text("website_url"),
  applicationUrl: text("application_url"),
  country: text("country").default("CA"),
  supportsCanada: boolean("supports_canada").default(true),
  supportsUs: boolean("supports_us").default(false),
  acceptedEntityTypes: jsonb("accepted_entity_types").$type<string[]>().default([]),
  acceptedIndustries: jsonb("accepted_industries").$type<string[]>().default([]),
  prohibitedIndustries: jsonb("prohibited_industries").$type<string[]>().default([]),
  monthlyVolumeMin: decimal("monthly_volume_min"),
  monthlyVolumeMax: decimal("monthly_volume_max"),
  transactionFees: jsonb("transaction_fees").$type<TransactionFees | null>(),
  requiredDocuments: jsonb("required_documents").$type<string[]>().default([]),
  requiredFields: jsonb("required_fields").$type<ProcessorField[]>().default([]),
  kycRequirements: text("kyc_requirements"),
  typicalApprovalTime: text("typical_approval_time"),
  integrationType: text("integration_type"),
  shopifyCompatible: boolean("shopify_compatible").default(false),
  notes: text("notes"),
  difficultyRating: integer("difficulty_rating"),
  successRateEstimate: integer("success_rate_estimate"),
  lastVerifiedAt: text("last_verified_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
