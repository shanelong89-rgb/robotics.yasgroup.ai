"use client";

import { ChevronRight } from "lucide-react";
import type { OnboardState, IndustryVertical, HQLocation } from "./OnboardFlow";

interface Props {
  state: OnboardState;
  update: (patch: Partial<OnboardState>) => void;
  onNext: () => void;
}

const INDUSTRIES: IndustryVertical[] = ["Logistics", "Retail", "Healthcare", "Manufacturing", "Security", "Other"];
const LOCATIONS: HQLocation[] = ["Hong Kong", "Shenzhen", "Tokyo", "Singapore"];
const HEAR_ABOUT = ["Referral", "LinkedIn", "Google", "Event", "Other"];

function inputClass() {
  return "w-full px-4 py-2.5 rounded-xl text-sm text-yas-text placeholder-yas-muted outline-none transition-all duration-200";
}

function inputStyle(focused?: boolean) {
  return {
    background: "rgba(255,255,255,0.04)",
    border: `1px solid ${focused ? "rgba(20,184,166,0.5)" : "rgba(255,255,255,0.08)"}`,
  };
}

export default function Step1Company({ state, update, onNext }: Props) {
  const canProceed =
    state.companyName.trim() !== "" &&
    state.industry !== "" &&
    state.hqLocation !== "" &&
    state.contactName.trim() !== "" &&
    state.contactEmail.trim() !== "";

  return (
    <div className="pb-28 md:pb-8 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-yas-text mb-0.5">Company Profile</h2>
        <p className="text-xs text-yas-subtext">Tell us about your organisation and primary contact.</p>
      </div>

      <div
        className="rounded-2xl p-5 space-y-4"
        style={{ background: "rgba(15,22,40,0.8)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        {/* Company Name */}
        <div>
          <label className="block text-xs font-medium text-yas-subtext mb-1.5">Company Name *</label>
          <input
            type="text"
            value={state.companyName}
            onChange={(e) => update({ companyName: e.target.value })}
            placeholder="e.g. Robofleet Asia Ltd."
            className={inputClass()}
            style={inputStyle()}
          />
        </div>

        {/* Industry Vertical */}
        <div>
          <label className="block text-xs font-medium text-yas-subtext mb-1.5">Industry Vertical *</label>
          <div className="flex flex-wrap gap-2">
            {INDUSTRIES.map((ind) => (
              <button
                key={ind}
                onClick={() => update({ industry: ind })}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
                style={{
                  background: state.industry === ind ? "rgba(20,184,166,0.15)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${state.industry === ind ? "rgba(20,184,166,0.5)" : "rgba(255,255,255,0.08)"}`,
                  color: state.industry === ind ? "#14B8A6" : "#94A3B8",
                }}
              >
                {ind}
              </button>
            ))}
          </div>
        </div>

        {/* Fleet HQ Location */}
        <div>
          <label className="block text-xs font-medium text-yas-subtext mb-1.5">Fleet HQ Location *</label>
          <div className="flex flex-wrap gap-2">
            {LOCATIONS.map((loc) => (
              <button
                key={loc}
                onClick={() => update({ hqLocation: loc })}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
                style={{
                  background: state.hqLocation === loc ? "rgba(20,184,166,0.15)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${state.hqLocation === loc ? "rgba(20,184,166,0.5)" : "rgba(255,255,255,0.08)"}`,
                  color: state.hqLocation === loc ? "#14B8A6" : "#94A3B8",
                }}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Details */}
      <div
        className="rounded-2xl p-5 space-y-4"
        style={{ background: "rgba(15,22,40,0.8)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <h3 className="text-xs font-semibold text-yas-subtext uppercase tracking-widest">Primary Contact</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-yas-subtext mb-1.5">Full Name *</label>
            <input
              type="text"
              value={state.contactName}
              onChange={(e) => update({ contactName: e.target.value })}
              placeholder="Jane Smith"
              className={inputClass()}
              style={inputStyle()}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-yas-subtext mb-1.5">Email Address *</label>
            <input
              type="email"
              value={state.contactEmail}
              onChange={(e) => update({ contactEmail: e.target.value })}
              placeholder="jane@company.com"
              className={inputClass()}
              style={inputStyle()}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-yas-subtext mb-1.5">Phone Number</label>
            <input
              type="tel"
              value={state.contactPhone}
              onChange={(e) => update({ contactPhone: e.target.value })}
              placeholder="+852 9123 4567"
              className={inputClass()}
              style={inputStyle()}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-yas-subtext mb-1.5">How did you hear about YAS?</label>
            <select
              value={state.hearAbout}
              onChange={(e) => update({ hearAbout: e.target.value })}
              className={inputClass()}
              style={{ ...inputStyle(), appearance: "none" as const }}
            >
              <option value="">Select (optional)</option>
              {HEAR_ABOUT.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200"
          style={{
            background: canProceed ? "linear-gradient(135deg, #3B82F6, #14B8A6)" : "rgba(255,255,255,0.06)",
            color: canProceed ? "#fff" : "#64748B",
            boxShadow: canProceed ? "0 4px 20px rgba(59,130,246,0.25)" : "none",
            cursor: canProceed ? "pointer" : "not-allowed",
          }}
        >
          Fleet Composition
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
