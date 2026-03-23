"use client";

import { ArrowLeft, Shield, CheckCircle } from "lucide-react";
import type { OnboardState, AssetType, CoverageTier } from "./OnboardFlow";

interface Props {
  state: OnboardState;
  update: (patch: Partial<OnboardState>) => void;
  onBack: () => void;
  onSuccess: () => void;
}

const BASE_RATES: Record<AssetType, number> = { Robot: 1800, EV: 1400, AV: 2400 };
const GEO_MULTIPLIERS: Record<string, number> = {
  "Hong Kong": 1.0, Shenzhen: 0.85, Tokyo: 1.15, Singapore: 0.9,
};
const UTIL_MULTIPLIERS: Record<number, number> = { 4: 0.7, 8: 1.0, 12: 1.25, 16: 1.45, 24: 1.8 };
const USE_MULTIPLIERS: Record<string, number> = {
  delivery: 1.15, warehouse: 0.9, patrol: 1.0, transport: 1.1, mixed: 1.05, "": 1.05,
};
const TIER_MULTIPLIERS: Record<CoverageTier, number> = { Essential: 0.7, Standard: 1.0, Comprehensive: 1.45 };

function calcFleetPremium(state: OnboardState, tier: CoverageTier): number {
  const geo = GEO_MULTIPLIERS[state.hqLocation] ?? 1.0;
  const util = UTIL_MULTIPLIERS[state.hoursPerDay] ?? 1.0;
  const uc = USE_MULTIPLIERS[state.useCase] ?? 1.05;
  const tm = TIER_MULTIPLIERS[tier];
  return state.assets.reduce((sum, a) => {
    const base = BASE_RATES[a.type];
    return sum + Math.round(base * geo * util * uc * tm * a.qty);
  }, 0);
}

const TIERS: { id: CoverageTier; tagline: string; features: string[] }[] = [
  {
    id: "Essential",
    tagline: "Core protection for low-risk fleets",
    features: ["Third-party liability", "Asset damage cover", "Basic telemetry monitoring", "Email support"],
  },
  {
    id: "Standard",
    tagline: "Recommended for most fleets",
    features: ["Everything in Essential", "Operational downtime cover", "ARIA real-time risk monitoring", "Priority claims processing", "24/7 support"],
  },
  {
    id: "Comprehensive",
    tagline: "Maximum protection for critical ops",
    features: ["Everything in Standard", "Full liability + cyber cover", "Regulatory compliance module", "Dedicated account manager", "SLA-backed incident response"],
  },
];

export default function Step5Coverage({ state, update, onBack, onSuccess }: Props) {
  const canActivate = state.agreedToTerms && state.coverageStartDate !== "";

  return (
    <div className="pb-28 md:pb-8 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-yas-text mb-0.5">Coverage Selection & Activation</h2>
        <p className="text-xs text-yas-subtext">Choose your coverage tier and activate your fleet.</p>
      </div>

      {/* Coverage Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TIERS.map(({ id, tagline, features }) => {
          const active = state.coverageTier === id;
          const premium = calcFleetPremium(state, id);
          const isRecommended = id === "Standard";

          return (
            <button
              key={id}
              onClick={() => update({ coverageTier: id })}
              className="text-left p-5 rounded-2xl transition-all duration-200 relative"
              style={{
                background: active ? "rgba(20,184,166,0.1)" : "rgba(15,22,40,0.8)",
                border: `1px solid ${active ? "rgba(20,184,166,0.4)" : "rgba(255,255,255,0.07)"}`,
                boxShadow: active ? "0 0 20px rgba(20,184,166,0.1)" : "none",
              }}
            >
              {isRecommended && (
                <span
                  className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap"
                  style={{ background: "#14B8A6", color: "#fff" }}
                >
                  Recommended
                </span>
              )}

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-yas-text">{id}</span>
                {active && <CheckCircle className="w-4 h-4" style={{ color: "#14B8A6" }} />}
              </div>

              <p className="text-xs text-yas-muted mb-3">{tagline}</p>

              <div className="mb-4">
                <span className="text-xl font-bold text-yas-teal">HK${premium.toLocaleString()}</span>
                <span className="text-xs text-yas-muted">/mo</span>
              </div>

              <ul className="space-y-1.5">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-yas-subtext">
                    <Shield className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: active ? "#14B8A6" : "#64748B" }} />
                    {f}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      {/* Total Premium Summary */}
      <div
        className="rounded-2xl px-5 py-4 flex items-center justify-between"
        style={{ background: "rgba(20,184,166,0.07)", border: "1px solid rgba(20,184,166,0.2)" }}
      >
        <div>
          <p className="text-xs text-yas-subtext">Total Fleet Monthly Premium</p>
          <p className="text-xs text-yas-muted">{state.coverageTier} tier · {state.assets.reduce((s, a) => s + a.qty, 0)} assets</p>
        </div>
        <span className="text-2xl font-bold text-yas-teal">
          HK${calcFleetPremium(state, state.coverageTier).toLocaleString()}/mo
        </span>
      </div>

      {/* Coverage Start Date */}
      <div
        className="rounded-2xl p-5 space-y-3"
        style={{ background: "rgba(15,22,40,0.8)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <label className="block text-xs font-semibold text-yas-subtext uppercase tracking-widest">
          Coverage Start Date
        </label>
        <input
          type="date"
          value={state.coverageStartDate}
          onChange={(e) => update({ coverageStartDate: e.target.value })}
          className="w-full md:w-64 px-4 py-2.5 rounded-xl text-sm text-yas-text outline-none"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            colorScheme: "dark",
          }}
        />
      </div>

      {/* Terms Checkbox */}
      <div
        className="rounded-2xl p-5"
        style={{ background: "rgba(15,22,40,0.8)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <label className="flex items-start gap-3 cursor-pointer">
          <div
            onClick={() => update({ agreedToTerms: !state.agreedToTerms })}
            className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
            style={{
              background: state.agreedToTerms ? "#14B8A6" : "rgba(255,255,255,0.06)",
              border: `1px solid ${state.agreedToTerms ? "#14B8A6" : "rgba(255,255,255,0.15)"}`,
            }}
          >
            {state.agreedToTerms && (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6L5 9L10 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <span className="text-xs text-yas-subtext leading-relaxed">
            I confirm the fleet details are accurate and agree to{" "}
            <span className="text-yas-blue cursor-pointer hover:underline">YAS coverage terms</span>.
          </span>
        </label>
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
          onClick={onSuccess}
          disabled={!canActivate}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all"
          style={{
            background: canActivate
              ? "linear-gradient(135deg, #14B8A6, #0D9488)"
              : "rgba(255,255,255,0.06)",
            color: canActivate ? "#fff" : "#64748B",
            boxShadow: canActivate ? "0 4px 24px rgba(20,184,166,0.3)" : "none",
            cursor: canActivate ? "pointer" : "not-allowed",
          }}
        >
          <Shield className="w-4 h-4" />
          Activate Fleet Coverage
        </button>
      </div>
    </div>
  );
}
