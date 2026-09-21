"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

export function AuditFilters({
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
    searchParams.get("actorId") ||
    searchParams.get("from") ||
    searchParams.get("to");

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <input
        placeholder="Search action or resource type…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="w-64 rounded-md border border-line bg-paper px-3 py-2 text-sm"
      />
      <select
        defaultValue={searchParams.get("actorId") ?? ""}
        onChange={(e) => updateParam("actorId", e.target.value)}
        className="rounded-md border border-line bg-paper px-3 py-2 text-sm"
      >
        <option value="">Anyone</option>
        {orgUsers.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name}
          </option>
        ))}
      </select>
      <input
        type="date"
        defaultValue={searchParams.get("from") ?? ""}
        onChange={(e) => updateParam("from", e.target.value)}
        className="rounded-md border border-line bg-paper px-3 py-2 text-sm"
      />
      <span className="text-xs text-steel">to</span>
      <input
        type="date"
        defaultValue={searchParams.get("to") ?? ""}
        onChange={(e) => updateParam("to", e.target.value)}
        className="rounded-md border border-line bg-paper px-3 py-2 text-sm"
      />
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
