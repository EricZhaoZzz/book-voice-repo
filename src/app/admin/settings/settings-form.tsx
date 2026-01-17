"use client";

import { useState, useTransition } from "react";
import { updateSettings } from "../actions";

interface SettingsFormProps {
  settings: Record<string, unknown>;
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState(settings);
  const [saved, setSaved] = useState(false);

  const handleChange = (key: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await updateSettings(formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Site Info */}
      <div className="rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Site Information</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Site Name</label>
            <input
              type="text"
              value={(formData.site_name as string) || ""}
              onChange={(e) => handleChange("site_name", e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Logo URL</label>
            <input
              type="text"
              value={(formData.logo_url as string) || ""}
              onChange={(e) => handleChange("logo_url", e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Features</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Allow Guest Access</p>
              <p className="text-sm text-muted-foreground">
                Allow users to access content without logging in
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleChange("allow_guest_access", !formData.allow_guest_access)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.allow_guest_access ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.allow_guest_access ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Allow Registration</p>
              <p className="text-sm text-muted-foreground">Allow new users to sign up</p>
            </div>
            <button
              type="button"
              onClick={() => handleChange("allow_registration", !formData.allow_registration)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.allow_registration ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.allow_registration ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Playback */}
      <div className="rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Playback</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Default Playback Speed</label>
            <select
              value={(formData.default_playback_speed as number) || 1}
              onChange={(e) => handleChange("default_playback_speed", parseFloat(e.target.value))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="0.5">0.5x</option>
              <option value="0.75">0.75x</option>
              <option value="1">1x (Normal)</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
              <option value="2">2x</option>
            </select>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div>
              <p className="font-medium">Auto-play Next</p>
              <p className="text-sm text-muted-foreground">Automatically play next lesson</p>
            </div>
            <button
              type="button"
              onClick={() => handleChange("auto_play_next", !formData.auto_play_next)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.auto_play_next ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.auto_play_next ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Upload */}
      <div className="rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Upload Settings</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Max Upload Size (MB)</label>
            <input
              type="number"
              min="1"
              max="100"
              value={(formData.max_upload_size as number) || 50}
              onChange={(e) => handleChange("max_upload_size", parseInt(e.target.value))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Allowed Formats</label>
            <input
              type="text"
              value={(formData.allowed_formats as string) || "mp3,wav,ogg"}
              onChange={(e) => handleChange("allowed_formats", e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Security</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Max Login Attempts</label>
            <input
              type="number"
              min="1"
              max="10"
              value={(formData.login_attempts as number) || 5}
              onChange={(e) => handleChange("login_attempts", parseInt(e.target.value))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div>
              <p className="font-medium">Enable Captcha</p>
              <p className="text-sm text-muted-foreground">
                Require captcha for login/registration
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleChange("captcha_enabled", !formData.captcha_enabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.captcha_enabled ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.captcha_enabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          {isPending ? "Saving..." : "Save Settings"}
        </button>
        {saved && <p className="text-sm text-green-600">Settings saved successfully!</p>}
      </div>
    </form>
  );
}
