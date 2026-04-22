import { cn } from "@/lib/utils";

/**
 * Stylized "knot" mark reminiscent of a woven flower. Not the OpenAI logo;
 * a distinct glyph for Chat Work.
 */
export function KnotLogo({
  className,
  size = 28,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-ink", className)}
      aria-label="Chat Work"
    >
      <g
        stroke="currentColor"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <path d="M32 10 C 46 10, 54 18, 54 32 C 54 46, 46 54, 32 54 C 18 54, 10 46, 10 32 C 10 18, 18 10, 32 10 Z" />
        <path d="M20 22 C 28 14, 36 14, 44 22 C 52 30, 52 34, 44 42 C 36 50, 28 50, 20 42 C 12 34, 12 30, 20 22 Z" />
        <path d="M22 32 C 22 22, 30 16, 32 16 C 34 16, 42 22, 42 32 C 42 42, 34 48, 32 48 C 30 48, 22 42, 22 32 Z" />
      </g>
    </svg>
  );
}
