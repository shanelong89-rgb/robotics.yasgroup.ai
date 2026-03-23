"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Battery, Activity, Shield, Zap, Clock, AlertTriangle, ExternalLink, Bot, Car, Navigation } from "lucide-react";
import { Asset } from "@/types";
import StatusChip from "./StatusChip";
import RiskScoreBadge from "./RiskScoreBadge";
import Link from "next/link";

interface RightControlPanelProps {
  asset: Asset | null;
  onClose: () => void;
  onReportIncident?: (asset: Asset) => void;
}

const assetTypeIcon = {
  robot: Bot,
  ev: Car,
  av: Navigation,
};

const assetTypeColor = {
  robot: "#14B8A6",
  ev: "#3B82F6",
  av: "#A855F7",
};

const assetTypeBg = {
  robot: "rgba(20,184,166,0.12)",
  ev: "rgba(59,130,246,0.12)",
  av: "rgba(168,85,247,0.12)",
};

const geographyLabel: Record<string, string> = {
  hong_kong: "Hong Kong",
  shenzhen: "Shenzhen",
  tokyo: "Tokyo",
  singapore: "Singapore",
};

function SignalBars() {
  return (
    <div className="flex items-end gap-0.5" title="Signal: Strong">
      {[3, 5, 7].map((h, i) => (
        <div
          key={i}
          className="w-1 rounded-sm"
          style={{ height: `${h}px`, background: "#22C55E" }}
        />
      ))}
    </div>
  );
}

