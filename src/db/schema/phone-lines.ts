import { pgTable, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";

export const phoneLines = pgTable("phone_lines", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  phoneNumber: text("phone_number").notNull().unique(),
  carrier: text("carrier"),
  deviceLabel: text("device_label"),
  simIccid: text("sim_iccid"),
  forwardingTo: text("forwarding_to"),
  forwardingActive: boolean("forwarding_active").default(false),
  assignedToApplicationId: integer("assigned_to_application_id"),
  assignedToCompanyId: integer("assigned_to_company_id"),
  status: text("status").default("available").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
