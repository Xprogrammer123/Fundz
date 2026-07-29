import { HandArrowScribble } from "@/components/hand-arrow";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import type { ReactNode } from "react";

/** Shared rail shell — ink / paper energy matching the hero */
export function SidebarRail({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative mt-5 mb-5 ml-4 flex w-16 shrink-0 flex-col items-center gap-1.5 overflow-hidden rounded-full border-2 border-ink/25 bg-paper/80 px-1.5 py-3 shadow-[3px_3px_0_rgba(17,17,17,0.08)] backdrop-blur-md sm:ml-6 md:ml-10 md:w-20 md:px-2 md:py-3.5",
        className,
      )}
    >
      {/* faint bars peeking in the rail */}
      <div
        className="pointer-events-none absolute inset-x-2 bottom-3 flex h-10 items-end justify-center gap-0.5 opacity-20"
        aria-hidden
      >
        {[40, 70, 45, 90, 55, 75].map((h, i) => (
          <span
            key={i}
            className="w-1 rounded-sm bg-ink"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      {children}
    </div>
  );
}

export function SidebarFlyout({
  children,
  widthClass = "group-hover/sidebar:w-56",
  innerWidthClass = "w-56",
}: {
  children: ReactNode;
  widthClass?: string;
  innerWidthClass?: string;
}) {
  return (
    <div
      className={cn(
        "pointer-events-none my-5 ml-3 w-0 overflow-hidden opacity-0",
        "rounded-[1.75rem] border-2 border-ink/20 bg-paper/85 shadow-[4px_4px_0_rgba(17,17,17,0.1)] backdrop-blur-md",
        "transition-[width,opacity,transform] duration-300 ease-out",
        "group-hover/sidebar:pointer-events-auto group-hover/sidebar:opacity-100",
        "group-hover/sidebar:rotate-[-0.5deg]",
        widthClass,
      )}
    >
      <div className={cn("flex h-full flex-col py-4", innerWidthClass)}>
        {children}
      </div>
    </div>
  );
}

export function SidebarBrand({
  title,
  note,
}: {
  title: string;
  note: string;
}) {
  return (
    <div className="relative mb-3 px-4 pb-3">
      <p className="font-display text-xl leading-none text-ink">{title}</p>
      <p className="font-hand mt-2 flex items-center gap-1.5 text-sm text-ink/70">
        <HandArrowScribble className="h-3" />
        {note}
      </p>
      {/* tiny sparkline accent */}
      <svg
        viewBox="0 0 120 20"
        className="mt-2 h-3 w-24 text-ink/35"
        fill="none"
        aria-hidden
      >
        <path
          d="M2 14 C 18 4, 30 16, 48 8 C 66 0, 80 14, 118 6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export function SidebarMark({ label = "F" }: { label?: string }) {
  return (
    <motion.div
      whileHover={{ rotate: -8, scale: 1.06 }}
      className="relative mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-ink/30 bg-ink text-paper"
    >
      <span className="font-display text-base leading-none tracking-wider">
        {label}
      </span>
      <span
        className="font-hand absolute -top-2 -right-1 text-[10px] text-ink"
        aria-hidden
      >
        ★
      </span>
    </motion.div>
  );
}

export function railLinkClass(isActive: boolean) {
  return cn(
    "relative flex size-11 items-center justify-center rounded-full transition-all duration-200",
    isActive
      ? "bg-ink text-paper shadow-[2px_2px_0_rgba(17,17,17,0.2)] scale-105"
      : "text-ink/65 hover:bg-ink/10 hover:text-ink hover:-rotate-3",
  );
}

export function flyoutLinkClass(isActive: boolean) {
  return cn(
    "font-hand mb-1.5 block rounded-full px-3 py-2.5 text-left text-base transition-all duration-200",
    isActive
      ? "bg-ink text-paper -rotate-1 shadow-[2px_2px_0_rgba(17,17,17,0.15)]"
      : "text-ink/75 hover:bg-ink/8 hover:text-ink hover:translate-x-0.5",
  );
}
