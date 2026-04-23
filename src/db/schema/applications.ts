import { pgTable, text, integer, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { companies } from "./companies";
import { processors } from "./processors";
import { domains } from "./domains";
import { phoneLines } from "./phone-lines";
import { identities } from "./identities";

export const pipelineStageEnum = pgEnum("pipeline_stage", [
  "draft",
  "assets_ready",
  "form_filling",
  "submitted",
  "under_review",
  "info_requested",
  "approved",
  "denied",
  "integration",
  "live",
  "suspended",
  "closed",
]);

export type StageChange = {
  stage: string;
  changedAt: string;
  changedBy: string;
  notes?: string;
};

export const applications = pgTable("applications", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  companyId: integer("company_id").notNull().references(() => companies.id),
  processorId: integer("processor_id").notNull().references(() => processors.id),
  domainId: integer("domain_id").references(() => domains.id),
  phoneLineId: integer("phone_line_id").references(() => phoneLines.id),
  identityId: integer("identity_id").references(() => identities.id),
  emailAddress: text("email_address"),
  stage: pipelineStageEnum("stage").default("draft").notNull(),
  formData: jsonb("form_data").$type<Record<string, unknown>>().default({}),
  stageHistory: jsonb("stage_history").$type<StageChange[]>().default([]),
  submittedAt: timestamp("submitted_at"),
  approvedAt: timestamp("approved_at"),
  deniedAt: timestamp("denied_at"),
  denialReason: text("denial_reason"),
  midNumber: text("mid_number"),
  apiKeys: jsonb("api_keys").$type<Record<string, string>>(),
  integrationStatus: text("integration_status").default("not_started"),
  monthlyVolumeApproved: text("monthly_volume_approved"),
  feeStructure: jsonb("fee_structure").$type<Record<string, unknown>>(),
  followUps: jsonb("follow_ups").$type<Array<Record<string, unknown>>>().default([]),
  isolationHash: text("isolation_hash"),
  notes: text("notes"),
  priority: integer("priority").default(5),
  assignedTeamMember: text("assigned_team_member"),
  riskScore: integer("risk_score").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
