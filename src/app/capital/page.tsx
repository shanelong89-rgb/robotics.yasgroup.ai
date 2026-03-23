"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Shield, Database, TrendingUp, Activity, Zap, DollarSign } from "lucide-react";

const AgentFAB = dynamic(() => import("@/components/AgentFAB"), { ssr: false });

// ─── Types ───────────────────────────────────────────────────────────────────
interface CapitalEvent {
  id: number;
  ts: string;
  type: "PREMIUM" | "SETTLEMENT" | "REBALANCE" | "ALERT";
  desc: string;
  amount: string;
}

// ─── Mock event templates ─────────────────────────────────────────────────────
const EVENT_TEMPLATES: Omit<CapitalEvent, "id" | "ts">[] = [
  { type: "PREMIUM",    desc: "Premium accrued – HK Robotics Fleet A",          amount: "+HKD 1,240" },
  { type: "SETTLEMENT", desc: "Oracle settled CLM-847291",                       amount: "HKD 42,000" },
  { type: "REBALANCE",  desc: "Pool rebalance: +HKD 120,000 to First Loss",     amount: "+HKD 120,000" },
  { type: "PREMIUM",    desc: "Premium accrued – SZ EV Grid B",                  amount: "+HKD 890" },
  { type: "ALERT",      desc: "Utilisation threshold 35% approaching – Layer 1", amount: "—" },
  { type: "SETTLEMENT", desc: "Oracle settled CLM-912043",                       amount: "HKD 18,500" },
  { type: "PREMIUM",    desc: "Premium accrued – Tokyo AV Corridor",             amount: "+HKD 2,110" },
  { type: "REBALANCE",  desc: "Monthly sweep: Captive → ERC-4626 vault",        amount: "+HKD 350,000" },
  { type: "PREMIUM",    desc: "Premium accrued – SG Patrol Bots",               amount: "+HKD 780" },
  { type: "SETTLEMENT", desc: "Oracle settled CLM-763104",                       amount: "HKD 55,000" },
  { type: "ALERT",      desc: "Polymarket YES price spike: SZ Mixed Fleet D",   amount: "0.041 → 0.063" },
  { type: "REBALANCE",  desc: "Reserve top-up: Shared Reserve replenished",     amount: "+HKD 200,000" },
  { type: "PREMIUM",    desc: "Premium accrued – HK Delivery Fleet C",          amount: "+HKD 3,450" },
  { type: "PREMIUM",    desc: "Batch premium sweep – 14 policies",              amount: "+HKD 47,820" },
  { type: "ALERT",      desc: "Chainlink heartbeat: all oracles healthy",       amount: "OK" },
];

const EVENT_COLORS: Record<string, string> = {
  PREMIUM:    "#22C55E",
  SETTLEMENT: "#EF4444",
  REBALANCE:  "#3B82F6",
  ALERT:      "#F59E0B",
};

function fmtTime(d: Date) {
  return d.toLocaleTimeString("en-HK", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
}

function makeEvent(idx: number): CapitalEvent {
  const tmpl = EVENT_TEMPLATES[idx % EVENT_TEMPLATES.length];
  return { ...tmpl, id: Date.now() + Math.random(), ts: fmtTime(new Date()) };
}

// Seed 15 initial events
function seedEvents(): CapitalEvent[] {
  const now = new Date();
  return Array.from({ length: 15 }, (_, i) => {
    const d = new Date(now.getTime() - (14 - i) * 12000);
    const tmpl = EVENT_TEMPLATES[i % EVENT_TEMPLATES.length];
    return { ...tmpl, id: i, ts: fmtTime(d) };
  });
}

// ─── Pool data ────────────────────────────────────────────────────────────────
const POOLS = [
  {
    layer: "Layer 1",
    name: "Consumer Pool",
    subtitle: "YAS HKD Policy Layer",
    balance: "HKD 2,400,000",
    utilPct: 34,
    stat1Label: "Premium inflow",
    stat1Value: "+HKD 47,820/day",
    status: "ACTIVE",
    color: "#3B82F6",
    bg: "rgba(59,130,246,0.08)",
    border: "rgba(59,130,246,0.20)",
    icon: Shield,
    note: null,
  },
  {
    layer: "Layer 2",
    name: "Captive Pool",
    subtitle: "First Loss Reserve (ERC-4626)",
    balance: "HKD 8,700,000",
    utilPct: 18,
    stat1Label: "Pending liabilities",
    stat1Value: "HKD 1,560,000",
    status: "HEALTHY",
    color: "#14B8A6",
    bg: "rgba(20,184,166,0.08)",
    border: "rgba(20,184,166,0.20)",
    icon: Database,
    note: "Self-funded · No external LP required",
  },
  {
    layer: "Layer 3",
    name: "Prediction Pool",
    subtitle: "Polymarket Binary Markets",
    balance: "LP: HKD 4,200,000",
    utilPct: 62,
    stat1Label: "Active markets / Avg YES",
    stat1Value: "6 markets · 0.037",
    status: "LIVE",
    color: "#A855F7",
    bg: "rgba(168,85,247,0.08)",
    border: "rgba(168,85,247,0.20)",
    icon: TrendingUp,
    note: "LP underwriters hold NO tokens",
  },
  {
    layer: "Layer 4",
    name: "Oracle Layer",
    subtitle: "Chainlink + UMA Settlement",
    balance: "3 settled this month",
    utilPct: 8,
    stat1Label: "Avg settlement / Last",
    stat1Value: "2h 14m · HKD 42,000",
    status: "OPERATIONAL",
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.20)",
    icon: Activity,
    note: null,
  },
];

