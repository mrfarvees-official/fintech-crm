import { config } from "dotenv";

config({
  path: ".env.local",
});

import { db } from "@/lib/db";

import { seedOrganization } from "./modules/organization.seed";
import { seedRbac } from "./modules/rbac.seed";
import { seedUsers } from "./modules/users.seed";
import { seedPbac } from "./modules/pbac.seed";
import { seedCrm } from "./modules/crm.seed";

async function seed() {
  console.log("🌱 Starting database seed...");

  await db.transaction(async (tx) => {
    const organization = await seedOrganization(tx);

    const rbac = await seedRbac(tx, {
      organizationId: organization.id,
    });

    const users = await seedUsers(tx, {
      organizationId: organization.id,
      roles: rbac.roles,
    });

    const pbac = await seedPbac(tx, {
      organizationId: organization.id,
      users,
      roles: rbac.roles,
    });

    await seedCrm(tx, {
      organizationId: organization.id,
      users,
      pbac,
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
