export type ChartType =
  | "bar"
  | "line"
  | "area"
  | "pie"
  | "composed"
  | "radar"
  | "sankey";

export type ChartBackgroundId = "black" | "white" | "paper" | "transparent";

export type ChartStyleOption = {
  id: string;
  label: string;
};

export const CHART_TYPES: { id: ChartType; label: string }[] = [
  { id: "bar", label: "Bar" },
  { id: "line", label: "Line" },
  { id: "area", label: "Area" },
  { id: "pie", label: "Pie" },
  { id: "composed", label: "Composed" },
  { id: "radar", label: "Radar" },
  { id: "sankey", label: "Sankey" },
];

/** Per-type style packs — area is ready; others get more variants as you add them. */
export const CHART_STYLES: Record<ChartType, ChartStyleOption[]> = {
  area: [
    { id: "layers", label: "Layers" },
    { id: "compare", label: "Compare" },
    { id: "benchmark", label: "Benchmark" },
    { id: "spotlight", label: "Spotlight" },
  ],
  bar: [
    { id: "default", label: "Default" },
    { id: "peak", label: "Peak" },
    { id: "grid", label: "Grid" },
    { id: "mono", label: "Mono" },
  ],
  line: [
    { id: "default", label: "Default" },
    { id: "glow", label: "Glow" },
    { id: "versus", label: "Versus" },
  ],
  pie: [
    { id: "default", label: "Default" },
    { id: "share", label: "Share" },
    { id: "rings", label: "Rings" },
    { id: "mix", label: "Mix" },
    { id: "gauge", label: "Gauge" },
  ],
  composed: [
    { id: "default", label: "Default" },
    { id: "hatched", label: "Hatched" },
    { id: "stripped", label: "Stripped" },
    { id: "bump", label: "Bump" },
    { id: "spectrum", label: "Spectrum" },
  ],
  radar: [{ id: "default", label: "Default" }],
  sankey: [
    { id: "default", label: "Default" },
    { id: "allocation", label: "Allocation" },
    { id: "pipeline", label: "Pipeline" },
  ],
};

export const CHART_BACKGROUNDS: {
  id: ChartBackgroundId;
  label: string;
  /** Canvas fill for export; null = leave transparent (PNG). */
  fill: string | null;
  preview: string;
  /** EvilCharts reads `.dark` for the dark color slots. */
  echartsDark: boolean;
}[] = [
  { id: "black", label: "Black", fill: "#000000", preview: "#000000", echartsDark: true },
  { id: "white", label: "White", fill: "#ffffff", preview: "#ffffff", echartsDark: false },
  { id: "paper", label: "Paper", fill: "#f0ebe3", preview: "#f0ebe3", echartsDark: false },
  {
    id: "transparent",
    label: "Clear",
    fill: null,
    preview: "transparent",
    echartsDark: true,
  },
];

export function defaultStyleFor(type: ChartType): string {
  return CHART_STYLES[type][0]?.id ?? "default";
}

export function backgroundFill(id: ChartBackgroundId): string | null {
  return CHART_BACKGROUNDS.find((b) => b.id === id)?.fill ?? "#000000";
}

export function isEchartsDark(id: ChartBackgroundId): boolean {
  return CHART_BACKGROUNDS.find((b) => b.id === id)?.echartsDark ?? true;
}

/**
 * Surface + text contrast for the export card.
 * Adds `.dark` on dark surfaces so EvilCharts CSS vars (`dark: [...]`) activate.
 */
export function backgroundClass(id: ChartBackgroundId): string {
  switch (id) {
    case "white":
      return [
        "bg-white text-black",
        "[&_.text-primary]:text-black",
        "[&_.text-muted-foreground]:text-black/55",
        "[&_.text-foreground]:text-black",
        "[&_.border-border]:border-black/15",
      ].join(" ");
    case "paper":
      return [
        "bg-[#f0ebe3] text-[#111111]",
        "[&_.text-primary]:text-[#111111]",
        "[&_.text-muted-foreground]:text-[#111111]/60",
        "[&_.text-foreground]:text-[#111111]",
        "[&_.border-border]:border-[#111111]/20",
      ].join(" ");
    case "transparent":
      return [
        "dark bg-transparent text-white",
        "[&_.text-primary]:text-white",
        "[&_.text-muted-foreground]:text-white/55",
        "[&_.text-foreground]:text-white",
      ].join(" ");
    case "black":
    default:
      return [
        "dark bg-black text-white",
        "[&_.text-primary]:text-white",
        "[&_.text-muted-foreground]:text-white/55",
        "[&_.text-foreground]:text-white",
        "[&_.border-border]:border-white/20",
      ].join(" ");
  }
}

/** Axis / tick labels that keep the year visible. */
export function shortPeriodTick(period: string): string {
  // "January 2024" → "Jan '24"
  const named = period.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (named) {
    return `${named[1]!.slice(0, 3)} '${named[2]!.slice(2)}`;
  }
  // "2024-07" → "Jul '24"
  const ym = period.match(/^(\d{4})-(\d{2})$/);
  if (ym) {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const m = months[Number(ym[2]) - 1] ?? ym[2];
    return `${m} '${ym[1]!.slice(2)}`;
  }
  // "2024-07-15" → "07-15"
  if (/^\d{4}-\d{2}-\d{2}$/.test(period)) return period.slice(5);
  // bare year
  if (/^\d{4}$/.test(period)) return period;
  const parts = period.split(" ");
  if (parts.length >= 2) return `${parts[0]!.slice(0, 3)} ${parts[1]}`;
  return period.length > 8 ? period.slice(0, 8) : period;
}
