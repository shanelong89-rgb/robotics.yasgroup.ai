"use client";

import { ChevronRight, ArrowLeft } from "lucide-react";
import type { OnboardState, UseCase, Environment } from "./OnboardFlow";

interface Props {
  state: OnboardState;
  update: (patch: Partial<OnboardState>) => void;
  onNext: () => void;
  onBack: () => void;
}

const USE_CASES: { id: UseCase; label: string; icon: string }[] = [
  { id: "delivery", label: "Delivery", icon: "📦" },
  { id: "warehouse", label: "Warehouse", icon: "🏭" },
  { id: "patrol", label: "Patrol", icon: "🛡️" },
  { id: "transport", label: "Transport", icon: "🚌" },
  { id: "mixed", label: "Mixed", icon: "⚡" },
];

const HOURS: (4 | 8 | 12 | 16 | 24)[] = [4, 8, 12, 16, 24];
const ENVIRONMENTS: Environment[] = ["Urban", "Indoor", "Highway", "Mixed"];

export default function Step3Operations({ state, update, onNext, onBack }: Props) {
  const canProceed = state.useCase !== "" && state.environments.length > 0;

  function toggleEnv(env: Environment) {
    const current = state.environments;
    if (current.includes(env)) {
      update({ environments: current.filter((e) => e !== env) });
    } else {
      update({ environments: [...current, env] });
    }
  }

  return (
    <div className="pb-28 md:pb-8 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-yas-text mb-0.5">Operations Profile</h2>
        <p className="text-xs text-yas-subtext">Help ARIA understand how your fleet operates.</p>
      </div>

      {/* Use Case */}
      <div
        className="rounded-2xl p-5 space-y-4"
        style={{ background: "rgba(15,22,40,0.8)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <h3 className="text-xs font-semibold text-yas-subtext uppercase tracking-widest">Primary Use Case *</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {USE_CASES.map(({ id, label, icon }) => {
            const active = state.useCase === id;
            return (
              <button
                key={id}
                onClick={() => update({ useCase: id })}
                className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200"
                style={{
                  background: active ? "rgba(20,184,166,0.12)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${active ? "rgba(20,184,166,0.4)" : "rgba(255,255,255,0.08)"}`,
                  boxShadow: active ? "0 0 12px rgba(20,184,166,0.1)" : "none",
                }}
              >
                <span className="text-2xl">{icon}</span>
                <span className="text-xs font-medium" style={{ color: active ? "#14B8A6" : "#94A3B8" }}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Operating Hours Slider */}
      <div
        className="rounded-2xl p-5 space-y-4"
        style={{ background: "rgba(15,22,40,0.8)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-yas-subtext uppercase tracking-widest">Operating Hours / Day</h3>
          <span className="text-lg font-bold text-yas-teal">{state.hoursPerDay}h</span>
        </div>

        <div className="flex gap-2">
          {HOURS.map((h) => (
            <button
              key={h}
              onClick={() => update({ hoursPerDay: h })}
              className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: state.hoursPerDay === h ? "rgba(20,184,166,0.15)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${state.hoursPerDay === h ? "rgba(20,184,166,0.4)" : "rgba(255,255,255,0.08)"}`,
                color: state.hoursPerDay === h ? "#14B8A6" : "#64748B",
              }}
            >
              {h}h
            </button>
          ))}
        </div>

        {/* Visual slider bar */}
        <div className="w-full h-1.5 rounded-full relative" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div
            className="absolute left-0 top-0 h-full rounded-full transition-all duration-300"
            style={{
              width: `${(HOURS.indexOf(state.hoursPerDay) / (HOURS.length - 1)) * 100}%`,
              background: "linear-gradient(90deg, #3B82F6, #14B8A6)",
            }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-yas-muted">
          <span>Minimal use</span>
          <span>24/7 ops</span>
        </div>
      </div>

      {/* Operating Environments */}
      <div
        className="rounded-2xl p-5 space-y-4"
        style={{ background: "rgba(15,22,40,0.8)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <h3 className="text-xs font-semibold text-yas-subtext uppercase tracking-widest">
          Operating Environments * <span className="normal-case text-yas-muted">(select all that apply)</span>
        </h3>
        <div className="flex flex-wrap gap-2">
          {ENVIRONMENTS.map((env) => {
            const active = state.environments.includes(env);
            return (
              <button
                key={env}
                onClick={() => toggleEnv(env)}
                className="px-4 py-2 rounded-full text-xs font-medium transition-all duration-200"
                style={{
                  background: active ? "rgba(59,130,246,0.12)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${active ? "rgba(59,130,246,0.4)" : "rgba(255,255,255,0.08)"}`,
                  color: active ? "#3B82F6" : "#94A3B8",
                }}
              >
                {env}
              </button>
            );
          })}
        </div>
      </div>

      {/* Existing Insurance */}
      <div
        className="rounded-2xl p-5 space-y-4"
        style={{ background: "rgba(15,22,40,0.8)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-yas-subtext uppercase tracking-widest">Existing Insurance?</h3>
            <p className="text-xs text-yas-muted mt-0.5">Do you currently have fleet insurance coverage?</p>
          </div>
          {/* Toggle */}
          <button
            onClick={() => update({ hasExistingInsurance: !state.hasExistingInsurance })}
            className="w-12 h-6 rounded-full transition-all duration-300 relative flex-shrink-0"
            style={{
              background: state.hasExistingInsurance ? "#14B8A6" : "rgba(255,255,255,0.1)",
            }}
          >
            <div
              className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300"
              style={{ left: state.hasExistingInsurance ? "calc(100% - 22px)" : "2px" }}
            />
          </button>
        </div>

        {state.hasExistingInsurance && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-medium text-yas-subtext mb-1.5">Current Insurer</label>
              <input
                type="text"
                value={state.existingInsurer}
                onChange={(e) => update({ existingInsurer: e.target.value })}
                placeholder="e.g. AIA, Zurich, AXA"
                className="w-full px-3 py-2.5 rounded-xl text-sm text-yas-text placeholder-yas-muted outline-none"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-yas-subtext mb-1.5">Annual Premium (HKD)</label>
              <input
                type="number"
                value={state.existingPremium}
                onChange={(e) => update({ existingPremium: e.target.value })}
                placeholder="e.g. 120000"
                className="w-full px-3 py-2.5 rounded-xl text-sm text-yas-text placeholder-yas-muted outline-none"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all"
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
          onClick={onNext}
          disabled={!canProceed}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all"
          style={{
            background: canProceed ? "linear-gradient(135deg, #3B82F6, #14B8A6)" : "rgba(255,255,255,0.06)",
            color: canProceed ? "#fff" : "#64748B",
            boxShadow: canProceed ? "0 4px 20px rgba(59,130,246,0.25)" : "none",
            cursor: canProceed ? "pointer" : "not-allowed",
          }}
        >
          Run ARIA Assessment
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
