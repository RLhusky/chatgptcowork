import { NextRequest, NextResponse } from "next/server";
import { getDisplayName, getSetting, setSetting } from "@/lib/settings";
import { DEFAULT_MODEL_ID } from "@/lib/models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    displayName: getDisplayName(),
    defaultModel: getSetting("default_model") ?? DEFAULT_MODEL_ID,
    theme: getSetting("theme") ?? "system",
  });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  if (typeof body.displayName === "string")
    setSetting("display_name", body.displayName.slice(0, 100));
  if (typeof body.defaultModel === "string")
    setSetting("default_model", body.defaultModel);
  if (typeof body.theme === "string") setSetting("theme", body.theme);
  return NextResponse.json({ ok: true });
}
