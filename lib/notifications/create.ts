import "server-only";
import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";

export async function createNotification({
  organizationId,
  userId,
  type,
  title,
  message,
}: {
  organizationId: number;
  userId: number;
  type: string;
  title: string;
  message: string;
}) {
  try {
    await db
      .insert(notifications)
      .values({ organizationId, userId, type, title, message });
  } catch (err) {
    console.error("Failed to create notification", err);
  }
}
