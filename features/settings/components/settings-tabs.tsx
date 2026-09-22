import { Can } from "@/features/authorization/can";
import { SETTINGS_NAV } from "@/features/navigation/nav-items";
import { SettingsTabLink } from "./settings-tab-link";

export async function SettingsTabs() {
  return (
    <nav className="flex gap-1 border-b border-line px-8">
      {SETTINGS_NAV.map((item, id) => {
        if (item.ownerOnly) {
          return <SettingsTabLink key={id} href={item.href} label={item.label} />;
        }
        if (item.gate) {
          return (
            <Can
              key={item.href}
              action={item.gate.action}
              resourceType={item.gate.resourceType}
            >
              <SettingsTabLink href={item.href} label={item.label} />
            </Can>
          );
        }
        return (
          <SettingsTabLink
            key={item.href}
            href={item.href}
            label={item.label}
          />
        );
      })}
    </nav>
  );
}
