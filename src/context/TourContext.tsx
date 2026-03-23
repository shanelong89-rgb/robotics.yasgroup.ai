"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

export interface TourStep {
  title: string;
  body: string;
  hint: string;
  page: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    title: "Live Fleet Intelligence",
    body: "Real-time telemetry from 90 assets across HK, Shenzhen, Tokyo, and Singapore. Every data point feeds our risk engine.",
    hint: "Look at the fleet map below ↓",
    page: "/",
  },
  {
    title: "Risk Scoring Engine",
    body: "ARIA scores every asset continuously. Fleet health: 74/100. 2.9× safer than industry average.",
    hint: "Look at the right panel KPIs →",
    page: "/",
  },
  {
    title: "Telemetry-Linked Pricing",
    body: "Premiums adjust in real-time based on behaviour. Your fleet's HKD 12.8K/month is 18.4% below market rate.",
    hint: "Look at the policy status strip above ↑",
    page: "/risk",
  },
  {
    title: "2-Minute Payouts",
    body: "Parametric triggers replace manual adjusters. HK-BOT-003: collision at 09:41, HKD 42,000 approved at 09:44. No forms.",
    hint: "Look at the parametric payout timeline ↓",
    page: "/claims",
  },
  {
    title: "Self-Funded Capital Stack",
    body: "4-layer reserve architecture. HKD 11.1M deployed. 3.42× coverage ratio. Self-funded — no external LP required for MVP.",
    hint: "Look at the pool health dashboard ↓",
    page: "/capital",
  },
  {
    title: "Prediction Market Underwriting",
    body: "Binary markets price accident probability. LP underwriters hold NO tokens — earning yield by underwriting fleet risk.",
    hint: "Look at the active markets grid ↓",
    page: "/markets",
  },
  {
    title: "LP Investment Opportunity",
    body: "Series A pool open. Senior tranche: 12-14% APY. Mezzanine: 18-22%. Junior: 28-35%. All backed by live telemetry data.",
    hint: "Look at the tranche cards below ↓",
    page: "/invest",
  },
  {
    title: "The Data Moat",
    body: "HKD 84,200 saved vs flat-rate pricing. Loss ratio: 23.4% vs industry 67%. This is the proof — telemetry drives better risk.",
    hint: "Look at the savings summary cards ↓",
    page: "/insights",
  },
];

interface TourContextValue {
  isActive: boolean;
  currentStep: number;
  totalSteps: number;
  startTour: () => void;
  stopTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
}

const TourContext = createContext<TourContextValue | null>(null);

export function useTour() {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error("useTour must be used within TourProvider");
  return ctx;
}

const STORAGE_KEY = "yas_demo_tour";
const SEEN_KEY = "yas_tour_seen";

export function TourProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Restore step from localStorage (persists across navigation)
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.active) {
        setIsActive(true);
        setCurrentStep(parsed.step ?? 0);
      }
    }
  }, []);

  // Persist state to localStorage
  useEffect(() => {
    if (isActive) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ active: true, step: currentStep }));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [isActive, currentStep]);

  const startTour = useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
    localStorage.setItem(SEEN_KEY, "1");
    router.push(TOUR_STEPS[0].page);
  }, [router]);

  const stopTour = useCallback(() => {
    setIsActive(false);
    setCurrentStep(0);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const nextStep = useCallback(() => {
    const next = currentStep + 1;
    if (next >= TOUR_STEPS.length) {
      stopTour();
      return;
    }
    const nextPage = TOUR_STEPS[next].page;
    const currentPage = TOUR_STEPS[currentStep].page;
    setCurrentStep(next);
    if (nextPage !== currentPage) {
      router.push(nextPage);
    }
  }, [currentStep, router, stopTour]);

  const prevStep = useCallback(() => {
    const prev = currentStep - 1;
    if (prev < 0) return;
    const prevPage = TOUR_STEPS[prev].page;
    const currentPage = TOUR_STEPS[currentStep].page;
    setCurrentStep(prev);
    if (prevPage !== currentPage) {
      router.push(prevPage);
    }
  }, [currentStep, router]);

  return (
    <TourContext.Provider value={{ isActive, currentStep, totalSteps: TOUR_STEPS.length, startTour, stopTour, nextStep, prevStep }}>
      {children}
    </TourContext.Provider>
  );
}
