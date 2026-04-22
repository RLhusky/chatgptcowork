import { Composer } from "@/components/composer";
import { ActionCards } from "@/components/action-cards";
import { RecentChats } from "@/components/recent-chats";
import { CodexAuthBanner } from "@/components/codex-auth-gate";
import { KnotLogo } from "@/components/knot-logo";
import { getDisplayName } from "@/lib/settings";
import { greetingForDate } from "@/lib/greeting";
import { firstNameOf } from "@/lib/utils";

export default function HomePage() {
  const name = getDisplayName();
  const greeting = greetingForDate();
  return (
    <div className="canvas-gradient min-h-screen">
      <div className="mx-auto max-w-3xl px-6 pb-16 pt-16">
        <CodexAuthBanner />
        <div className="flex flex-col items-center">
          <KnotLogo size={44} />
          <h1 className="mt-6 text-[40px] font-semibold tracking-tight text-ink">
            {greeting}, {firstNameOf(name)}.
          </h1>
          <p className="mt-3 text-center text-[16px] leading-6 text-ink-muted">
            Chat Work is your AI coworker.
            <br />
            Ready to help you think, write, and build.
          </p>
        </div>

        <div className="mt-10">
          <Composer autoFocus />
        </div>

        <ActionCards />

        <RecentChats />
      </div>
    </div>
  );
}
