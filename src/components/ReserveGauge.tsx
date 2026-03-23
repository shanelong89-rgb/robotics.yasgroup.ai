"use client";

import { motion } from "framer-motion";

interface ReserveGaugeProps {
  label: string;
  balance: number;
  maxCapacity: number;
  utilizationPct: number;
  currency?: string;
  color?: string;
}

function formatMoney(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return n.toString();
}

export default function ReserveGauge({
  label,
  balance,
  maxCapacity,
  utilizationPct,
  currency = "HKD",
  color = "#3B82F6",
}: ReserveGaugeProps) {
  const pct = Math.min(100, utilizationPct);
  const safeZone = pct < 60;
  const warningZone = pct >= 60 && pct < 80;
  const dangerZone = pct >= 80;

  const gaugeColor = dangerZone ? "#EF4444" : warningZone ? "#F59E0B" : color;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-yas-subtext uppercase tracking-widest" style={{ fontSize: "10px" }}>{label}</span>
        <span className={`text-xs font-medium ${dangerZone ? "text-yas-red" : warningZone ? "text-yas-amber" : "text-yas-green"}`}>
          {pct}% utilized
        </span>
      </div>

      <div className="relative h-2 bg-white/[0.06] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ backgroundColor: gaugeColor }}
        />
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-xl font-bold text-yas-text tabular-nums">
            {currency} {formatMoney(balance)}
          </p>
          <p className="text-[10px] text-yas-muted mt-0.5">
            of {currency} {formatMoney(maxCapacity)} capacity
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-yas-muted">Available</p>
          <p className="text-sm font-semibold text-yas-text tabular-nums">
            {currency} {formatMoney(maxCapacity - balance)}
          </p>
        </div>
      </div>
    </div>
  );
}
