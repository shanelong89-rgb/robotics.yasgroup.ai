"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ArrowLeft, Bot, Car, Navigation, Battery, Activity, Clock, Zap, Shield, MapPin, AlertTriangle } from "lucide-react";
import dynamic from "next/dynamic";
import { assets, fleets, alerts, claims, telemetryEvents, generateRiskHistory, generateUtilizationData } from "@/lib/demo-data";
import StatusChip from "@/components/StatusChip";
import RiskScoreBadge from "@/components/RiskScoreBadge";
const AgentFAB = dynamic(() => import("@/components/AgentFAB"), { ssr: false });
const TelemetryChart = dynamic(() => import("@/components/TelemetryChart"), { ssr: false });
const FNOLPanel = dynamic(() => import("@/components/FNOLPanel"), { ssr: false });

const MiniMap = dynamic(() => import("@/components/MiniMap"), { ssr: false });

const typeIcon = { robot: Bot, ev: Car, av: Navigation };
const typeColor = { robot: "text-yas-teal", ev: "text-yas-blue", av: "text-purple-400" };
const typeBg = { robot: "bg-yas-teal/10 border-yas-teal/20", ev: "bg-yas-blue/10 border-yas-blue/20", av: "bg-purple-400/10 border-purple-400/20" };

export default function AssetPage() {
  const params = useParams();
  const assetId = params.id as string;
  const asset = assets.find(a => a.id === assetId);
  const [fnolOpen, setFnolOpen] = useState(false);
  const fleet = fleets.find(f => f.id === asset?.fleetId);
  const assetAlerts = alerts.filter(a => a.assetId === assetId);
  const assetClaims = claims.filter(c => c.assetId === assetId);
  const assetTelemetry = telemetryEvents.filter(e => e.assetId === assetId);
  const riskHistory = asset ? generateRiskHistory(assetId, asset.riskScore) : [];
  const utilData = asset ? generateUtilizationData(asset.fleetId) : [];

  if (!asset) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <p className="text-yas-muted text-lg">Asset not found</p>
          <Link href="/" className="text-yas-blue text-sm mt-2 block hover:underline">← Back to Command Center</Link>
        </div>
      </div>
    );
  }

  const Icon = typeIcon[asset.type];
  const geographyLabel: Record<string, string> = { hong_kong: "Hong Kong", shenzhen: "Shenzhen", tokyo: "Tokyo", singapore: "Singapore" };

  const ariaContext = {
    asset: {
      id: asset.id,
      name: asset.name,
      type: asset.type,
      status: asset.status,
      riskScore: asset.riskScore,
      batteryPct: asset.batteryLevel,
      faultCount: assetAlerts.filter(a => a.severity === 'critical').length,
      fleet: fleet?.name ?? asset.fleetId,
    },
    coverage: assetClaims.length > 0 ? { activeClaims: assetClaims.length } : null,
  };

  const statusGlow: Record<string, string> = {
    active: "rgba(34,197,94,0.2)",
    warning: "rgba(245,158,11,0.2)",
    critical: "rgba(239,68,68,0.25)",
    idle: "rgba(100,116,139,0.15)",
    offline: "rgba(100,116,139,0.1)",
  };

  // Live telemetry feed state
  const initialTelemetry = [
    { label: "Location", value: `${asset.lat.toFixed(4)}°N, ${asset.lng.toFixed(4)}°E` },
    { label: "Speed", value: `${Math.round(Math.random() * 30 + 5)} km/h` },
    { label: "Battery", value: `${asset.batteryLevel}%` },
    { label: "Fault Count", value: `${asset.status === "critical" ? 3 : asset.status === "warning" ? 1 : 0}` },
    { label: "Uptime", value: `${Math.round(asset.operatingHours)}h` },
  ];
  const [liveTelemetry, setLiveTelemetry] = useState(initialTelemetry);

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTelemetry([
        { label: "Location", value: `${(asset.lat + (Math.random() - 0.5) * 0.001).toFixed(4)}°N, ${(asset.lng + (Math.random() - 0.5) * 0.001).toFixed(4)}°E` },
        { label: "Speed", value: `${Math.round(Math.random() * 30 + 5)} km/h` },
        { label: "Battery", value: `${Math.max(0, Math.min(100, asset.batteryLevel + Math.round((Math.random() - 0.5) * 2)))}%` },
        { label: "Fault Count", value: `${asset.status === "critical" ? 3 : asset.status === "warning" ? 1 : 0}` },
        { label: "Uptime", value: `${Math.round(asset.operatingHours)}h` },
      ]);
    }, 3000);
    return () => clearInterval(timer);
  }, [asset]);

  return (
    <div className="pt-4 md:pt-6 pb-24 md:pb-8 px-4 md:px-6 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-2 text-yas-muted text-sm">
          <Link href="/" className="hover:text-yas-subtext transition-colors flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            Command Center
          </Link>
          <span>/</span>
          <Link href={`/fleet/${fleet?.id}`} className="hover:text-yas-subtext transition-colors">{fleet?.name}</Link>
          <span>/</span>
          <span className="text-yas-text">{asset.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFnolOpen(true)}
            className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors"
            style={{ color: "#EF4444", borderColor: "rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)" }}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Report Incident
          </button>
          <Link
            href={`/?asset=${asset.id}`}
            className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors"
            style={{ color: "#14B8A6", borderColor: "rgba(20,184,166,0.25)", background: "rgba(20,184,166,0.08)" }}
          >
            <MapPin className="w-3.5 h-3.5" />
            VIEW ON COMMAND MAP
          </Link>
        </div>
      </div>

      {/* Asset Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 mb-6"
      >
        <div className="flex items-start gap-6">
          {/* Large type icon with ambient glow */}
          <div className="relative flex-shrink-0">
            <div
              className="absolute inset-0 rounded-2xl blur-2xl"
              style={{ background: statusGlow[asset.status] ?? "transparent", transform: "scale(1.5)" }}
            />
            <div
              className={`relative p-5 rounded-2xl border ${typeBg[asset.type]}`}
              style={{ width: "80px", height: "80px", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <Icon className={`w-10 h-10 ${typeColor[asset.type]}`} />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-bold text-yas-text tracking-tight" style={{ fontSize: "28px" }}>{asset.name}</h1>
              <StatusChip status={asset.status} />
            </div>
            <div className="flex items-center gap-4 text-xs text-yas-muted">
              <span className="font-mono">{asset.id.toUpperCase()}</span>
              <span>·</span>
              <span className="capitalize">{asset.type === "robot" ? "Delivery Robot" : asset.type === "ev" ? "Electric Vehicle" : "Autonomous Vehicle"}</span>
              <span>·</span>
              <span>{geographyLabel[asset.geography]}</span>
              <span>·</span>
              <span>{fleet?.name}</span>
            </div>
          </div>
          <RiskScoreBadge score={asset.riskScore} size="lg" />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Status Tiles */}
        <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { icon: Battery, label: "Battery", value: `${asset.batteryLevel}%`, color: asset.batteryLevel < 25 ? "text-yas-red" : asset.batteryLevel < 50 ? "text-yas-amber" : "text-yas-green", bg: "bg-yas-green/5" },
            { icon: Activity, label: "Health", value: `${asset.healthPercent}%`, color: asset.healthPercent < 70 ? "text-yas-red" : asset.healthPercent < 85 ? "text-yas-amber" : "text-yas-green", bg: "bg-yas-green/5" },
            { icon: Clock, label: "Operating Hours", value: `${asset.operatingHours.toLocaleString()}h`, color: "text-yas-text", bg: "bg-yas-blue/5" },
            { icon: Zap, label: "Premium Burn", value: `HK$${asset.premiumBurnRate}/hr`, color: "text-yas-teal", bg: "bg-yas-teal/5" },
            { icon: MapPin, label: "Location", value: geographyLabel[asset.geography], color: "text-yas-text", bg: "bg-white/[0.03]" },
            { icon: AlertTriangle, label: "Last Event", value: asset.lastEvent, color: asset.status === "critical" ? "text-yas-red" : "text-yas-amber", bg: "bg-yas-amber/5" },
          ].map(tile => (
            <div key={tile.label} className={`rounded-xl p-4 border border-white/[0.06] ${tile.bg}`}>
              <div className="flex items-center gap-2 mb-2">
                <tile.icon className="w-3.5 h-3.5 text-yas-muted" />
                <span className="text-[10px] uppercase tracking-widest text-yas-muted font-medium">{tile.label}</span>
              </div>
              <p className={`text-sm font-bold ${tile.color} leading-tight`}>{tile.value}</p>
            </div>
          ))}
        </div>

        {/* Mini Map */}
        <div className="glass-card overflow-hidden" style={{ minHeight: "200px" }}>
          <div className="p-3 border-b border-white/[0.06] flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-yas-blue" />
            <span className="text-xs text-yas-subtext font-medium">Current Position</span>
          </div>
          <div style={{ height: "calc(100% - 44px)", minHeight: "180px" }}>
            <MiniMap asset={asset} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Runtime Chart */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-yas-blue" />
            <h3 className="text-sm font-semibold text-yas-text">Runtime Utilization (24h)</h3>
          </div>
          <TelemetryChart
            data={utilData}
            dataKey="utilization"
            color="#3B82F6"
            height={160}
            gradientId="assetUtil"
          />
        </div>

        {/* Risk Score History */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-yas-amber" />
            <h3 className="text-sm font-semibold text-yas-text">Risk Score History (24h)</h3>
          </div>
          <TelemetryChart
            data={riskHistory.map((r, i) => ({ hour: `${i}:00`, score: Math.round(r.score) }))}
            dataKey="score"
            color="#F59E0B"
            height={160}
            gradientId="riskGradient"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Telemetry Stream */}
        <div className="md:col-span-2 glass-card p-5">
          <h3 className="text-sm font-semibold text-yas-text mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-yas-teal" />
            Telemetry Stream
          </h3>
          <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
            {assetTelemetry.length === 0 ? (
              <p className="text-yas-muted text-sm">No recent telemetry</p>
            ) : (
              assetTelemetry.map(ev => (
                <div key={ev.id} className={`flex items-center gap-3 p-3 rounded-xl border ${
                  ev.severity === "critical" ? "border-yas-red/20 bg-yas-red/5" :
                  ev.severity === "warning" ? "border-yas-amber/20 bg-yas-amber/5" :
                  "border-white/[0.06] bg-white/[0.02]"
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    ev.severity === "critical" ? "bg-yas-red animate-pulse" :
                    ev.severity === "warning" ? "bg-yas-amber" : "bg-yas-green"
                  }`} />
                  <span className="text-[10px] text-yas-muted uppercase tracking-widest w-20 flex-shrink-0">{ev.type}</span>
                  <span className="text-xs text-yas-text flex-1">{String(ev.value)}{ev.unit ? ` ${ev.unit}` : ""}</span>
                  <span className="text-[10px] text-yas-muted">{new Date(ev.timestamp).toLocaleTimeString()}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* System Diagnostics */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-yas-text mb-4">System Diagnostics</h3>
          <div className="flex flex-col gap-3">
            {[
              { label: "Navigation", status: asset.status !== "critical" ? "OK" : "Fault", ok: asset.status !== "critical" },
              { label: "Motor System", status: asset.healthPercent > 70 ? "Nominal" : "Degraded", ok: asset.healthPercent > 70 },
              { label: "Sensor Array", status: asset.riskScore < 70 ? "Calibrated" : "Check", ok: asset.riskScore < 70 },
              { label: "Comms", status: "Connected", ok: true },
              { label: "Battery BMS", status: asset.batteryLevel > 20 ? "Normal" : "Critical", ok: asset.batteryLevel > 20 },
              { label: "Safety Systems", status: "Active", ok: true },
            ].map(diag => (
              <div key={diag.label} className="flex items-center justify-between">
                <span className="text-xs text-yas-subtext">{diag.label}</span>
                <span className={`text-[10px] font-semibold uppercase tracking-widest ${diag.ok ? "text-yas-green" : "text-yas-red"}`}>
                  {diag.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Telemetry Feed */}
      <div className="glass-card p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yas-green opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-yas-green"></span>
          </span>
          <h3 className="text-sm font-semibold text-yas-text">Live Telemetry Feed</h3>
          <span className="text-[9px] text-yas-green font-medium uppercase tracking-widest ml-1">Updates every 3s</span>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {liveTelemetry.map((row, i) => (
            <motion.div
              key={row.label}
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.2 }}
              className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]"
            >
              <p className="text-[9px] uppercase tracking-widest text-yas-muted mb-1 font-medium">{row.label}</p>
              <p className="text-xs font-bold text-yas-teal tabular-nums">{row.value}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Coverage Card */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-yas-teal" />
            <h3 className="text-sm font-semibold text-yas-text">Coverage</h3>
          </div>
          <div className="flex flex-col gap-3">
            {[
              { label: "Policy Status", value: "Active", color: "text-yas-green" },
              { label: "Coverage Type", value: "Comprehensive" },
              { label: "Coverage Limit", value: "HK$500,000" },
              { label: "Deductible", value: "HK$5,000" },
              { label: "Premium/mo", value: `HK$2,400`, color: "text-yas-teal" },
              { label: "Risk Multiplier", value: `${(1 + asset.riskScore / 100).toFixed(2)}×`, color: asset.riskScore > 60 ? "text-yas-red" : "text-yas-green" },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between border-b border-white/[0.04] pb-2">
                <span className="text-xs text-yas-muted">{item.label}</span>
                <span className={`text-xs font-semibold ${item.color ?? "text-yas-text"}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Incidents & Claims Timeline */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-yas-text mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yas-amber" />
            Incidents & Claims
          </h3>
          <div className="flex flex-col gap-3">
            {assetAlerts.length === 0 && assetClaims.length === 0 ? (
              <div className="text-center py-6">
                <div className="text-yas-green text-2xl mb-2">✓</div>
                <p className="text-yas-muted text-sm">No incidents</p>
              </div>
            ) : (
              <>
                {assetAlerts.map(alert => (
                  <div key={alert.id} className={`p-3 rounded-xl border ${alert.severity === "critical" ? "border-yas-red/20 bg-yas-red/5" : "border-yas-amber/20 bg-yas-amber/5"}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-yas-text">{alert.title}</span>
                      <span className={`text-[9px] uppercase font-bold ${alert.severity === "critical" ? "text-yas-red" : "text-yas-amber"}`}>{alert.severity}</span>
                    </div>
                    <p className="text-[11px] text-yas-muted">{new Date(alert.timestamp).toLocaleString()}</p>
                  </div>
                ))}
                {assetClaims.map(claim => (
                  <div key={claim.id} className="p-3 rounded-xl border border-yas-blue/20 bg-yas-blue/5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-yas-text">{claim.title}</span>
                      <span className="text-[9px] uppercase font-bold text-yas-blue">{claim.status.replace("_", " ")}</span>
                    </div>
                    <p className="text-[11px] text-yas-muted">{claim.currency} {claim.estimatedLoss.toLocaleString()}</p>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      <AgentFAB agents={['aria']} context={ariaContext} />
      <FNOLPanel
        isOpen={fnolOpen}
        onClose={() => setFnolOpen(false)}
        asset={{
          id: asset.id,
          name: asset.name,
          type: asset.type,
          status: asset.status,
          batteryLevel: asset.batteryLevel,
          lat: asset.lat,
          lng: asset.lng,
          geography: asset.geography,
        }}
      />
    </div>
  );
}
