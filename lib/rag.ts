import { getOpenAI } from "./openai";
import { db, schema } from "./db/client";
import { eq, inArray } from "drizzle-orm";
import { EMBEDDING_MODEL, EMBEDDING_DIMS } from "./models";

export function embeddingToBuffer(vec: number[]): Buffer {
  const buf = Buffer.alloc(vec.length * 4);
  for (let i = 0; i < vec.length; i++) buf.writeFloatLE(vec[i], i * 4);
  return buf;
}

export function embeddingFromBuffer(buf: Buffer): Float32Array {
  const f = new Float32Array(buf.length / 4);
  for (let i = 0; i < f.length; i++) f[i] = buf.readFloatLE(i * 4);
  return f;
}

export function cosine(a: Float32Array, b: Float32Array): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  const client = getOpenAI();
  const resp = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts,
  });
  return resp.data.map((d) => d.embedding as number[]);
}

export interface RetrievedChunk {
  chunkId: string;
  fileId: string;
  fileName: string;
  ord: number;
  content: string;
  score: number;
}

export async function retrieveChunks(
  query: string,
  fileIds: string[],
  topK: number = 6
): Promise<RetrievedChunk[]> {
  if (fileIds.length === 0 || !query.trim()) return [];
  const [queryVec] = await embedTexts([query]);
  const qf = new Float32Array(queryVec);

  const rows = await db
    .select({
      chunkId: schema.knowledgeChunk.id,
      fileId: schema.knowledgeChunk.fileId,
      ord: schema.knowledgeChunk.ord,
      content: schema.knowledgeChunk.content,
      embedding: schema.knowledgeChunk.embedding,
      fileName: schema.knowledgeFile.name,
    })
    .from(schema.knowledgeChunk)
    .innerJoin(
      schema.knowledgeFile,
      eq(schema.knowledgeFile.id, schema.knowledgeChunk.fileId)
    )
    .where(inArray(schema.knowledgeChunk.fileId, fileIds));

  const scored: RetrievedChunk[] = rows.map((r) => ({
    chunkId: r.chunkId,
    fileId: r.fileId,
    fileName: r.fileName,
    ord: r.ord,
    content: r.content,
    score: cosine(qf, embeddingFromBuffer(r.embedding as Buffer)),
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}

export { EMBEDDING_DIMS };
