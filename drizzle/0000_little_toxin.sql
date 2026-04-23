CREATE TYPE "public"."pipeline_stage" AS ENUM('draft', 'assets_ready', 'form_filling', 'submitted', 'under_review', 'info_requested', 'approved', 'denied', 'integration', 'live', 'suspended', 'closed');--> statement-breakpoint
CREATE TABLE "companies" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "companies_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"legal_name" text NOT NULL,
	"trade_name" text,
	"entity_type" text,
	"jurisdiction" text,
	"registration_number" text,
	"tax_id" text,
	"gst_hst_number" text,
	"incorporation_date" text,
	"status" text DEFAULT 'active' NOT NULL,
	"registered_address" jsonb,
	"mailing_address" jsonb,
	"directors" jsonb DEFAULT '[]'::jsonb,
	"bank_accounts" jsonb DEFAULT '[]'::jsonb,
	"documents" jsonb DEFAULT '[]'::jsonb,
	"notes" text,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "identities" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "identities_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"person_name" text NOT NULL,
	"date_of_birth" text,
	"sin_last_4" text,
	"id_type" text,
	"id_number" text,
	"id_province_state" text,
	"id_expiry_date" text,
	"scans" jsonb DEFAULT '[]'::jsonb,
	"address_on_id" jsonb,
	"linked_companies" jsonb DEFAULT '[]'::jsonb,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "processors" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "processors_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"website_url" text,
	"application_url" text,
	"country" text DEFAULT 'CA',
	"supports_canada" boolean DEFAULT true,
	"supports_us" boolean DEFAULT false,
	"accepted_entity_types" jsonb DEFAULT '[]'::jsonb,
	"accepted_industries" jsonb DEFAULT '[]'::jsonb,
	"prohibited_industries" jsonb DEFAULT '[]'::jsonb,
	"monthly_volume_min" numeric,
	"monthly_volume_max" numeric,
	"transaction_fees" jsonb,
	"required_documents" jsonb DEFAULT '[]'::jsonb,
	"required_fields" jsonb DEFAULT '[]'::jsonb,
	"kyc_requirements" text,
	"typical_approval_time" text,
	"integration_type" text,
	"shopify_compatible" boolean DEFAULT false,
	"notes" text,
	"difficulty_rating" integer,
	"success_rate_estimate" integer,
	"last_verified_at" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "phone_lines" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "phone_lines_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"phone_number" text NOT NULL,
	"carrier" text,
	"device_label" text,
	"sim_iccid" text,
	"forwarding_to" text,
	"forwarding_active" boolean DEFAULT false,
	"assigned_to_application_id" integer,
	"assigned_to_company_id" integer,
	"status" text DEFAULT 'available' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "phone_lines_phone_number_unique" UNIQUE("phone_number")
);
--> statement-breakpoint
CREATE TABLE "domains" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "domains_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"domain_name" text NOT NULL,
	"registrar" text,
	"registrar_account" text,
	"expiry_date" text,
	"nameservers" jsonb DEFAULT '[]'::jsonb,
	"dns_provider" text,
	"mx_records_configured" boolean DEFAULT false,
	"email_addresses" jsonb DEFAULT '[]'::jsonb,
	"ssl_status" text DEFAULT 'none',
	"assigned_to_company_id" integer,
	"assigned_to_application_id" integer,
	"website_live" boolean DEFAULT false,
	"website_platform" text,
	"dns_records" jsonb DEFAULT '[]'::jsonb,
	"notes" text,
	"status" text DEFAULT 'available' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "domains_domain_name_unique" UNIQUE("domain_name")
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "applications_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"company_id" integer NOT NULL,
	"processor_id" integer NOT NULL,
	"domain_id" integer,
	"phone_line_id" integer,
	"identity_id" integer,
	"email_address" text,
	"stage" "pipeline_stage" DEFAULT 'draft' NOT NULL,
	"form_data" jsonb DEFAULT '{}'::jsonb,
	"stage_history" jsonb DEFAULT '[]'::jsonb,
	"submitted_at" timestamp,
	"approved_at" timestamp,
	"denied_at" timestamp,
	"denial_reason" text,
	"mid_number" text,
	"api_keys" jsonb,
	"integration_status" text DEFAULT 'not_started',
	"monthly_volume_approved" text,
	"fee_structure" jsonb,
	"follow_ups" jsonb DEFAULT '[]'::jsonb,
	"isolation_hash" text,
	"notes" text,
	"priority" integer DEFAULT 5,
	"assigned_team_member" text,
	"risk_score" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "communications" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "communications_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"type" text NOT NULL,
	"direction" text NOT NULL,
	"application_id" integer,
	"phone_line_id" integer,
	"domain_id" integer,
	"from_address" text,
	"to_address" text,
	"subject" text,
	"body" text,
	"voicemail_url" text,
	"voicemail_transcription" text,
	"attachments" jsonb DEFAULT '[]'::jsonb,
	"is_read" boolean DEFAULT false NOT NULL,
	"is_flagged" boolean DEFAULT false NOT NULL,
	"action_needed" boolean DEFAULT false NOT NULL,
	"action_notes" text,
	"received_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "existing_accounts" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "existing_accounts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"platform" text NOT NULL,
	"account_name" text,
	"account_email" text,
	"account_id" text,
	"company_id" integer,
	"domain_id" integer,
	"phone_line_id" integer,
	"status" text DEFAULT 'active' NOT NULL,
	"payment_processor_connected" text,
	"monthly_volume" text,
	"notes" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "isolation_rules" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "isolation_rules_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"rule_name" text NOT NULL,
	"asset_type" text NOT NULL,
	"scope" text NOT NULL,
	"allow_sharing" boolean DEFAULT false NOT NULL,
	"max_uses" integer,
	"exception_conditions" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "accounts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sessions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"session_token" text NOT NULL,
	"user_id" integer NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "sessions_session_token_unique" UNIQUE("session_token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text,
	"email" text NOT NULL,
	"password_hash" text,
	"role" text DEFAULT 'member' NOT NULL,
	"image" text,
	"email_verified" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_processor_id_processors_id_fk" FOREIGN KEY ("processor_id") REFERENCES "public"."processors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_domain_id_domains_id_fk" FOREIGN KEY ("domain_id") REFERENCES "public"."domains"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_phone_line_id_phone_lines_id_fk" FOREIGN KEY ("phone_line_id") REFERENCES "public"."phone_lines"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_identity_id_identities_id_fk" FOREIGN KEY ("identity_id") REFERENCES "public"."identities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communications" ADD CONSTRAINT "communications_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "existing_accounts" ADD CONSTRAINT "existing_accounts_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "existing_accounts" ADD CONSTRAINT "existing_accounts_domain_id_domains_id_fk" FOREIGN KEY ("domain_id") REFERENCES "public"."domains"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;