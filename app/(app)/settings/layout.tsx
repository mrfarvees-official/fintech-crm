import { Can } from "@/features/authorization/can";
import { SETTINGS_NAV } from "@/features/navigation/nav-items";
import Link from "next/link";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1">
      <nav className="w-48 shrink-0 border-r border-line p-4">
        {SETTINGS_NAV.map((item) =>
          item.gate ? (
            <Can
              key={item.href}
              action={item.gate.action}
              resourceType={item.gate.resourceType}
            >
              <Link
                href={item.href}
                className="block rounded px-3 py-2 text-sm text-ink-soft hover:bg-paper"
              >
                {item.label}
              </Link>
            </Can>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded px-3 py-2 text-sm text-ink-soft hover:bg-paper"
            >
              {item.label}
            </Link>
          ),
        )}
      </nav>
      <div className="flex-1 p-8">{children}</div>
    </div>
  );
}
