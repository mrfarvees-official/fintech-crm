import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { customers } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/dal";
import { requirePermissionPage } from "@/features/authorization/can";
import { KycCaseForm } from "@/features/kyc/components/kyc-case-form";

export default async function NewKycCasePage() {
  await requirePermissionPage("kyc.create", "KYC_CASE");
  const user = await getCurrentUser();

  const orgCustomers = await db
    .select({
      id: customers.id,
      firstName: customers.firstName,
      lastName: customers.lastName,
      customerNumber: customers.customerNumber,
    })
    .from(customers)
    .where(eq(customers.organizationId, user.organizationId))
    .orderBy(customers.lastName);

  return (
    <div className="p-8">
      <h1 className="font-serif text-2xl text-ink">New KYC case</h1>
      <KycCaseForm customers={orgCustomers} />
    </div>
  );
}
