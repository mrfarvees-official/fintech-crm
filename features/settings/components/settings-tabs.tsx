import { Can } from "@/features/authorization/can";
import { IsOwner } from "@/features/authorization/is-owner";
import { SETTINGS_NAV } from "@/features/navigation/nav-items";
import { SettingsTabLink } from "./settings-tab-link";

export async function SettingsTabs() {
  return (
    <nav className="flex gap-1 border-b border-line px-8">
      {SETTINGS_NAV.map((item) => {
        if (item.ownerOnly) {
          return (
            <IsOwner key={item.href}>
              <SettingsTabLink href={item.href} label={item.label} />
            </IsOwner>
          );
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
