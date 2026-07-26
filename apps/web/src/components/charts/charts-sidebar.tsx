import { ChartGlyph } from "@/components/charts/chart-glyphs";
import {
  CHART_BACKGROUNDS,
  CHART_STYLES,
  CHART_TYPES,
  type ChartBackgroundId,
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

type ChartsSidebarProps = {
  chartType: ChartType;
  styleId: string;
  background: ChartBackgroundId;
  onChartTypeChange: (type: ChartType) => void;
  onStyleChange: (styleId: string) => void;
  onBackgroundChange: (background: ChartBackgroundId) => void;
};

export function ChartsSidebar({
  chartType,
  styleId,
  background,
  onChartTypeChange,
  onStyleChange,
  onBackgroundChange,
}: ChartsSidebarProps) {
  const styles = CHART_STYLES[chartType];

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
        <SidebarBrand title="Studio" note="ink your export" />

        <Section title="Chart type" tip="pick a shape">
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
        </Section>

        <Section title="Style" tip="mood">
          {styles.map((style) => (
            <button
              key={style.id}
              type="button"
              onClick={() => onStyleChange(style.id)}
              className={flyoutLinkClass(styleId === style.id)}
            >
              {style.label}
            </button>
          ))}
        </Section>

        <Section title="Background" tip="paper or void">
          <div className="grid grid-cols-2 gap-2 px-1">
            {CHART_BACKGROUNDS.map((bg) => (
              <button
                key={bg.id}
                type="button"
                onClick={() => onBackgroundChange(bg.id)}
                className={cn(
                  "font-hand flex flex-col items-center gap-1.5 rounded-2xl border-2 px-2 py-2.5 text-xs transition-all",
                  background === bg.id
                    ? "border-ink bg-ink/10 text-ink -rotate-1 shadow-[2px_2px_0_rgba(17,17,17,0.12)]"
                    : "border-ink/15 text-ink/65 hover:border-ink/40 hover:text-ink",
                )}
              >
                <span
                  className="size-8 rounded-full border border-ink/25"
                  style={{
                    background:
                      bg.id === "transparent"
                        ? "repeating-conic-gradient(#bbb 0% 25%, #eee 0% 50%) 50% / 8px 8px"
                        : bg.preview,
                  }}
                />
                {bg.label}
              </button>
            ))}
          </div>
        </Section>

        <p className="font-hand mt-auto px-4 pt-2 text-[11px] leading-snug text-ink/40">
          hover the rail · export stays local ★
        </p>
      </SidebarFlyout>
    </aside>
  );
}

function Section({
  title,
  tip,
  children,
}: {
  title: string;
  tip: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <div className="mb-2 flex items-baseline justify-between gap-2 px-4">
        <p className="font-display text-[10px] tracking-[0.2em] text-ink/50 uppercase">
          {title}
        </p>
        <p className="font-hand text-[11px] text-ink/35">{tip}</p>
      </div>
      <div className="flex flex-col px-2">{children}</div>
    </div>
  );
}
