import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { runMigrations } from "@/lib/db/migrate";
import { getDisplayName } from "@/lib/settings";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chat Work",
  description: "Your AI coworker.",
};

let migrated = false;
function ensureMigrated() {
  if (migrated) return;
  try {
    runMigrations();
    migrated = true;
  } catch (err) {
    console.error("[migrations]", err);
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  ensureMigrated();
  const displayName = getDisplayName();
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen w-full">
          <Sidebar displayName={displayName} />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </body>
    </html>
  );
}
