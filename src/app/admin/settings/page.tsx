import { getSettings } from "../actions";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">System Settings</h1>
      <SettingsForm settings={settings} />
    </div>
  );
}
