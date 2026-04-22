import { Keyboard } from "lucide-react";
import { codexAuthStatus } from "@/lib/codex-auth";

export const dynamic = "force-dynamic";

export default function HelpPage() {
  const codex = codexAuthStatus();
  return (
    <div className="canvas-gradient min-h-screen">
      <div className="mx-auto max-w-3xl px-8 py-10">
        <h1 className="mb-6 text-[28px] font-semibold tracking-tight">Help</h1>

        <section className="mb-8 rounded-2xl bg-white/80 p-6 ring-1 ring-[var(--color-border-soft)]">
          <h2 className="mb-3 flex items-center gap-2 font-semibold">
            <Keyboard size={16} /> Keyboard shortcuts
          </h2>
          <dl className="grid grid-cols-[180px_1fr] gap-y-2 text-[14px]">
            <dt className="text-ink-muted">Enter</dt>
            <dd>Send the current message</dd>
            <dt className="text-ink-muted">Shift + Enter</dt>
            <dd>New line in the composer</dd>
            <dt className="text-ink-muted">Esc</dt>
            <dd>Close popovers and the citation panel</dd>
          </dl>
        </section>

        <section className="mb-8 rounded-2xl bg-white/80 p-6 ring-1 ring-[var(--color-border-soft)]">
          <h2 className="mb-3 font-semibold">How Codex auth works</h2>
          <p className="text-[14px] leading-6 text-ink-muted">
            Chat Work reads your Codex credentials from{" "}
            <code className="rounded bg-black/[0.04] px-1 py-0.5 text-[12px]">
              {codex.path}
            </code>{" "}
            and uses them against standard OpenAI API endpoints. Requests are
            billed to your ChatGPT subscription&apos;s built-in API allowance.
            To sign in, install Codex CLI and run{" "}
            <code className="rounded bg-black/[0.04] px-1 py-0.5 text-[12px]">
              codex login
            </code>
            . If requests start failing with a 401, re-run{" "}
            <code className="rounded bg-black/[0.04] px-1 py-0.5 text-[12px]">
              codex login
            </code>{" "}
            to refresh the token.
          </p>
        </section>

        <section className="rounded-2xl bg-white/80 p-6 ring-1 ring-[var(--color-border-soft)]">
          <h2 className="mb-3 font-semibold">Knowledge</h2>
          <p className="text-[14px] leading-6 text-ink-muted">
            Files are parsed, chunked at ~800 tokens with 100-token overlap,
            and embedded with{" "}
            <code className="rounded bg-black/[0.04] px-1 py-0.5 text-[12px]">
              text-embedding-3-small
            </code>
            . Embeddings live in local SQLite. At chat time, the top 6 chunks by
            cosine similarity are injected as context and cited by number.
          </p>
        </section>
      </div>
    </div>
  );
}
