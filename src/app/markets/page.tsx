"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { X, TrendingUp, Activity, DollarSign, CheckCircle } from "lucide-react";

const AgentFAB = dynamic(() => import("@/components/AgentFAB"), { ssr: false });

// ─── Dynamic recharts import ──────────────────────────────────────────────────
const SparkChart = dynamic(
  () =>
    import("recharts").then((m) => {
      const { AreaChart, Area, ResponsiveContainer } = m;
      function Chart({ data, color }: { data: number[]; color: string }) {
        const chartData = data.map((v, i) => ({ i, v }));
        return (
          <ResponsiveContainer width="100%" height={48}>
            <AreaChart data={chartData} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={color}
                strokeWidth={1.5}
                fill={`url(#grad-${color.replace("#", "")})`}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      }
      return Chart;
    }),
  { ssr: false }
);

// ─── Types ────────────────────────────────────────────────────────────────────
interface Market {
  id: string;
  fleet: string;
  geo: string;
  question: string;
  yesPrice: number;
  volume: number;
  liquidity: number;
  daysLeft: number;
  status: "ACTIVE" | "RESOLVING";
  sparkData: number[];
}

interface ResolvedMarket {
  id: string;
  fleet: string;
  question: string;
  outcome: "NO EVENT" | "COLLISION";
  payout: string;
  resolvedDate: string;
  oracle: string;
  status: "SETTLED";
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const ACTIVE_MARKETS: Market[] = [
  {
    id: "m1",
    fleet: "HK Robotics Fleet A",
    geo: "Hong Kong",
    question: "Will HK Robotics Fleet A have a collision event in the next 30 days?",
    yesPrice: 0.034,
    volume: 820000,
    liquidity: 380000,
    daysLeft: 22,
    status: "ACTIVE",
    sparkData: [0.031, 0.033, 0.035, 0.032, 0.034, 0.033, 0.034],
  },
  {
    id: "m2",
    fleet: "SZ EV Grid B",
    geo: "Shenzhen",
    question: "Will SZ EV Grid B have a collision event in the next 30 days?",
    yesPrice: 0.028,
    volume: 650000,
    liquidity: 290000,
    daysLeft: 18,
    status: "ACTIVE",
    sparkData: [0.030, 0.029, 0.027, 0.028, 0.026, 0.028, 0.028],
  },
  {
    id: "m3",
    fleet: "Tokyo AV Corridor",
    geo: "Tokyo",
    question: "Will Tokyo AV Corridor have a collision event in the next 30 days?",
    yesPrice: 0.051,
    volume: 540000,
    liquidity: 210000,
    daysLeft: 14,
    status: "RESOLVING",
    sparkData: [0.042, 0.044, 0.047, 0.049, 0.051, 0.050, 0.051],
  },
  {
    id: "m4",
    fleet: "SG Patrol Bots",
    geo: "Singapore",
    question: "Will SG Patrol Bots have a collision event in the next 30 days?",
    yesPrice: 0.019,
    volume: 430000,
    liquidity: 210000,
    daysLeft: 27,
    status: "ACTIVE",
    sparkData: [0.022, 0.021, 0.020, 0.019, 0.020, 0.019, 0.019],
  },
  {
    id: "m5",
    fleet: "HK Delivery Fleet C",
    geo: "Hong Kong",
    question: "Will HK Delivery Fleet C have a collision event in the next 30 days?",
    yesPrice: 0.063,
    volume: 980000,
    liquidity: 440000,
    daysLeft: 9,
    status: "RESOLVING",
    sparkData: [0.049, 0.052, 0.055, 0.059, 0.061, 0.062, 0.063],
  },
  {
    id: "m6",
    fleet: "SZ Mixed Fleet D",
    geo: "Shenzhen",
    question: "Will SZ Mixed Fleet D have a collision event in the next 30 days?",
    yesPrice: 0.041,
    volume: 780000,
    liquidity: 320000,
    daysLeft: 19,
    status: "ACTIVE",
    sparkData: [0.037, 0.038, 0.040, 0.039, 0.041, 0.042, 0.041],
  },
];

const RESOLVED_MARKETS: ResolvedMarket[] = [
  {
    id: "r1",
    fleet: "HK Logistics Alpha",
    question: "Will HK Logistics Alpha have a collision event in March 2026?",
    outcome: "NO EVENT",
    payout: "HKD 0",
    resolvedDate: "Mar 15, 2026",
    oracle: "Chainlink",
    status: "SETTLED",
  },
  {
    id: "r2",
    fleet: "SZ Delivery Fleet A",
    question: "Will SZ Delivery Fleet A have a collision event in Feb 2026?",
    outcome: "COLLISION",
    payout: "HKD 42,000",
    resolvedDate: "Feb 28, 2026",
    oracle: "UMA",
    status: "SETTLED",
  },
  {
    id: "r3",
    fleet: "Tokyo Mobility Grid",
    question: "Will Tokyo Mobility Grid have a collision event in Feb 2026?",
    outcome: "NO EVENT",
    payout: "HKD 0",
    resolvedDate: "Feb 14, 2026",
    oracle: "Chainlink",
    status: "SETTLED",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtHKD(n: number) {
  return "HKD " + n.toLocaleString();
}

function StatusBadge({ status, color }: { status: string; color: string }) {
  return (
    <span
      className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
      style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}
    >
      {status}
    </span>
  );
}

// ─── Add Liquidity Modal ──────────────────────────────────────────────────────
function LiquidityModal({ market, onClose }: { market: Market; onClose: () => void }) {
  const [position, setPosition] = useState<"no" | "yes">("no");
  const [amount, setAmount] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const noPrice = (1 - market.yesPrice).toFixed(3);
  const expectedYield = position === "no"
    ? ((market.yesPrice / (1 - market.yesPrice)) * 100).toFixed(1) + "% if no collision"
    : ((( 1 - market.yesPrice) / market.yesPrice) * 100).toFixed(1) + "% if collision";

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(2,2,3,0.85)", backdropFilter: "blur(8px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md bg-yas-panel border border-white/[0.10] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
          <h3 className="text-sm font-bold text-yas-text">Add Liquidity</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/[0.06] transition-colors">
            <X className="w-4 h-4 text-yas-muted" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-yas-text mb-2">Liquidity Added</h4>
              <p className="text-xs text-yas-subtext leading-relaxed">
                Adding liquidity to {market.fleet}. You will receive{" "}
                <span className="text-yas-teal font-semibold">NO tokens</span> representing your underwriting position.
              </p>
            </div>
            <button onClick={onClose} className="px-5 py-2 rounded-xl bg-yas-teal text-white text-sm font-semibold hover:bg-yas-teal/90 transition-colors">
              Done
            </button>
          </div>
        ) : (
          <div className="p-6 flex flex-col gap-4">
            {/* Market name */}
            <div className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              <p className="text-[10px] text-yas-muted mb-0.5">Market</p>
              <p className="text-xs font-semibold text-yas-text">{market.fleet}</p>
            </div>

            {/* Position */}
            <div>
              <p className="text-xs text-yas-muted mb-2">Position</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: "no" as const, label: "NO Tokens", sub: `Price ${noPrice}`, color: "#14B8A6", note: "LP default" },
                  { key: "yes" as const, label: "YES Tokens", sub: `Price ${market.yesPrice.toFixed(3)}`, color: "#EF4444" },
                ].map(p => (
                  <button
                    key={p.key}
                    onClick={() => setPosition(p.key)}
                    className="p-3 rounded-xl border text-xs font-semibold transition-all text-left"
                    style={{
                      borderColor: position === p.key ? p.color : "rgba(255,255,255,0.08)",
                      background: position === p.key ? `${p.color}14` : "rgba(255,255,255,0.02)",
                      color: position === p.key ? p.color : "#64748B",
                    }}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      {p.label}
                      {p.note && (
                        <span className="text-[8px] px-1.5 py-0.5 rounded" style={{ background: `${p.color}20`, color: p.color }}>
                          {p.note}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] opacity-70">{p.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="text-xs text-yas-muted mb-2 block">Amount (HKD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-yas-muted">HKD</span>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-12 pr-4 py-2.5 text-sm text-yas-text placeholder:text-yas-muted focus:outline-none focus:border-yas-teal/40"
                />
              </div>
            </div>

            {/* Expected yield */}
            <div className="px-3 py-2.5 rounded-xl bg-yas-teal/8 border border-yas-teal/20">
              <p className="text-[10px] text-yas-muted mb-0.5">Expected Yield</p>
              <p className="text-xs font-semibold text-yas-teal">{expectedYield}</p>
            </div>

            <button
              onClick={() => setSubmitted(true)}
              className="w-full py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #14B8A6, #0D9488)", color: "#fff" }}
            >
              Confirm — Add Liquidity
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Market Card ──────────────────────────────────────────────────────────────
function MarketCard({ market, onAddLiquidity }: { market: Market; onAddLiquidity: () => void }) {
  const noPrice = (1 - market.yesPrice).toFixed(3);
  const statusColor = market.status === "RESOLVING" ? "#F59E0B" : "#22C55E";
  const yesColor = market.yesPrice > 0.05 ? "#EF4444" : market.yesPrice > 0.035 ? "#F59E0B" : "#22C55E";

  return (
    <div className="bg-yas-panel border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-yas-text leading-snug">{market.question}</p>
          <p className="text-[11px] text-yas-muted mt-1">{market.fleet} · {market.geo}</p>
        </div>
        <StatusBadge status={market.status} color={statusColor} />
      </div>

      {/* YES/NO prices */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl p-2.5 text-center" style={{ background: `${yesColor}10`, border: `1px solid ${yesColor}25` }}>
          <p className="text-[9px] text-yas-muted uppercase tracking-wider mb-0.5">YES</p>
          <p className="text-base font-bold" style={{ color: yesColor }}>{market.yesPrice.toFixed(3)}</p>
          <p className="text-[9px] text-yas-muted">{(market.yesPrice * 100).toFixed(1)}% prob</p>
        </div>
        <div className="rounded-xl p-2.5 text-center" style={{ background: "rgba(20,184,166,0.08)", border: "1px solid rgba(20,184,166,0.20)" }}>
          <p className="text-[9px] text-yas-muted uppercase tracking-wider mb-0.5">NO</p>
          <p className="text-base font-bold text-yas-teal">{noPrice}</p>
          <p className="text-[9px] text-yas-muted">LP position</p>
        </div>
      </div>

      {/* Sparkline */}
      <div>
        <p className="text-[10px] text-yas-muted mb-1">7-day YES price history</p>
        <SparkChart data={market.sparkData} color={yesColor} />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-[9px] text-yas-muted uppercase tracking-wider">Volume</p>
          <p className="text-[11px] font-semibold text-yas-text">{fmtHKD(market.volume)}</p>
        </div>
        <div>
          <p className="text-[9px] text-yas-muted uppercase tracking-wider">Liquidity</p>
          <p className="text-[11px] font-semibold text-yas-text">{fmtHKD(market.liquidity)}</p>
        </div>
        <div>
          <p className="text-[9px] text-yas-muted uppercase tracking-wider">Expires</p>
          <p className="text-[11px] font-semibold text-yas-text">{market.daysLeft}d</p>
        </div>
      </div>

      <button
        onClick={onAddLiquidity}
        className="w-full py-2 rounded-xl text-xs font-bold border border-yas-teal/30 text-yas-teal transition-all hover:bg-yas-teal/10"
      >
        Add Liquidity
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function MarketsPage() {
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);

  const cassContext = {
    page: "Fleet Risk Markets",
    activeMarkets: 6,
    totalVolume: 4200000,
    openInterest: 2847000,
    avgYESPrice: 0.037,
    marketsResolvedThisMonth: 3,
    positions: ACTIVE_MARKETS.map(m => ({ fleet: m.fleet, yes: m.yesPrice, vol: m.volume })),
  };

  return (
    <div className="pt-4 md:pt-6 pb-24 md:pb-8 px-4 md:px-6 max-w-7xl mx-auto">
      {/* ─── Header ─────────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <h1 className="text-3xl font-bold text-yas-text tracking-tight">Fleet Risk Markets</h1>
          <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-widest">
            6 ACTIVE MARKETS
          </span>
        </div>
        <p className="text-yas-muted text-sm">
          Binary prediction markets for fleet accident probability. LP underwriters as NO token holders.
        </p>
      </div>

      {/* ─── Section 1: Stats bar ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Market Volume",       value: "HKD 4,200,000", color: "#3B82F6",  icon: DollarSign },
          { label: "Open Interest",             value: "HKD 2,847,000", color: "#14B8A6",  icon: Activity },
          { label: "Avg YES Price",             value: "0.037",          color: "#A855F7",  icon: TrendingUp },
          { label: "Resolved This Month",       value: "3 markets",      color: "#22C55E",  icon: CheckCircle },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="bg-yas-panel border border-white/[0.08] rounded-2xl p-4 flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${color}14`, border: `1px solid ${color}30` }}
            >
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <div>
              <p className="text-[10px] text-yas-muted">{label}</p>
              <p className="text-sm font-bold" style={{ color }}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Section 2: Active Markets ───────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
          </span>
          <h2 className="text-base font-bold text-yas-text">Active Markets</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ACTIVE_MARKETS.map((m) => (
            <MarketCard
              key={m.id}
              market={m}
              onAddLiquidity={() => setSelectedMarket(m)}
            />
          ))}
        </div>
      </div>

      {/* ─── Section 3: Resolved Markets ─────────────────────────────────────── */}
      <div>
        <h2 className="text-base font-bold text-yas-text mb-4">Resolved Markets</h2>
        <div className="flex flex-col gap-3">
          {RESOLVED_MARKETS.map((r) => {
            const outcomeColor = r.outcome === "COLLISION" ? "#EF4444" : "#22C55E";
            return (
              <div
                key={r.id}
                className="bg-yas-panel border border-white/[0.06] rounded-2xl p-4 flex items-center gap-4 flex-wrap"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-yas-text truncate">{r.question}</p>
                  <p className="text-[11px] text-yas-muted mt-0.5">{r.fleet}</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap flex-shrink-0">
                  <span
                    className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full"
                    style={{ background: `${outcomeColor}14`, color: outcomeColor, border: `1px solid ${outcomeColor}30` }}
                  >
                    {r.outcome}
                  </span>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-yas-text">{r.payout}</p>
                    <p className="text-[10px] text-yas-muted">{r.resolvedDate}</p>
                  </div>
                  <div
                    className="text-[10px] px-2 py-0.5 rounded-md font-medium"
                    style={{ background: "rgba(148,163,184,0.10)", color: "#94A3B8", border: "1px solid rgba(148,163,184,0.15)" }}
                  >
                    {r.oracle}
                  </div>
                  <StatusBadge status={r.status} color="#64748B" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedMarket && (
        <LiquidityModal
          market={selectedMarket}
          onClose={() => setSelectedMarket(null)}
        />
      )}

      <AgentFAB agents={["cass"]} context={cassContext} />
    </div>
  );
}
