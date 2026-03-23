"use client";

import { FleetProfile } from "./QuoteFlow";
import { ChevronRight } from "lucide-react";

interface Props {
  profile: FleetProfile;
  setProfile: (p: FleetProfile) => void;
  onNext: () => void;
}

const assetTypes = [
  { id: "robot", emoji: "🤖", label: "Robot", sub: "Delivery / Service" },
  { id: "ev", emoji: "🚗", label: "EV Fleet", sub: "Electric Vehicles" },
  { id: "av", emoji: "🚐", label: "Autonomous Vehicle", sub: "AV / Self-driving" },
  { id: "mixed", emoji: "🔀", label: "Mixed Fleet", sub: "Multiple asset types" },
] as const;

const geoOptions = [
  { id: "hk", label: "HK" },
  { id: "sz", label: "Shenzhen" },
  { id: "tokyo", label: "Tokyo" },
  { id: "sg", label: "Singapore" },
  { id: "multi", label: "Multi-region" },
] as const;

const useCaseOptions = [
  { id: "delivery", label: "Delivery" },
  { id: "warehouse", label: "Warehouse" },
  { id: "patrol", label: "Patrol" },
  { id: "transport", label: "Transport" },
  { id: "other", label: "Other" },
] as const;

const utilizationSteps = [4, 8, 12, 16, 24] as const;

function utilizationLabel(h: number) {
  if (h <= 4) return "Light";
  if (h <= 8) return "Normal";
  if (h <= 12) return "Active";
  if (h <= 16) return "Heavy";
  return "24/7";
}

export default function Step1FleetProfile({ profile, setProfile, onNext }: Props) {
  const isValid = profile.assetType && profile.geography && profile.useCase;

  const set = (partial: Partial<FleetProfile>) => setProfile({ ...profile, ...partial });

  const utilizationIndex = utilizationSteps.indexOf(profile.utilization as typeof utilizationSteps[number]);

  return (
    <div className="space-y-8 pb-28 md:pb-8">
      {/* Asset Type */}
      <section>
        <h2 className="text-sm font-semibold text-yas-text mb-3">Asset Type</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {assetTypes.map((a) => {
            const active = profile.assetType === a.id;
            return (
              <button
                key={a.id}
                onClick={() => set({ assetType: a.id })}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-200"
                style={{
                  background: active ? "rgba(20,184,166,0.12)" : "rgba(255,255,255,0.03)",
                  border: active
                    ? "1px solid rgba(20,184,166,0.5)"
                    : "1px solid rgba(255,255,255,0.07)",
                  boxShadow: active ? "0 0 20px rgba(20,184,166,0.15)" : "none",
                }}
              >
                <span className="text-3xl">{a.emoji}</span>
                <div className="text-center">
                  <p className="text-xs font-semibold text-yas-text">{a.label}</p>
                  <p className="text-[10px] text-yas-muted mt-0.5">{a.sub}</p>
                </div>
                {active && (
                  <span
                    className="w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ background: "#14B8A6" }}
                  >
                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                      <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Fleet Size */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-yas-text">Fleet Size</h2>
          <div
            className="flex items-center gap-2 px-3 py-1 rounded-lg"
            style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)" }}
          >
            <input
              type="number"
              min={1}
              max={500}
              value={profile.fleetSize}
              onChange={(e) => {
                const v = Math.max(1, Math.min(500, Number(e.target.value)));
                set({ fleetSize: v });
              }}
              className="w-12 bg-transparent text-yas-blue font-bold text-sm text-center outline-none"
            />
            <span className="text-xs text-yas-subtext">assets</span>
          </div>
        </div>
        <input
          type="range"
          min={1}
          max={500}
          value={profile.fleetSize}
          onChange={(e) => set({ fleetSize: Number(e.target.value) })}
          className="w-full h-1.5 rounded-full outline-none appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #3B82F6 ${(profile.fleetSize / 500) * 100}%, rgba(255,255,255,0.1) ${(profile.fleetSize / 500) * 100}%)`,
          }}
        />
        <div className="flex justify-between text-[10px] text-yas-muted mt-1">
          <span>1</span>
          <span>500</span>
        </div>
      </section>

      {/* Geography */}
      <section>
        <h2 className="text-sm font-semibold text-yas-text mb-3">Geography</h2>
        <div className="flex flex-wrap gap-2">
          {geoOptions.map((g) => {
            const active = profile.geography === g.id;
            return (
              <button
                key={g.id}
                onClick={() => set({ geography: g.id })}
                className="px-4 py-2 rounded-full text-xs font-medium transition-all duration-200"
                style={{
                  background: active ? "rgba(20,184,166,0.15)" : "rgba(255,255,255,0.05)",
                  border: active ? "1px solid rgba(20,184,166,0.5)" : "1px solid rgba(255,255,255,0.08)",
                  color: active ? "#14B8A6" : "#94A3B8",
                  boxShadow: active ? "0 0 12px rgba(20,184,166,0.1)" : "none",
                }}
              >
                {g.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Utilization */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-yas-text">Daily Utilization</h2>
          <span className="text-xs font-bold" style={{ color: "#F59E0B" }}>
            {profile.utilization}h/day — {utilizationLabel(profile.utilization)}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={4}
          step={1}
          value={utilizationIndex}
          onChange={(e) => {
            const idx = Number(e.target.value);
            set({ utilization: utilizationSteps[idx] });
          }}
          className="w-full h-1.5 rounded-full outline-none appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #F59E0B ${(utilizationIndex / 4) * 100}%, rgba(255,255,255,0.1) ${(utilizationIndex / 4) * 100}%)`,
          }}
        />
        <div className="flex justify-between text-[10px] text-yas-muted mt-1">
          {utilizationSteps.map((h) => (
            <span key={h}>{h}h</span>
          ))}
        </div>
      </section>

      {/* Use Case */}
      <section>
        <h2 className="text-sm font-semibold text-yas-text mb-3">Use Case</h2>
        <div className="flex flex-wrap gap-2">
          {useCaseOptions.map((u) => {
            const active = profile.useCase === u.id;
            return (
              <button
                key={u.id}
                onClick={() => set({ useCase: u.id })}
                className="px-4 py-2 rounded-full text-xs font-medium transition-all duration-200"
                style={{
                  background: active ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.05)",
                  border: active ? "1px solid rgba(59,130,246,0.5)" : "1px solid rgba(255,255,255,0.08)",
                  color: active ? "#3B82F6" : "#94A3B8",
                  boxShadow: active ? "0 0 12px rgba(59,130,246,0.1)" : "none",
                }}
              >
                {u.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <div className="pt-2">
        <button
          onClick={onNext}
          disabled={!isValid}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200"
          style={{
            background: isValid
              ? "linear-gradient(135deg, #3B82F6, #14B8A6)"
              : "rgba(255,255,255,0.06)",
            color: isValid ? "#fff" : "#64748B",
            cursor: isValid ? "pointer" : "not-allowed",
            boxShadow: isValid ? "0 4px 20px rgba(59,130,246,0.25)" : "none",
          }}
        >
          Calculate Risk Profile
          <ChevronRight className="w-4 h-4" />
        </button>
        {!isValid && (
          <p className="text-center text-xs text-yas-muted mt-2">
            Please select asset type, geography, and use case to continue
          </p>
        )}
      </div>
    </div>
  );
}
