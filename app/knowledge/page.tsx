import { db, schema } from "@/lib/db/client";
import { desc } from "drizzle-orm";
import { KnowledgeView } from "./knowledge-view";

export const dynamic = "force-dynamic";

export default async function KnowledgePage() {
  let rows: {
    id: string;
    name: string;
    mime: string;
    size: number;
    chunkCount: number;
    createdAt: string;
  }[] = [];
  try {
    const r = db
      .select({
        id: schema.knowledgeFile.id,
        name: schema.knowledgeFile.name,
        mime: schema.knowledgeFile.mime,
        size: schema.knowledgeFile.size,
        chunkCount: schema.knowledgeFile.chunkCount,
        createdAt: schema.knowledgeFile.createdAt,
      })
      .from(schema.knowledgeFile)
      .orderBy(desc(schema.knowledgeFile.createdAt))
      .all();
    rows = r.map((f) => ({
      ...f,
      createdAt: f.createdAt.toISOString(),
    }));
  } catch {
    rows = [];
  }

  return <KnowledgeView initialFiles={rows} />;
}
