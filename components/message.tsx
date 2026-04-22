"use client";

import { KnotLogo } from "./knot-logo";
import { cn } from "@/lib/utils";

export interface Citation {
  fileId: string;
  fileName: string;
  ord: number;
  content: string;
}

export function Message({
  role,
  content,
  streaming,
  citations,
  onCitationClick,
}: {
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  streaming?: boolean;
  citations?: Citation[];
  onCitationClick?: (c: Citation, index: number) => void;
}) {
  if (role === "system" || role === "tool") return null;
  const isUser = role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-md bg-black text-white px-4 py-2.5 text-[15px] leading-6 whitespace-pre-wrap">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white ring-1 ring-[var(--color-border-soft)]">
        <KnotLogo size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <div
          className={cn(
            "prose prose-sm max-w-none whitespace-pre-wrap text-[15px] leading-7 text-ink",
            streaming && "streaming-caret"
          )}
        >
          {renderWithCitations(content, citations, onCitationClick)}
        </div>
      </div>
    </div>
  );
}

function renderWithCitations(
  text: string,
  citations?: Citation[],
  onCitationClick?: (c: Citation, index: number) => void
): React.ReactNode {
  if (!citations || !citations.length) return text;
  const parts: React.ReactNode[] = [];
  const re = /\[(\d+)\]/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const n = parseInt(m[1], 10);
    const c = citations[n - 1];
    if (c) {
      parts.push(
        <button
          key={`c-${key++}`}
          onClick={() => onCitationClick?.(c, n - 1)}
          className="mx-0.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-black/[0.08] px-1 text-[11px] font-medium text-ink hover:bg-black/[0.15]"
          title={c.fileName}
        >
          {n}
        </button>
      );
    } else {
      parts.push(m[0]);
    }
    last = re.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}
