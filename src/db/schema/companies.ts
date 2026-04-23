import { pgTable, text, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";

export type Address = {
  type: "registered" | "mailing" | "business";
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
};

export type Director = {
  name: string;
  title: string;
  identityId?: number;
  ownershipPercent?: number;
};

export type BankAccount = {
  institution: string;
  transitNumber: string;
  accountNumber: string;
  currency: string;
};

export type CompanyDocument = {
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
  expiresAt?: string;
};

export const companies = pgTable("companies", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  legalName: text("legal_name").notNull(),
  tradeName: text("trade_name"),
  entityType: text("entity_type"),
  jurisdiction: text("jurisdiction"),
  registrationNumber: text("registration_number"),
  taxId: text("tax_id"),
  gstHstNumber: text("gst_hst_number"),
  incorporationDate: text("incorporation_date"),
  status: text("status").default("active").notNull(),
  registeredAddress: jsonb("registered_address").$type<Address | null>(),
  mailingAddress: jsonb("mailing_address").$type<Address | null>(),
  directors: jsonb("directors").$type<Director[]>().default([]),
  bankAccounts: jsonb("bank_accounts").$type<BankAccount[]>().default([]),
  documents: jsonb("documents").$type<CompanyDocument[]>().default([]),
  notes: text("notes"),
  tags: jsonb("tags").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isDeleted: boolean("is_deleted").default(false).notNull(),
});