const FLOW_NODES = [
  { label: "Premium Inflow",    sub: "+HKD 47,820/day", color: "#22C55E" },
  { label: "Consumer Pool",     sub: "HKD 2,400,000",   color: "#3B82F6" },
  { label: "First Loss Reserve",sub: "HKD 8,700,000",   color: "#14B8A6" },
  { label: "Prediction Pool",   sub: "LP HKD 4,200,000",color: "#A855F7" },
  { label: "Oracle / Payout",   sub: "Auto-settle 2h",  color: "#F59E0B" },
  { label: "Policyholder",      sub: "HKD payout",      color: "#EF4444" },
];

const cassContext = {
  totalCapitalDeployed: 11100000,
  firstLossPool: 2400000,
  sharedReserve: 8700000,
  capitalEfficiency: "3.42×",
  liveMarkets: 6,
  avgYESPrice: 0.037,
  pendingLiabilities: 1560000,
  claimsSettledThisMonth: 3,
};

// ─── Status pill ──────────────────────────────────────────────────────────────
function StatusPill({ status, color }: { status: string; color: string }) {
  return (
    <span
      className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
      style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}
    >
      {status}
    </span>
  );
}

// ─── Event badge ──────────────────────────────────────────────────────────────
function TypeBadge({ type }: { type: string }) {
  const c = EVENT_COLORS[type] ?? "#94A3B8";
  return (
    <span
      className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md flex-shrink-0"
      style={{ background: `${c}18`, color: c, border: `1px solid ${c}30` }}
    >
      {type}
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function CapitalPage() {
  const [events, setEvents] = useState<CapitalEvent[]>(seedEvents);
  const [eventIdx, setEventIdx] = useState(0);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setEventIdx(i => i + 1);
      setEvents(prev => [makeEvent(prev.length), ...prev.slice(0, 29)]);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="pt-4 md:pt-6 pb-24 md:pb-8 px-4 md:px-6 max-w-7xl mx-auto">
      {/* ─── Header ─────────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-yas-text tracking-tight">Capital Command Center</h1>
          <span className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold uppercase tracking-widest">
            LIVE
          </span>
        </div>
        <p className="text-yas-muted text-sm">Real-time pool health, capital flow, and oracle settlement monitoring</p>
      </div>

      {/* ─── Section 1: Overview stat cards ─────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Capital Deployed", value: "HKD 11,100,000", sub: "Across all layers",    color: "#3B82F6", icon: DollarSign },
          { label: "First Loss Pool",        value: "HKD 2,400,000",  sub: "21.6% of total",       color: "#EF4444", icon: Shield },
          { label: "Shared Reserve",         value: "HKD 8,700,000",  sub: "78.4% of total",       color: "#14B8A6", icon: Database },
          { label: "Capital Efficiency",     value: "3.42×",          sub: "Reserve / outstanding",color: "#A855F7", icon: Zap },
        ].map(({ label, value, sub, color, icon: Icon }) => (
          <div
            key={label}
            className="bg-yas-panel border border-white/[0.08] rounded-2xl p-4 flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-yas-muted font-medium">{label}</span>
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <p className="text-xl font-bold" style={{ color }}>{value}</p>
            <p className="text-[11px] text-yas-muted">{sub}</p>
          </div>
        ))}
      </div>

      {/* ─── Main 2-col grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Left 60% */}
        <div className="lg:col-span-3 flex flex-col gap-5">

          {/* ─── Section 2: Pool Health ──────────────────────────────────────── */}
          <div className="bg-yas-panel border border-white/[0.08] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-yas-blue" />
              <h2 className="text-sm font-semibold text-yas-text">Pool Health Dashboard</h2>
            </div>
            <div className="flex flex-col gap-3">
              {POOLS.map((pool) => {
                const Icon = pool.icon;
                return (
                  <div
                    key={pool.layer}
                    className="rounded-xl p-4 border"
                    style={{ background: pool.bg, borderColor: pool.border }}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon + badge */}
                      <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center"
                          style={{ background: `${pool.color}18`, border: `1px solid ${pool.color}35` }}
                        >
                          <Icon className="w-4 h-4" style={{ color: pool.color }} />
                        </div>
                        <span
                          className="text-[8px] font-bold uppercase tracking-widest px-1 py-0.5 rounded"
                          style={{ background: `${pool.color}18`, color: pool.color }}
                        >
                          {pool.layer}
                        </span>
                      </div>
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
                          <div>
                            <span className="text-xs font-bold text-yas-text">{pool.name}</span>
                            <span className="text-[11px] text-yas-muted ml-2">{pool.subtitle}</span>
                          </div>
                          <StatusPill status={pool.status} color={pool.color} />
                        </div>
                        {/* Balance + utilisation */}
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xs font-semibold" style={{ color: pool.color }}>{pool.balance}</span>
                          <span className="text-[11px] text-yas-muted">{pool.utilPct}% utilised</span>
                        </div>
                        {/* Utilisation bar */}
                        <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden mb-2">
                          <div
                            className="h-full rounded-full pool-util-bar"
                            style={{
                              width: `${pool.utilPct}%`,
                              background: pool.color,
                              transition: "width 1.2s ease-out",
                            }}
                          />
                        </div>
                        {/* Sub-stats */}
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-yas-muted">{pool.stat1Label}: <span className="text-yas-subtext font-medium">{pool.stat1Value}</span></span>
                          {pool.note && (
                            <span className="text-[10px] text-yas-muted italic">{pool.note}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ─── Section 3: Capital Flow Diagram ────────────────────────────── */}
          <div className="bg-yas-panel border border-white/[0.08] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-yas-amber" />
              <h2 className="text-sm font-semibold text-yas-text">Capital Flow</h2>
              <span className="text-[10px] text-yas-muted ml-2">Live routing · CSS animated</span>
            </div>
            <div className="flex flex-col items-center gap-0">
              {FLOW_NODES.map((node, i) => (
                <div key={node.label} className="flex flex-col items-center w-full">
                  <div
                    className="w-full max-w-xs rounded-xl px-4 py-3 border flex items-center justify-between"
                    style={{
                      background: `${node.color}10`,
                      borderColor: `${node.color}30`,
                    }}
                  >
                    <div>
                      <p className="text-xs font-bold" style={{ color: node.color }}>{node.label}</p>
                      <p className="text-[11px] text-yas-muted mt-0.5">{node.sub}</p>
                    </div>
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: node.color, boxShadow: `0 0 6px ${node.color}` }}
                    />
                  </div>
                  {i < FLOW_NODES.length - 1 && (
                    <div className="relative flex flex-col items-center" style={{ height: 32 }}>
                      <div className="w-px h-full bg-white/[0.10]" />
                      {/* Animated flow dot */}
                      <div
                        className="absolute flow-dot rounded-full"
                        style={{
                          width: 6,
                          height: 6,
                          background: FLOW_NODES[i + 1].color,
                          animationDelay: `${i * 0.5}s`,
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 40% — Live Metrics Feed */}
        <div className="lg:col-span-2">
          <div className="bg-yas-panel border border-white/[0.08] rounded-2xl p-5 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4 flex-shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
              </span>
              <h2 className="text-sm font-semibold text-yas-text">Live Capital Feed</h2>
              <span className="ml-auto text-[10px] text-yas-muted">{events.length} events</span>
            </div>
            <div
              ref={feedRef}
              className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1"
              style={{ maxHeight: 680 }}
            >
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="flex flex-col gap-1 p-3 rounded-xl border border-white/[0.05] bg-white/[0.02]"
                >
                  <div className="flex items-center gap-2">
                    <TypeBadge type={ev.type} />
                    <span className="text-[10px] text-yas-muted ml-auto font-mono">{ev.ts}</span>
                  </div>
                  <p className="text-[11px] text-yas-subtext">{ev.desc}</p>
                  <p
                    className="text-xs font-semibold"
                    style={{ color: EVENT_COLORS[ev.type] ?? "#94A3B8" }}
                  >
                    {ev.amount}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Flow dot + util bar CSS */}
      <style jsx global>{`
        @keyframes flowDot {
          0%   { top: 0; opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { top: 26px; opacity: 0; }
        }
        .flow-dot {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          animation: flowDot 1.6s linear infinite;
        }
      `}</style>

      <AgentFAB agents={["cass"]} context={cassContext} />
    </div>
  );
}
