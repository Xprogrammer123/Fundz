import { cn } from "@/lib/utils";
import type { ChartType } from "@/components/charts/studio";

/** Tiny ink glyphs for chart types in the studio rail */
export function ChartGlyph({
  type,
  className,
}: {
  type: ChartType;
  className?: string;
}) {
  const cls = cn("text-current", className);

  switch (type) {
    case "bar":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="currentColor" aria-hidden>
          <rect x="3" y="12" width="3.5" height="9" rx="0.5" />
          <rect x="9" y="7" width="3.5" height="14" rx="0.5" />
          <rect x="15" y="3" width="3.5" height="18" rx="0.5" />
        </svg>
      );
    case "line":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" aria-hidden>
          <path
            d="M3 16 L8 10 L13 13 L21 5"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="8" cy="10" r="1.6" fill="currentColor" />
          <circle cx="13" cy="13" r="1.6" fill="currentColor" />
          <circle cx="21" cy="5" r="1.6" fill="currentColor" />
        </svg>
      );
    case "area":
      return (
        <svg viewBox="0 0 24 24" className={cls} aria-hidden>
          <path
            d="M3 18 L3 14 L8 8 L13 11 L21 4 L21 18 Z"
            fill="currentColor"
            fillOpacity="0.25"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "pie":
      return (
        <svg viewBox="0 0 24 24" className={cls} aria-hidden>
          <circle
            cx="12"
            cy="12"
            r="8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M12 12 L12 4 A8 8 0 0 1 19 15 Z"
            fill="currentColor"
            fillOpacity="0.35"
            stroke="currentColor"
            strokeWidth="1.4"
          />
        </svg>
      );
    case "composed":
      return (
        <svg viewBox="0 0 24 24" className={cls} aria-hidden>
          <rect x="3" y="11" width="3" height="10" fill="currentColor" />
          <rect x="8" y="7" width="3" height="14" fill="currentColor" />
          <path
            d="M4 9 L10 5 L15 8 L21 3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case "radar":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" aria-hidden>
          <polygon
            points="12,3 20,9 17,19 7,19 4,9"
            stroke="currentColor"
            strokeWidth="1.6"
            fill="currentColor"
            fillOpacity="0.15"
          />
          <polygon
            points="12,7 16,10 14.5,15 9.5,15 8,10"
            stroke="currentColor"
            strokeWidth="1.4"
          />
        </svg>
      );
    case "sankey":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" aria-hidden>
          <path
            d="M3 6 C 10 6, 10 12, 21 8"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            opacity="0.5"
          />
          <path
            d="M3 12 C 10 12, 10 12, 21 12"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M3 18 C 10 18, 10 14, 21 16"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            opacity="0.5"
          />
        </svg>
      );
    default:
      return (
        <span className={cn("font-display text-xs", className)}>?</span>
      );
  }
}
