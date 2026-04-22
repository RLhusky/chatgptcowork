import { existsSync, readFileSync, statSync, watch, FSWatcher } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export interface CodexAuth {
  token: string;
  accountId?: string;
  expiresAt?: number;
  source: "OPENAI_API_KEY" | "tokens.access_token" | "id_token" | "env";
  path: string;
}

const AUTH_PATH = process.env.CODEX_AUTH_PATH ?? join(homedir(), ".codex", "auth.json");

let cached: { auth: CodexAuth | null; readAt: number } | null = null;
let watcher: FSWatcher | null = null;

function extractToken(parsed: unknown, path: string): CodexAuth | null {
  if (!parsed || typeof parsed !== "object") return null;
  const obj = parsed as Record<string, unknown>;

  if (typeof obj.OPENAI_API_KEY === "string" && obj.OPENAI_API_KEY.length > 10) {
    return {
      token: obj.OPENAI_API_KEY,
      accountId: typeof obj.account_id === "string" ? obj.account_id : undefined,
      source: "OPENAI_API_KEY",
      path,
    };
  }

  const tokens = obj.tokens as Record<string, unknown> | undefined;
  if (tokens && typeof tokens === "object") {
    if (typeof tokens.access_token === "string" && tokens.access_token.length > 10) {
      const expIso = typeof tokens.expires_at === "string" ? Date.parse(tokens.expires_at) : undefined;
      return {
        token: tokens.access_token,
        accountId: typeof tokens.account_id === "string" ? tokens.account_id : undefined,
        expiresAt: expIso && Number.isFinite(expIso) ? expIso : undefined,
        source: "tokens.access_token",
        path,
      };
    }
    if (typeof tokens.id_token === "string" && tokens.id_token.length > 10) {
      return {
        token: tokens.id_token,
        source: "id_token",
        path,
      };
    }
  }

  return null;
}

export function readCodexAuth(): CodexAuth | null {
  if (process.env.OPENAI_API_KEY) {
    return {
      token: process.env.OPENAI_API_KEY,
      source: "env",
      path: "env:OPENAI_API_KEY",
    };
  }

  if (cached && Date.now() - cached.readAt < 2000) {
    return cached.auth;
  }

  if (!existsSync(AUTH_PATH)) {
    cached = { auth: null, readAt: Date.now() };
    return null;
  }

  try {
    const raw = readFileSync(AUTH_PATH, "utf8");
    const parsed = JSON.parse(raw);
    const auth = extractToken(parsed, AUTH_PATH);
    cached = { auth, readAt: Date.now() };

    if (!watcher) {
      try {
        watcher = watch(AUTH_PATH, () => {
          cached = null;
        });
      } catch {
        // ignore watch errors; we'll just re-read after 2s TTL
      }
    }
    return auth;
  } catch (err) {
    console.error("[codex-auth] failed to read", AUTH_PATH, err);
    cached = { auth: null, readAt: Date.now() };
    return null;
  }
}

export function codexAuthStatus() {
  const path = AUTH_PATH;
  const exists = existsSync(path);
  const auth = readCodexAuth();
  let mtime: number | undefined;
  if (exists) {
    try {
      mtime = statSync(path).mtimeMs;
    } catch {
      // ignore
    }
  }
  return {
    path,
    exists,
    ok: !!auth,
    source: auth?.source ?? null,
    accountId: auth?.accountId ?? null,
    expiresAt: auth?.expiresAt ?? null,
    mtime: mtime ?? null,
  };
}

export function invalidateCodexAuthCache() {
  cached = null;
}
