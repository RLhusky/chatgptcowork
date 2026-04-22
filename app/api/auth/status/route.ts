import { NextResponse } from "next/server";
import { codexAuthStatus, invalidateCodexAuthCache } from "@/lib/codex-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  invalidateCodexAuthCache();
  return NextResponse.json(codexAuthStatus());
}
