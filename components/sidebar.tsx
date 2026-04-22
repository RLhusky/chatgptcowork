"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Folder,
  HelpCircle,
  MessageCircle,
  Plus,
  Puzzle,
  Settings,
  SquarePen,
  Users,
} from "lucide-react";
import { KnotLogo } from "./knot-logo";
import { cn, initialsOf } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

export function Sidebar({ displayName }: { displayName: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems: {
    href: string;
    label: string;
    icon: React.ReactNode;
    match: (p: string) => boolean;
  }[] = [
    {
      href: "/",
      label: "New chat",
      icon: <Plus size={18} />,
      match: (p) => p === "/",
    },
    {
      href: "/chats",
      label: "Chats",
      icon: <MessageCircle size={18} />,
      match: (p) => p === "/chats" || p.startsWith("/chat/"),
    },
    {
      href: "/projects",
      label: "Projects",
      icon: <Folder size={18} />,
      match: (p) => p.startsWith("/projects"),
    },
    {
      href: "/knowledge",
      label: "Knowledge",
      icon: <BookOpen size={18} />,
      match: (p) => p.startsWith("/knowledge"),
    },
    {
      href: "/integrations",
      label: "Integrations",
      icon: <Puzzle size={18} />,
      match: (p) => p.startsWith("/integrations"),
    },
  ];

  return (
    <aside className="sidebar-gradient sticky top-0 flex h-screen w-[280px] shrink-0 flex-col justify-between px-4 pb-4 pt-5">
      <div>
        <div className="mb-4 flex items-center justify-between px-2">
          <Link href="/" className="flex items-center gap-2">
            <KnotLogo size={24} />
            <span className="text-[17px] font-semibold tracking-tight">
              Chat Work
            </span>
          </Link>
          <button
            onClick={() => router.push("/")}
            className="rounded-lg p-1.5 text-ink-muted hover:bg-black/5"
            aria-label="New chat"
            title="New chat"
          >
            <SquarePen size={18} />
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] text-ink transition-colors",
                  active
                    ? "pill-active"
                    : "hover:bg-white/40 text-ink/85"
                )}
              >
                <span className="text-ink/80">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="my-3 h-px bg-white/40" />

        <div className="flex flex-col gap-1">
          <Popover>
            <PopoverTrigger>
              <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] text-ink/85 hover:bg-white/40">
                <Users size={18} className="text-ink/80" />
                <span className="flex-1 text-left font-medium">
                  Team workspace
                </span>
                <ChevronDown size={16} className="text-ink-muted" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="min-w-[220px]">
              <div className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-ink-muted">
                Workspaces
              </div>
              <div className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-black/5 cursor-default">
                ✓ Personal
              </div>
              <div className="cursor-not-allowed rounded-lg px-3 py-2 text-sm text-ink-faint">
                Invite teammates — Coming soon
              </div>
            </PopoverContent>
          </Popover>

          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] transition-colors",
              pathname.startsWith("/settings")
                ? "pill-active"
                : "text-ink/85 hover:bg-white/40"
            )}
          >
            <Settings size={18} className="text-ink/80" />
            <span className="font-medium">Settings</span>
          </Link>
          <Link
            href="/help"
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] transition-colors",
              pathname.startsWith("/help")
                ? "pill-active"
                : "text-ink/85 hover:bg-white/40"
            )}
          >
            <HelpCircle size={18} className="text-ink/80" />
            <span className="font-medium">Help</span>
          </Link>
        </div>
      </div>

      <Popover>
        <PopoverTrigger>
          <button className="flex w-full items-center gap-3 rounded-xl bg-white/40 px-2.5 py-2 text-sm hover:bg-white/70">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[11px] font-semibold text-ink">
              {initialsOf(displayName)}
            </span>
            <span className="flex-1 text-left font-medium">{displayName}</span>
            <ChevronUp size={16} className="text-ink-muted" />
          </button>
        </PopoverTrigger>
        <PopoverContent side="top" align="start" className="min-w-[240px]">
          <Link
            href="/settings"
            className="block rounded-lg px-3 py-2 text-sm hover:bg-black/5"
          >
            Edit profile
          </Link>
          <Link
            href="/settings?tab=codex"
            className="block rounded-lg px-3 py-2 text-sm hover:bg-black/5"
          >
            Codex auth
          </Link>
          <Link
            href="/help"
            className="block rounded-lg px-3 py-2 text-sm hover:bg-black/5"
          >
            Keyboard shortcuts
          </Link>
        </PopoverContent>
      </Popover>
    </aside>
  );
}
