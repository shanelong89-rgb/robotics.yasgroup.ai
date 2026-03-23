"use client";

import { motion } from "framer-motion";
import { AlertTriangle, TrendingUp, Shield, Zap, ChevronUp, ChevronDown } from "lucide-react";
import { fleets, assets, coveragePolicies } from "@/lib/demo-data";
import RiskScoreBadge from "@/components/RiskScoreBadge";
import StatusChip from "@/components/StatusChip";
import dynamic from "next/dynamic";
const AgentFAB = dynamic(() => import("@/components/AgentFAB"), { ssr: false });

export default function RiskPage() {
  // Risk by fleet
  const fleetRisk = fleets.map(f => {
    const fleetAssets = assets.filter(a => a.fleetId === f.id);
    const avgRisk = fleetAssets.reduce((s, a) => s + a.riskScore, 0) / fleetAssets.length;
    const highRisk = fleetAssets.filter(a => a.riskScore >= 60).length;
    const policies = coveragePolicies.filter(p => p.fleetId === f.id);
    const avgMultiplier = policies.length > 0 ? policies.reduce((s, p) => s + p.riskMultiplier, 0) / policies.length : 1.0;
    return { ...f, avgRisk, highRisk, avgMultiplier, assetCount: fleetAssets.length };
  });

  // Dynamic pricing monitors
  const pricingData = [
    { fleet: "HK Robotics Alpha", base: 0.42, multiplier: 1.18, current: 0.50, change: +0.08, currency: "HKD/hr" },
    { fleet: "Shenzhen EV Grid", base: 0.38, multiplier: 1.31, current: 0.50, change: +0.12, currency: "HKD/hr" },
    { fleet: "Tokyo AV Pilot", base: 0.55, multiplier: 1.06, current: 0.58, change: +0.03, currency: "HKD/hr" },
    { fleet: "Singapore Logistics", base: 0.44, multiplier: 1.14, current: 0.50, change: +0.06, currency: "HKD/hr" },
  ];

  // Exposure by fleet
  const exposureData = fleets.map(f => {
    const fPolicies = coveragePolicies.filter(p => p.fleetId === f.id);
    const totalExposure = fPolicies.reduce((s, p) => s + p.coverageLimit, 0);
    const premiumMonthly = fPolicies.reduce((s, p) => s + p.premiumMonthly, 0);
    return { fleet: f.name, totalExposure, premiumMonthly };
  });

  const topUpAlerts = assets.filter(a => a.riskScore >= 70 && a.status !== "offline").slice(0, 4);
  const avgRiskScore = Math.round(assets.reduce((s, a) => s + a.riskScore, 0) / assets.length);
  const ariaContext = {
    fleetRisk: fleetRisk.map(f => ({ fleet: f.name, avgRisk: Math.round(f.avgRisk), highRiskCount: f.highRisk, multiplier: f.avgMultiplier })),
    topRiskAssets: topUpAlerts.map(a => ({ name: a.name, riskScore: a.riskScore, type: a.type })),
    avgRiskScore,
    totalAssets: assets.length,
  };

  return (
    <div className="pt-4 md:pt-6 pb-24 md:pb-8 px-4 md:px-6 max-w-7xl mx-auto">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-yas-text tracking-tight mb-1">Risk & Coverage Console</h1>
        <p className="text-yas-muted text-sm">Dynamic pricing monitor, risk multipliers, and coverage intelligence</p>
      </div>

      {/* Dynamic Pricing Monitor */}
      <div className="glass-card p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <Zap className="w-4 h-4 text-yas-amber animate-pulse" />
          <h2 className="text-sm font-semibold text-yas-text">Dynamic Pricing Monitor</h2>
          <div className="ml-2 px-2 py-0.5 rounded-full bg-yas-amber/10 border border-yas-amber/20 text-yas-amber text-[9px] uppercase tracking-widest font-bold">Live</div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {pricingData.map((item, i) => (
            <motion.div
              key={item.fleet}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]"
            >
              <p className="text-[10px] uppercase tracking-widest text-yas-muted mb-3 font-medium">{item.fleet}</p>
              <p className="text-2xl font-bold text-yas-text tabular-nums">
                HK${item.current.toFixed(2)}<span className="text-xs text-yas-muted font-normal ml-1">/hr</span>
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-yas-muted">Base: HK${item.base.toFixed(2)}</span>
                <div className="flex items-center gap-1">
                  {item.change > 0 ? (
                    <ChevronUp className="w-3 h-3 text-yas-red" />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-yas-green" />
                  )}
                  <span className={`text-[11px] font-semibold ${item.change > 0 ? "text-yas-red" : "text-yas-green"}`}>
                    {item.change > 0 ? "+" : ""}{item.change.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[10px] text-yas-muted">Multiplier</span>
                <span className="text-xs font-semibold text-yas-amber">{item.multiplier.toFixed(2)}×</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Risk Multiplier Table by Fleet */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-4 h-4 text-yas-red" />
            <h2 className="text-sm font-semibold text-yas-text">Risk Multiplier by Fleet</h2>
          </div>
          {/* Risk tier badge helper */}
          {(() => {
            const riskTierBadge = (score: number) => {
              if (score >= 80) return <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-red-500/10 border border-red-500/30 text-red-400">Critical</span>;
              if (score >= 60) return <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-orange-400/10 border border-orange-400/30 text-orange-400">High</span>;
              if (score >= 31) return <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-yas-amber/10 border border-yas-amber/30 text-yas-amber">Moderate</span>;
              return <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-yas-green/10 border border-yas-green/30 text-yas-green">Low</span>;
            };
            const riskDeltas: Record<string, number> = {
              "fleet-hk-alpha": +5,
              "fleet-sz-ev": -3,
              "fleet-tky-av": +2,
              "fleet-sg-log": -7,
            };
            return (
              <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] md:min-w-0">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    {["Fleet", "Avg Risk", "Tier", "Delta", "High Risk Units", "Multiplier"].map(h => (
                      <th key={h} className="text-left pb-3 px-2 text-[10px] uppercase tracking-widest text-yas-muted font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {fleetRisk.map(f => {
                    const delta = riskDeltas[f.id] ?? 0;
                    return (
                      <tr key={f.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-2 text-xs font-medium text-yas-text">{f.name.replace(" Alpha", "").replace(" Grid", "").replace(" Pilot", "").replace(" Logistics", "")}</td>
                        <td className="py-3 px-2"><RiskScoreBadge score={f.avgRisk} size="sm" /></td>
                        <td className="py-3 px-2">{riskTierBadge(f.avgRisk)}</td>
                        <td className="py-3 px-2">
                          <span className={`text-xs font-bold tabular-nums ${delta > 0 ? "text-yas-red" : delta < 0 ? "text-yas-green" : "text-yas-muted"}`}>
                            {delta > 0 ? "+" : ""}{delta}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-xs text-yas-text tabular-nums">{f.highRisk}/{f.assetCount}</td>
                        <td className="py-3 px-2">
                          <span className={`text-sm font-bold tabular-nums ${f.avgMultiplier > 1.5 ? "text-yas-red" : f.avgMultiplier > 1.2 ? "text-yas-amber" : "text-yas-green"}`}>
                            {f.avgMultiplier.toFixed(2)}×
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              </div>
            );
          })()}
        </div>

        {/* Exposure by Fleet */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-5">
            <Shield className="w-4 h-4 text-yas-blue" />
            <h2 className="text-sm font-semibold text-yas-text">Exposure by Fleet</h2>
          </div>
          <div className="flex flex-col gap-4">
            {fleets.map((f, i) => {
              const fAssets = assets.filter(a => a.fleetId === f.id);
              const exposure = fAssets.length * 250000;
              const maxExposure = 24 * 250000;
              const pct = (exposure / maxExposure) * 100;
              return (
                <div key={f.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-yas-subtext">{f.name}</span>
                    <span className="text-xs font-semibold text-yas-text tabular-nums">HK${(exposure / 1000000).toFixed(1)}M</span>
                  </div>
                  <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ background: ["#3B82F6", "#14B8A6", "#A855F7", "#F59E0B"][i] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Policy Status Overview */}
      <div className="glass-card p-5 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <Shield className="w-4 h-4 text-yas-teal" />
          <h2 className="text-sm font-semibold text-yas-text">Policy Status Overview</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Active Policies", value: coveragePolicies.filter(p => p.status === "active").length, color: "text-yas-green", bg: "bg-yas-green/10" },
            { label: "Total Coverage", value: `HK$${(coveragePolicies.reduce((s, p) => s + p.coverageLimit, 0) / 1000000).toFixed(1)}M`, color: "text-yas-blue", bg: "bg-yas-blue/10" },
            { label: "Monthly Premium", value: `HK$${Math.round(coveragePolicies.reduce((s, p) => s + p.premiumMonthly, 0) / 1000)}K`, color: "text-yas-teal", bg: "bg-yas-teal/10" },
            { label: "Avg Multiplier", value: `${(coveragePolicies.reduce((s, p) => s + p.riskMultiplier, 0) / coveragePolicies.length).toFixed(2)}×`, color: "text-yas-amber", bg: "bg-yas-amber/10" },
            { label: "Expiring Soon", value: "0", color: "text-yas-muted", bg: "bg-white/[0.04]" },
          ].map(stat => (
            <div key={stat.label} className={`rounded-xl p-3 md:p-4 ${stat.bg} border border-white/[0.06]`}>
              <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-yas-muted mb-1.5 truncate">{stat.label}</p>
              <p className={`text-lg md:text-xl font-bold tabular-nums truncate ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Top-up Prompts */}
      {topUpAlerts.length > 0 && (
        <div className="glass-card p-5 border border-yas-red/20">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-yas-red animate-pulse" />
            <h2 className="text-sm font-semibold text-yas-text">Coverage Top-up Recommended</h2>
          </div>
          <div className="flex flex-col gap-3">
            {topUpAlerts.map(asset => (
              <div key={asset.id} className="flex items-center justify-between p-3 rounded-xl bg-yas-red/5 border border-yas-red/20">
                <div className="flex-1 min-w-0 mr-3">
                  <p className="text-xs font-semibold text-yas-text truncate">{asset.name}</p>
                  <p className="text-[10px] text-yas-muted mt-0.5">Risk elevated — review coverage limits</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <RiskScoreBadge score={asset.riskScore} size="sm" />
                  <StatusChip status={asset.status} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <AgentFAB agents={['aria']} context={ariaContext} />
    </div>
  );
}
