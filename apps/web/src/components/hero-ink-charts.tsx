import { cn } from "@/lib/utils";
import { motion } from "motion/react";

/** Thin solid ink bars — poster skyline (~14 columns). */
export function InkBars({
  values,
  className,
}: {
  values: number[];
  className?: string;
}) {
  const finite = values.map((n) => (Number.isFinite(n) ? Math.abs(n) : 0));
  const max = Math.max(...finite, 1);

  return (
    <div
      className={cn(
        "flex h-full min-h-[12rem] w-full items-end justify-start gap-1.5 sm:gap-2 md:gap-2.5",
        className,
      )}
      aria-hidden
    >
      {finite.map((v, i) => {
        const pct = 20 + (v / max) * 80;
        return (
          <motion.div
            key={i}
            className="w-[7px] origin-bottom bg-ink sm:w-2 md:w-2.5"
            style={{ height: `${pct}%` }}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            transition={{
              delay: 0.15 + i * 0.03,
              duration: 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        );
      })}
    </div>
  );
}

/** Small jagged cashflow line under the brand. */
export function InkSparkline({
  points,
  className,
}: {
  points: number[];
  className?: string;
}) {
  const w = 220;
  const h = 44;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const coords = points.map((p, i) => {
    const x = (i / Math.max(points.length - 1, 1)) * w;
    const y = h - 4 - ((p - min) / range) * (h - 10);
    return { x, y };
  });
  const d = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`).join(" ");

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={cn("overflow-visible text-ink", className)}
      fill="none"
      aria-hidden
    >
      <motion.path
        d={d}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
      />
      {coords.map((c, i) => (
        <motion.circle
          key={i}
          cx={c.x}
          cy={c.y}
          r="2.4"
          fill="currentColor"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.55 + i * 0.05 }}
        />
      ))}
    </svg>
  );
}

/** Three-slice hand pie — one wedge filled grey. */
export function InkPie({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={cn("text-ink", className)}
      aria-hidden
    >
      <circle
        cx="60"
        cy="60"
        r="46"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
      />
      {/* Top-right slice — open */}
      <path
        d="M60 60 L60 14 A46 46 0 0 1 100 40 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      {/* Bottom-right — filled */}
      <path
        d="M60 60 L100 40 A46 46 0 0 1 40 98 Z"
        fill="currentColor"
        fillOpacity="0.28"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      {/* Left slice */}
      <path
        d="M60 60 L40 98 A46 46 0 0 1 60 14 Z"
        fill="currentColor"
        fillOpacity="0.06"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="60" cy="60" r="3" fill="currentColor" />
    </svg>
  );
}

/** Full-width bottom area — light fill + thick jagged stroke. */
export function InkArea({
  points,
  className,
}: {
  points: number[];
  className?: string;
}) {
  const w = 900;
  const h = 200;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const line = points
    .map((p, i) => {
      const x = (i / Math.max(points.length - 1, 1)) * w;
      const y = h - 4 - ((p - min) / range) * (h - 20);
      return `${x},${y}`;
    })
    .join(" ");
  const area = `M0,${h} L ${line} L${w},${h} Z`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={cn("text-ink", className)}
      aria-hidden
      preserveAspectRatio="none"
    >
      <path d={area} fill="currentColor" fillOpacity="0.12" />
      <polyline
        points={line}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
