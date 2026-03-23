"use client";

import { useEffect, useState } from "react";
import { FleetProfile } from "./QuoteFlow";
import { ChevronRight, ArrowLeft } from "lucide-react";

interface Props {
  profile: FleetProfile;
  onNext: () => void;
  onBack: () => void;
}

function calcRiskScore(p: FleetProfile): number {
  let score = 40;

  // Asset class
  const assetScores: Record<string, number> = { robot: 5, ev: 0, av: 15, mixed: 8 };
  score += assetScores[p.assetType ?? "ev"] ?? 0;

  // Geography
  const geoScores: Record<string, number> = { hk: 5, sz: 3, tokyo: 8, sg: 4, multi: 12 };
  score += geoScores[p.geography ?? "hk"] ?? 0;

  // Utilization
  const utilScores: Record<number, number> = { 4: -8, 8: 0, 12: 6, 16: 12, 24: 18 };
  score += utilScores[p.utilization] ?? 0;

  // Use case
  const useCaseScores: Record<string, number> = {
    delivery: 8,
    warehouse: -4,
    patrol: 2,
    transport: 6,
    other: 0,
  };
  score += useCaseScores[p.useCase ?? "other"] ?? 0;

  // Fleet size impact
  if (p.fleetSize > 100) score += 5;
  if (p.fleetSize > 300) score += 4;

  return Math.max(10, Math.min(95, score));
}

function calcRiskFactors(p: FleetProfile) {
  const utilMap: Record<number, number> = { 4: 25, 8: 45, 12: 65, 16: 80, 24: 95 };
  const assetClassMap: Record<string, number> = { robot: 55, ev: 40, av: 85, mixed: 60 };
  const geoMap: Record<string, number> = { hk: 50, sz: 40, tokyo: 65, sg: 45, multi: 80 };
  const coverageGap = Math.min(95, 40 + (p.fleetSize / 500) * 40 + (p.utilization === 24 ? 15 : 0));

  return [
    { label: "Operational Intensity", value: utilMap[p.utilization] ?? 45, color: "#F59E0B" },
    { label: "Asset Class Risk", value: assetClassMap[p.assetType ?? "ev"] ?? 50, color: "#EF4444" },
    { label: "Geographic Exposure", value: geoMap[p.geography ?? "hk"] ?? 50, color: "#3B82F6" },
    { label: "Coverage Gap", value: Math.round(coverageGap), color: "#A855F7" },
  ];
}

function generateSummary(p: FleetProfile, score: number): string {
  const assetLabels: Record<string, string> = {
    robot: "robotic",
    ev: "electric vehicle",
    av: "autonomous vehicle",
    mixed: "mixed",
  };
  const geoLabels: Record<string, string> = {
    hk: "Hong Kong",
    sz: "Shenzhen",
    tokyo: "Tokyo",
    sg: "Singapore",
    multi: "multiple regions",
  };
  const useCaseLabels: Record<string, string> = {
    delivery: "delivery operations",
    warehouse: "warehouse automation",
    patrol: "patrol duties",
    transport: "passenger transport",
    other: "general operations",
  };

  const riskLevel = score < 40 ? "low" : score < 65 ? "moderate" : "elevated";
  const asset = assetLabels[p.assetType ?? "ev"] ?? "fleet";
  const geo = geoLabels[p.geography ?? "hk"] ?? "the region";
  const useCase = useCaseLabels[p.useCase ?? "other"] ?? "operations";

  return `ARIA has assessed your ${asset} fleet of ${p.fleetSize} assets operating in ${geo} for ${useCase} at ${p.utilization} hours per day. Your overall risk profile is ${riskLevel} (score: ${score}/100). ${
    score >= 65
      ? "Given the elevated operational intensity and asset class exposure, comprehensive coverage is strongly recommended to protect against liability gaps."
      : score >= 40
      ? "Standard coverage provides an optimal balance of protection and cost efficiency for your risk profile."
      : "Your fleet's operating parameters suggest a conservative risk profile. Essential or Standard coverage should provide adequate protection."
  }`;
}

