import { HandArrowScribble } from "@/components/hand-arrow";
import {
  CHART_BACKGROUNDS,
  CHART_STYLES,
  CHART_TYPES,
  type ChartBackgroundId,
  type ChartType,
} from "@/components/charts/studio";
import { cn } from "@/lib/utils";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
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
      <div className="mt-5 mb-5 ml-5 flex w-16 shrink-0 flex-col items-center gap-1 rounded-full border border-ink/20 bg-white/40 px-1.5 py-3 backdrop-blur-xl">
        <Link
          to="/import"
          title="Back"
          className="mb-2 flex size-11 items-center justify-center rounded-full border border-ink/25 text-ink/70 transition-colors hover:bg-ink/10 hover:text-ink"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={22} strokeWidth={1.5} />
          <span className="sr-only">Back</span>
        </Link>

        <nav className="flex flex-1 flex-col items-center gap-1 overflow-y-auto">
          {CHART_TYPES.map((type) => (
            <button
              key={type.id}
              type="button"
              title={type.label}
              onClick={() => onChartTypeChange(type.id)}
              className={cn(
                "flex size-11 items-center justify-center rounded-full text-[11px] font-semibold tracking-wide transition-colors",
                chartType === type.id
                  ? "bg-ink text-paper"
                  : "text-ink/65 hover:bg-ink/10 hover:text-ink",
              )}
            >
              {type.label.slice(0, 1)}
            </button>
          ))}
        </nav>
      </div>

      <div
        className={cn(
          "pointer-events-none my-5 ml-3 w-0 overflow-hidden opacity-0",
          "rounded-3xl border border-ink/20 bg-white/45 backdrop-blur-xl",
          "transition-[width,opacity] duration-300 ease-out",
          "group-hover/sidebar:pointer-events-auto group-hover/sidebar:w-56 group-hover/sidebar:opacity-100",
        )}
      >
        <div className="flex h-full w-56 flex-col gap-5 overflow-y-auto py-4">
          <div className="px-4">
            <p className="font-display text-lg text-ink">Export</p>
            <p className="font-hand mt-1 flex items-center gap-1.5 text-sm text-ink-soft">
              <HandArrowScribble />
              chart studio
            </p>
          </div>

          <Section title="Chart">
            {CHART_TYPES.map((type) => (
              <SideButton
                key={type.id}
                active={chartType === type.id}
                onClick={() => onChartTypeChange(type.id)}
              >
                {type.label}
              </SideButton>
            ))}
          </Section>

          <Section title="Style">
            {styles.map((style) => (
              <SideButton
                key={style.id}
                active={styleId === style.id}
                onClick={() => onStyleChange(style.id)}
              >
                {style.label}
              </SideButton>
            ))}
          </Section>

          <Section title="Background">
            <div className="grid grid-cols-2 gap-2 px-2">
              {CHART_BACKGROUNDS.map((bg) => (
                <button
                  key={bg.id}
                  type="button"
                  onClick={() => onBackgroundChange(bg.id)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-2xl border px-2 py-2.5 text-xs transition-colors",
                    background === bg.id
                      ? "border-ink bg-ink/10 text-ink"
                      : "border-ink/15 text-ink/65 hover:border-ink/35 hover:text-ink",
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
        </div>
      </div>
    </aside>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 px-4 text-[11px] font-medium uppercase tracking-wide text-ink/45">
        {title}
      </p>
      <div className="flex flex-col gap-0.5 px-2">{children}</div>
    </div>
  );
}

function SideButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-2.5 text-left text-sm font-medium transition-colors",
        active
          ? "bg-ink text-paper"
          : "text-ink/70 hover:bg-ink/10 hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
