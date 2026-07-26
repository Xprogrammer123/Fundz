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

/** Left rail: chart shape only. Look controls live on the right inspector. */
export function ChartsSidebar({
  chartType,
  onChartTypeChange,
}: ChartsSidebarProps) {
  return (
    <aside
      className="group/sidebar fixed top-0 bottom-0 left-0 z-50 flex items-stretch"
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

        <p className="font-hand relative z-10 text-[9px] text-ink/45" aria-hidden>
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
  );
}