function RiskGauge({ score }: { score: number }) {
  const color = score >= 70 ? "#EF4444" : score >= 40 ? "#F59E0B" : "#22C55E";
  const label = score >= 70 ? "HIGH" : score >= 40 ? "MODERATE" : "LOW";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[9px] uppercase tracking-widest text-yas-muted font-medium">Risk Score</span>
        <span className="text-xs font-bold tabular-nums" style={{ color }}>{score}<span className="text-yas-muted font-normal">/100</span></span>
      </div>
      <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}99, ${color})` }}
        />
      </div>
      <div className="flex justify-between items-center">
        <span className="text-[9px] text-yas-muted">0</span>
        <span className="text-[9px] font-semibold uppercase tracking-widest" style={{ color }}>{label}</span>
        <span className="text-[9px] text-yas-muted">100</span>
      </div>
    </div>
  );
}

export default function RightControlPanel({ asset, onClose, onReportIncident }: RightControlPanelProps) {
  return (
    <AnimatePresence mode="wait">
      {asset && (
        <motion.div
          key={asset.id}
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 40 }}
          className="fixed right-0 top-14 bottom-0 w-96 border-l border-white/[0.08] z-50 flex flex-col overflow-hidden"
          style={{
            background: "rgba(10, 14, 26, 0.92)",
            backdropFilter: "saturate(200%) blur(40px)",
            WebkitBackdropFilter: "saturate(200%) blur(40px)",
            borderTop: "2px solid #3B82F6",
            boxShadow: "-8px 0 40px rgba(0,0,0,0.4)",
          }}
        >
          {/* Frosted glass hero header */}
          <div
            className="px-5 pt-4 pb-4 border-b border-white/[0.06] relative overflow-hidden"
            style={{
              background: assetTypeBg[asset.type],
            }}
          >
            {/* Ambient glow */}
            <div
              className="absolute -top-6 -right-6 w-32 h-32 rounded-full blur-3xl pointer-events-none"
              style={{ background: assetTypeColor[asset.type], opacity: 0.15 }}
            />

            <div className="flex items-start justify-between relative z-10">
              <div className="flex items-start gap-3">
                {/* Large icon */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/10"
                  style={{ background: assetTypeBg[asset.type] }}
                >
                  {(() => {
                    const Icon = assetTypeIcon[asset.type];
                    return <Icon className="w-6 h-6" style={{ color: assetTypeColor[asset.type] }} />;
                  })()}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border"
                      style={{
                        color: "#3B82F6",
                        borderColor: "rgba(59,130,246,0.3)",
                        background: "rgba(59,130,246,0.1)",
                      }}
                    >
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-yas-blue animate-pulse" />
                      Selected
                    </span>
                  </div>
                  <h3 className="font-bold text-yas-text text-sm leading-tight">{asset.name}</h3>
                  <p className="text-[11px] text-yas-muted mt-0.5 font-mono">{asset.id.toUpperCase()}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-yas-muted hover:text-yas-text hover:bg-white/[0.06] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <SignalBars />
              </div>
            </div>

            {/* Status below */}
            <div className="flex items-center gap-2 mt-3 relative z-10">
              <StatusChip status={asset.status} />
              <RiskScoreBadge score={asset.riskScore} size="sm" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Risk Score Gauge */}
            <div className="p-4">
              <RiskGauge score={asset.riskScore} />
            </div>
            <div className="divider mx-4" />

            {/* Key Stats */}
            <div className="p-4 grid grid-cols-2 gap-3">
              <StatTile icon={<Battery className="w-3.5 h-3.5" />} label="Battery" value={`${asset.batteryLevel}%`} color={asset.batteryLevel < 25 ? "text-yas-red" : asset.batteryLevel < 50 ? "text-yas-amber" : "text-yas-green"} />
              <StatTile icon={<Activity className="w-3.5 h-3.5" />} label="Health" value={`${asset.healthPercent}%`} color={asset.healthPercent < 70 ? "text-yas-red" : asset.healthPercent < 85 ? "text-yas-amber" : "text-yas-green"} />
              <StatTile icon={<Clock className="w-3.5 h-3.5" />} label="Op. Hours" value={asset.operatingHours.toLocaleString()} color="text-yas-text" />
              <StatTile icon={<Zap className="w-3.5 h-3.5" />} label="Premium/hr" value={`HK$${asset.premiumBurnRate}`} color="text-yas-teal" />
            </div>
            <div className="divider mx-4" />

            {/* Location */}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-3.5 h-3.5 text-yas-blue" />
                <span className="text-[10px] uppercase tracking-widest text-yas-muted font-medium">Location</span>
              </div>
              <p className="text-xs text-yas-text font-medium">{geographyLabel[asset.geography]}</p>
              <p className="text-[11px] text-yas-muted font-mono mt-0.5">
                {asset.lat.toFixed(4)}°N, {asset.lng.toFixed(4)}°E
              </p>
            </div>
            <div className="divider mx-4" />

            {/* Last Event */}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className={`w-3.5 h-3.5 ${asset.status === "critical" ? "text-yas-red" : "text-yas-amber"}`} />
                <span className="text-[10px] uppercase tracking-widest text-yas-muted font-medium">Last Event</span>
              </div>
              <p className="text-xs text-yas-text">{asset.lastEvent}</p>
              <p className="text-[11px] text-yas-muted mt-0.5">{asset.lastEventTime}</p>
            </div>
            <div className="divider mx-4" />

            {/* Protection Status */}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-3.5 h-3.5 text-yas-teal" />
                <span className="text-[10px] uppercase tracking-widest text-yas-muted font-medium">Protection Status</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-yas-subtext">Coverage</span>
                  <span className="text-xs font-medium text-yas-green flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-yas-green inline-block" />
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-yas-subtext">Type</span>
                  <span className="text-xs font-medium text-yas-text">Comprehensive</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-yas-subtext">Premium burn rate</span>
                  <span className="text-xs font-medium text-yas-teal tabular-nums">HK${asset.premiumBurnRate}/hr</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-yas-subtext">Monthly est.</span>
                  <span className="text-xs font-medium text-yas-text tabular-nums">HK$2,400/mo</span>
                </div>
              </div>
            </div>

            {/* Recommended Action */}
            {(asset.status === "critical" || asset.status === "warning") && (
              <>
                <div className="divider mx-4" />
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="m-4 rounded-xl p-3 border"
                  style={{
                    background: asset.status === "critical" ? "rgba(239,68,68,0.08)" : "rgba(245,158,11,0.08)",
                    borderColor: asset.status === "critical" ? "rgba(239,68,68,0.25)" : "rgba(245,158,11,0.25)",
                  }}
                >
                  <p className={`text-[10px] uppercase tracking-widest font-semibold mb-1 ${asset.status === "critical" ? "text-yas-red" : "text-yas-amber"}`}>
                    Recommended Action
                  </p>
                  <p className="text-xs text-yas-subtext mb-3">
                    {asset.status === "critical"
                      ? "Immediate dispatch required. Initiate claim process and notify operator."
                      : "Monitor closely. Battery or sensor check recommended at next stop."}
                  </p>
                  <div
                    className="inline-flex items-center px-3 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-widest"
                    style={{ background: "rgba(20,184,166,0.15)", color: "#14B8A6", border: "1px solid rgba(20,184,166,0.3)" }}
                  >
                    {asset.status === "critical" ? "→ Dispatch Now" : "→ Schedule Check"}
                  </div>
                </motion.div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/[0.06] flex flex-col gap-2">
            {(asset.status === "critical" || asset.status === "warning") && onReportIncident && (
              <button
                onClick={() => onReportIncident(asset)}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-yas-red text-sm font-semibold transition-colors border border-yas-red/30 btn-press"
                style={{ background: "rgba(239,68,68,0.1)" }}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                ⚠ Report Incident
              </button>
            )}
            <Link
              href={`/asset/${asset.id}`}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-yas-blue text-sm font-medium transition-colors border border-yas-blue/30 btn-press"
              style={{ background: "rgba(59,130,246,0.1)" }}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Full Asset Detail
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function StatTile({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.06]">
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-yas-muted">{icon}</span>
        <span className="text-[9px] uppercase tracking-widest text-yas-muted">{label}</span>
      </div>
      <p className={`text-sm font-bold tabular-nums ${color}`}>{value}</p>
    </div>
  );
}
