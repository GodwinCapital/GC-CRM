// Categorical palette (light- and dark-surface steps), per the firm's
// dataviz standard. Order is the CVD-safety mechanism — assign in this
// fixed order, never cycle or re-sort by rank.
export const CHART_COLORS_DARK = [
  "#3987e5", // blue
  "#d95926", // orange
  "#199e70", // aqua
  "#c98500", // yellow
  "#d55181", // magenta
  "#008300", // green
  "#9085e9", // violet
  "#e66767", // red
];

export const CHART_COLORS_LIGHT = [
  "#2a78d6", // blue
  "#eb6834", // orange
  "#1baf7a", // aqua
  "#eda100", // yellow
  "#e87ba4", // magenta
  "#008300", // green
  "#4a3aa7", // violet
  "#e34948", // red
];

// Backwards-compatible default export (dark) for any non-theme-aware caller.
export const CHART_COLORS = CHART_COLORS_DARK;

export const CHART_STATUS = {
  good: "#0ca30c",
  warning: "#fab219",
  serious: "#ec835a",
  critical: "#d03b3b",
};

export const CHART_CHROME_DARK = {
  grid: "#2c2c2a",
  axis: "#383835",
  mutedText: "#94a3b8",
  primaryText: "#f1f5f9",
  tooltipBg: "#0f172a",
  tooltipBorder: "#1e293b",
};

export const CHART_CHROME_LIGHT = {
  grid: "#e1e0d9",
  axis: "#c3c2b7",
  mutedText: "#64748b",
  primaryText: "#0f172a",
  tooltipBg: "#ffffff",
  tooltipBorder: "#e2e8f0",
};

// Backwards-compatible default export (dark) for any non-theme-aware caller.
export const CHART_CHROME = CHART_CHROME_DARK;

export function colorsFor(theme: "light" | "dark"): string[] {
  return theme === "dark" ? CHART_COLORS_DARK : CHART_COLORS_LIGHT;
}

export function chromeFor(theme: "light" | "dark") {
  return theme === "dark" ? CHART_CHROME_DARK : CHART_CHROME_LIGHT;
}
