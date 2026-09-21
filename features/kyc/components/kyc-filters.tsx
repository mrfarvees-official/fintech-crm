"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { KYC_STATUSES } from "../schema";

export function KycFilters({
  orgUsers,
}: {
  orgUsers: { id: number; name: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  useEffect(() => {
    const handle = setTimeout(() => {
      if (q !== (searchParams.get("q") ?? "")) updateParam("q", q);
    }, 350);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const hasFilters =
    searchParams.get("q") ||
    searchParams.get("status") ||
    searchParams.get("submittedBy");

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <input
        placeholder="Search customer…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="w-56 rounded-md border border-line bg-paper px-3 py-2 text-sm"
      />
      <select
        defaultValue={searchParams.get("status") ?? ""}
        onChange={(e) => updateParam("status", e.target.value)}
        className="rounded-md border border-line bg-paper px-3 py-2 text-sm"
      >
        <option value="">All statuses</option>
        {KYC_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <select
        defaultValue={searchParams.get("submittedBy") ?? ""}
        onChange={(e) => updateParam("submittedBy", e.target.value)}
        className="rounded-md border border-line bg-paper px-3 py-2 text-sm"
      >
        <option value="">Anyone submitted</option>
        {orgUsers.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name}
          </option>
        ))}
      </select>
      {hasFilters && (
        <button
          type="button"
          onClick={() => {
            setQ("");
            router.push(pathname);
          }}
          className="text-xs text-steel underline"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
