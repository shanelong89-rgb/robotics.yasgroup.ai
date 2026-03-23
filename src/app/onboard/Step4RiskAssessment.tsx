"use client";

import { useEffect, useState } from "react";
import { ChevronRight, ArrowLeft } from "lucide-react";
import type { OnboardState, AssetType } from "./OnboardFlow";

interface Props {
  state: OnboardState;
  update: (patch: Partial<OnboardState>) => void;
  onNext: () => void;
  onBack: () => void;
}

const BASE_RATES: Record<AssetType, number> = { Robot: 1800, EV: 1400, AV: 2400 };
const GEO_MULTIPLIERS: Record<string, number> = {
  "Hong Kong": 1.0,
  Shenzhen: 0.85,
  Tokyo: 1.15,
  Singapore: 0.9,
};
const UTIL_MULTIPLIERS: Record<number, number> = { 4: 0.7, 8: 1.0, 12: 1.25, 16: 1.45, 24: 1.8 };
const USE_MULTIPLIERS: Record<string, number> = {
  delivery: 1.15, warehouse: 0.9, patrol: 1.0, transport: 1.1, mixed: 1.05, "": 1.05,
};

function calcRiskScore(state: OnboardState): number {
  let score = 35;
  if (state.useCase === "delivery" || state.useCase === "transport") score += 10;
  if (state.environments.includes("Urban")) score += 8;

  const types = new Set(state.assets.map((a) => a.type));
  types.forEach((t) => {
    if (t === "Robot") score += 8;
    else if (t === "AV") score += 12;
    else if (t === "EV") score += 4;
  });

  const totalQty = state.assets.reduce((s, a) => s + a.qty, 0);
  if (totalQty > 50) score += 5;

  return Math.min(95, score);
}

function calcAssetPremium(type: AssetType, qty: number, state: OnboardState, tierMult: number): number {
  const base = BASE_RATES[type];
  const geo = GEO_MULTIPLIERS[state.hqLocation] ?? 1.0;
  const util = UTIL_MULTIPLIERS[state.hoursPerDay] ?? 1.0;
  const uc = USE_MULTIPLIERS[state.useCase] ?? 1.05;
  return Math.round(base * geo * util * uc * tierMult * qty);
}

function getRiskTier(score: number): string {
  return score < 40 ? "Low" : score < 65 ? "Moderate" : "Elevated";
}

function getRiskColor(score: number): string {
  return score < 40 ? "#22C55E" : score < 65 ? "#F59E0B" : "#EF4444";
}

function getRecommendedPlan(score: number): string {
  return score < 40 ? "Essential" : score < 65 ? "Standard" : "Comprehensive";
}

// SVG Gauge
function RiskGauge({ score, animate }: { score: number; animate: boolean }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const arc = circumference * 0.75;
  const offset = arc - (arc * score) / 100;
  const color = getRiskColor(score);

  return (
    <div className="flex flex-col items-center">
      <svg width="180" height="140" viewBox="0 0 180 140">
        <circle
          cx="90" cy="100" r={radius} fill="none"
          stroke="rgba(255,255,255,0.06)" strokeWidth="12"
          strokeDasharray={`${arc} ${circumference}`} strokeDashoffset={0}
          strokeLinecap="round" transform="rotate(135 90 100)"
        />
        <circle
          cx="90" cy="100" r={radius} fill="none"
          stroke={color} strokeWidth="12"
          strokeDasharray={`${arc} ${circumference}`}
          strokeDashoffset={animate ? offset : arc}
          strokeLinecap="round" transform="rotate(135 90 100)"
          style={{
            transition: "stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1), stroke 0.5s ease",
            filter: `drop-shadow(0 0 8px ${color}60)`,
          }}
        />
        <text x="90" y="95" textAnchor="middle" fill="#F1F5F9" fontSize="32" fontWeight="700" fontFamily="Inter, sans-serif">
          {animate ? score : 0}
        </text>
        <text x="90" y="112" textAnchor="middle" fill="#64748B" fontSize="11" fontFamily="Inter, sans-serif">
          / 100
        </text>
      </svg>
      <span
        className="text-xs font-semibold px-3 py-1 rounded-full -mt-2"
        style={{ background: `${color}18`, color, border: `1px solid ${color}40` }}
      >
        {getRiskTier(score)} Risk
      </span>
    </div>
  );
}

