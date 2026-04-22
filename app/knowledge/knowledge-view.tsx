"use client";

import { useRef, useState } from "react";
import { BookOpen, Trash2, Upload } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";
import { Button } from "@/components/ui/button";
import { CodexAuthBanner } from "@/components/codex-auth-gate";

interface Row {
  id: string;
  name: string;
  mime: string;
  size: number;
  chunkCount: number;
  createdAt: string;
}

function formatSize(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export function KnowledgeView({ initialFiles }: { initialFiles: Row[] }) {
  const [rows, setRows] = useState<Row[]>(initialFiles);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(files: File[]) {
    if (!files.length) return;
    setUploading(true);
    const fd = new FormData();
    for (const f of files) fd.append("files", f);
    const r = await fetch("/api/knowledge/upload", {
      method: "POST",
      body: fd,
    });
    setUploading(false);
    if (!r.ok) {
      const body = await r.json().catch(() => ({}));
      alert(body?.message ?? "Upload failed");
      return;
    }
    const j = await r.json();
    // refetch full list for accurate metadata
    const list = await fetch("/api/knowledge").then((x) => x.json());
    setRows(
      (list.files ?? []).map((f: Row & { createdAt: string | number }) => ({
        ...f,
        createdAt:
          typeof f.createdAt === "string"
            ? f.createdAt
            : new Date(f.createdAt).toISOString(),
      }))
    );
    if (inputRef.current) inputRef.current.value = "";
    void j;
  }

  async function remove(id: string) {
    if (!confirm("Delete this file and its chunks?")) return;
    const r = await fetch(`/api/knowledge/${id}`, { method: "DELETE" });
    if (r.ok) setRows((cur) => cur.filter((x) => x.id !== id));
  }

  return (
    <div className="canvas-gradient min-h-screen">
      <div className="mx-auto max-w-5xl px-8 py-10">
        <CodexAuthBanner />
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-[28px] font-semibold tracking-tight">Knowledge</h1>
          <Button onClick={() => inputRef.current?.click()} disabled={uploading}>
            <Upload size={16} /> {uploading ? "Uploading…" : "Upload files"}
          </Button>
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            accept=".pdf,.txt,.md,.docx,.csv,.json"
            onChange={(e) => upload(Array.from(e.target.files ?? []))}
          />
        </div>
        <p className="mb-6 max-w-xl text-[14px] text-ink-muted">
          Upload PDF, DOCX, text or markdown files. Each file is chunked and
          embedded locally so you can attach it to chats or projects. Uploads
          require a valid Codex sign-in.
        </p>

        <div className="overflow-hidden rounded-2xl bg-white/80 ring-1 ring-[var(--color-border-soft)]">
          {rows.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-ink-muted">
              No files yet. Upload one to start building your knowledge library.
            </div>
          ) : (
            <table className="w-full text-[14px]">
              <thead className="text-left text-xs uppercase tracking-wide text-ink-muted">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Size</th>
                  <th className="px-4 py-3">Chunks</th>
                  <th className="px-4 py-3">Added</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map((f, i) => (
                  <tr
                    key={f.id}
                    className={i > 0 ? "border-t border-black/5" : ""}
                  >
                    <td className="flex items-center gap-2 px-4 py-3">
                      <BookOpen size={14} className="text-ink-muted" />
                      <span className="truncate">{f.name}</span>
                    </td>
                    <td className="px-4 py-3 text-ink-muted">
                      {formatSize(f.size)}
                    </td>
                    <td className="px-4 py-3 text-ink-muted">{f.chunkCount}</td>
                    <td className="px-4 py-3 text-ink-muted">
                      {formatDistanceToNowStrict(new Date(f.createdAt), {
                        addSuffix: true,
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => remove(f.id)}
                        className="rounded-md p-1 text-ink-muted hover:bg-black/5"
                        aria-label="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
