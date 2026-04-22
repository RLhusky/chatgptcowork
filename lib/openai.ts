import OpenAI from "openai";
import { readCodexAuth } from "./codex-auth";

export class CodexAuthMissingError extends Error {
  code = "codex_auth_required" as const;
  constructor() {
    super(
      "No Codex credentials found. Run `codex login` (install with `npm i -g @openai/codex`) or set OPENAI_API_KEY."
    );
  }
}

export function getOpenAI(): OpenAI {
  const auth = readCodexAuth();
  if (!auth) throw new CodexAuthMissingError();
  return new OpenAI({ apiKey: auth.token });
}
