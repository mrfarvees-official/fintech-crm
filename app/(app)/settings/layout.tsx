import { SettingsTabs } from "@/features/settings/components/settings-tabs";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <SettingsTabs />
      <div className="flex-1 p-8">{children}</div>
    </div>
  );
}
