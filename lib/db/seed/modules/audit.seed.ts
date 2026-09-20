import { and, eq } from "drizzle-orm";

import { auditLogs, customers, kycCases, users } from "@/lib/db/schema";

import { AUDIT_LOG_SEEDS } from "../data/audit";

import type { SeedTransaction } from "../types";

type User = typeof users.$inferSelect;

export async function seedAudit(
  tx: SeedTransaction,
  {
    organizationId,
    users,
  }: {
    organizationId: number;
    users: Record<string, User>;
  },
) {
  for (const seed of AUDIT_LOG_SEEDS) {
    const actor = users[seed.actorKey];

    if (!actor) {
      throw new Error(`Audit actor not found: ${seed.actorKey}`);
    }

    const customerNumber =
      seed.customerKey === "lowRisk"
        ? "CUS-0001"
        : seed.customerKey === "mediumRisk"
          ? "CUS-0002"
          : "CUS-0003";

    const [customer] = await tx
      .select()
      .from(customers)
      .where(
        and(
          eq(customers.organizationId, organizationId),
          eq(customers.customerNumber, customerNumber),
        ),
      )
      .limit(1);

    if (!customer) {
      throw new Error(`Audit customer not found: ${customerNumber}`);
    }

    let resourceId: number;

    if (seed.resourceType === "CUSTOMER") {
      resourceId = customer.id;
    } else {
      const [kycCase] = await tx
        .select()
        .from(kycCases)
        .where(
          and(
            eq(kycCases.organizationId, organizationId),
            eq(kycCases.customerId, customer.id),
          ),
        )
        .limit(1);

      if (!kycCase) {
        throw new Error(`Audit KYC case not found: ${customerNumber}`);
      }

      resourceId = kycCase.id;
    }

    const [existing] = await tx
      .select()
      .from(auditLogs)
      .where(
        and(
          eq(auditLogs.organizationId, organizationId),
          eq(auditLogs.actorId, actor.id),
          eq(auditLogs.action, seed.action),
          eq(auditLogs.resourceType, seed.resourceType),
          eq(auditLogs.resourceId, resourceId),
        ),
      )
      .limit(1);

    if (existing) {
      continue;
    }

    await tx.insert(auditLogs).values({
      organizationId,

      actorId: actor.id,

      action: seed.action,

      resourceType: seed.resourceType,
      resourceId,

      oldValues: seed.oldValues,
      newValues: seed.newValues,

      ipAddress: seed.ipAddress,
      userAgent: seed.userAgent,
    });

    console.log(`  + Audit: ${seed.action} ${seed.resourceType}#${resourceId}`);
  }
}
