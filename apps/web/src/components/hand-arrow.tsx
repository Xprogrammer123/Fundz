import { cn } from "@/lib/utils";

type HandArrowProps = {
  className?: string;
  /** Matches the handwritten subtext stroke */
  direction?: "up" | "up-right" | "right" | "down";
};

/** Sketchy curved arrow — same ink weight / vibe as Architects Daughter subtext. */
export function HandArrow({ className, direction = "up" }: HandArrowProps) {
  const rotate =
    direction === "up"
      ? "rotate-0"
      : direction === "up-right"
        ? "rotate-45"
        : direction === "right"
          ? "rotate-90"
          : "rotate-180";

  return (
    <svg
      viewBox="0 0 48 64"
      fill="none"
      aria-hidden
      className={cn(
        "inline-block shrink-0 text-ink",
        "h-[1.35em] w-auto",
        rotate,
        className,
      )}
    >
      {/* Wobbly stem */}
      <path
        d="M24 58 C 22 46, 20 34, 22 24 C 23.5 16, 26 10, 27 4"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Hand-drawn arrowhead */}
      <path
        d="M16 16 C 20 12, 24 7, 27 4 C 28 10, 32 15, 36 18"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Compact scribbled arrow for inline labels (like the portfolio signature mark). */
export function HandArrowScribble({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 28"
      fill="none"
      aria-hidden
      className={cn("inline-block h-[1.1em] w-auto shrink-0 text-ink", className)}
    >
      <path
        d="M4 22 C 10 18, 14 10, 18 6 C 22 2.5, 28 2, 34 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M26 2 C 30 3, 33 5, 35 7 M 34 4 C 32 8, 31 12, 31 15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
