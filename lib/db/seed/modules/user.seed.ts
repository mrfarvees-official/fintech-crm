import { randomBytes, scryptSync } from "node:crypto";

import { and, eq } from "drizzle-orm";

import { users } from "@/lib/db/schema";

import { DEMO_USERS, DEMO_USER_PASSWORD } from "../data/users";

import type { SeedTransaction } from "../types";

type User = typeof users.$inferSelect;

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");

  const hash = scryptSync(password, salt, 64).toString("hex");

  return `scrypt$${salt}$${hash}`;
}

export async function seedUsers(
  tx: SeedTransaction,
  {
    organizationId,
  }: {
    organizationId: number;
  },
) {
  const seededUsers: Record<string, User> = {};

  for (const seed of DEMO_USERS) {
    const [existingUser] = await tx
      .select()
      .from(users)
      .where(
        and(
          eq(users.organizationId, organizationId),
          eq(users.email, seed.email),
        ),
      )
      .limit(1);

    let user = existingUser;

    if (!user) {
      const [inserted] = await tx
        .insert(users)
        .values({
          organizationId,
          name: seed.name,
          email: seed.email,
          passwordHash: hashPassword(DEMO_USER_PASSWORD),
          department: seed.department,
          status: "status" in seed ? seed.status : "ACTIVE", // was: status: "ACTIVE"
        })
        .$returningId();

      [user] = await tx
        .select()
        .from(users)
        .where(eq(users.id, inserted.id))
        .limit(1);

      console.log(`  + User: ${seed.email}`);
    } else {
      console.log(`  = User exists: ${seed.email}`);
    }

    if (!user) {
      throw new Error(`Failed to seed user: ${seed.email}`);
    }

    seededUsers[seed.key] = user;
  }

  return seededUsers;
}
