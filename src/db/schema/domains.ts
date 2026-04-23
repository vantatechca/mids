import { pgTable, text, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";

export type DnsRecord = {
  type: "A" | "AAAA" | "CNAME" | "MX" | "TXT" | "NS";
  name: string;
  value: string;
  ttl: number;
  priority?: number;
};

export type EmailForward = {
  email: string;
  forwardingTo: string;
  purpose: string;
};

export const domains = pgTable("domains", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  domainName: text("domain_name").notNull().unique(),
  registrar: text("registrar"),
  registrarAccount: text("registrar_account"),
  expiryDate: text("expiry_date"),
  nameservers: jsonb("nameservers").$type<string[]>().default([]),
  dnsProvider: text("dns_provider"),
  mxRecordsConfigured: boolean("mx_records_configured").default(false),
  emailAddresses: jsonb("email_addresses").$type<EmailForward[]>().default([]),
  sslStatus: text("ssl_status").default("none"),
  assignedToCompanyId: integer("assigned_to_company_id"),
  assignedToApplicationId: integer("assigned_to_application_id"),
  websiteLive: boolean("website_live").default(false),
  websitePlatform: text("website_platform"),
  dnsRecords: jsonb("dns_records").$type<DnsRecord[]>().default([]),
  notes: text("notes"),
  status: text("status").default("available").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
