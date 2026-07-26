/** Black & white chart palette for dirty-paper theme. */
export const MONO = {
  black: "#111111",
  white: "#e8e4db",
  gray100: "#f5f2ea",
  gray200: "#ddd7cb",
  gray300: "#b8b2a6",
  gray400: "#8a8478",
  gray500: "#5c5c5c",
  gray600: "#3a3a3a",
  gray700: "#222222",
  gray800: "#111111",
  gray900: "#111111",
} as const;

/** Distinct tones for multi-series charts */
export const CHART_PALETTE = [
  MONO.black,
  MONO.gray500,
  MONO.gray400,
  MONO.gray600,
  MONO.gray300,
  MONO.gray700,
  MONO.gray200,
  MONO.gray800,
] as const;

export function seriesColors(kind: "income" | "expense" | "net" | "value") {
  switch (kind) {
    case "income":
      return { light: [MONO.black], dark: [MONO.black] };
    case "expense":
      return { light: [MONO.gray500], dark: [MONO.gray500] };
    case "net":
      return { light: [MONO.gray700], dark: [MONO.gray700] };
    default:
      return { light: [MONO.black], dark: [MONO.black] };
  }
}
