"use client";

import { useState } from "react";
import { FleetProfile, SelectedPlan } from "./QuoteFlow";
import { ArrowLeft, CheckCircle2, Star, Zap, Shield, Sparkles } from "lucide-react";

interface Props {
  profile: FleetProfile;
  onBack: () => void;
  onSelectPlan: (plan: SelectedPlan) => void;
}

// Premium calculation logic
function calcPremium(profile: FleetProfile, tier: "essential" | "standard" | "comprehensive"): number {
  const baseRates: Record<string, number> = { robot: 1800, ev: 1400, av: 2400, mixed: 1900 };
  const geoMultipliers: Record<string, number> = { hk: 1.0, sz: 0.85, tokyo: 1.15, sg: 0.9, multi: 1.2 };
  const utilMultipliers: Record<number, number> = { 4: 0.7, 8: 1.0, 12: 1.25, 16: 1.45, 24: 1.8 };
  const useCaseMultipliers: Record<string, number> = {
    delivery: 1.15, warehouse: 0.9, patrol: 1.0, transport: 1.1, other: 1.05,
  };
  const tierMultipliers = { essential: 0.7, standard: 1.0, comprehensive: 1.45 };

  const base = baseRates[profile.assetType ?? "ev"] ?? 1800;
  const geo = geoMultipliers[profile.geography ?? "hk"] ?? 1.0;
  const util = utilMultipliers[profile.utilization] ?? 1.0;
  const useCase = useCaseMultipliers[profile.useCase ?? "other"] ?? 1.0;
  const tierMult = tierMultipliers[tier];

  return Math.round(base * geo * util * useCase * tierMult * profile.fleetSize);
}

function formatHKD(amount: number): string {
  if (amount >= 1_000_000) return `HKD ${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `HKD ${(amount / 1_000).toFixed(0)}K`;
  return `HKD ${amount.toLocaleString()}`;
}

const PLANS = [
  {
    id: "essential" as const,
    name: "Essential" as const,
    icon: Zap,
    color: "#64748B",
    coverageLimit: 25000,
    riskMultiplier: "0.7×",
    description: "Core protection for cost-sensitive fleets",
    features: [
      "Third-party liability up to HKD 25K/asset",
      "Accidental damage coverage",
      "Basic malfunction protection",
      "24/7 claims hotline",
    ],
  },
  {
    id: "standard" as const,
    name: "Standard" as const,
    icon: Shield,
    color: "#3B82F6",
    coverageLimit: 50000,
    riskMultiplier: "1.0×",
    description: "Balanced coverage for most fleets",
    features: [
      "Third-party liability up to HKD 50K/asset",
      "Comprehensive damage coverage",
      "Cyber & data breach protection",
      "Equipment breakdown coverage",
      "Priority claims processing",
      "Annual fleet audit",
    ],
    recommended: true,
  },
  {
    id: "comprehensive" as const,
    name: "Comprehensive" as const,
    icon: Sparkles,
    color: "#14B8A6",
    coverageLimit: 100000,
    riskMultiplier: "1.45×",
    description: "Maximum protection for mission-critical fleets",
    features: [
      "Third-party liability up to HKD 100K/asset",
      "Full replacement value coverage",
      "Cyber, AI liability & data breach",
      "Business interruption coverage",
      "Regulatory compliance support",
      "Dedicated fleet risk manager",
      "Quarterly risk assessments",
    ],
  },
];

export default function Step3Coverage({ profile, onBack, onSelectPlan }: Props) {
  const [selected, setSelected] = useState<"essential" | "standard" | "comprehensive">("standard");

  const selectedPlan = PLANS.find((p) => p.id === selected)!;
  const monthlyPremium = calcPremium(profile, selected);

  return (
    <div className="pb-28 md:pb-8 space-y-6">
      <div>
        <p className="text-xs text-yas-muted mb-1">
          Based on {profile.fleetSize} {profile.assetType ?? "fleet"} assets · {profile.geography?.toUpperCase()}
        </p>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS.map((plan) => {
          const PlanIcon = plan.icon;
          const isSelected = selected === plan.id;
          const premium = calcPremium(profile, plan.id);
          const perAsset = Math.round(premium / profile.fleetSize);

          return (
            <button
              key={plan.id}
              onClick={() => setSelected(plan.id)}
              className="relative flex flex-col text-left p-5 rounded-2xl transition-all duration-300"
              style={{
                background: isSelected ? "rgba(15,22,40,0.95)" : "rgba(15,22,40,0.6)",
                border: isSelected
                  ? `1px solid ${plan.color}60`
                  : "1px solid rgba(255,255,255,0.07)",
                boxShadow: isSelected
                  ? `0 0 30px ${plan.color}20, inset 0 0 30px ${plan.color}08`
                  : "none",
              }}
            >
              {/* Recommended badge */}
              {plan.recommended && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-0.5 rounded-full text-[10px] font-bold"
                  style={{ background: "#3B82F6", color: "#fff" }}
                >
                  <Star className="w-2.5 h-2.5" />
                  Recommended
                </div>
              )}

              {/* Icon + name */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: `${plan.color}18`, border: `1px solid ${plan.color}30` }}
                  >
                    <PlanIcon className="w-4 h-4" style={{ color: plan.color }} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-yas-text">{plan.name}</p>
                    <p className="text-[10px] text-yas-muted">{plan.riskMultiplier} multiplier</p>
                  </div>
                </div>
                {isSelected && (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: plan.color }} />
                )}
              </div>

              {/* Premium */}
              <div className="mb-3">
                <p className="text-xl font-bold" style={{ color: plan.color }}>
                  {formatHKD(premium)}
                </p>
                <p className="text-[10px] text-yas-muted">per month total</p>
                <p className="text-xs text-yas-subtext mt-0.5">
                  ~HKD {perAsset.toLocaleString()}/asset/mo
                </p>
              </div>

              {/* Coverage limit */}
              <div
                className="text-xs px-2 py-1 rounded-lg mb-3 inline-block"
                style={{ background: `${plan.color}10`, color: plan.color }}
              >
                Up to HKD {plan.coverageLimit.toLocaleString()}/asset
              </div>

              {/* Features */}
              <ul className="space-y-1.5 mt-auto">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[11px] text-yas-subtext">
                    <span className="mt-0.5 flex-shrink-0" style={{ color: plan.color }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      {/* CTA */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-3.5 rounded-xl text-sm font-medium transition-all duration-200"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#94A3B8",
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={() =>
            onSelectPlan({ name: selectedPlan.name, monthlyPremium })
          }
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all duration-200"
          style={{
            background: `linear-gradient(135deg, ${selectedPlan.color}, ${
              selectedPlan.id === "essential" ? "#94A3B8" : selectedPlan.id === "standard" ? "#14B8A6" : "#3B82F6"
            })`,
            color: "#fff",
            boxShadow: `0 4px 20px ${selectedPlan.color}30`,
          }}
        >
          Get Started with {selectedPlan.name}
          <span className="opacity-75 text-xs">→</span>
        </button>
      </div>
    </div>
  );
}
