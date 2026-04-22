"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Folder, MessageCircle, Save, Trash2 } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Composer } from "@/components/composer";
import { cn } from "@/lib/utils";

interface KnowledgeFile {
  id: string;
  name: string;
  chunkCount: number;
}

interface ChatRow {
  id: string;
  title: string;
  updatedAt: string;
}

export function ProjectView({
  project,
  attachedFiles,
  allFiles,
  chats,
}: {
  project: { id: string; name: string; instructions: string };
  attachedFiles: KnowledgeFile[];
  allFiles: KnowledgeFile[];
  chats: ChatRow[];
}) {
  const router = useRouter();
  const [name, setName] = useState(project.name);
  const [instructions, setInstructions] = useState(project.instructions);
  const [fileIds, setFileIds] = useState<string[]>(
    attachedFiles.map((f) => f.id)
  );
  const [saving, setSaving] = useState(false);

  function toggleFile(id: string) {
    setFileIds((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]
    );
  }

  async function save() {
    setSaving(true);
    await fetch(`/api/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, instructions, fileIds }),
    });
    setSaving(false);
    router.refresh();
  }

  async function remove() {
    if (!confirm("Delete this project? Chats inside it will lose the link.")) return;
    await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
    router.push("/projects");
  }

  return (
    <div className="canvas-gradient min-h-screen">
      <div className="mx-auto max-w-4xl px-8 py-10">
        <div className="mb-6 flex items-center gap-2 text-ink-muted">
          <Link href="/projects" className="hover:text-ink">
            Projects
          </Link>
          <span>/</span>
          <Folder size={14} />
          <span className="truncate text-ink">{project.name}</span>
        </div>

        <div className="flex items-center gap-3">
          <Input
            className="flex-1 h-12 bg-white text-[22px] font-semibold"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button onClick={save} disabled={saving}>
            <Save size={16} /> Save
          </Button>
          <Button variant="ghost" onClick={remove}>
            <Trash2 size={16} />
          </Button>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-[1fr_300px]">
          <div>
            <h2 className="mb-2 text-[14px] font-semibold">Instructions</h2>
            <Textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={10}
              placeholder="e.g. You are working on our Q2 marketing plan. Prefer bullet summaries."
              className="bg-white"
            />

            <h2 className="mb-2 mt-8 text-[14px] font-semibold">
              Start a chat in this project
            </h2>
            <Composer projectId={project.id} />

            <h2 className="mb-2 mt-8 text-[14px] font-semibold">
              Chats in this project
            </h2>
            <div className="overflow-hidden rounded-2xl bg-white/70 ring-1 ring-[var(--color-border-soft)]">
              {chats.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-ink-muted">
                  No chats yet.
                </div>
              ) : (
                chats.map((c, i) => (
                  <Link
                    key={c.id}
                    href={`/chat/${c.id}`}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 text-[14px] hover:bg-black/[0.03]",
                      i > 0 && "border-t border-black/5"
                    )}
                  >
                    <MessageCircle size={16} className="text-ink-muted" />
                    <span className="flex-1 truncate">{c.title}</span>
                    <span className="text-xs text-ink-muted">
                      {formatDistanceToNowStrict(new Date(c.updatedAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div>
            <h2 className="mb-2 text-[14px] font-semibold">Knowledge</h2>
            <div className="rounded-2xl bg-white/70 p-2 ring-1 ring-[var(--color-border-soft)]">
              {allFiles.length === 0 ? (
                <div className="px-3 py-6 text-center text-sm text-ink-muted">
                  No files uploaded.{" "}
                  <Link href="/knowledge" className="underline">
                    Add some
                  </Link>
                  .
                </div>
              ) : (
                allFiles.map((f) => {
                  const on = fileIds.includes(f.id);
                  return (
                    <button
                      key={f.id}
                      onClick={() => toggleFile(f.id)}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm hover:bg-black/5"
                    >
                      <Check
                        size={14}
                        className={cn(on ? "text-ink" : "text-transparent")}
                      />
                      <span className="min-w-0 flex-1 truncate">{f.name}</span>
                      <span className="text-xs text-ink-muted">
                        {f.chunkCount} chunks
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
