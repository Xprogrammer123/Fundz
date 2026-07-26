import { cn } from "@/lib/utils";
import { motion } from "motion/react";

/** Solid ink bar skyline — HTML bars so grow animation doesn't collapse. */
export function InkBars({
  values,
  className,
}: {
  values: number[];
  className?: string;
}) {
  const finite = values.map((n) => (Number.isFinite(n) ? Math.abs(n) : 0));
  // Soften outliers so one huge month doesn't flatten the rest
  const scaled = finite.map((v) => Math.sqrt(v));
  const max = Math.max(...scaled, 1);

  return (
    <div
      className={cn(
        "flex h-full min-h-[8rem] w-full items-end justify-center gap-1 sm:gap-1.5",
        className,
      )}
      aria-hidden
    >
      {scaled.map((v, i) => {
        const pct = 18 + (v / max) * 82;
        return (
          <motion.div
            key={i}
            className="w-2 origin-bottom rounded-[1px] bg-ink sm:w-2.5 md:w-[11px]"
            style={{ height: `${pct}%` }}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 0.78 + (i % 4) * 0.05 }}
            transition={{
              delay: 0.2 + i * 0.04,
              duration: 0.55,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        );
      })}
    </div>
  );
}

/** Small cashflow scribble under the brand mark. */
export function InkSparkline({
  points,
  className,
}: {
  points: number[];
  className?: string;
}) {
  const w = 280;
  const h = 56;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const coords = points.map((p, i) => {
    const x = (i / Math.max(points.length - 1, 1)) * w;
    const y = h - 6 - ((p - min) / range) * (h - 14);
    return [x, y] as const;
  });
  // Quadratic smoothing so it feels hand-drawn, not polyline-rigid
  let d = `M ${coords[0]![0]} ${coords[0]![1]}`;
  for (let i = 1; i < coords.length; i++) {
    const [x, y] = coords[i]!;
    const [px, py] = coords[i - 1]!;
    const cx = (px + x) / 2;
    d += ` Q ${px} ${py}, ${cx} ${(py + y) / 2}`;
    if (i === coords.length - 1) d += ` T ${x} ${y}`;
  }

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
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ delay: 0.45, duration: 1.15, ease: "easeOut" }}
      />
      {coords.map(([x, y], i) => {
        if (i % 3 !== 0) return null;
        return (
          <motion.circle
            key={i}
            cx={x}
            cy={y}
            r="2.8"
            fill="currentColor"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.65 + i * 0.04 }}
          />
        );
      })}
    </svg>
  );
}

/** Hand-drawn pie — ink wedges with a slight tilt in the parent. */
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
        r="48"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.35, duration: 0.75 }}
      />
      <motion.path
        d="M60 60 L60 12 A48 48 0 0 1 104 78 Z"
        fill="currentColor"
        fillOpacity="0.16"
        stroke="currentColor"
        strokeWidth="2"
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.55 }}
        style={{ transformOrigin: "60px 60px" }}
      />
      <motion.path
        d="M60 60 L104 78 A48 48 0 0 1 26 92 Z"
        fill="currentColor"
        fillOpacity="0.34"
        stroke="currentColor"
        strokeWidth="2"
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7 }}
        style={{ transformOrigin: "60px 60px" }}
      />
      <motion.path
        d="M60 60 L26 92 A48 48 0 0 1 60 12 Z"
        fill="currentColor"
        fillOpacity="0.08"
        stroke="currentColor"
        strokeWidth="2"
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.85 }}
        style={{ transformOrigin: "60px 60px" }}
      />
      <circle cx="60" cy="60" r="3.5" fill="currentColor" />
    </svg>
  );
}

/**
 * Bold filled area chart — sits bottom-right like a stamped ink mountain,
 * not a pale full-bleed wash.
 */
export function InkArea({
  points,
  className,
}: {
  points: number[];
  className?: string;
}) {
  const w = 640;
  const h = 200;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const coords = points.map((p, i) => {
    const x = (i / Math.max(points.length - 1, 1)) * w;
    const y = h - 8 - ((p - min) / range) * (h - 28);
    return [x, y] as const;
  });

  let line = `M ${coords[0]![0]} ${coords[0]![1]}`;
  for (let i = 1; i < coords.length; i++) {
    const [x, y] = coords[i]!;
    const [px, py] = coords[i - 1]!;
    const cpx = (px + x) / 2;
    line += ` Q ${px} ${py + ((i % 2) * 2 - 1)}, ${cpx} ${(py + y) / 2}`;
    if (i === coords.length - 1) line += ` T ${x} ${y}`;
  }
  const area = `${line} L ${w} ${h} L 0 ${h} Z`;

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
        fillOpacity="0.78"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.path
        d={line}
        fill="none"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.4, duration: 1.2 }}
      />
    </svg>
  );
}
