/** Black / white / gray only — shared chart & UI palette. */
export const MONO = {
  black: "#000000",
  white: "#ffffff",
  gray100: "#f5f5f5",
  gray200: "#e5e5e5",
  gray300: "#d4d4d4",
  gray400: "#a3a3a3",
  gray500: "#737373",
  gray600: "#525252",
  gray700: "#404040",
  gray800: "#262626",
  gray900: "#171717",
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
