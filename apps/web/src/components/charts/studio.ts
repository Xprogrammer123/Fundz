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
  sankey: [{ id: "default", label: "Default" }],
};

export const CHART_BACKGROUNDS: {
  id: ChartBackgroundId;
  label: string;
  /** Canvas fill for export; null = leave transparent (PNG). */
  fill: string | null;
  preview: string;
}[] = [
  { id: "black", label: "Black", fill: "#000000", preview: "#000000" },
  { id: "white", label: "White", fill: "#ffffff", preview: "#ffffff" },
  { id: "paper", label: "Paper", fill: "#f0ebe3", preview: "#f0ebe3" },
  { id: "transparent", label: "Clear", fill: null, preview: "transparent" },
];

export function defaultStyleFor(type: ChartType): string {
  return CHART_STYLES[type][0]?.id ?? "default";
}

export function backgroundFill(id: ChartBackgroundId): string | null {
  return CHART_BACKGROUNDS.find((b) => b.id === id)?.fill ?? "#000000";
}

export function backgroundClass(id: ChartBackgroundId): string {
  switch (id) {
    case "white":
      return "bg-white text-black [&_.text-primary]:text-black [&_.text-muted-foreground]:text-black/55";
    case "paper":
      return "bg-[#f0ebe3] text-black [&_.text-primary]:text-black [&_.text-muted-foreground]:text-black/55";
    case "transparent":
      return "bg-transparent";
    case "black":
    default:
      return "bg-black text-white";
  }
}
