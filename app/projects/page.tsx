import Link from "next/link";
import { Folder, Plus } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";
import { db, schema } from "@/lib/db/client";
import { desc } from "drizzle-orm";
import { NewProjectButton } from "./new-project-button";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  let rows: {
    id: string;
    name: string;
    instructions: string;
    updatedAt: Date;
  }[] = [];
  try {
    rows = db
      .select({
        id: schema.project.id,
        name: schema.project.name,
        instructions: schema.project.instructions,
        updatedAt: schema.project.updatedAt,
      })
      .from(schema.project)
      .orderBy(desc(schema.project.updatedAt))
      .all();
  } catch {
    rows = [];
  }

  return (
    <div className="canvas-gradient min-h-screen">
      <div className="mx-auto max-w-5xl px-8 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-[28px] font-semibold tracking-tight">Projects</h1>
          <NewProjectButton />
        </div>
        <p className="mb-6 max-w-xl text-[14px] text-ink-muted">
          Projects bundle pinned instructions with a knowledge library so every
          chat inside the project picks them up automatically.
        </p>

        {rows.length === 0 ? (
          <div className="rounded-2xl bg-white/70 p-10 text-center ring-1 ring-[var(--color-border-soft)]">
            <Plus className="mx-auto mb-3 text-ink-muted" />
            <div className="text-[15px] font-medium">No projects yet</div>
            <div className="text-[13px] text-ink-muted">
              Create one to pin instructions and knowledge.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((p) => (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                className="rounded-2xl bg-white/80 p-5 ring-1 ring-[var(--color-border-soft)] hover:bg-white"
              >
                <div className="mb-2 flex items-center gap-2 text-ink/80">
                  <Folder size={16} />
                  <div className="truncate font-semibold">{p.name}</div>
                </div>
                <div className="line-clamp-3 text-[13px] text-ink-muted">
                  {p.instructions || "No instructions yet."}
                </div>
                <div className="mt-3 text-[12px] text-ink-muted">
                  Updated{" "}
                  {formatDistanceToNowStrict(p.updatedAt, {
                    addSuffix: true,
                  })}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
