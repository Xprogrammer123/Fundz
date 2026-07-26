import type { BarColorState } from "@/components/charts/charts-sidebar";
import {
  CHART_BACKGROUNDS,
  CHART_STYLES,
  type ChartBackgroundId,
  type ChartType,
} from "@/components/charts/studio";
import { cn } from "@/lib/utils";

type ChartsInspectorProps = {
  chartType: ChartType;
  styleId: string;
  background: ChartBackgroundId;
  barColors: BarColorState;
  currency: string;
  onStyleChange: (styleId: string) => void;
  onBackgroundChange: (background: ChartBackgroundId) => void;
  onBarColorsChange: (colors: BarColorState) => void;
};

/** Always-visible look controls on the right — not buried in the hover rail. */
export function ChartsInspector({
  chartType,
  styleId,
  background,
  barColors,
  currency,
  onStyleChange,
  onBackgroundChange,
  onBarColorsChange,
}: ChartsInspectorProps) {
  const styles = CHART_STYLES[chartType];
  const showBarColors = chartType === "bar";

  return (
    <aside
      className="w-full shrink-0 lg:sticky lg:top-6 lg:w-56 xl:w-60"
      aria-label="Chart look"
    >
      <div className="rounded-[1.75rem] border-2 border-ink/20 bg-paper/85 p-4 shadow-[4px_4px_0_rgba(17,17,17,0.08)] backdrop-blur-md lg:rotate-[0.4deg]">
        <div className="mb-4">
          <p className="font-display text-lg leading-none text-ink">Look</p>
          <p className="font-hand mt-1.5 text-sm text-ink/55">
            ink · paper · currency
          </p>
        </div>

        <Block title="Currency" tip="from import">
          <p className="font-hand rounded-2xl border-2 border-ink/15 px-3 py-2.5 text-base text-ink">
            {currency}
          </p>
        </Block>

        {styles.length > 1 ? (
          <Block title="Style" tip="mood">
            <div className="flex flex-col gap-1">
              {styles.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => onStyleChange(style.id)}
                  className={cn(
                    "font-hand rounded-full px-3 py-2 text-left text-sm transition-all",
                    styleId === style.id
                      ? "bg-ink text-paper -rotate-1 shadow-[2px_2px_0_rgba(17,17,17,0.12)]"
                      : "text-ink/70 hover:bg-ink/8 hover:text-ink",
                  )}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </Block>
        ) : null}

        <Block title="Background" tip="export fill">
          <div className="grid grid-cols-2 gap-2">
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
                  className="size-7 rounded-full border border-ink/25"
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
        </Block>

        {showBarColors ? (
          <Block title="Bar colors" tip="pick ink">
            <div className="flex flex-col gap-2">
              <ColorField
                label="Spending"
                value={barColors.primary}
                onChange={(primary) =>
                  onBarColorsChange({ ...barColors, primary })
                }
              />
              <ColorField
                label="Income"
                value={barColors.secondary}
                onChange={(secondary) =>
                  onBarColorsChange({ ...barColors, secondary })
                }
              />
            </div>
          </Block>
        ) : (
          <p className="font-hand text-[11px] leading-snug text-ink/40">
            Switch to Bar to tint the columns ★
          </p>
        )}
      </div>
    </aside>
  );
}

function Block({
  title,
  tip,
  children,
}: {
  title: string;
  tip: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <p className="font-display text-[10px] tracking-[0.2em] text-ink/50 uppercase">
          {title}
        </p>
        <p className="font-hand text-[11px] text-ink/35">{tip}</p>
      </div>
      {children}
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-2xl border-2 border-ink/15 px-3 py-2">
      <span className="font-hand text-xs text-ink/70">{label}</span>
      <span className="flex items-center gap-2">
        <span
          className="size-5 rounded-full border border-ink/30"
          style={{ backgroundColor: value }}
          aria-hidden
        />
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent p-0"
          aria-label={`${label} bar color`}
        />
      </span>
    </label>
  );
}
