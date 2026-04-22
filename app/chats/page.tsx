import Link from "next/link";
import { desc } from "drizzle-orm";
import { formatDistanceToNowStrict } from "date-fns";
import { MessageCircle } from "lucide-react";
import { db, schema } from "@/lib/db/client";

export const dynamic = "force-dynamic";

function bucket(d: Date): string {
  const now = Date.now();
  const ms = now - d.getTime();
  const day = 24 * 60 * 60 * 1000;
  if (ms < day) return "Today";
  if (ms < 2 * day) return "Yesterday";
  if (ms < 7 * day) return "Last 7 days";
  if (ms < 30 * day) return "Last 30 days";
  return "Older";
}

export default async function ChatsPage() {
  let rows: { id: string; title: string; updatedAt: Date }[] = [];
  try {
    rows = db
      .select({
        id: schema.chat.id,
        title: schema.chat.title,
        updatedAt: schema.chat.updatedAt,
      })
      .from(schema.chat)
      .orderBy(desc(schema.chat.updatedAt))
      .all();
  } catch {
    rows = [];
  }

  const groups: Record<string, typeof rows> = {};
  const order = ["Today", "Yesterday", "Last 7 days", "Last 30 days", "Older"];
  for (const r of rows) {
    const b = bucket(r.updatedAt);
    (groups[b] ??= []).push(r);
  }

  return (
    <div className="canvas-gradient min-h-screen">
      <div className="mx-auto max-w-3xl px-8 py-10">
        <h1 className="mb-6 text-[28px] font-semibold tracking-tight">Chats</h1>
        {rows.length === 0 ? (
          <div className="rounded-2xl bg-white/70 p-10 text-center ring-1 ring-[var(--color-border-soft)]">
            <div className="text-[15px] font-medium">No chats yet</div>
            <div className="text-[13px] text-ink-muted">
              Start one from the home screen.
            </div>
          </div>
        ) : (
          order
            .filter((k) => groups[k]?.length)
            .map((k) => (
              <div key={k} className="mb-8">
                <h2 className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-ink-muted">
                  {k}
                </h2>
                <div className="overflow-hidden rounded-2xl bg-white/80 ring-1 ring-[var(--color-border-soft)]">
                  {groups[k].map((c, i) => (
                    <Link
                      key={c.id}
                      href={`/chat/${c.id}`}
                      className={
                        "flex items-center gap-3 px-4 py-3 text-[14px] hover:bg-black/[0.03] " +
                        (i > 0 ? "border-t border-black/5" : "")
                      }
                    >
                      <MessageCircle size={16} className="text-ink-muted" />
                      <span className="flex-1 truncate">{c.title}</span>
                      <span className="text-xs text-ink-muted">
                        {formatDistanceToNowStrict(c.updatedAt, {
                          addSuffix: true,
                        })}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