export default function Step4RiskAssessment({ state, update, onNext, onBack }: Props) {
  const [loading, setLoading] = useState(true);
  const [animateGauge, setAnimateGauge] = useState(false);

  const riskScore = calcRiskScore(state);
  const tier = getRiskTier(riskScore);
  const recommended = getRecommendedPlan(riskScore);

  useEffect(() => {
    update({ riskScore });
    const t1 = setTimeout(() => setLoading(false), 2000);
    const t2 = setTimeout(() => setAnimateGauge(true), 2300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Group assets by type
  const assetGroups = state.assets.reduce<Record<AssetType, number>>((acc, a) => {
    acc[a.type] = (acc[a.type] || 0) + a.qty;
    return acc;
  }, {} as Record<AssetType, number>);

  const breakdownRows = Object.entries(assetGroups).map(([type, qty]) => {
    const t = type as AssetType;
    const premium = calcAssetPremium(t, qty, state, 1.0);
    return { type: t, qty, premium };
  });

  const totalMonthly = breakdownRows.reduce((s, r) => s + r.premium, 0);

  const locationLabel = state.hqLocation || "your region";
  const useCaseLabel: Record<string, string> = {
    delivery: "delivery", warehouse: "warehouse", patrol: "patrol",
    transport: "transport", mixed: "mixed-use", "": "general",
  };
  const summaryText = `ARIA has assessed your ${useCaseLabel[state.useCase]} fleet operating ${state.hoursPerDay} hours/day in ${locationLabel}. Your overall risk profile is ${tier.toLowerCase()} (score: ${riskScore}/100). ${recommended === "Comprehensive" ? "Given the elevated risk factors, comprehensive coverage is strongly recommended." : recommended === "Standard" ? "Standard coverage provides an optimal balance of protection and cost efficiency for your profile." : "Essential coverage provides adequate protection for your low-risk fleet profile."}`;

  return (
    <div className="pb-28 md:pb-8 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-yas-text mb-0.5">ARIA Risk Assessment</h2>
        <p className="text-xs text-yas-subtext">AI-powered fleet risk analysis based on your inputs.</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full" style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }} />
            <div
              className="absolute inset-0 rounded-full border-4 border-transparent"
              style={{ borderTopColor: "#3B82F6", borderRightColor: "#14B8A6", animation: "spin 1s linear infinite" }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-2xl">🛡️</div>
          </div>
          <div className="text-center">
            <p className="text-yas-text font-semibold text-sm">ARIA is analysing your fleet profile…</p>
            <p className="text-yas-muted text-xs mt-1">Processing {state.assets.reduce((s, a) => s + a.qty, 0)} assets across {state.environments.length} environment{state.environments.length !== 1 ? "s" : ""}…</p>
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: "#3B82F6", animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Gauge + Summary */}
          <div
            className="rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6"
            style={{ background: "rgba(15,22,40,0.8)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <RiskGauge score={riskScore} animate={animateGauge} />
            <div className="flex-1 text-center md:text-left">
              <p className="text-xs text-yas-muted uppercase tracking-widest mb-2">ARIA Risk Analysis</p>
              <p className="text-sm text-yas-text leading-relaxed">{summaryText}</p>
            </div>
          </div>

          {/* Key Insight Callout */}
          <div
            className="rounded-xl px-5 py-4 flex items-start gap-3"
            style={{ background: "rgba(20,184,166,0.07)", border: "1px solid rgba(20,184,166,0.2)" }}
          >
            <span className="text-lg mt-0.5">💡</span>
            <p className="text-xs text-yas-text leading-relaxed">
              Your <span className="text-yas-teal font-semibold">{useCaseLabel[state.useCase]}</span> fleet in{" "}
              <span className="text-yas-teal font-semibold">{locationLabel}</span> falls in the{" "}
              <span className="font-semibold" style={{ color: getRiskColor(riskScore) }}>{tier}</span> risk tier.
              Recommended coverage: <span className="text-yas-teal font-semibold">{recommended}</span>.
            </p>
          </div>

          {/* Risk Breakdown Table */}
          <div
            className="rounded-2xl p-5 space-y-3"
            style={{ background: "rgba(15,22,40,0.8)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <h3 className="text-xs font-semibold text-yas-subtext uppercase tracking-widest">Risk Breakdown</h3>
            <div className="hidden md:grid grid-cols-4 gap-3 pb-2 border-b border-white/[0.06]">
              <span className="text-[10px] text-yas-muted uppercase tracking-widest">Asset Type</span>
              <span className="text-[10px] text-yas-muted uppercase tracking-widest">Units</span>
              <span className="text-[10px] text-yas-muted uppercase tracking-widest">Risk Tier</span>
              <span className="text-[10px] text-yas-muted uppercase tracking-widest text-right">Est. Monthly</span>
            </div>
            {breakdownRows.map(({ type, qty, premium }) => {
              const typeScore = type === "AV" ? 70 : type === "Robot" ? 55 : 45;
              const typeTier = getRiskTier(typeScore);
              const typeColor = getRiskColor(typeScore);
              return (
                <div key={type} className="grid grid-cols-2 md:grid-cols-4 gap-3 items-center py-2 border-b border-white/[0.04] last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{type === "Robot" ? "🤖" : type === "EV" ? "🚗" : "🚐"}</span>
                    <span className="text-sm text-yas-text font-medium">{type}</span>
                  </div>
                  <span className="text-sm text-yas-subtext">{qty} unit{qty !== 1 ? "s" : ""}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full inline-flex w-fit"
                    style={{ background: `${typeColor}15`, color: typeColor, border: `1px solid ${typeColor}30` }}>
                    {typeTier}
                  </span>
                  <span className="text-sm font-bold text-yas-text text-right">HK${premium.toLocaleString()}/mo</span>
                </div>
              );
            })}
            <div className="flex justify-between pt-2">
              <span className="text-xs text-yas-subtext font-medium">Total Fleet (Standard)</span>
              <span className="text-base font-bold text-yas-teal">HK${totalMonthly.toLocaleString()}/mo</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#94A3B8" }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={onNext}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all"
              style={{
                background: "linear-gradient(135deg, #3B82F6, #14B8A6)",
                color: "#fff",
                boxShadow: "0 4px 20px rgba(59,130,246,0.25)",
              }}
            >
              Select Coverage
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
