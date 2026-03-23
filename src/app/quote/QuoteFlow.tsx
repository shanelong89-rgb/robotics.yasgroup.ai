"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Step1FleetProfile from "./Step1FleetProfile";
import Step2RiskAssessment from "./Step2RiskAssessment";
import Step3Coverage from "./Step3Coverage";
import LeadCaptureModal from "./LeadCaptureModal";

const AgentFAB = dynamic(() => import("@/components/AgentFAB"), { ssr: false });

export interface FleetProfile {
  assetType: "robot" | "ev" | "av" | "mixed" | null;
  fleetSize: number;
  geography: "hk" | "sz" | "tokyo" | "sg" | "multi" | null;
  utilization: 4 | 8 | 12 | 16 | 24;
  useCase: "delivery" | "warehouse" | "patrol" | "transport" | "other" | null;
}

export interface SelectedPlan {
  name: "Essential" | "Standard" | "Comprehensive";
  monthlyPremium: number;
}

const defaultProfile: FleetProfile = {
  assetType: null,
  fleetSize: 10,
  geography: null,
  utilization: 8,
  useCase: null,
};

export default function QuoteFlow() {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<FleetProfile>(defaultProfile);
  const [selectedPlan, setSelectedPlan] = useState<SelectedPlan | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleNext = useCallback(() => {
    setStep((s) => Math.min(s + 1, 3));
  }, []);

  const handleBack = useCallback(() => {
    setStep((s) => Math.max(s - 1, 1));
  }, []);

  const handleSelectPlan = useCallback((plan: SelectedPlan) => {
    setSelectedPlan(plan);
    setModalOpen(true);
  }, []);

  const agentContext = {
    currentStep: step,
    assetType: profile.assetType,
    fleetSize: profile.fleetSize,
    geography: profile.geography,
    utilization: profile.utilization,
    useCase: profile.useCase,
    selectedPlan: selectedPlan?.name ?? null,
  };

  return (
    <div
      className="min-h-screen pb-24 md:pb-6"
      style={{ background: "linear-gradient(180deg, #020203 0%, #0A0E1A 100%)" }}
    >
      {/* Header */}
      <div className="max-w-3xl mx-auto px-4 pt-4 md:pt-8 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <span
            className="text-xs font-semibold tracking-widest uppercase px-2.5 py-1 rounded-full"
            style={{ background: "rgba(20,184,166,0.12)", color: "#14B8A6", border: "1px solid rgba(20,184,166,0.25)" }}
          >
            Instant Quote
          </span>
          <span className="text-xs text-yas-muted">Powered by ARIA</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-yas-text tracking-tight">
          Fleet Coverage Quote
        </h1>
        <p className="text-sm text-yas-subtext mt-1">
          Get a personalised coverage estimate in under 60 seconds.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="max-w-3xl mx-auto px-4 mb-5 md:mb-8">
        <div className="flex items-center gap-0">
          {[
            { n: 1, label: "Fleet Profile" },
            { n: 2, label: "Risk Assessment" },
            { n: 3, label: "Coverage Options" },
          ].map(({ n, label }, i, arr) => (
            <div key={n} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
                  style={{
                    background:
                      step > n
                        ? "#14B8A6"
                        : step === n
                        ? "linear-gradient(135deg, #3B82F6, #14B8A6)"
                        : "rgba(255,255,255,0.06)",
                    color: step >= n ? "#fff" : "#64748B",
                    border: step === n ? "none" : step > n ? "none" : "1px solid rgba(255,255,255,0.1)",
                    boxShadow: step === n ? "0 0 16px rgba(20,184,166,0.3)" : "none",
                  }}
                >
                  {step > n ? "✓" : n}
                </div>
                <span
                  className="text-[10px] font-medium whitespace-nowrap"
                  style={{ color: step >= n ? "#F1F5F9" : "#64748B" }}
                >
                  {label}
                </span>
              </div>
              {i < arr.length - 1 && (
                <div
                  className="flex-1 h-[1px] mt-[-14px] mx-2 transition-all duration-500"
                  style={{
                    background: step > n ? "#14B8A6" : "rgba(255,255,255,0.08)",
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Steps — CSS slide transitions */}
      <div className="max-w-3xl mx-auto px-4 relative overflow-hidden">
        <div
          className="quote-step"
          style={{
            opacity: step === 1 ? 1 : 0,
            transform: step === 1 ? "translateX(0)" : step > 1 ? "translateX(-40px)" : "translateX(40px)",
            pointerEvents: step === 1 ? "auto" : "none",
            position: step === 1 ? "relative" : "absolute",
            top: 0,
            left: 16,
            right: 16,
            transition: "opacity 0.3s ease, transform 0.3s ease",
          }}
        >
          <Step1FleetProfile profile={profile} setProfile={setProfile} onNext={handleNext} />
        </div>

        <div
          className="quote-step"
          style={{
            opacity: step === 2 ? 1 : 0,
            transform: step === 2 ? "translateX(0)" : step > 2 ? "translateX(-40px)" : "translateX(40px)",
            pointerEvents: step === 2 ? "auto" : "none",
            position: step === 2 ? "relative" : "absolute",
            top: 0,
            left: 16,
            right: 16,
            transition: "opacity 0.3s ease, transform 0.3s ease",
          }}
        >
          {step >= 2 && (
            <Step2RiskAssessment profile={profile} onNext={handleNext} onBack={handleBack} />
          )}
        </div>

        <div
          className="quote-step"
          style={{
            opacity: step === 3 ? 1 : 0,
            transform: step === 3 ? "translateX(0)" : "translateX(40px)",
            pointerEvents: step === 3 ? "auto" : "none",
            position: step === 3 ? "relative" : "absolute",
            top: 0,
            left: 16,
            right: 16,
            transition: "opacity 0.3s ease, transform 0.3s ease",
          }}
        >
          {step === 3 && (
            <Step3Coverage profile={profile} onBack={handleBack} onSelectPlan={handleSelectPlan} />
          )}
        </div>
      </div>

      {/* Lead Capture Modal */}
      {modalOpen && selectedPlan && (
        <LeadCaptureModal
          plan={selectedPlan}
          onClose={() => setModalOpen(false)}
        />
      )}

      {/* ARIA Agent FAB */}
      <AgentFAB agents={["aria"]} context={agentContext} />
    </div>
  );
}
