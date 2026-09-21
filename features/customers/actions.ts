"use server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { customers } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/dal";
import { checkPermissionWithReason } from "@/features/authorization/can";
import { CustomerSchema, type CustomerFormState } from "./schema";

function readForm(formData: FormData) {
  const get = (k: string) => {
    const v = formData.get(k);
    return typeof v === "string" && v.trim() !== "" ? v : null;
  };
  return {
    customerNumber: get("customerNumber"),
    firstName: get("firstName"),
    lastName: get("lastName"),
    email: get("email"),
    phone: get("phone"),
    nicPassport: get("nicPassport"),
    dateOfBirth: get("dateOfBirth"),
    employmentStatus: get("employmentStatus"),
    employer: get("employer"),
    monthlyIncome: get("monthlyIncome"),
    assignedUserId: get("assignedUserId"),
    status: get("status") ?? "LEAD",
  };
}

function mysqlDupEntry(err: unknown) {
  const code =
    (err as { cause?: { code?: string }; code?: string })?.cause?.code ??
    (err as { code?: string })?.code;
  return code === "ER_DUP_ENTRY";
}

export async function createCustomerAction(
  _prevState: CustomerFormState,
  formData: FormData,
): Promise<CustomerFormState> {
  const access = await checkPermissionWithReason("customer.create", "CUSTOMER");
  if (!access.allowed) return { denied: true, message: access.reason };

  const user = await getCurrentUser();
  const parsed = CustomerSchema.safeParse(readForm(formData));
  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      message: "Fix the errors below.",
    };
  }
  const data = parsed.data;

  let newId: number | undefined;
  try {
    const [row] = await db
      .insert(customers)
      .values({
        organizationId: user.organizationId,
        customerNumber: data.customerNumber,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        nicPassport: data.nicPassport,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        employmentStatus: data.employmentStatus ?? null,
        employer: data.employer,
        monthlyIncome:
          data.monthlyIncome != null ? String(data.monthlyIncome) : null,
        assignedUserId: data.assignedUserId ?? null,
        status: data.status,
        createdBy: user.id,
      })
      .$returningId();
    newId = row.id;

    await recordAudit({
      organizationId: user.organizationId,
      actorId: user.id,
      action: "customer.create",
      resourceType: "CUSTOMER",
      resourceId: newId!,
      newValues: data,
    });
  } catch (err) {
    if (mysqlDupEntry(err)) {
      return {
        errors: { customerNumber: ["That customer number is already in use."] },
        message: "Fix the errors below.",
      };
    }
    throw err;
  }

  revalidatePath("/customers");
  redirect(`/customers/${newId}`);
}

export async function updateCustomerAction(
  customerId: number,
  _prevState: CustomerFormState,
  formData: FormData,
): Promise<CustomerFormState> {
  const user = await getCurrentUser();
  const [existing] = await db
    .select()
    .from(customers)
    .where(eq(customers.id, customerId))
    .limit(1);
  if (!existing || existing.organizationId !== user.organizationId) {
    return { denied: true, message: "Customer not found." };
  }

  const access = await checkPermissionWithReason(
    "customer.update",
    "CUSTOMER",
    {
      assignedUserId: existing.assignedUserId,
      organizationId: existing.organizationId,
    },
  );
  if (!access.allowed) return { denied: true, message: access.reason };

  const parsed = CustomerSchema.safeParse(readForm(formData));
  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      message: "Fix the errors below.",
    };
  }
  const data = parsed.data;

  try {
    await db
      .update(customers)
      .set({
        customerNumber: data.customerNumber,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        nicPassport: data.nicPassport,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        employmentStatus: data.employmentStatus ?? null,
        employer: data.employer,
        monthlyIncome:
          data.monthlyIncome != null ? String(data.monthlyIncome) : null,
        status: data.status,
      })
      .where(eq(customers.id, customerId));

    await recordAudit({
      organizationId: user.organizationId,
      actorId: user.id,
      action: "customer.update",
      resourceType: "CUSTOMER",
      resourceId: customerId,
      oldValues: {
        customerNumber: existing.customerNumber,
        firstName: existing.firstName,
        lastName: existing.lastName,
        status: existing.status,
      },
      newValues: {
        customerNumber: data.customerNumber,
        firstName: data.firstName,
        lastName: data.lastName,
        status: data.status,
      },
    });
  } catch (err) {
    if (mysqlDupEntry(err)) {
      return {
        errors: { customerNumber: ["That customer number is already in use."] },
        message: "Fix the errors below.",
      };
    }
    throw err;
  }

  revalidatePath("/customers");
  revalidatePath(`/customers/${customerId}`);
  return { message: "Saved." };
}

export async function assignCustomerAction(
  customerId: number,
  assignedUserId: number | null,
) {
  const user = await getCurrentUser();
  const [existing] = await db
    .select()
    .from(customers)
    .where(eq(customers.id, customerId))
    .limit(1);
  if (!existing || existing.organizationId !== user.organizationId) {
    return { denied: true, message: "Customer not found." };
  }

  const access = await checkPermissionWithReason(
    "customer.assign",
    "CUSTOMER",
    {
      assignedUserId: existing.assignedUserId,
      organizationId: existing.organizationId,
    },
  );
  if (!access.allowed) return { denied: true, message: access.reason };

  await db
    .update(customers)
    .set({ assignedUserId })
    .where(eq(customers.id, customerId));

  await recordAudit({
    organizationId: user.organizationId,
    actorId: user.id,
    action: "customer.assign",
    resourceType: "CUSTOMER",
    resourceId: customerId,
    oldValues: { assignedUserId: existing.assignedUserId },
    newValues: { assignedUserId },
  });
  
  revalidatePath("/customers");
  revalidatePath(`/customers/${customerId}`);
  return { message: "Assigned." };
}

import {
  guardDelete,
  isForeignKeyConstraintError,
} from "@/lib/auth/delete-guard";
import { recordAudit } from "@/lib/audit/log";

export async function deleteCustomerAction(customerId: number) {
  const user = await getCurrentUser();
  const [existing] = await db
    .select()
    .from(customers)
    .where(eq(customers.id, customerId))
    .limit(1);
  if (!existing || existing.organizationId !== user.organizationId) {
    return { denied: true, message: "Customer not found." };
  }

  const guard = await guardDelete("customer.delete", "CUSTOMER", {
    assignedUserId: existing.assignedUserId,
    organizationId: existing.organizationId,
  });
  if (!guard.allowed) return { denied: true, message: guard.message };

  try {
    await db.delete(customers).where(eq(customers.id, customerId));
    await recordAudit({
      organizationId: user.organizationId,
      actorId: user.id,
      action: "customer.delete",
      resourceType: "CUSTOMER",
      resourceId: customerId,
      oldValues: {
        customerNumber: existing.customerNumber,
        firstName: existing.firstName,
        lastName: existing.lastName,
      },
    });
  } catch (err) {
    if (isForeignKeyConstraintError(err)) {
      return {
        denied: true,
        message:
          "Can't delete — this customer has KYC cases or risk assessments on record.",
      };
    }
    throw err;
  }

  revalidatePath("/customers");
  return { message: "Customer deleted." };
}
