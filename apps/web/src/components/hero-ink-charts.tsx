import { cn } from "@/lib/utils";
import { motion } from "motion/react";

/** Hand-ink bar skyline — grows in like a chart reveal */
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
        "flex h-full min-h-[8rem] w-full items-end justify-center gap-1.5 sm:gap-2",
        className,
      )}
      aria-hidden
    >
      {finite.map((v, i) => {
        const pct = 14 + (v / max) * 86;
        return (
          <motion.div
            key={i}
            className="w-2 origin-bottom rounded-[2px] bg-ink sm:w-2.5 md:w-3"
            style={{ height: `${pct}%` }}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 0.72 + (i % 4) * 0.07 }}
            transition={{
              delay: 0.25 + i * 0.045,
              duration: 0.55,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        );
      })}
    </div>
  );
}

/** Scribble sparkline that draws itself */
export function InkSparkline({
  points,
  className,
}: {
  points: number[];
  className?: string;
}) {
  const w = 320;
  const h = 72;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const coords = points.map((p, i) => {
    const x = (i / Math.max(points.length - 1, 1)) * w;
    const y = h - 8 - ((p - min) / range) * (h - 16);
    return `${x},${y}`;
  });
  const d = `M ${coords.join(" L ")}`;

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
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ delay: 0.5, duration: 1.2, ease: "easeOut" }}
      />
      {points.map((p, i) => {
        if (i % 2 !== 0) return null;
        const x = (i / Math.max(points.length - 1, 1)) * w;
        const y = h - 8 - ((p - min) / range) * (h - 16);
        return (
          <motion.circle
            key={i}
            cx={x}
            cy={y}
            r="3.2"
            fill="currentColor"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.7 + i * 0.05 }}
          />
        );
      })}
    </svg>
  );
}

/** Hand-drawn pie — ink wedges, not a polished chart widget */
export function InkPie({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={cn("text-ink", className)}
      aria-hidden
    >
      <motion.circle
        cx="60"
        cy="60"
        r="46"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
      />
      <motion.path
        d="M60 60 L60 14 A46 46 0 0 1 102 78 Z"
        fill="currentColor"
        fillOpacity="0.14"
        stroke="currentColor"
        strokeWidth="1.8"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.65 }}
        style={{ transformOrigin: "60px 60px" }}
      />
      <motion.path
        d="M60 60 L102 78 A46 46 0 0 1 28 90 Z"
        fill="currentColor"
        fillOpacity="0.28"
        stroke="currentColor"
        strokeWidth="1.8"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8 }}
        style={{ transformOrigin: "60px 60px" }}
      />
      <motion.path
        d="M60 60 L28 90 A46 46 0 0 1 60 14 Z"
        fill="currentColor"
        fillOpacity="0.08"
        stroke="currentColor"
        strokeWidth="1.8"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.95 }}
        style={{ transformOrigin: "60px 60px" }}
      />
      <circle cx="60" cy="60" r="4" fill="currentColor" />
    </svg>
  );
}

/** Soft area mountain under the brand */
export function InkArea({
  points,
  className,
}: {
  points: number[];
  className?: string;
}) {
  const w = 600;
  const h = 140;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const line = points
    .map((p, i) => {
      const x = (i / Math.max(points.length - 1, 1)) * w;
      const y = h - 10 - ((p - min) / range) * (h - 24);
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
      <motion.path
        d={area}
        fill="currentColor"
        fillOpacity="0.08"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.8 }}
      />
      <motion.polyline
        points={line}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.45, duration: 1.1 }}
      />
    </svg>
  );
}
