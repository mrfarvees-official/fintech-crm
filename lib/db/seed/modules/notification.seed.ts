import { and, eq } from "drizzle-orm";

import { notifications, users } from "@/lib/db/schema";

import { NOTIFICATION_SEEDS } from "../data/notifications";

import type { SeedTransaction } from "../types";

type User = typeof users.$inferSelect;

export async function seedNotifications(
  tx: SeedTransaction,
  {
    organizationId,
    users,
  }: {
    organizationId: number;
    users: Record<string, User>;
  },
) {
  for (const seed of NOTIFICATION_SEEDS) {
    const user = users[seed.userKey];

    if (!user) {
      throw new Error(`Notification user not found: ${seed.userKey}`);
    }

    const [existing] = await tx
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.organizationId, organizationId),
          eq(notifications.userId, user.id),
          eq(notifications.type, seed.type),
          eq(notifications.title, seed.title),
        ),
      )
      .limit(1);

    if (existing) {
      continue;
    }

    await tx.insert(notifications).values({
      organizationId,

      userId: user.id,

      type: seed.type,
      title: seed.title,
      message: seed.message,
    });

    console.log(`  + Notification: ${seed.title}`);
  }
}
