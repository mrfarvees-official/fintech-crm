"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function SettingsTabLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={`relative px-4 py-3 text-sm font-medium transition-colors ${
        active ? "text-ink" : "text-steel hover:text-ink-soft"
      }`}
    >
      {label}
      {active && (
        <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-ledger" />
      )}
    </Link>
  );
}
