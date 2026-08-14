// Categorical palette (dark-surface steps), per the firm's dataviz standard.
// Order is the CVD-safety mechanism — assign in this fixed order, never cycle
// or re-sort by rank.
export const CHART_COLORS = [
  "#3987e5", // blue
  "#d95926", // orange
  "#199e70", // aqua
  "#c98500", // yellow
  "#d55181", // magenta
  "#008300", // green
  "#9085e9", // violet
  "#e66767", // red
];

export const CHART_STATUS = {
  good: "#0ca30c",
  warning: "#fab219",
  serious: "#ec835a",
  critical: "#d03b3b",
};

export const CHART_CHROME = {
  grid: "#2c2c2a",
  axis: "#383835",
  mutedText: "#94a3b8",
  primaryText: "#f1f5f9",
};

export function colorFor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}
