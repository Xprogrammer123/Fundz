/** Chart palette — white / soft white only (no teal, no solid gray fills). */
export const MONO = {
  black: "#0a0a0a",
  white: "#ffffff",
  gray100: "#f5f5f5",
  gray200: "#e8e8e8",
  gray300: "#d4d4d4",
  gray400: "#bdbdbd",
  gray500: "#a3a3a3",
  gray600: "#8a8a8a",
  gray700: "#737373",
  gray800: "#0a0a0a",
  gray900: "#0a0a0a",
} as const;

/** Distinct grays for multi-series charts */
export const CHART_PALETTE = [
  MONO.white,
  MONO.gray300,
  MONO.gray400,
  MONO.gray500,
  MONO.gray600,
  MONO.gray200,
  MONO.gray700,
  MONO.gray100,
] as const;

export function seriesColors(kind: "income" | "expense" | "net" | "value") {
  switch (kind) {
    case "income":
      return { light: [MONO.white], dark: [MONO.white] };
    case "expense":
      return { light: [MONO.gray400], dark: [MONO.gray400] };
    case "net":
      return { light: [MONO.gray200], dark: [MONO.gray200] };
    default:
      return { light: [MONO.white], dark: [MONO.white] };
  }
}
