// lib/db/seed/index.ts

import { config } from "dotenv";

config({
  path: ".env",
});

import { seedOrganization } from "./modules/organization.seed";
import { seedUsers } from "./modules/user.seed";
import { seedPbac } from "./modules/pbac.seed";
import { seedCrm } from "./modules/crm.seed";

async function seed() {
  // Import DB only AFTER dotenv has been loaded.
  const { db } = await import("@/lib/db");

  console.log("🌱 Starting database seed...");

  await db.transaction(async (tx) => {
    const organization = await seedOrganization(tx);

    const users = await seedUsers(tx, {
      organizationId: organization.id,
    });

    await seedPbac(tx, {
      organizationId: organization.id,
    });

    await seedCrm(tx, {
      organizationId: organization.id,
      users,
    });
  });

  console.log("✅ Database seed completed.");
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Database seed failed:");
    console.error(error);
    process.exit(1);
  });
