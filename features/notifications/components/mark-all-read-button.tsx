"use client";
import { useTransition } from "react";
import { markAllNotificationsReadAction } from "../actions";

export function MarkAllReadButton() {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => markAllNotificationsReadAction())}
      className="rounded-md border border-line px-3 py-1.5 text-xs font-medium text-ink-soft disabled:opacity-50"
    >
      Mark all read
    </button>
  );
}
