"use client";

import { useEffect } from "react";
import { useTour, TOUR_STEPS } from "@/context/TourContext";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";

export default function DemoTour() {
  const { isActive, currentStep, totalSteps, nextStep, prevStep, stopTour } = useTour();
  const pathname = usePathname();

  // Block scroll while tour is active
  useEffect(() => {
    if (isActive) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isActive]);

  if (!isActive) return null;

  const step = TOUR_STEPS[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;

  // Don't render the card if we're on the wrong page (navigation in progress)
  if (step.page !== pathname) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[200] pointer-events-none"
        style={{ background: "rgba(2,2,3,0.75)", backdropFilter: "blur(2px)" }}
        aria-hidden="true"
      />

      {/* Tour card */}
      <div
        className="fixed z-[201] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md"
        style={{
          background: "#131929",
          border: "1px solid rgba(255,255,255,0.08)",
          borderTop: "2px solid #14B8A6",
          borderRadius: "16px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(20,184,166,0.1)",
          animation: "tourFadeIn 0.25s ease",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          {/* Step counter */}
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{ background: "rgba(20,184,166,0.15)", color: "#14B8A6", border: "1px solid rgba(20,184,166,0.25)" }}
            >
              {currentStep + 1} of {totalSteps}
            </span>
          </div>
          {/* Skip */}
          <button
            onClick={stopTour}
            className="flex items-center gap-1 text-[11px] font-medium transition-colors hover:opacity-80"
            style={{ color: "#64748B" }}
            aria-label="Skip tour"
          >
            <X className="w-3.5 h-3.5" />
            Skip tour
          </button>
        </div>

        {/* Progress dots */}
        <div className="flex items-center gap-1.5 px-5 pb-3">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className="h-1 rounded-full transition-all duration-300"
              style={{
                background: i === currentStep ? "#14B8A6" : i < currentStep ? "rgba(20,184,166,0.4)" : "rgba(255,255,255,0.1)",
                width: i === currentStep ? "24px" : "8px",
              }}
            />
          ))}
        </div>

        {/* Body */}
        <div className="px-5 pb-4">
          <h3
            className="text-base font-semibold mb-2 leading-snug"
            style={{ color: "#F1F5F9" }}
          >
            {step.title}
          </h3>
          <p className="text-sm leading-relaxed mb-3" style={{ color: "#94A3B8" }}>
            {step.body}
          </p>
          {/* Hint */}
          <div
            className="flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-xl"
            style={{
              background: "rgba(59,130,246,0.08)",
              border: "1px solid rgba(59,130,246,0.15)",
              color: "#60A5FA",
            }}
          >
            <span className="text-base leading-none">👁</span>
            {step.hint}
          </div>
        </div>

        {/* Navigation */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <button
            onClick={prevStep}
            disabled={isFirst}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl transition-all"
            style={{
              color: isFirst ? "#334155" : "#94A3B8",
              background: isFirst ? "transparent" : "rgba(255,255,255,0.05)",
              cursor: isFirst ? "default" : "pointer",
            }}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Back
          </button>

          <button
            onClick={nextStep}
            className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl transition-all hover:opacity-90"
            style={{
              background: isLast ? "linear-gradient(135deg, #22C55E, #16A34A)" : "linear-gradient(135deg, #14B8A6, #0D9488)",
              color: "#fff",
              boxShadow: isLast ? "0 2px 12px rgba(34,197,94,0.3)" : "0 2px 12px rgba(20,184,166,0.3)",
            }}
          >
            {isLast ? "Finish Tour ✓" : "Next"}
            {!isLast && <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes tourFadeIn {
          from { opacity: 0; transform: translate(-50%, calc(-50% + 12px)); }
          to { opacity: 1; transform: translate(-50%, -50%); }
        }
      `}</style>
    </>
  );
}
