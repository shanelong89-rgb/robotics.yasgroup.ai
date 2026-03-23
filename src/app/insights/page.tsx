"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { TrendingDown, Zap, MapPin, Wrench, ArrowRight, CheckCircle, Download } from "lucide-react";
import { assets } from "@/lib/demo-data";
import InsightsPDF, { useInsightsPDF } from "./InsightsPDF";

const AgentFAB = dynamic(() => import("@/components/AgentFAB"), { ssr: false });

const SavingsSparkline = dynamic(
  () =>
    import("recharts").then((mod) => {
      const { BarChart, Bar, ResponsiveContainer, Tooltip } = mod;
      const sparkData = [
        { m: "Apr", v: 3200 },
        { m: "May", v: 4800 },
        { m: "Jun", v: 5400 },
        { m: "Jul", v: 6100 },
        { m: "Aug", v: 7200 },
        { m: "Sep", v: 7800 },
        { m: "Oct", v: 8100 },
        { m: "Nov", v: 8900 },
        { m: "Dec", v: 9200 },
        { m: "Jan", v: 9800 },
        { m: "Feb", v: 10400 },
        { m: "Mar", v: 11200 },
      ];
      return function Sparkline() {
        return (
          <ResponsiveContainer width="100%" height={48}>
            <BarChart data={sparkData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
              <Bar dataKey="v" fill="#22C55E" radius={[2, 2, 0, 0]} opacity={0.8} />
              <Tooltip
                contentStyle={{
                  background: "#131929",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 8,
                  fontSize: 10,
                  color: "#F1F5F9",
                }}
                formatter={(v: unknown) => [`HKD ${Number(v).toLocaleString()}`, ""]}
                labelFormatter={() => ""}
              />
            </BarChart>
          </ResponsiveContainer>
        );
      };
    }),
  { ssr: false }
);

const HealthTrendChart = dynamic(
  () =>
    import("recharts").then((mod) => {
      const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } = mod;

      function generateData(points: number, startScore: number) {
        return Array.from({ length: points }, (_, i) => ({
          t: i + 1,
          fleet: Math.round(startScore + ((74 - startScore) * i) / (points - 1) + (Math.random() - 0.5) * 2),
          industry: 58,
        }));
      }

      return function HealthTrend({ period }: { period: "30D" | "60D" | "90D" }) {
        const configs = { "30D": { points: 12, start: 62 }, "60D": { points: 24, start: 55 }, "90D": { points: 36, start: 48 } };
        const cfg = configs[period];
        const data = generateData(cfg.points, cfg.start);

        return (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(20,184,166,0.2)" />
              <XAxis
                dataKey="t"
                tick={{ fill: "#64748B", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[40, 100]}
                tick={{ fill: "#64748B", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#131929",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 8,
                  fontSize: 11,
                  color: "#F1F5F9",
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: 11, color: "#94A3B8" }}
              />
              <Line
                type="monotone"
                dataKey="fleet"
                stroke="#14B8A6"
                strokeWidth={2}
                dot={false}
                name="Your Fleet"
              />
              <Line
                type="monotone"
                dataKey="industry"
                stroke="#64748B"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
                name="Industry Avg"
              />
            </LineChart>
          </ResponsiveContainer>
        );
      };
    }),
  { ssr: false }
);

// Top 5 highest risk assets
const topRiskAssets = [...assets].sort((a, b) => b.riskScore - a.riskScore).slice(0, 5);

const benchmarkRows = [
  { metric: "Loss Ratio", fleet: "23.4%", industry: "67.0%", delta: "-43.6%" },
  { metric: "Collision Rate", fleet: "0.8/1000hr", industry: "2.1/1000hr", delta: "-62%" },
  { metric: "Fault Response Time", fleet: "4.2 min", industry: "18.7 min", delta: "-78%" },
  { metric: "Battery Incidents", fleet: "3.1%", industry: "8.4%", delta: "-63%" },
  { metric: "Avg Claim Value", fleet: "HKD 28,400", industry: "HKD 52,000", delta: "-45%" },
];

const recommendations = [
  {
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.2)",
    Icon: Zap,
    title: "Resolve battery faults on HK-BOT-007, HK-BOT-012",
    saving: "–HKD 3,200/month",
    detail:
      "These 2 assets have recurring low-battery alerts. Battery degradation adds 0.8× risk multiplier. Resolving reduces fleet risk score by 8 points.",
    cta: "View Assets",
    href: "/risk",
  },
  {
    color: "#3B82F6",
    bg: "rgba(59,130,246,0.08)",
    border: "rgba(59,130,246,0.2)",
    Icon: MapPin,
    title: "Restrict night operations for HK Delivery Fleet (22:00–06:00)",
    saving: "–HKD 1,800/month",
    detail:
      "Night-time collision rate is 2.3× higher in your fleet data. Geographic restriction reduces TPL exposure significantly.",
    cta: "View Fleet",
    href: "/fleet/1",
  },
  {
    color: "#A855F7",
    bg: "rgba(168,85,247,0.08)",
    border: "rgba(168,85,247,0.2)",
    Icon: Wrench,
    title: "Schedule preventive maintenance for 4 EVs due 30-day service",
    saving: "–HKD 960/month",
    detail:
      "Deferred maintenance correlates with 40% higher fault incident rate. 4 EVs are overdue by avg 12 days.",
    cta: "View Risk Console",
    href: "/risk",
  },
];

