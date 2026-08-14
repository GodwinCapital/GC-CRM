"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area,
  LineChart,
  Line,
} from "recharts";
import { colorsFor, chromeFor } from "@/lib/chart-colors";
import { formatMoney } from "@/lib/format";
import { useTheme } from "@/lib/use-theme";

export function DealCountBarChart({
  data,
  dataKey = "count",
  labelKey = "label",
  color,
  horizontal = false,
  valueSuffix,
}: {
  data: Record<string, unknown>[];
  dataKey?: string;
  labelKey?: string;
  color?: string;
  horizontal?: boolean;
  valueSuffix?: string;
}) {
  const { theme } = useTheme();
  const chrome = chromeFor(theme);
  const barColor = color ?? colorsFor(theme)[0];
  const axisTick = { fill: chrome.mutedText, fontSize: 12 };
  const tooltipStyle = {
    background: chrome.tooltipBg,
    border: `1px solid ${chrome.tooltipBorder}`,
    borderRadius: 8,
    fontSize: 12,
    color: chrome.primaryText,
  };

  if (horizontal) {
    return (
      <ResponsiveContainer width="100%" height={Math.max(160, data.length * 40)}>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
          <CartesianGrid stroke={chrome.grid} horizontal={false} />
          <XAxis type="number" tick={axisTick} axisLine={{ stroke: chrome.axis }} />
          <YAxis
            type="category"
            dataKey={labelKey}
            width={160}
            tick={axisTick}
            axisLine={{ stroke: chrome.axis }}
          />
          <Tooltip
            cursor={{ fill: "rgba(128,128,128,0.08)" }}
            contentStyle={tooltipStyle}
            formatter={(v) => [`${v}${valueSuffix ?? ""}`, ""]}
          />
          <Bar dataKey={dataKey} radius={[0, 4, 4, 0]} fill={barColor} maxBarSize={22} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ left: 0, right: 8 }}>
        <CartesianGrid stroke={chrome.grid} vertical={false} />
        <XAxis dataKey={labelKey} tick={axisTick} axisLine={{ stroke: chrome.axis }} />
        <YAxis tick={axisTick} axisLine={{ stroke: chrome.axis }} />
        <Tooltip
          cursor={{ fill: "rgba(128,128,128,0.08)" }}
          contentStyle={tooltipStyle}
          formatter={(v) => [`${v}${valueSuffix ?? ""}`, ""]}
        />
        <Bar dataKey={dataKey} radius={[4, 4, 0, 0]} fill={barColor} maxBarSize={40} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function StatusDonutChart({
  data,
}: {
  data: { label: string; value: number; color: string }[];
}) {
  const { theme } = useTheme();
  const chrome = chromeFor(theme);
  const tooltipStyle = {
    background: chrome.tooltipBg,
    border: `1px solid ${chrome.tooltipBorder}`,
    borderRadius: 8,
    fontSize: 12,
    color: chrome.primaryText,
  };
  const total = data.reduce((a, d) => a + d.value, 0);
  return (
    <div className="flex items-center gap-6">
      <ResponsiveContainer width={180} height={180}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={2}
            stroke="none"
            isAnimationActive={false}
          >
            {data.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => [v, ""]} />
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-2">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-2 text-sm">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
            <span className="text-slate-600 dark:text-slate-300">{d.label}</span>
            <span className="text-slate-500">
              {d.value} ({total > 0 ? Math.round((d.value / total) * 100) : 0}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MonthlyVolumeChart({
  data,
}: {
  data: { label: string; count: number; ev: number }[];
}) {
  const { theme } = useTheme();
  const chrome = chromeFor(theme);
  const color = colorsFor(theme)[0];
  const axisTick = { fill: chrome.mutedText, fontSize: 12 };
  const tooltipStyle = {
    background: chrome.tooltipBg,
    border: `1px solid ${chrome.tooltipBorder}`,
    borderRadius: 8,
    fontSize: 12,
    color: chrome.primaryText,
  };

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ left: 0, right: 8 }}>
        <defs>
          <linearGradient id="evGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={chrome.grid} vertical={false} />
        <XAxis dataKey="label" tick={axisTick} axisLine={{ stroke: chrome.axis }} />
        <YAxis tick={axisTick} axisLine={{ stroke: chrome.axis }} />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(v, name) => [
            name === "ev" ? formatMoney(Number(v)) : v,
            name === "ev" ? "Enterprise Value" : "Deals Received",
          ]}
        />
        <Area
          type="monotone"
          dataKey="ev"
          stroke={color}
          strokeWidth={2}
          fill="url(#evGradient)"
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function DealVolumeCountChart({
  data,
}: {
  data: { label: string; count: number }[];
}) {
  const { theme } = useTheme();
  const chrome = chromeFor(theme);
  const color = colorsFor(theme)[2];
  const axisTick = { fill: chrome.mutedText, fontSize: 12 };
  const tooltipStyle = {
    background: chrome.tooltipBg,
    border: `1px solid ${chrome.tooltipBorder}`,
    borderRadius: 8,
    fontSize: 12,
    color: chrome.primaryText,
  };

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ left: 0, right: 8 }}>
        <CartesianGrid stroke={chrome.grid} vertical={false} />
        <XAxis dataKey="label" tick={axisTick} axisLine={{ stroke: chrome.axis }} />
        <YAxis tick={axisTick} axisLine={{ stroke: chrome.axis }} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => [v, "Deals Received"]} />
        <Line
          type="monotone"
          dataKey="count"
          stroke={color}
          strokeWidth={2}
          dot={{ r: 3, fill: color }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function CategoryBarChart({
  data,
}: {
  data: { label: string; count: number }[];
}) {
  const { theme } = useTheme();
  const chrome = chromeFor(theme);
  const colors = colorsFor(theme);
  const axisTick = { fill: chrome.mutedText, fontSize: 12 };
  const tooltipStyle = {
    background: chrome.tooltipBg,
    border: `1px solid ${chrome.tooltipBorder}`,
    borderRadius: 8,
    fontSize: 12,
    color: chrome.primaryText,
  };

  return (
    <ResponsiveContainer width="100%" height={Math.max(160, data.length * 34)}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
        <CartesianGrid stroke={chrome.grid} horizontal={false} />
        <XAxis type="number" tick={axisTick} axisLine={{ stroke: chrome.axis }} allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="label"
          width={190}
          tick={axisTick}
          axisLine={{ stroke: chrome.axis }}
        />
        <Tooltip cursor={{ fill: "rgba(128,128,128,0.08)" }} contentStyle={tooltipStyle} />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={20} isAnimationActive={false}>
          {data.map((_, i) => (
            <Cell key={i} fill={colors[i % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