// SVG circular gauge
function RiskGauge({ score, animate }: { score: number; animate: boolean }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const arc = circumference * 0.75; // 270 degrees
  const offset = arc - (arc * score) / 100;

  const color = score < 40 ? "#22C55E" : score < 65 ? "#F59E0B" : "#EF4444";

  return (
    <div className="flex flex-col items-center">
      <svg width="180" height="140" viewBox="0 0 180 140">
        {/* Background arc */}
        <circle
          cx="90"
          cy="100"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="12"
          strokeDasharray={`${arc} ${circumference}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          transform="rotate(135 90 100)"
        />
        {/* Score arc */}
        <circle
          cx="90"
          cy="100"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeDasharray={`${arc} ${circumference}`}
          strokeDashoffset={animate ? offset : arc}
          strokeLinecap="round"
          transform="rotate(135 90 100)"
          style={{
            transition: "stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1), stroke 0.5s ease",
            filter: `drop-shadow(0 0 8px ${color}60)`,
          }}
        />
        {/* Score text */}
        <text x="90" y="95" textAnchor="middle" fill="#F1F5F9" fontSize="32" fontWeight="700" fontFamily="Inter, sans-serif">
          {animate ? score : 0}
        </text>
        <text x="90" y="112" textAnchor="middle" fill="#64748B" fontSize="11" fontFamily="Inter, sans-serif">
          / 100
        </text>
      </svg>
      <span
        className="text-xs font-semibold px-3 py-1 rounded-full -mt-2"
        style={{
          background: `${color}18`,
          color,
          border: `1px solid ${color}40`,
        }}
      >
        {score < 40 ? "Low Risk" : score < 65 ? "Moderate Risk" : "Elevated Risk"}
      </span>
    </div>
  );
}

export default function Step2RiskAssessment({ profile, onNext, onBack }: Props) {
  const [loading, setLoading] = useState(true);
  const [animateGauge, setAnimateGauge] = useState(false);
  const [animateBars, setAnimateBars] = useState(false);

  const riskScore = calcRiskScore(profile);
  const riskFactors = calcRiskFactors(profile);
  const summary = generateSummary(profile, riskScore);

  useEffect(() => {
    const t1 = setTimeout(() => setLoading(false), 2000);
    const t2 = setTimeout(() => setAnimateGauge(true), 2200);
    const t3 = setTimeout(() => setAnimateBars(true), 2400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <div className="pb-28 md:pb-8">
      {loading ? (
        /* Loading state */
        <div className="flex flex-col items-center justify-center py-20 gap-6">
          <div className="relative">
            <div
              className="w-20 h-20 rounded-full"
              style={{
                background: "rgba(59,130,246,0.1)",
                border: "1px solid rgba(59,130,246,0.2)",
              }}
            />
            <div
              className="absolute inset-0 rounded-full border-4 border-transparent"
              style={{
                borderTopColor: "#3B82F6",
                borderRightColor: "#14B8A6",
                animation: "spin 1s linear infinite",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-2xl">🛡️</div>
          </div>
          <div className="text-center">
            <p className="text-yas-text font-semibold text-sm">ARIA is calculating your risk profile</p>
            <p className="text-yas-muted text-xs mt-1">Analysing {profile.fleetSize} assets across operational parameters…</p>
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: "#3B82F6",
                  animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Risk Score */}
          <div
            className="rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6"
            style={{
              background: "rgba(15,22,40,0.8)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <RiskGauge score={riskScore} animate={animateGauge} />
            <div className="flex-1 text-center md:text-left">
              <p className="text-xs text-yas-muted uppercase tracking-widest mb-1">ARIA Risk Analysis</p>
              <p className="text-sm text-yas-text leading-relaxed">{summary}</p>
            </div>
          </div>

          {/* Risk Factors */}
          <div
            className="rounded-2xl p-6 space-y-4"
            style={{
              background: "rgba(15,22,40,0.8)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <h3 className="text-xs font-semibold text-yas-subtext uppercase tracking-widest">Risk Factors</h3>
            {riskFactors.map(({ label, value, color }) => (
              <div key={label} className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-yas-text font-medium">{label}</span>
                  <span className="text-xs font-bold" style={{ color }}>
                    {value}%
                  </span>
                </div>
                <div
                  className="w-full h-1.5 rounded-full overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: animateBars ? `${value}%` : "0%",
                      background: `linear-gradient(90deg, ${color}80, ${color})`,
                      boxShadow: `0 0 8px ${color}40`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200"
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
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-200"
              style={{
                background: "linear-gradient(135deg, #3B82F6, #14B8A6)",
                color: "#fff",
                boxShadow: "0 4px 20px rgba(59,130,246,0.25)",
              }}
            >
              View Coverage Options
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
