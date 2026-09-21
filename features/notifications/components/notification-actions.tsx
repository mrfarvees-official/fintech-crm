"use client";
import { useTransition } from "react";
import {
  markNotificationReadAction,
  deleteNotificationAction,
} from "../actions";

export function NotificationActions({
  notificationId,
  isRead,
}: {
  notificationId: number;
  isRead: boolean;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <div className="flex items-center gap-3 text-xs">
      {!isRead && (
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(() => markNotificationReadAction(notificationId))
          }
          className="font-medium text-ledger hover:underline disabled:opacity-50"
        >
          Mark read
        </button>
      )}
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(() => deleteNotificationAction(notificationId))
        }
        className="font-medium text-red-600 hover:underline disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}
