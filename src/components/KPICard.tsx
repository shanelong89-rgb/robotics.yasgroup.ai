"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KPICardProps {
  label: string;
  value: string | number;
  delta?: number;
  deltaLabel?: string;
  icon?: React.ReactNode;
  critical?: boolean;
  color?: "default" | "green" | "amber" | "red" | "blue" | "teal";
}

const colorMap = {
  default: { value: "text-yas-text", border: "border-white/[0.08]", icon: "text-yas-blue", glow: "rgba(59,130,246,0.12)", bar: "#3B82F6" },
  green:   { value: "text-yas-green",  border: "border-yas-green/20",  icon: "text-yas-green",  glow: "rgba(34,197,94,0.12)",  bar: "#22C55E" },
  amber:   { value: "text-yas-amber",  border: "border-yas-amber/20",  icon: "text-yas-amber",  glow: "rgba(245,158,11,0.12)", bar: "#F59E0B" },
  red:     { value: "text-yas-red",    border: "border-yas-red/30",    icon: "text-yas-red",    glow: "rgba(239,68,68,0.12)",  bar: "#EF4444" },
  blue:    { value: "text-yas-blue",   border: "border-yas-blue/20",   icon: "text-yas-blue",   glow: "rgba(59,130,246,0.12)", bar: "#3B82F6" },
  teal:    { value: "text-yas-teal",   border: "border-yas-teal/20",   icon: "text-yas-teal",   glow: "rgba(20,184,166,0.12)", bar: "#14B8A6" },
};

// Deterministic sparkline heights so they don't change on re-render
const SPARKLINES: Record<string, number[]> = {
  default: [40, 65, 50, 75, 60],
  green:   [30, 55, 80, 65, 90],
  amber:   [60, 40, 70, 50, 65],
  red:     [80, 60, 75, 50, 70],
  blue:    [45, 70, 55, 80, 65],
  teal:    [50, 65, 45, 75, 60],
};

export default function KPICard({ label, value, delta, deltaLabel, icon, critical = false, color = "default" }: KPICardProps) {
  const colors = colorMap[color];
  const sparkHeights = SPARKLINES[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`animate-fade-up relative bg-yas-panel border ${colors.border} rounded-2xl px-5 pt-4 pb-3 flex flex-col gap-2 overflow-hidden ${critical ? "ring-1 ring-yas-red/40" : ""}`}
    >
      {critical && (
        <div className="absolute inset-0 bg-yas-red/5 pointer-events-none" />
      )}

      {/* Radial glow behind metric */}
      <div
        className="absolute left-4 top-8 w-20 h-20 rounded-full pointer-events-none blur-2xl"
        style={{ background: colors.glow, opacity: 0.8 }}
      />

      <div className="flex items-start justify-between relative z-10">
        <span
          className="text-yas-subtext font-medium uppercase tracking-widest"
          style={{ fontSize: "10px" }}
        >
          {label}
        </span>
        {icon && <span className={`${colors.icon} opacity-70`}>{icon}</span>}
      </div>

      <div className={`text-2xl font-bold tracking-tight ${colors.value} tabular-nums relative z-10 animate-count-up`}>
        {value}
      </div>

      {delta !== undefined && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-1 relative z-10"
        >
          {delta > 0 ? (
            <TrendingUp className="w-3 h-3 text-yas-green" />
          ) : delta < 0 ? (
            <TrendingDown className="w-3 h-3 text-yas-red" />
          ) : (
            <Minus className="w-3 h-3 text-yas-muted" />
          )}
          <span
            className={`text-[11px] font-medium ${
              delta > 0 ? "text-yas-green" : delta < 0 ? "text-yas-red" : "text-yas-muted"
            }`}
          >
            {delta > 0 ? "+" : ""}
            {delta}% {deltaLabel}
          </span>
        </motion.div>
      )}

      {/* Sparkline mini bars */}
      <div className="flex items-end gap-0.5 h-5 mt-1 relative z-10">
        {sparkHeights.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm opacity-60"
            style={{
              height: `${h}%`,
              background: colors.bar,
              minHeight: "2px",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
