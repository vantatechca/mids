import { pgTable, text, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { applications } from "./applications";

export const communications = pgTable("communications", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  type: text("type").notNull(),
  direction: text("direction").notNull(),
  applicationId: integer("application_id").references(() => applications.id),
  phoneLineId: integer("phone_line_id"),
  domainId: integer("domain_id"),
  fromAddress: text("from_address"),
  toAddress: text("to_address"),
  subject: text("subject"),
  body: text("body"),
  voicemailUrl: text("voicemail_url"),
  voicemailTranscription: text("voicemail_transcription"),
  attachments: jsonb("attachments").$type<Array<{ filename: string; url: string; size: number }>>().default([]),
  isRead: boolean("is_read").default(false).notNull(),
  isFlagged: boolean("is_flagged").default(false).notNull(),
  actionNeeded: boolean("action_needed").default(false).notNull(),
  actionNotes: text("action_notes"),
  receivedAt: timestamp("received_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
