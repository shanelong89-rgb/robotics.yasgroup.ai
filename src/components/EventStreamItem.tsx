"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Zap, DollarSign, Activity, Shield } from "lucide-react";
import { EventStreamEntry } from "@/types";

const typeConfig = {
  alert: { icon: AlertTriangle, color: "text-yas-red", bg: "bg-yas-red/10", accent: "#EF4444" },
  claim: { icon: Shield, color: "text-yas-amber", bg: "bg-yas-amber/10", accent: "#F59E0B" },
  payout: { icon: DollarSign, color: "text-yas-green", bg: "bg-yas-green/10", accent: "#22C55E" },
  telemetry: { icon: Activity, color: "text-yas-blue", bg: "bg-yas-blue/10", accent: "#3B82F6" },
  reserve: { icon: Zap, color: "text-yas-teal", bg: "bg-yas-teal/10", accent: "#14B8A6" },
};

const severityAccent = {
  info: "#3B82F6",
  warning: "#F59E0B",
  critical: "#EF4444",
};

function formatTimestamp(timestamp: string) {
  const d = new Date(timestamp);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

function formatTime(timestamp: string) {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

interface EventStreamItemProps {
  event: EventStreamEntry;
  index: number;
}

export default function EventStreamItem({ event, index }: EventStreamItemProps) {
  const config = typeConfig[event.type];
  const Icon = config.icon;
  const accentColor = severityAccent[event.severity];
  const isWarning = event.severity === "warning";

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={`relative flex items-start gap-3 px-4 py-2.5 hover:bg-white/[0.02] transition-colors cursor-default flex-shrink-0 ${isWarning ? "animate-pulse-subtle" : ""}`}
      style={isWarning ? { animation: "warning-pulse 2.5s ease-in-out infinite" } : undefined}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r"
        style={{ background: accentColor, opacity: event.severity === "info" ? 0.5 : 0.8 }}
      />

      <div className={`rounded-lg p-1.5 ${config.bg} flex-shrink-0 mt-0.5`}>
        <Icon className={`w-3 h-3 ${config.color}`} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-yas-text truncate">{event.title}</span>
          <span
            className="text-[9px] flex-shrink-0 font-mono"
            style={{ color: "#475569", letterSpacing: "0.03em" }}
          >
            {formatTimestamp(event.timestamp)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className="text-[11px] text-yas-subtext leading-relaxed truncate">{event.description}</p>
          <span className="text-[9px] text-yas-muted flex-shrink-0">{formatTime(event.timestamp)}</span>
        </div>
      </div>
    </motion.div>
  );
}
