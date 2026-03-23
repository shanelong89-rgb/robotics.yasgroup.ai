"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Step1Company from "./Step1Company";
import Step2Fleet from "./Step2Fleet";
import Step3Operations from "./Step3Operations";
import Step4RiskAssessment from "./Step4RiskAssessment";
import Step5Coverage from "./Step5Coverage";
import SuccessScreen from "./SuccessScreen";

const AgentFAB = dynamic(() => import("@/components/AgentFAB"), { ssr: false });

export type IndustryVertical = "Logistics" | "Retail" | "Healthcare" | "Manufacturing" | "Security" | "Other";
export type HQLocation = "Hong Kong" | "Shenzhen" | "Tokyo" | "Singapore";
export type AssetType = "Robot" | "EV" | "AV";
export type UseCase = "delivery" | "warehouse" | "patrol" | "transport" | "mixed";
export type Environment = "Urban" | "Indoor" | "Highway" | "Mixed";
export type CoverageTier = "Essential" | "Standard" | "Comprehensive";

export interface AssetRow {
  name: string;
  type: AssetType;
  qty: number;
}

export interface OnboardState {
  // Step 1
  companyName: string;
  industry: IndustryVertical | "";
  hqLocation: HQLocation | "";
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  hearAbout: string;

  // Step 2
  assets: AssetRow[];

  // Step 3
  useCase: UseCase | "";
  hoursPerDay: 4 | 8 | 12 | 16 | 24;
  environments: Environment[];
  hasExistingInsurance: boolean;
  existingInsurer: string;
  existingPremium: string;

  // Step 4 (derived)
  riskScore: number;

  // Step 5
  coverageTier: CoverageTier;
  coverageStartDate: string;
  agreedToTerms: boolean;
}

function defaultStartDate() {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().split("T")[0];
}

const defaultState: OnboardState = {
  companyName: "",
  industry: "",
  hqLocation: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  hearAbout: "",
  assets: [{ name: "", type: "Robot", qty: 1 }],
  useCase: "",
  hoursPerDay: 8,
  environments: [],
  hasExistingInsurance: false,
  existingInsurer: "",
  existingPremium: "",
  riskScore: 0,
  coverageTier: "Standard",
  coverageStartDate: defaultStartDate(),
  agreedToTerms: false,
};

const STEPS = [
  { n: 1, label: "Company Profile" },
  { n: 2, label: "Fleet Composition" },
  { n: 3, label: "Operations Profile" },
  { n: 4, label: "ARIA Risk Assessment" },
  { n: 5, label: "Coverage & Activation" },
];

