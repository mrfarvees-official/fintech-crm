import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { riskAssessments } from "@/lib/db/schema";

export async function latestRiskLevel(kycCaseId: number) {
  const [row] = await db
    .select({ level: riskAssessments.level })
    .from(riskAssessments)
    .where(eq(riskAssessments.kycCaseId, kycCaseId))
    .orderBy(desc(riskAssessments.createdAt))
    .limit(1);
  return row?.level ?? null;
}
