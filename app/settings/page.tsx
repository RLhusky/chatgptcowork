import { codexAuthStatus } from "@/lib/codex-auth";
import { getDisplayName, getSetting } from "@/lib/settings";
import { DEFAULT_MODEL_ID, MODELS } from "@/lib/models";
import { SettingsView } from "./settings-view";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  const status = codexAuthStatus();
  return (
    <SettingsView
      initial={{
        displayName: getDisplayName(),
        defaultModel: getSetting("default_model") ?? DEFAULT_MODEL_ID,
        theme: getSetting("theme") ?? "system",
      }}
      models={MODELS.map((m) => ({ id: m.id, label: m.label }))}
      codex={status}
    />
  );
}
