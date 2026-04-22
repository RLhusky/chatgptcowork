"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface AuthStatus {
  ok: boolean;
  path: string;
  exists: boolean;
  source: string | null;
}

export function CodexAuthBanner() {
  const [status, setStatus] = useState<AuthStatus | null>(null);

  async function refresh() {
    const r = await fetch("/api/auth/status");
    if (r.ok) setStatus(await r.json());
  }

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 15000);
    return () => clearInterval(id);
  }, []);

  if (!status || status.ok) return null;

  return (
    <div className="mx-auto mb-4 flex max-w-3xl items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm">
      <AlertTriangle size={18} className="mt-0.5 text-amber-600" />
      <div className="flex-1">
        <div className="font-semibold text-amber-900">
          Codex sign-in required
        </div>
        <div className="mt-0.5 text-amber-900/80">
          {status.exists
            ? "Your Codex credentials are present but unreadable. Re-run "
            : "No Codex credentials found at "}
          <code className="rounded bg-amber-100 px-1 py-0.5 text-[12px]">
            {status.path}
          </code>
          {!status.exists && (
            <>
              . Install Codex with{" "}
              <code className="rounded bg-amber-100 px-1 py-0.5 text-[12px]">
                npm i -g @openai/codex
              </code>{" "}
              then run{" "}
              <code className="rounded bg-amber-100 px-1 py-0.5 text-[12px]">
                codex login
              </code>
              .
            </>
          )}
        </div>
      </div>
      <button
        onClick={refresh}
        className="flex items-center gap-1 rounded-md bg-amber-100 px-2 py-1 text-xs font-medium text-amber-900 hover:bg-amber-200"
      >
        <RefreshCw size={12} /> Retry
      </button>
    </div>
  );
}
