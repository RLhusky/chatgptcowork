"use client";

import { BarChart3, Code2, Lightbulb, PenLine } from "lucide-react";
import { useRouter } from "next/navigation";

interface Action {
  label: string;
  icon: React.ReactNode;
  tone: string;
  prompt: string;
}

const ACTIONS: Action[] = [
  {
    label: "Write & edit",
    icon: <PenLine size={16} />,
    tone: "text-indigo-500",
    prompt:
      "Help me draft and polish a piece of writing. Ask me what I want to write, the audience, and the tone, then produce a first draft.",
  },
  {
    label: "Analyze data",
    icon: <BarChart3 size={16} />,
    tone: "text-emerald-500",
    prompt:
      "I want to analyze some data. Ask me to describe or paste the data, clarify the question I want answered, and then suggest the analysis.",
  },
  {
    label: "Build with AI",
    icon: <Code2 size={16} />,
    tone: "text-blue-500",
    prompt:
      "I want to build something with AI. Ask me what I'm building, tech stack, and constraints, then propose an architecture and draft starter code.",
  },
  {
    label: "Brainstorm",
    icon: <Lightbulb size={16} />,
    tone: "text-amber-500",
    prompt:
      "Let's brainstorm. Ask me the topic, the goal, and any constraints, then generate 10 distinct ideas and group them.",
  },
];

export function ActionCards() {
  const router = useRouter();

  async function run(action: Action) {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: action.prompt,
        seed: action.label,
      }),
    });
    if (!res.ok) {
      alert("Unable to start chat. Check that `codex login` has been run.");
      return;
    }
    const data = await res.json();
    if (data.chatId) router.push(`/chat/${data.chatId}`);
  }

  return (
    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {ACTIONS.map((a) => (
        <button
          key={a.label}
          onClick={() => run(a)}
          className="flex items-center gap-2 rounded-2xl bg-white/80 px-4 py-4 text-[14px] font-medium text-ink ring-1 ring-[var(--color-border-soft)] transition-colors hover:bg-white"
        >
          <span className={a.tone}>{a.icon}</span>
          <span>{a.label}</span>
        </button>
      ))}
    </div>
  );
}
