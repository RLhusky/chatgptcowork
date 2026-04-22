import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-10 w-full rounded-xl border border-[var(--color-border-soft)] bg-white px-3.5 text-sm placeholder:text-ink-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/10",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";
