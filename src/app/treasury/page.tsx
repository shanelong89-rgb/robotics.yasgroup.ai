"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, TrendingDown, Shield, Activity } from "lucide-react";
import { reservePools, treasuryMovements, generatePremiumChartData } from "@/lib/demo-data";
import ReserveGauge from "@/components/ReserveGauge";
const AgentFAB = dynamic(() => import("@/components/AgentFAB"), { ssr: false });
const TelemetryChart = dynamic(() => import("@/components/TelemetryChart"), { ssr: false });

export default function TreasuryPage() {
  const chartData = generatePremiumChartData();
  const totalReserve = reservePools.reduce((s, p) => s + p.balance, 0);
  const totalCapacity = reservePools.reduce((s, p) => s + p.maxCapacity, 0);
  const pendingLiabilities = 42000 + 28500 + 18700; // active claims estimates in HKD equivalent
  const capitalSufficiencyRatio = totalReserve / pendingLiabilities;

  const monthlyInflow = 148000 + 112000 + 195000 + 133000;
  const monthlyOutflow = 5400 + 7800;

  const cassContext = {
    pools: {
      firstLoss: reservePools.find(p => p.type === 'first_loss')?.balance ?? 2400000,
      shared: reservePools.find(p => p.type === 'shared')?.balance ?? 8700000,
    },
    totalReserve,
    coverageRatio: capitalSufficiencyRatio,
    pendingLiabilities,
    premiumInflow30d: monthlyInflow,
    idleCapital: Math.round(totalReserve * 0.85),
    yieldOpportunity: '4.5% APY on idle reserves',
  };

  return (
    <div className="pt-4 md:pt-6 pb-24 md:pb-8 px-4 md:px-6 max-w-7xl mx-auto">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-yas-text tracking-tight mb-1">Treasury & Reserve Command</h1>
        <p className="text-yas-muted text-sm">Capital reserves, premium flows, and financial intelligence</p>
      </div>

      {/* Reserve Health status pill */}
      <div className="mb-4 flex items-center gap-3">
        <span
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border"
          style={{
            background: capitalSufficiencyRatio >= 3 ? "rgba(34,197,94,0.1)" : capitalSufficiencyRatio >= 1.5 ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)",
            borderColor: capitalSufficiencyRatio >= 3 ? "rgba(34,197,94,0.3)" : capitalSufficiencyRatio >= 1.5 ? "rgba(245,158,11,0.3)" : "rgba(239,68,68,0.3)",
            color: capitalSufficiencyRatio >= 3 ? "#22C55E" : capitalSufficiencyRatio >= 1.5 ? "#F59E0B" : "#EF4444",
          }}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: capitalSufficiencyRatio >= 3 ? "#22C55E" : capitalSufficiencyRatio >= 1.5 ? "#F59E0B" : "#EF4444" }}
          />
          Reserve Health: {capitalSufficiencyRatio >= 3 ? "Healthy" : capitalSufficiencyRatio >= 1.5 ? "Monitor" : "At Risk"}
        </span>
        <span className="text-xs text-yas-muted">Capital Sufficiency Ratio: {capitalSufficiencyRatio.toFixed(1)}×</span>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        {[
          { label: "Total Reserves", value: `HK$${(totalReserve / 1000000).toFixed(2)}M`, color: "text-yas-text", icon: DollarSign, bg: "bg-yas-blue/10 border-yas-blue/20" },
          { label: "Monthly Inflow", value: `HK$${(monthlyInflow / 1000).toFixed(0)}K`, color: "text-yas-green", icon: TrendingUp, bg: "bg-yas-green/10 border-yas-green/20" },
          { label: "Pending Liabilities", value: `HK$${(pendingLiabilities / 1000).toFixed(1)}K`, color: "text-yas-red", icon: TrendingDown, bg: "bg-yas-red/10 border-yas-red/20" },
          { label: "Capital Sufficiency", value: `${capitalSufficiencyRatio.toFixed(1)}×`, color: capitalSufficiencyRatio >= 3 ? "text-yas-green" : capitalSufficiencyRatio >= 1.5 ? "text-yas-amber" : "text-yas-red", icon: Shield, bg: "bg-yas-teal/10 border-yas-teal/20" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`glass-card p-5 border ${stat.bg}`}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] uppercase tracking-widest text-yas-muted font-medium">{stat.label}</p>
              <stat.icon className={`w-4 h-4 ${stat.color} opacity-60`} />
            </div>
            <p className={`text-2xl font-bold tabular-nums ${stat.color}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Reserve Pools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {reservePools.map((pool, i) => (
          <motion.div
            key={pool.id}
            initial={{ opacity: 0, x: i === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-2 mb-5">
              <div className={`px-2 py-0.5 rounded-md text-[10px] uppercase tracking-widest font-bold ${
                pool.type === "first_loss"
                  ? "bg-yas-red/10 border border-yas-red/20 text-yas-red"
                  : "bg-yas-blue/10 border border-yas-blue/20 text-yas-blue"
              }`}>
                {pool.type === "first_loss" ? "First Loss" : "Shared Pool"}
              </div>
              <h3 className="text-sm font-semibold text-yas-text">{pool.name}</h3>
            </div>
            <ReserveGauge
              label="Pool Utilization"
              balance={pool.balance}
              maxCapacity={pool.maxCapacity}
              utilizationPct={pool.utilizationPct}
              currency="HKD"
              color={pool.type === "first_loss" ? "#EF4444" : "#3B82F6"}
            />

            {/* Allocations */}
            <div className="mt-5 pt-4 border-t border-white/[0.06]">
              <p className="text-[9px] uppercase tracking-widest text-yas-muted mb-3">Fleet Allocations</p>
              {pool.allocations.map((alloc, ai) => (
                <div key={alloc.id} className="flex items-center justify-between py-1.5">
                  <span className="text-xs text-yas-subtext">{alloc.fleetId.replace("fleet-", "").replace("-alpha", "").replace("-ev", "").replace("-av", "").replace("-log", "").toUpperCase()}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: '0%' }}
                        animate={{ width: `${alloc.allocationPct}%` }}
                        transition={{ duration: 0.8, delay: 0.3 + ai * 0.1, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ background: pool.type === "first_loss" ? "#EF4444" : "#3B82F6" }}
                      />
                    </div>
                    <span className="text-xs text-yas-text tabular-nums w-12 text-right">HK${(alloc.amount / 1000000).toFixed(1)}M</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-yas-green" />
            <h3 className="text-sm font-semibold text-yas-text">Premium Inflow (30d)</h3>
            <span className="ml-auto text-xs font-semibold text-yas-green tabular-nums">HK${(monthlyInflow / 1000).toFixed(0)}K</span>
          </div>
          <TelemetryChart
            data={chartData}
            dataKey="inflow"
            color="#22C55E"
            height={160}
            gradientId="inflowGrad"
          />
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-4 h-4 text-yas-red" />
            <h3 className="text-sm font-semibold text-yas-text">Payout Outflow (30d)</h3>
            <span className="ml-auto text-xs font-semibold text-yas-red tabular-nums">HK${(monthlyOutflow / 1000).toFixed(1)}K</span>
          </div>
          <TelemetryChart
            data={chartData}
            dataKey="outflow"
            color="#EF4444"
            height={160}
            gradientId="outflowGrad"
          />
        </div>
      </div>

      {/* Reserve Transaction Ledger */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-yas-teal" />
          <h3 className="text-sm font-semibold text-yas-text">Reserve Transaction Ledger</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {["Timestamp", "Pool", "Type", "Amount", "Balance After", "Description"].map(h => (
                <th key={h} className="text-left pb-3 px-3 text-[10px] uppercase tracking-widest text-yas-muted font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {treasuryMovements.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((mv, i) => (
              <motion.tr
                key={mv.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
              >
                <td className="py-3 px-3 text-xs text-yas-muted">{new Date(mv.timestamp).toLocaleDateString()}</td>
                <td className="py-3 px-3 text-xs text-yas-subtext">{mv.poolId === "pool-first-loss" ? "First Loss" : "Shared"}</td>
                <td className="py-3 px-3">
                  <span className={`text-[10px] uppercase font-semibold tracking-widest ${
                    mv.type === "premium_inflow" ? "text-yas-green" :
                    mv.type === "claim_payout" ? "text-yas-red" :
                    mv.type === "yield" ? "text-yas-teal" : "text-yas-blue"
                  }`}>
                    {mv.type.replace(/_/g, " ")}
                  </span>
                </td>
                <td className={`py-3 px-3 text-xs font-semibold tabular-nums ${mv.amount >= 0 ? "text-yas-green" : "text-yas-red"}`}>
                  {mv.amount >= 0 ? "+" : ""}{mv.currency} {Math.abs(mv.amount).toLocaleString()}
                </td>
                <td className="py-3 px-3 text-xs text-yas-text tabular-nums">HK${(mv.balanceAfter / 1000000).toFixed(2)}M</td>
                <td className="py-3 px-3 text-xs text-yas-muted truncate max-w-48">{mv.description}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <AgentFAB agents={['cass']} context={cassContext} />
    </div>
  );
}
