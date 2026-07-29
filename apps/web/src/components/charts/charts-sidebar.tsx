import { ChartGlyph } from "@/components/charts/chart-glyphs";
import {
  CHART_TYPES,
  type ChartType,
} from "@/components/charts/studio";
import {
  SidebarBrand,
  SidebarFlyout,
  SidebarRail,
  flyoutLinkClass,
  railLinkClass,
} from "@/components/sidebar-chrome";
import { cn } from "@/lib/utils";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";

export type BarColorState = {
  primary: string;
  secondary: string;
};

type ChartsSidebarProps = {
  chartType: ChartType;
  onChartTypeChange: (type: ChartType) => void;
};

/** Left rail (desktop) + horizontal type strip (mobile). */
export function ChartsSidebar({
  chartType,
  onChartTypeChange,
}: ChartsSidebarProps) {
  return (
    <>
      {/* Mobile / tablet: horizontal chart-type strip */}
      <div className="mb-4 md:hidden">
        <div className="mb-2 flex items-center justify-between gap-2">
          <Link
            to="/import"
            className="font-hand inline-flex items-center gap-1.5 text-sm text-ink/70"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} strokeWidth={1.6} />
            Back
          </Link>
          <p className="font-display text-[10px] tracking-[0.2em] text-ink/45 uppercase">
            Chart type
          </p>
        </div>
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {CHART_TYPES.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => onChartTypeChange(type.id)}
              className={cn(
                "font-hand flex shrink-0 items-center gap-1.5 rounded-full border-2 px-3 py-2 text-sm transition-all",
                chartType === type.id
                  ? "border-ink bg-ink text-paper -rotate-1 shadow-[2px_2px_0_rgba(17,17,17,0.12)]"
                  : "border-ink/15 text-ink/70 active:border-ink/40",
              )}
            >
              <ChartGlyph type={type.id} className="size-3.5 shrink-0" />
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop rail */}
      <aside
        className="group/sidebar fixed top-0 bottom-0 left-0 z-50 hidden items-stretch md:flex"
        aria-label="Chart studio"
      >
        <SidebarRail>
          <Link
            to="/import"
            title="Back"
            className={cn(
              railLinkClass(false),
              "mb-2 border-2 border-ink/25 bg-transparent",
            )}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={20} strokeWidth={1.6} />
            <span className="sr-only">Back</span>
          </Link>

          <nav className="relative z-10 flex flex-1 flex-col items-center gap-1 overflow-y-auto">
            {CHART_TYPES.map((type, i) => (
              <motion.button
                key={type.id}
                type="button"
                title={type.label}
                onClick={() => onChartTypeChange(type.id)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.04 * i }}
                whileHover={{ rotate: -6, scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className={railLinkClass(chartType === type.id)}
              >
                <ChartGlyph type={type.id} className="size-5" />
              </motion.button>
            ))}
          </nav>

          <p
            className="font-hand relative z-10 text-[9px] text-ink/45"
            aria-hidden
          >
            viz
          </p>
        </SidebarRail>

        <SidebarFlyout>
          <SidebarBrand title="Studio" note="pick a shape" />

          <div className="mb-2 px-4">
            <p className="font-display text-[10px] tracking-[0.2em] text-ink/50 uppercase">
              Chart type
            </p>
            <p className="font-hand text-[11px] text-ink/35">left rail or here</p>
          </div>

          <div className="flex flex-col px-2">
            {CHART_TYPES.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => onChartTypeChange(type.id)}
                className={flyoutLinkClass(chartType === type.id)}
              >
                <span className="flex items-center gap-2.5">
                  <ChartGlyph type={type.id} className="size-4 shrink-0" />
                  {type.label}
                </span>
              </button>
            ))}
          </div>

          <p className="font-hand mt-auto px-4 pt-2 text-[11px] leading-snug text-ink/40">
            look controls sit on the right ★
          </p>
        </SidebarFlyout>
      </aside>
    </>
  );
}
