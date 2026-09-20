import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/dal";
import { Can } from "@/features/authorization/can";
import { PRIMARY_NAV } from "../nav-items";
import { UserMenu } from "./user-menu";

export async function Sidebar() {
  const user = await getCurrentUser();

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-line bg-paper-raised">
      <div className="flex h-16 items-center border-b border-line px-6">
        <span className="font-serif text-lg tracking-tight text-ink">
          Fintech CRM
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {PRIMARY_NAV.map((item) =>
          item.gate ? (
            <Can
              key={item.href}
              action={item.gate.action}
              resourceType={item.gate.resourceType}
            >
              <SidebarLink {...item} />
            </Can>
          ) : (
            <SidebarLink key={item.href} {...item} />
          ),
        )}
      </nav>

      <div className="border-t border-line p-3">
        <UserMenu user={user} />
      </div>
    </aside>
  );
}

function SidebarLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-md px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-paper"
    >
      {label}
    </Link>
  );
}
