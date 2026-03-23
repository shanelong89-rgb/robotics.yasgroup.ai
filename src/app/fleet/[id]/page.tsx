"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Activity, Shield, AlertTriangle, TrendingUp, Cpu, Bot, Car, Navigation } from "lucide-react";
import { fleets, assets, alerts, claims, generateUtilizationData } from "@/lib/demo-data";
import StatusChip from "@/components/StatusChip";
import RiskScoreBadge from "@/components/RiskScoreBadge";
import dynamic from "next/dynamic";
const TelemetryChart = dynamic(() => import("@/components/TelemetryChart"), { ssr: false });
import ClaimsTable from "@/components/ClaimsTable";

export default function FleetPage() {
  const params = useParams();
  const fleetId = params.id as string;
  const fleet = fleets.find(f => f.id === fleetId);
  const fleetAssets = assets.filter(a => a.fleetId === fleetId);
  const fleetAlerts = alerts.filter(a => a.fleetId === fleetId);
  const fleetClaims = claims.filter(c => c.fleetId === fleetId);
  const utilizationData = generateUtilizationData(fleetId);

  if (!fleet) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <p className="text-yas-muted text-lg">Fleet not found</p>
          <Link href="/" className="text-yas-blue text-sm mt-2 block hover:underline">← Back to Command Center</Link>
        </div>
      </div>
    );
  }

  const geographyLabel: Record<string, string> = {
    hong_kong: "Hong Kong",
    shenzhen: "Shenzhen",
    tokyo: "Tokyo",
    singapore: "Singapore",
  };

  const criticalAssets = fleetAssets.filter(a => a.status === "critical").length;
  const warningAssets = fleetAssets.filter(a => a.status === "warning").length;
  const activeAssets = fleetAssets.filter(a => a.status === "active").length;

  const topRiskyUnits = [...fleetAssets].sort((a, b) => b.riskScore - a.riskScore).slice(0, 5);

  const typeIcon = { robot: Bot, ev: Car, av: Navigation };

  return (
    <div className="pt-4 md:pt-6 pb-24 md:pb-8 px-4 md:px-6 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm mb-6 transition-colors px-3 py-1.5 rounded-lg border"
        style={{ color: "#14B8A6", borderColor: "rgba(20,184,166,0.25)", background: "rgba(20,184,166,0.08)" }}
      >
        <ArrowLeft className="w-4 h-4" />
        RETURN TO COMMAND CENTER
      </Link>

      {/* Fleet Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 mb-6"
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="px-2 py-0.5 rounded-md bg-yas-blue/10 border border-yas-blue/20 text-yas-blue text-[10px] uppercase tracking-widest font-semibold">
                {geographyLabel[fleet.geography]}
              </div>
              <span className="text-yas-muted text-xs font-mono">{fleet.id.toUpperCase()}</span>
              {/* Connected to Command Map indicator */}
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yas-green opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-yas-green"></span>
                </span>
                <span className="text-[9px] text-yas-green font-semibold uppercase tracking-widest">Connected to Command Map</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-yas-text tracking-tight mb-1">{fleet.name}</h1>
            <p className="text-yas-muted text-sm">{fleet.assetCount} managed assets · {(fleet.coverageRatio * 100).toFixed(0)}% coverage ratio</p>
          </div>

          {/* Health Score — circular gauge */}
          <div className="text-right flex flex-col items-end">
            <p className="text-[10px] uppercase tracking-widest text-yas-muted mb-3">Fleet Health Score</p>
            <div className="relative w-24 h-24">
              <svg width="96" height="96" viewBox="0 0 96 96">
                {/* Background circle */}
                <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                {/* Score arc */}
                <circle
                  cx="48" cy="48" r="40"
                  fill="none"
                  stroke={fleet.healthScore >= 90 ? "#22C55E" : fleet.healthScore >= 75 ? "#F59E0B" : "#EF4444"}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${(fleet.healthScore / 100) * 251.2} 251.2`}
                  transform="rotate(-90 48 48)"
                  style={{ transition: "stroke-dasharray 1s ease" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-2xl font-bold tabular-nums ${fleet.healthScore >= 90 ? "text-yas-green" : fleet.healthScore >= 75 ? "text-yas-amber" : "text-yas-red"}`}>
                  {fleet.healthScore}
                </span>
                <span className="text-[9px] text-yas-muted">/ 100</span>
              </div>
            </div>
            <p className="text-[10px] text-yas-muted mt-2">
              {fleet.healthScore >= 90 ? "Excellent" : fleet.healthScore >= 75 ? "Good" : "Needs attention"}
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/[0.06]">
          {[
            { label: "Active", value: activeAssets, color: "text-yas-green" },
            { label: "Warning", value: warningAssets, color: "text-yas-amber" },
            { label: "Critical", value: criticalAssets, color: "text-yas-red" },
            { label: "Monthly Premium", value: `HK$${fleet.premiumMonthly.toLocaleString()}`, color: "text-yas-teal" },
          ].map(stat => (
            <div key={stat.label}>
              <p className="text-[10px] uppercase tracking-widest text-yas-muted mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold tabular-nums ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Utilization Chart */}
        <div className="md:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-yas-blue" />
              <h3 className="text-sm font-semibold text-yas-text">Fleet Utilization (24h)</h3>
            </div>
            <span className="text-[10px] text-yas-muted">Avg {Math.round(utilizationData.reduce((s, d) => s + d.utilization, 0) / 24)}%</span>
          </div>
          <TelemetryChart
            data={utilizationData}
            dataKey="utilization"
            color="#3B82F6"
            height={180}
            gradientId="utilGradient"
          />
        </div>

        {/* Alert Summary */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-yas-amber" />
            <h3 className="text-sm font-semibold text-yas-text">Alert Summary</h3>
          </div>
          {fleetAlerts.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-yas-muted text-sm">No active alerts</div>
          ) : (
            <div className="flex flex-col gap-3">
              {fleetAlerts.map(alert => (
                <div key={alert.id} className={`p-3 rounded-xl border ${alert.severity === "critical" ? "border-yas-red/30 bg-yas-red/5" : "border-yas-amber/30 bg-yas-amber/5"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] uppercase tracking-widest font-semibold ${alert.severity === "critical" ? "text-yas-red" : "text-yas-amber"}`}>
                      {alert.severity}
                    </span>
                    {!alert.acknowledged && <span className="w-1.5 h-1.5 rounded-full bg-yas-red animate-pulse" />}
                  </div>
                  <p className="text-xs text-yas-text font-medium">{alert.title}</p>
                  <p className="text-[10px] text-yas-muted mt-0.5">{alert.description.slice(0, 60)}...</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Asset Grid */}
        <div className="md:col-span-2 glass-card p-5">
          <h3 className="text-sm font-semibold text-yas-text mb-4 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-yas-teal" />
            Asset Grid ({fleetAssets.length})
          </h3>
          <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
            {fleetAssets.map((asset, ai) => {
              const Icon = typeIcon[asset.type];
              return (
                <Link key={asset.id} href={`/asset/${asset.id}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: ai * 0.04 }}
                    whileHover={{ scale: 1.02 }}
                    className="card-lift p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-yas-blue/30 cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 text-yas-muted" />
                        <span className="text-xs font-medium text-yas-text">{asset.name}</span>
                      </div>
                      <StatusChip status={asset.status} size="sm" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-yas-muted">Risk</span>
                      <RiskScoreBadge score={asset.riskScore} size="sm" showLabel={false} />
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Coverage Status */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-yas-teal" />
            <h3 className="text-sm font-semibold text-yas-text">Coverage Status</h3>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-yas-subtext">Coverage Ratio</span>
              <span className="text-sm font-bold text-yas-green">{(fleet.coverageRatio * 100).toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
              <div className="h-full bg-yas-teal rounded-full" style={{ width: `${fleet.coverageRatio * 100}%` }} />
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
              <span className="text-xs text-yas-subtext">Monthly Premium</span>
              <span className="text-sm font-semibold text-yas-text tabular-nums">HK${fleet.premiumMonthly.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-yas-subtext">Claims (Active)</span>
              <span className="text-sm font-semibold text-yas-amber">{fleetClaims.filter(c => ["submitted","under_review","evidence_requested"].includes(c.status)).length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Risky Units */}
      <div className="glass-card p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-yas-red" />
          <h3 className="text-sm font-semibold text-yas-text">Top Risk Units</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {["Asset", "Type", "Status", "Risk Score", "Battery", "Op. Hours"].map(h => (
                <th key={h} className="text-left pb-3 px-3 text-[10px] uppercase tracking-widest text-yas-muted font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {topRiskyUnits.map((asset, i) => {
              const Icon = typeIcon[asset.type];
              return (
                <tr key={asset.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-3">
                    <Link href={`/asset/${asset.id}`} className="font-medium text-yas-text hover:text-yas-blue transition-colors">{asset.name}</Link>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5 text-yas-muted">
                      <Icon className="w-3.5 h-3.5" />
                      <span className="text-xs capitalize">{asset.type}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3"><StatusChip status={asset.status} size="sm" /></td>
                  <td className="py-3 px-3"><RiskScoreBadge score={asset.riskScore} size="sm" /></td>
                  <td className="py-3 px-3">
                    <span className={`text-xs font-semibold tabular-nums ${asset.batteryLevel < 25 ? "text-yas-red" : asset.batteryLevel < 50 ? "text-yas-amber" : "text-yas-green"}`}>
                      {asset.batteryLevel}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-yas-muted text-xs tabular-nums">{asset.operatingHours.toLocaleString()}h</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Claims */}
      {fleetClaims.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-yas-text mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-yas-amber" />
            Fleet Claims ({fleetClaims.length})
          </h3>
          <ClaimsTable claims={fleetClaims} />
        </div>
      )}
    </div>
  );
}
