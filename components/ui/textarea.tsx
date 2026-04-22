import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full rounded-xl border border-[var(--color-border-soft)] bg-white px-3.5 py-3 text-sm placeholder:text-ink-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/10",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
