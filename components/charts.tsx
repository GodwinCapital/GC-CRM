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
import { CHART_COLORS, CHART_CHROME } from "@/lib/chart-colors";
import { formatMoney } from "@/lib/format";

const tooltipStyle = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: 8,
  fontSize: 12,
  color: CHART_CHROME.primaryText,
};

const axisTick = { fill: CHART_CHROME.mutedText, fontSize: 12 };

export function DealCountBarChart({
  data,
  dataKey = "count",
  labelKey = "label",
  color = CHART_COLORS[0],
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
  if (horizontal) {
    return (
      <ResponsiveContainer width="100%" height={Math.max(160, data.length * 40)}>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
          <CartesianGrid stroke={CHART_CHROME.grid} horizontal={false} />
          <XAxis type="number" tick={axisTick} axisLine={{ stroke: CHART_CHROME.axis }} />
          <YAxis
            type="category"
            dataKey={labelKey}
            width={160}
            tick={axisTick}
            axisLine={{ stroke: CHART_CHROME.axis }}
          />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            contentStyle={tooltipStyle}
            formatter={(v) => [`${v}${valueSuffix ?? ""}`, ""]}
          />
          <Bar dataKey={dataKey} radius={[0, 4, 4, 0]} fill={color} maxBarSize={22} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ left: 0, right: 8 }}>
        <CartesianGrid stroke={CHART_CHROME.grid} vertical={false} />
        <XAxis dataKey={labelKey} tick={axisTick} axisLine={{ stroke: CHART_CHROME.axis }} />
        <YAxis tick={axisTick} axisLine={{ stroke: CHART_CHROME.axis }} />
        <Tooltip
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
          contentStyle={tooltipStyle}
          formatter={(v) => [`${v}${valueSuffix ?? ""}`, ""]}
        />
        <Bar dataKey={dataKey} radius={[4, 4, 0, 0]} fill={color} maxBarSize={40} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function StatusDonutChart({
  data,
}: {
  data: { label: string; value: number; color: string }[];
}) {
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
            <span className="text-slate-300">{d.label}</span>
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
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ left: 0, right: 8 }}>
        <defs>
          <linearGradient id="evGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART_COLORS[0]} stopOpacity={0.35} />
            <stop offset="100%" stopColor={CHART_COLORS[0]} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={CHART_CHROME.grid} vertical={false} />
        <XAxis dataKey="label" tick={axisTick} axisLine={{ stroke: CHART_CHROME.axis }} />
        <YAxis tick={axisTick} axisLine={{ stroke: CHART_CHROME.axis }} />
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
          stroke={CHART_COLORS[0]}
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
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ left: 0, right: 8 }}>
        <CartesianGrid stroke={CHART_CHROME.grid} vertical={false} />
        <XAxis dataKey="label" tick={axisTick} axisLine={{ stroke: CHART_CHROME.axis }} />
        <YAxis tick={axisTick} axisLine={{ stroke: CHART_CHROME.axis }} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => [v, "Deals Received"]} />
        <Line
          type="monotone"
          dataKey="count"
          stroke={CHART_COLORS[2]}
          strokeWidth={2}
          dot={{ r: 3, fill: CHART_COLORS[2] }}
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
  return (
    <ResponsiveContainer width="100%" height={Math.max(160, data.length * 34)}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
        <CartesianGrid stroke={CHART_CHROME.grid} horizontal={false} />
        <XAxis type="number" tick={axisTick} axisLine={{ stroke: CHART_CHROME.axis }} allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="label"
          width={190}
          tick={axisTick}
          axisLine={{ stroke: CHART_CHROME.axis }}
        />
        <Tooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} contentStyle={tooltipStyle} />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={20} isAnimationActive={false}>
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
