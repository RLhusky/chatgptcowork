const DEFAULT_CHUNK_TOKENS = 800;
const DEFAULT_OVERLAP_TOKENS = 100;
const CHARS_PER_TOKEN = 4; // rough heuristic

export interface Chunk {
  ord: number;
  content: string;
  tokens: number;
}

export function chunkText(
  text: string,
  {
    chunkTokens = DEFAULT_CHUNK_TOKENS,
    overlapTokens = DEFAULT_OVERLAP_TOKENS,
  }: { chunkTokens?: number; overlapTokens?: number } = {}
): Chunk[] {
  const cleaned = text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  if (!cleaned) return [];

  const chunkChars = chunkTokens * CHARS_PER_TOKEN;
  const overlapChars = overlapTokens * CHARS_PER_TOKEN;

  const out: Chunk[] = [];
  let cursor = 0;
  let ord = 0;
  while (cursor < cleaned.length) {
    let end = Math.min(cursor + chunkChars, cleaned.length);
    if (end < cleaned.length) {
      // try to break on a paragraph, then sentence
      const softWindow = cleaned.slice(cursor, end);
      const paraBreak = softWindow.lastIndexOf("\n\n");
      if (paraBreak > chunkChars * 0.5) {
        end = cursor + paraBreak + 2;
      } else {
        const sentMatch = softWindow.match(/[.!?]\s+(?=[A-Z0-9])/g);
        if (sentMatch && sentMatch.length) {
          const last = softWindow.lastIndexOf(sentMatch[sentMatch.length - 1]);
          if (last > chunkChars * 0.5) {
            end = cursor + last + sentMatch[sentMatch.length - 1].length;
          }
        }
      }
    }
    const piece = cleaned.slice(cursor, end).trim();
    if (piece) {
      out.push({
        ord: ord++,
        content: piece,
        tokens: Math.ceil(piece.length / CHARS_PER_TOKEN),
      });
    }
    if (end >= cleaned.length) break;
    cursor = Math.max(end - overlapChars, cursor + 1);
  }
  return out;
}
