"use client";

import { useState } from "react";
import { Cloud, Github, Slack, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const INTEGRATIONS: Integration[] = [
  {
    id: "google_drive",
    name: "Google Drive",
    description: "Browse and import Docs, Sheets, and PDFs into Knowledge.",
    icon: <Cloud size={20} className="text-sky-500" />,
  },
  {
    id: "github",
    name: "GitHub",
    description: "Attach code context and open PRs from inside Chat Work.",
    icon: <Github size={20} />,
  },
  {
    id: "notion",
    name: "Notion",
    description: "Sync pages and databases as Knowledge.",
    icon: <StickyNote size={20} className="text-rose-500" />,
  },
  {
    id: "slack",
    name: "Slack",
    description: "Summon Chat Work in a channel and export threads to Projects.",
    icon: <Slack size={20} className="text-violet-500" />,
  },
];

export default function IntegrationsPage() {
  const [toast, setToast] = useState<string | null>(null);

  function connect(name: string) {
    setToast(`${name} integration is coming soon.`);
    setTimeout(() => setToast(null), 2400);
  }

  return (
    <div className="canvas-gradient min-h-screen">
      <div className="mx-auto max-w-4xl px-8 py-10">
        <h1 className="mb-2 text-[28px] font-semibold tracking-tight">
          Integrations
        </h1>
        <p className="mb-8 max-w-xl text-[14px] text-ink-muted">
          Bring external data into Chat Work. All integrations below are
          planned — click Connect to register interest.
        </p>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {INTEGRATIONS.map((it) => (
            <div
              key={it.id}
              className="flex items-start gap-3 rounded-2xl bg-white/80 p-5 ring-1 ring-[var(--color-border-soft)]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/[0.04]">
                {it.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold">{it.name}</div>
                <div className="text-[13px] text-ink-muted">
                  {it.description}
                </div>
              </div>
              <Button variant="outline" onClick={() => connect(it.name)}>
                Connect
              </Button>
            </div>
          ))}
        </div>

        {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-black px-4 py-2 text-sm text-white shadow-lg">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
