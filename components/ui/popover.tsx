"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface PopoverCtx {
  open: boolean;
  setOpen: (v: boolean) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
}
const Ctx = React.createContext<PopoverCtx | null>(null);

export function Popover({
  children,
  open: controlled,
  onOpenChange,
}: {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
}) {
  const [uncontrolled, setUncontrolled] = React.useState(false);
  const open = controlled ?? uncontrolled;
  const setOpen = (v: boolean) => {
    if (controlled === undefined) setUncontrolled(v);
    onOpenChange?.(v);
  };
  const triggerRef = React.useRef<HTMLElement | null>(null);
  return (
    <Ctx.Provider value={{ open, setOpen, triggerRef }}>
      <div className="relative inline-block">{children}</div>
    </Ctx.Provider>
  );
}

export function PopoverTrigger({
  children,
  asChild,
}: {
  children: React.ReactElement;
  asChild?: boolean;
}) {
  const ctx = React.useContext(Ctx)!;
  const el = children as React.ReactElement<Record<string, unknown>>;
  const handleClick = (e: React.MouseEvent) => {
    ctx.setOpen(!ctx.open);
    const original = el.props.onClick as
      | ((ev: React.MouseEvent) => void)
      | undefined;
    original?.(e);
  };
  return React.cloneElement(el, {
    ref: ctx.triggerRef,
    onClick: handleClick,
  } as React.Attributes & Record<string, unknown>);
  // asChild is informational for now
  void asChild;
}

export function PopoverContent({
  children,
  className,
  align = "start",
  side = "bottom",
}: {
  children: React.ReactNode;
  className?: string;
  align?: "start" | "end" | "center";
  side?: "bottom" | "top" | "right";
}) {
  const ctx = React.useContext(Ctx)!;
  const ref = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    if (!ctx.open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (ref.current?.contains(t)) return;
      if (ctx.triggerRef.current?.contains(t)) return;
      ctx.setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") ctx.setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, [ctx]);
  if (!ctx.open) return null;
  const alignClass =
    align === "end"
      ? "right-0"
      : align === "center"
        ? "left-1/2 -translate-x-1/2"
        : "left-0";
  const sideClass =
    side === "top"
      ? "bottom-full mb-2"
      : side === "right"
        ? "left-full top-0 ml-2"
        : "top-full mt-2";
  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 min-w-[220px] rounded-xl border border-[var(--color-border-soft)] bg-white p-1 shadow-lg",
        alignClass,
        sideClass,
        className
      )}
    >
      {children}
    </div>
  );
}
