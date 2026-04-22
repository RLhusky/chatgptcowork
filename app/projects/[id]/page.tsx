import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db, schema } from "@/lib/db/client";
import { ProjectView } from "./project-view";

export const dynamic = "force-dynamic";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = db
    .select()
    .from(schema.project)
    .where(eq(schema.project.id, id))
    .get();
  if (!project) notFound();

  const attachedFiles = db
    .select({
      id: schema.knowledgeFile.id,
      name: schema.knowledgeFile.name,
      chunkCount: schema.knowledgeFile.chunkCount,
    })
    .from(schema.projectFile)
    .innerJoin(
      schema.knowledgeFile,
      eq(schema.knowledgeFile.id, schema.projectFile.fileId)
    )
    .where(eq(schema.projectFile.projectId, id))
    .all();

  const allFiles = db
    .select({
      id: schema.knowledgeFile.id,
      name: schema.knowledgeFile.name,
      chunkCount: schema.knowledgeFile.chunkCount,
    })
    .from(schema.knowledgeFile)
    .all();

  const chats = db
    .select({
      id: schema.chat.id,
      title: schema.chat.title,
      updatedAt: schema.chat.updatedAt,
    })
    .from(schema.chat)
    .where(eq(schema.chat.projectId, id))
    .all();

  return (
    <ProjectView
      project={{
        id: project.id,
        name: project.name,
        instructions: project.instructions,
      }}
      attachedFiles={attachedFiles}
      allFiles={allFiles}
      chats={chats.map((c) => ({
        id: c.id,
        title: c.title,
        updatedAt: c.updatedAt.toISOString(),
      }))}
    />
  );
}
