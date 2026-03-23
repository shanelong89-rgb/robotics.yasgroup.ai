"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

interface TelemetryChartProps {
  data: Array<Record<string, unknown>>;
  dataKey: string;
  color?: string;
  label?: string;
  height?: number;
  type?: "line" | "area";
  gradientId?: string;
}

export default function TelemetryChart({
  data,
  dataKey,
  color = "#3B82F6",
  label = "Value",
  height = 160,
  type = "area",
  gradientId = "gradient1",
}: TelemetryChartProps) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {type === "area" ? (
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="hour"
              tick={{ fill: "#64748B", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fill: "#64748B", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#131929",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "8px",
                color: "#F1F5F9",
                fontSize: "12px",
              }}
            />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={1.5}
              fill={`url(#${gradientId})`}
              dot={false}
            />
          </AreaChart>
        ) : (
          <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="hour"
              tick={{ fill: "#64748B", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fill: "#64748B", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#131929",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "8px",
                color: "#F1F5F9",
                fontSize: "12px",
              }}
            />
            <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={1.5} dot={false} />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
