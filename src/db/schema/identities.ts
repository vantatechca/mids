import { pgTable, text, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";

export type IdScan = {
  type: "front" | "back" | "selfie" | "utility_bill";
  url: string;
  uploadedAt: string;
};

export const identities = pgTable("identities", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  personName: text("person_name").notNull(),
  dateOfBirth: text("date_of_birth"),
  sinLast4: text("sin_last_4"),
  idType: text("id_type"),
  idNumber: text("id_number"),
  idProvinceState: text("id_province_state"),
  idExpiryDate: text("id_expiry_date"),
  scans: jsonb("scans").$type<IdScan[]>().default([]),
  addressOnId: jsonb("address_on_id").$type<Record<string, string> | null>(),
  linkedCompanies: jsonb("linked_companies").$type<number[]>().default([]),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isDeleted: boolean("is_deleted").default(false).notNull(),
});
