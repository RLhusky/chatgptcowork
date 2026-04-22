import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";
import { db, schema } from "@/lib/db/client";
import { desc } from "drizzle-orm";

export async function RecentChats({ limit = 5 }: { limit?: number }) {
  let rows: { id: string; title: string; updatedAt: Date }[] = [];
  try {
    const r = await db
      .select({
        id: schema.chat.id,
        title: schema.chat.title,
        updatedAt: schema.chat.updatedAt,
      })
      .from(schema.chat)
      .orderBy(desc(schema.chat.updatedAt))
      .limit(limit);
    rows = r;
  } catch {
    rows = [];
  }

  return (
    <div className="mt-8">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-[15px] font-semibold">Recent chats</h3>
        <Link
          href="/chats"
          className="flex items-center gap-1 text-[13px] text-ink-muted hover:text-ink"
        >
          View all ›
        </Link>
      </div>
      <div className="overflow-hidden rounded-2xl bg-white/70 ring-1 ring-[var(--color-border-soft)]">
        {rows.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-ink-muted">
            No chats yet. Start one above.
          </div>
        ) : (
          rows.map((c, i) => (
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
              <span className="text-[12px] text-ink-muted">
                {formatDistanceToNowStrict(c.updatedAt, { addSuffix: true })}
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
