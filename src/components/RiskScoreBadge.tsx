"use client";

interface RiskScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

function getRiskLevel(score: number): { label: string; color: string; bg: string } {
  if (score >= 75) return { label: "Critical", color: "text-yas-red", bg: "bg-yas-red/10 border-yas-red/30" };
  if (score >= 50) return { label: "High", color: "text-yas-amber", bg: "bg-yas-amber/10 border-yas-amber/30" };
  if (score >= 25) return { label: "Medium", color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/30" };
  return { label: "Low", color: "text-yas-green", bg: "bg-yas-green/10 border-yas-green/30" };
}

export default function RiskScoreBadge({ score, size = "md", showLabel = true }: RiskScoreBadgeProps) {
  const { label, color, bg } = getRiskLevel(score);

  const sizeMap = {
    sm: { num: "text-sm font-bold", container: "px-2 py-0.5 text-[10px]" },
    md: { num: "text-lg font-bold", container: "px-2.5 py-1 text-xs" },
    lg: { num: "text-3xl font-bold", container: "px-3 py-1.5 text-sm" },
  };

  return (
    <div className={`inline-flex items-center gap-2 rounded-lg border ${bg} ${sizeMap[size].container}`}>
      <span className={`${color} ${sizeMap[size].num} tabular-nums`}>{Math.round(score)}</span>
      {showLabel && <span className={`${color} font-medium uppercase tracking-widest`} style={{ fontSize: "9px" }}>{label}</span>}
    </div>
  );
}