function ProgressRing({ value, max }: { value: number; max: number }) {
  const r = 44;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (value / max) * circumference;
  return (
    <svg width="112" height="112" viewBox="0 0 112 112">
      <circle cx="56" cy="56" r={r} fill="none" stroke="rgba(59,130,246,0.15)" strokeWidth="8" />
      <circle
        cx="56"
        cy="56"
        r={r}
        fill="none"
        stroke="#3B82F6"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{
          transform: "rotate(-90deg)",
          transformOrigin: "56px 56px",
          transition: "stroke-dashoffset 1s ease",
        }}
      />
      <text x="56" y="52" textAnchor="middle" fill="#F1F5F9" fontSize="18" fontWeight="700">
        {value}
      </text>
      <text x="56" y="68" textAnchor="middle" fill="#64748B" fontSize="11">
        / {max}
      </text>
    </svg>
  );
}

export default function InsightsPage() {
  const { pdfRef, downloadReport } = useInsightsPDF();
  return (
    <div className="pt-6 md:pt-8 pb-24 md:pb-8 px-4 md:px-6 max-w-7xl mx-auto">
        {/* Hidden PDF component */}
        <InsightsPDF pdfRef={pdfRef} />

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-5 h-5" style={{ color: "#22C55E" }} />
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#22C55E" }}>
                  Operator Intelligence
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-yas-text mb-1">
                Fleet Intelligence — Operator Insights
              </h1>
              <p className="text-sm md:text-base" style={{ color: "#94A3B8" }}>
                Your telemetry advantage, translated into savings and risk reduction.
              </p>
            </div>
            <button
              onClick={downloadReport}
              className="no-print flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
              style={{
                border: "1px solid rgba(20,184,166,0.4)",
                color: "#14B8A6",
                background: "rgba(20,184,166,0.06)",
              }}
            >
              <Download className="w-3.5 h-3.5" />
              Download Report
            </button>
          </div>
        </div>

        {/* Section 1: Savings Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Card 1 - Telemetry Savings */}
          <div
            className="rounded-2xl p-5 border"
            style={{
              background: "#131929",
              borderColor: "rgba(34,197,94,0.2)",
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#22C55E" }}>
                Telemetry Savings
              </span>
            </div>
            <div className="text-2xl font-bold mb-1" style={{ color: "#22C55E" }}>
              HKD 84,200
            </div>
            <div className="text-xs mb-3" style={{ color: "#94A3B8" }}>
              saved this year vs. industry flat-rate pricing
            </div>
            <div className="text-[11px] mb-3 p-2 rounded-lg" style={{ background: "rgba(34,197,94,0.08)", color: "#94A3B8" }}>
              Your loss ratio: <span style={{ color: "#22C55E" }}>23.4%</span> | Industry avg:{" "}
              <span style={{ color: "#EF4444" }}>67%</span> | Savings:{" "}
              <span style={{ color: "#22C55E" }}>43.6 pp</span>
            </div>
            <SavingsSparkline />
          </div>

          {/* Card 2 - Premium Efficiency */}
          <div
            className="rounded-2xl p-5 border"
            style={{
              background: "#131929",
              borderColor: "rgba(20,184,166,0.2)",
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#14B8A6" }}>
                Premium Efficiency
              </span>
            </div>
            <div className="text-2xl font-bold mb-1" style={{ color: "#14B8A6" }}>
              18.4% below market
            </div>
            <div className="text-xs mb-3" style={{ color: "#94A3B8" }}>
              Telemetry-adjusted pricing advantage
            </div>
            <div className="text-xs leading-relaxed" style={{ color: "#94A3B8" }}>
              Your fleet earns lower premiums because your data proves lower risk. Every connected asset contributes to a continuously improving risk profile.
            </div>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1 h-2 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div
                  className="h-2 rounded-full"
                  style={{ width: "81.6%", background: "linear-gradient(90deg, #14B8A6, #0D9488)" }}
                />
              </div>
              <span className="text-xs font-semibold" style={{ color: "#14B8A6" }}>81.6%</span>
            </div>
            <div className="text-[10px] mt-1" style={{ color: "#64748B" }}>Market rate utilisation</div>
          </div>

          {/* Card 3 - Risk Reduction Score */}
          <div
            className="rounded-2xl p-5 border"
            style={{
              background: "#131929",
              borderColor: "rgba(59,130,246,0.2)",
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#3B82F6" }}>
                Risk Reduction Score
              </span>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <ProgressRing value={74} max={100} />
              <div>
                <div className="text-lg font-bold text-yas-text">Fleet Health</div>
                <div className="text-xs mb-2" style={{ color: "#94A3B8" }}>
                  Up 12 points in 90 days
                </div>
                <div
                  className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(34,197,94,0.1)", color: "#22C55E" }}
                >
                  <CheckCircle className="w-3 h-3" /> +12 pts ↑
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Recommendations */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-lg font-bold text-yas-text">3 actions that will lower your premium</h2>
            <span
              className="text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{ background: "rgba(245,158,11,0.1)", color: "#F59E0B" }}
            >
              AI Recommended
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.map((r, i) => {
              const Icon = r.Icon;
              return (
                <div
                  key={i}
                  className="rounded-2xl p-5 border flex flex-col gap-3"
                  style={{ background: r.bg, borderColor: r.border }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${r.color}20` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: r.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-yas-text leading-snug">{r.title}</div>
                      <div
                        className="text-xs font-bold mt-1"
                        style={{ color: r.color }}
                      >
                        {r.saving}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "#94A3B8" }}>
                    {r.detail}
                  </p>
                  <Link
                    href={r.href}
                    className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90 mt-auto"
                    style={{ background: `${r.color}20`, color: r.color, border: `1px solid ${r.color}40` }}
                  >
                    {r.cta} <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Benchmarking Table */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-yas-text mb-4">Fleet Performance Benchmarking</h2>
          <div className="rounded-2xl border overflow-hidden" style={{ background: "#131929", borderColor: "rgba(255,255,255,0.08)" }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "#64748B" }}>
                      Metric
                    </th>
                    <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "#14B8A6" }}>
                      Your Fleet
                    </th>
                    <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "#64748B" }}>
                      Industry Avg
                    </th>
                    <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "#64748B" }}>
                      Delta
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {benchmarkRows.map((row, i) => (
                    <tr
                      key={i}
                      style={{ borderBottom: i < benchmarkRows.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
                    >
                      <td className="px-5 py-3.5 text-sm text-yas-text">{row.metric}</td>
                      <td className="px-5 py-3.5 text-sm text-right font-semibold" style={{ color: "#14B8A6" }}>
                        {row.fleet}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-right" style={{ color: "#64748B" }}>
                        {row.industry}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                          style={{ background: "rgba(34,197,94,0.1)", color: "#22C55E" }}
                        >
                          {row.delta} ✅
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Section 4: Fleet Health Trend */}
        <HealthTrendSection />

        {/* Section 5: Asset Breakdown */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-yas-text mb-4">Top 5 Highest-Risk Assets</h2>
          <div className="rounded-2xl border overflow-hidden" style={{ background: "#131929", borderColor: "rgba(255,255,255,0.08)" }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    {["Asset", "Type", "Risk Score", "Monthly Premium", "Key Risk Factor", "Action"].map((h) => (
                      <th
                        key={h}
                        className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider"
                        style={{ color: "#64748B" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {topRiskAssets.map((asset, i) => {
                    const riskColor =
                      asset.riskScore >= 75
                        ? "#EF4444"
                        : asset.riskScore >= 50
                        ? "#F59E0B"
                        : "#14B8A6";
                    return (
                      <tr
                        key={asset.id}
                        style={{ borderBottom: i < topRiskAssets.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
                      >
                        <td className="px-5 py-3.5 font-semibold text-yas-text">{asset.name}</td>
                        <td className="px-5 py-3.5">
                          <span
                            className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full"
                            style={{ background: "rgba(59,130,246,0.1)", color: "#3B82F6" }}
                          >
                            {asset.type}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className="inline-flex items-center gap-1 text-xs font-bold"
                            style={{ color: riskColor }}
                          >
                            {asset.riskScore}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-xs" style={{ color: "#94A3B8" }}>
                          HKD {(asset.premiumBurnRate * 720).toFixed(0)}
                        </td>
                        <td className="px-5 py-3.5 text-xs" style={{ color: "#94A3B8" }}>
                          {asset.lastEvent}
                        </td>
                        <td className="px-5 py-3.5">
                          <Link
                            href={`/asset/${asset.id}`}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
                            style={{ background: "rgba(59,130,246,0.1)", color: "#3B82F6", border: "1px solid rgba(59,130,246,0.2)" }}
                          >
                            Review
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      <AgentFAB agents={["aria"]} />
    </div>
  );
}

function HealthTrendSection() {
  const [period, setPeriod] = useState<"30D" | "60D" | "90D">("30D");

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="text-lg font-bold text-yas-text">Fleet Health Trend</h2>
        <div className="flex items-center gap-2">
          {(["30D", "60D", "90D"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: period === p ? "rgba(20,184,166,0.15)" : "rgba(255,255,255,0.05)",
                color: period === p ? "#14B8A6" : "#64748B",
                border: period === p ? "1px solid rgba(20,184,166,0.3)" : "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border p-5" style={{ background: "#131929", borderColor: "rgba(255,255,255,0.08)" }}>
        <HealthTrendChart period={period} />
      </div>
    </div>
  );
}
