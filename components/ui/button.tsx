import * as React from "react";
import { cn } from "@/lib/utils";

type Variant =
  | "default"
  | "ghost"
  | "outline"
  | "secondary"
  | "link"
  | "icon"
  | "send";

type Size = "sm" | "md" | "lg" | "icon";

const variants: Record<Variant, string> = {
  default:
    "bg-black text-white hover:bg-black/85 active:bg-black/90",
  ghost:
    "bg-transparent text-ink hover:bg-black/5",
  outline:
    "border border-[var(--color-border-soft)] bg-white hover:bg-black/[0.03]",
  secondary:
    "bg-black/[0.04] text-ink hover:bg-black/[0.07]",
  link: "bg-transparent text-ink underline-offset-4 hover:underline",
  icon: "bg-transparent text-ink hover:bg-black/5",
  send: "bg-black text-white hover:bg-black/85 rounded-full",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-sm rounded-lg",
  md: "h-10 px-4 text-sm rounded-xl",
  lg: "h-11 px-5 text-[15px] rounded-xl",
  icon: "h-9 w-9 rounded-lg flex items-center justify-center",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
