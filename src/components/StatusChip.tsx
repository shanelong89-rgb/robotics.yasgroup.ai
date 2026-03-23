"use client";

import { AssetStatus } from "@/types";

const statusConfig: Record<AssetStatus, { label: string; color: string; dot: string }> = {
  active: { label: "Active", color: "text-yas-green bg-yas-green/10 border-yas-green/20", dot: "bg-yas-green" },
  idle: { label: "Idle", color: "text-yas-muted bg-yas-muted/10 border-yas-muted/20", dot: "bg-yas-muted" },
  warning: { label: "Warning", color: "text-yas-amber bg-yas-amber/10 border-yas-amber/20", dot: "bg-yas-amber" },
  critical: { label: "Critical", color: "text-yas-red bg-yas-red/10 border-yas-red/20", dot: "bg-yas-red" },
  offline: { label: "Offline", color: "text-yas-muted bg-yas-muted/5 border-yas-muted/10", dot: "bg-yas-muted" },
};

interface StatusChipProps {
  status: AssetStatus;
  size?: "sm" | "md";
}

export default function StatusChip({ status, size = "md" }: StatusChipProps) {
  const config = statusConfig[status];
  const sizeClass = size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-1";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${config.color} ${sizeClass}`}>
      <span
        className={`rounded-full ${config.dot} ${status === "active" ? "animate-pulse" : ""} ${size === "sm" ? "w-1 h-1" : "w-1.5 h-1.5"}`}
      />
      {config.label}
    </span>
  );
}
