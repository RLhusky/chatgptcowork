"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CodexStatus {
  ok: boolean;
  path: string;
  exists: boolean;
  source: string | null;
  accountId: string | null;
  expiresAt: number | null;
}

export function SettingsView({
  initial,
  models,
  codex: codexInit,
}: {
  initial: { displayName: string; defaultModel: string; theme: string };
  models: { id: string; label: string }[];
  codex: CodexStatus;
}) {
  const sp = useSearchParams();
  const router = useRouter();
  const [tab, setTab] = useState<string>(sp.get("tab") ?? "general");
  const [displayName, setDisplayName] = useState(initial.displayName);
  const [defaultModel, setDefaultModel] = useState(initial.defaultModel);
  const [theme, setTheme] = useState(initial.theme);
  const [codex, setCodex] = useState(codexInit);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName, defaultModel, theme }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
    router.refresh();
  }

  async function recheck() {
    const r = await fetch("/api/auth/status");
    if (r.ok) setCodex(await r.json());
  }

  const tabs = [
    { id: "general", label: "General" },
    { id: "codex", label: "Codex auth" },
    { id: "data", label: "Data" },
  ];

  return (
    <div className="canvas-gradient min-h-screen">
      <div className="mx-auto max-w-3xl px-8 py-10">
        <h1 className="mb-6 text-[28px] font-semibold tracking-tight">
          Settings
        </h1>
        <div className="mb-6 flex gap-1 border-b border-black/10">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "rounded-t-lg px-4 py-2 text-sm font-medium",
                tab === t.id
                  ? "border-b-2 border-black text-ink"
                  : "text-ink-muted hover:text-ink"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "general" && (
          <div className="flex flex-col gap-5 rounded-2xl bg-white/80 p-6 ring-1 ring-[var(--color-border-soft)]">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium">
                Display name
              </label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
              <p className="mt-1 text-xs text-ink-muted">
                Used in the sidebar and the home greeting.
              </p>
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-medium">
                Default model
              </label>
              <select
                value={defaultModel}
                onChange={(e) => setDefaultModel(e.target.value)}
                className="h-10 w-full rounded-xl border border-[var(--color-border-soft)] bg-white px-3 text-sm"
              >
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-medium">
                Theme
              </label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="h-10 w-full rounded-xl border border-[var(--color-border-soft)] bg-white px-3 text-sm"
              >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark (coming soon)</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={save} disabled={saving}>
                Save
              </Button>
              {saved && (
                <span className="flex items-center gap-1 text-sm text-emerald-600">
                  <Check size={14} /> Saved
                </span>
              )}
            </div>
          </div>
        )}

        {tab === "codex" && (
          <div className="rounded-2xl bg-white/80 p-6 ring-1 ring-[var(--color-border-soft)]">
            <div className="mb-4 flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex h-2.5 w-2.5 rounded-full",
                  codex.ok ? "bg-emerald-500" : "bg-rose-500"
                )}
              />
              <span className="font-medium">
                {codex.ok ? "Signed in via Codex" : "Not signed in"}
              </span>
              <button
                onClick={recheck}
                className="ml-auto flex items-center gap-1 rounded-md px-2 py-1 text-xs text-ink-muted hover:bg-black/5"
              >
                <RefreshCw size={12} /> Recheck
              </button>
            </div>
            <dl className="grid grid-cols-[140px_1fr] gap-y-2 text-[13px]">
              <dt className="text-ink-muted">Path</dt>
              <dd className="font-mono text-[12px]">{codex.path}</dd>
              <dt className="text-ink-muted">Source</dt>
              <dd>{codex.source ?? "—"}</dd>
              <dt className="text-ink-muted">Account</dt>
              <dd>{codex.accountId ?? "—"}</dd>
              <dt className="text-ink-muted">Expires</dt>
              <dd>
                {codex.expiresAt
                  ? new Date(codex.expiresAt).toLocaleString()
                  : "—"}
              </dd>
            </dl>
            <div className="mt-6 rounded-xl bg-black/[0.04] p-4 text-[13px] leading-6">
              <p className="font-medium">
                How to sign in with your ChatGPT subscription
              </p>
              <ol className="mt-2 list-decimal pl-5 text-ink-muted">
                <li>
                  Install Codex CLI:{" "}
                  <code className="rounded bg-white px-1.5 py-0.5 text-xs">
                    npm i -g @openai/codex
                  </code>
                </li>
                <li>
                  Run{" "}
                  <code className="rounded bg-white px-1.5 py-0.5 text-xs">
                    codex login
                  </code>{" "}
                  and complete the browser OAuth flow.
                </li>
                <li>
                  Come back here and click{" "}
                  <span className="font-medium">Recheck</span>.
                </li>
              </ol>
              <p className="mt-3 text-ink-muted">
                Alternatively set the{" "}
                <code className="rounded bg-white px-1.5 py-0.5 text-xs">
                  OPENAI_API_KEY
                </code>{" "}
                environment variable.
              </p>
            </div>
          </div>
        )}

        {tab === "data" && (
          <div className="flex flex-col gap-5 rounded-2xl bg-white/80 p-6 ring-1 ring-[var(--color-border-soft)]">
            <div>
              <h3 className="font-semibold">Export</h3>
              <p className="mb-2 text-[13px] text-ink-muted">
                Download all chats, projects, and knowledge metadata as JSON.
              </p>
              <a
                href="/api/export"
                className="inline-flex h-10 items-center rounded-xl bg-black px-4 text-sm font-medium text-white"
              >
                Download export.json
              </a>
            </div>
            <div className="border-t border-black/5 pt-4">
              <h3 className="font-semibold text-rose-600">Danger zone</h3>
              <p className="mb-2 text-[13px] text-ink-muted">
                Delete all local data. This cannot be undone.
              </p>
              <Button
                variant="outline"
                onClick={async () => {
                  if (
                    !confirm(
                      "Wipe all local data? Chats, projects, and knowledge will be deleted."
                    )
                  )
                    return;
                  const r = await fetch("/api/wipe", { method: "POST" });
                  if (r.ok) router.push("/");
                }}
              >
                Wipe local data
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