export default function OnboardFlow() {
  const [step, setStep] = useState(1);
  const [state, setState] = useState<OnboardState>(defaultState);
  const [success, setSuccess] = useState(false);
  const [refNumber] = useState(() => `YAS-${Math.floor(100000 + Math.random() * 900000)}`);

  const update = (patch: Partial<OnboardState>) =>
    setState((s) => ({ ...s, ...patch }));

  const handleNext = () => setStep((s) => Math.min(s + 1, 5));
  const handleBack = () => setStep((s) => Math.max(s - 1, 1));
  const handleSuccess = () => setSuccess(true);

  const agentContext = {
    currentStep: step,
    companyName: state.companyName,
    assets: state.assets,
    useCase: state.useCase,
    hqLocation: state.hqLocation,
  };

  if (success) {
    return <SuccessScreen refNumber={refNumber} />;
  }

  return (
    <div
      className="min-h-screen pb-24 md:pb-8"
      style={{ background: "linear-gradient(180deg, #020203 0%, #0A0E1A 100%)" }}
    >
      {/* Header */}
      <div className="max-w-5xl mx-auto px-4 pt-4 md:pt-8 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <span
            className="text-xs font-semibold tracking-widest uppercase px-2.5 py-1 rounded-full"
            style={{ background: "rgba(20,184,166,0.12)", color: "#14B8A6", border: "1px solid rgba(20,184,166,0.25)" }}
          >
            Fleet Onboarding
          </span>
          <span className="text-xs text-yas-muted">Powered by ARIA</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-yas-text tracking-tight">
          Onboard Your Fleet
        </h1>
        <p className="text-sm text-yas-subtext mt-1">
          Set up your fleet profile and get covered in under 5 minutes.
        </p>
      </div>

      {/* Mobile Progress Bar */}
      <div className="md:hidden max-w-5xl mx-auto px-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-yas-subtext">Step {step} of 5</span>
          <span className="text-xs text-yas-teal font-medium">{STEPS[step - 1].label}</span>
        </div>
        <div className="w-full h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${(step / 5) * 100}%`,
              background: "linear-gradient(90deg, #3B82F6, #14B8A6)",
              transition: "width 0.4s ease",
            }}
          />
        </div>
      </div>

      {/* Main Layout */}
      <div className="max-w-5xl mx-auto px-4 flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-56 flex-shrink-0 gap-1 pt-2">
          {STEPS.map(({ n, label }) => {
            const done = step > n;
            const active = step === n;
            return (
              <div
                key={n}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200"
                style={{
                  background: active ? "rgba(20,184,166,0.1)" : "transparent",
                  border: active ? "1px solid rgba(20,184,166,0.25)" : "1px solid transparent",
                }}
              >
                {/* Icon */}
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-300"
                  style={{
                    background: done
                      ? "#14B8A6"
                      : active
                      ? "linear-gradient(135deg, #3B82F6, #14B8A6)"
                      : "rgba(255,255,255,0.06)",
                    color: done || active ? "#fff" : "#64748B",
                    boxShadow: active ? "0 0 12px rgba(20,184,166,0.3)" : "none",
                  }}
                >
                  {done ? "✓" : n}
                </div>
                <span
                  className="text-xs font-medium leading-tight"
                  style={{ color: active ? "#F1F5F9" : done ? "#14B8A6" : "#64748B" }}
                >
                  {label}
                </span>
              </div>
            );
          })}

          {/* Divider */}
          <div className="my-4 h-px bg-white/[0.06]" />

          {/* ARIA sidebar note */}
          <div
            className="rounded-xl p-3"
            style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)" }}
          >
            <p className="text-[10px] text-yas-subtext leading-relaxed">
              <span className="text-yas-blue font-semibold">ARIA</span> will assess your fleet risk in Step 4 and recommend the optimal coverage tier.
            </p>
          </div>
        </aside>

        {/* Step Content */}
        <div className="flex-1 relative overflow-hidden">
          {/* Step 1 */}
          <div
            style={{
              opacity: step === 1 ? 1 : 0,
              transform: step === 1 ? "translateX(0)" : step > 1 ? "translateX(-40px)" : "translateX(40px)",
              pointerEvents: step === 1 ? "auto" : "none",
              position: step === 1 ? "relative" : "absolute",
              top: 0, left: 0, right: 0,
              transition: "opacity 0.3s ease, transform 0.3s ease",
            }}
          >
            <Step1Company state={state} update={update} onNext={handleNext} />
          </div>

          {/* Step 2 */}
          <div
            style={{
              opacity: step === 2 ? 1 : 0,
              transform: step === 2 ? "translateX(0)" : step > 2 ? "translateX(-40px)" : "translateX(40px)",
              pointerEvents: step === 2 ? "auto" : "none",
              position: step === 2 ? "relative" : "absolute",
              top: 0, left: 0, right: 0,
              transition: "opacity 0.3s ease, transform 0.3s ease",
            }}
          >
            {step >= 2 && <Step2Fleet state={state} update={update} onNext={handleNext} onBack={handleBack} />}
          </div>

          {/* Step 3 */}
          <div
            style={{
              opacity: step === 3 ? 1 : 0,
              transform: step === 3 ? "translateX(0)" : step > 3 ? "translateX(-40px)" : "translateX(40px)",
              pointerEvents: step === 3 ? "auto" : "none",
              position: step === 3 ? "relative" : "absolute",
              top: 0, left: 0, right: 0,
              transition: "opacity 0.3s ease, transform 0.3s ease",
            }}
          >
            {step >= 3 && <Step3Operations state={state} update={update} onNext={handleNext} onBack={handleBack} />}
          </div>

          {/* Step 4 */}
          <div
            style={{
              opacity: step === 4 ? 1 : 0,
              transform: step === 4 ? "translateX(0)" : step > 4 ? "translateX(-40px)" : "translateX(40px)",
              pointerEvents: step === 4 ? "auto" : "none",
              position: step === 4 ? "relative" : "absolute",
              top: 0, left: 0, right: 0,
              transition: "opacity 0.3s ease, transform 0.3s ease",
            }}
          >
            {step >= 4 && <Step4RiskAssessment state={state} update={update} onNext={handleNext} onBack={handleBack} />}
          </div>

          {/* Step 5 */}
          <div
            style={{
              opacity: step === 5 ? 1 : 0,
              transform: step === 5 ? "translateX(0)" : "translateX(40px)",
              pointerEvents: step === 5 ? "auto" : "none",
              position: step === 5 ? "relative" : "absolute",
              top: 0, left: 0, right: 0,
              transition: "opacity 0.3s ease, transform 0.3s ease",
            }}
          >
            {step === 5 && <Step5Coverage state={state} update={update} onBack={handleBack} onSuccess={handleSuccess} />}
          </div>
        </div>
      </div>

      <AgentFAB agents={["aria"]} context={agentContext} />
    </div>
  );
}
