import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { db } from "../index";
import {
  processors,
  phoneLines,
  isolationRules,
  communications,
  users,
  sessions,
  accounts,
  applications,
  existingAccounts,
  domains,
  companies,
  identities,
} from "../schema";
import { processorSeedData } from "./processors";
import { phoneLineSeedData } from "./phone-lines";
import { isolationRuleSeedData } from "./isolation-rules";
import { mockCommunicationsSeedData } from "./mock-communications";
import { hashSync } from "bcryptjs";

async function seed() {
  console.log("Starting seed...\n");

  // --- Clear existing data (order matters due to foreign keys) ---
  console.log("Clearing existing data...");

  console.log("  Deleting communications...");
  await db.delete(communications);

  console.log("  Deleting sessions...");
  await db.delete(sessions);

  console.log("  Deleting accounts...");
  await db.delete(accounts);

  console.log("  Deleting existing accounts...");
  await db.delete(existingAccounts);

  console.log("  Deleting applications...");
  await db.delete(applications);

  console.log("  Deleting domains...");
  await db.delete(domains);

  console.log("  Deleting phone lines...");
  await db.delete(phoneLines);

  console.log("  Deleting identities...");
  await db.delete(identities);

  console.log("  Deleting companies...");
  await db.delete(companies);

  console.log("  Deleting processors...");
  await db.delete(processors);

  console.log("  Deleting isolation rules...");
  await db.delete(isolationRules);

  console.log("  Deleting users...");
  await db.delete(users);

  console.log("  All tables cleared.\n");

  // --- Insert seed data ---

  // 1. Processors
  console.log("Seeding processors...");
  const insertedProcessors = await db
    .insert(processors)
    .values(processorSeedData)
    .returning({ id: processors.id, name: processors.name });
  console.log(`  Inserted ${insertedProcessors.length} processors.`);
  for (const p of insertedProcessors) {
    console.log(`    - [${p.id}] ${p.name}`);
  }

  // 2. Phone Lines
  console.log("\nSeeding phone lines...");
  const insertedPhoneLines = await db
    .insert(phoneLines)
    .values(phoneLineSeedData)
    .returning({ id: phoneLines.id, phoneNumber: phoneLines.phoneNumber });
  console.log(`  Inserted ${insertedPhoneLines.length} phone lines.`);
  for (const pl of insertedPhoneLines) {
    console.log(`    - [${pl.id}] ${pl.phoneNumber}`);
  }

  // 3. Isolation Rules
  console.log("\nSeeding isolation rules...");
  const insertedRules = await db
    .insert(isolationRules)
    .values(isolationRuleSeedData)
    .returning({ id: isolationRules.id, ruleName: isolationRules.ruleName });
  console.log(`  Inserted ${insertedRules.length} isolation rules.`);
  for (const r of insertedRules) {
    console.log(`    - [${r.id}] ${r.ruleName}`);
  }

  // 4. Mock Communications (no foreign keys required for seed)
  console.log("\nSeeding mock communications...");
  const insertedComms = await db
    .insert(communications)
    .values(mockCommunicationsSeedData)
    .returning({ id: communications.id, type: communications.type, subject: communications.subject });
  console.log(`  Inserted ${insertedComms.length} communications.`);
  for (const c of insertedComms) {
    const label = c.subject || `(${c.type} - no subject)`;
    console.log(`    - [${c.id}] ${label}`);
  }

  // 5. Default admin user
  console.log("\nSeeding default admin user...");
  const passwordHash = hashSync("admin123", 10);
  const insertedUsers = await db
    .insert(users)
    .values({
      name: "Admin",
      email: "admin@midfactory.com",
      passwordHash,
      role: "admin",
    })
    .returning({ id: users.id, email: users.email });
  console.log(`  Created admin user: ${insertedUsers[0].email} (id: ${insertedUsers[0].id})`);

  // --- Done ---
  console.log("\nSeed completed successfully!");
  console.log(`  Processors:     ${insertedProcessors.length}`);
  console.log(`  Phone Lines:    ${insertedPhoneLines.length}`);
  console.log(`  Isolation Rules: ${insertedRules.length}`);
  console.log(`  Communications: ${insertedComms.length}`);
  console.log(`  Users:          ${insertedUsers.length}`);

  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
