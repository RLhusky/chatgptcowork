import { userInfo } from "node:os";
import { db, schema } from "./db/client";
import { eq } from "drizzle-orm";

function osName(): string {
  try {
    const u = userInfo().username;
    if (!u) return "You";
    return u.charAt(0).toUpperCase() + u.slice(1);
  } catch {
    return "You";
  }
}

export function getSetting(key: string): string | null {
  try {
    const row = db
      .select()
      .from(schema.setting)
      .where(eq(schema.setting.key, key))
      .get();
    return row?.value ?? null;
  } catch {
    return null;
  }
}

export function setSetting(key: string, value: string) {
  db.insert(schema.setting)
    .values({ key, value })
    .onConflictDoUpdate({ target: schema.setting.key, set: { value } })
    .run();
}

export function getDisplayName(): string {
  return getSetting("display_name") ?? osName();
}

export function getDefaultModel(): string | null {
  return getSetting("default_model");
}
