"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { CurrentUser } from "@/lib/auth/dal";
import { logoutAction } from "@/features/auth/actions";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function UserMenu({ user }: { user: CurrentUser }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 rounded-md p-2 text-left transition-colors hover:bg-paper"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ledger text-xs font-medium text-white">
          {getInitials(user.name)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink">{user.name}</p>
          <p className="truncate text-xs text-steel">{user.email}</p>
        </div>
      </button>

      {open && (
        <div className="absolute bottom-full left-0 z-10 mb-2 w-full min-w-48 rounded-md border border-line bg-paper-raised p-1 shadow-lg">
          <Link
            href="/settings/profile"
            onClick={() => setOpen(false)}
            className="block rounded px-3 py-2 text-sm text-ink-soft hover:bg-paper"
          >
            Profile
          </Link>
          <Link
            href="/settings/sessions"
            onClick={() => setOpen(false)}
            className="block rounded px-3 py-2 text-sm text-ink-soft hover:bg-paper"
          >
            Settings
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="block w-full rounded px-3 py-2 text-left text-sm text-danger hover:bg-danger-soft"
            >
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
