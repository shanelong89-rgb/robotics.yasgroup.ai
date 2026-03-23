"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, CheckCircle, XCircle, FileText, Clock, AlertTriangle, Zap, Wallet } from "lucide-react";

import { Claim } from "@/types";
import { claims, claimEvidence, assets } from "@/lib/demo-data";
import ClaimsTable from "@/components/ClaimsTable";
import RiskScoreBadge from "@/components/RiskScoreBadge";
import dynamic from "next/dynamic";
const AgentFAB = dynamic(() => import("@/components/AgentFAB"), { ssr: false });
const FNOLPanel = dynamic(() => import("@/components/FNOLPanel"), { ssr: false });

const statusConfig: Record<string, { label: string; color: string }> = {
  submitted: { label: "Submitted", color: "text-yas-blue" },
  under_review: { label: "Under Review", color: "text-yas-amber" },
  evidence_requested: { label: "Evidence Req.", color: "text-orange-400" },
  approved: { label: "Approved", color: "text-yas-green" },
  rejected: { label: "Rejected", color: "text-yas-red" },
  paid: { label: "Paid", color: "text-yas-teal" },
};

export default function ClaimsPage() {
  const login = () => {}; const authenticated = false; const user = null;
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [fnolOpen, setFnolOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<"idle" | "processing" | "success" | "rejected">("idle");

  const activeClaims = claims.filter(c => !['paid', 'rejected'].includes(c.status));
  const pendingPayout = activeClaims.reduce((s, c) => s + (c.estimatedLoss ?? 0), 0);
  const ariaContext = {
    activeClaims: activeClaims.length,
    totalClaims: claims.length,
    pendingPayout,
    selectedClaim: selectedClaim ? { title: selectedClaim.title, severity: selectedClaim.severity, estimatedLoss: selectedClaim.estimatedLoss, status: selectedClaim.status } : null,
  };

  const getAsset = (id: string) => assets.find(a => a.id === id);
  const getEvidence = (ids: string[]) => claimEvidence.filter(e => ids.includes(e.id));

  const summaryStats = [
    { label: "Total Claims", value: claims.length, color: "text-yas-text" },
    { label: "In Progress", value: claims.filter(c => ["submitted","under_review","evidence_requested"].includes(c.status)).length, color: "text-yas-amber" },
    { label: "Pending Payout", value: `HK$${claims.filter(c => c.approvedAmount && c.status !== "paid").reduce((s, c) => s + (c.approvedAmount ?? 0), 0).toLocaleString()}`, color: "text-yas-red" },
    { label: "Paid Out", value: `HK$${claims.filter(c => c.status === "paid").reduce((s, c) => s + (c.approvedAmount ?? 0), 0).toLocaleString()}`, color: "text-yas-green" },
    { label: "Avg Resolution", value: "18hr", color: "text-yas-blue" },
  ];

  return (
    <div className="pt-4 md:pt-6 pb-24 md:pb-8 px-4 md:px-6 max-w-7xl mx-auto">
      <div className="mb-6 md:mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-yas-text tracking-tight mb-1">Claims Review & Payout Console</h1>
          <p className="text-yas-muted text-sm">Review, evidence assessment, and payout automation</p>
        </div>
        <button
          onClick={() => setFnolOpen(true)}
          className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl border transition-colors flex-shrink-0"
          style={{ color: "#EF4444", borderColor: "rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)" }}
        >
          <AlertTriangle className="w-4 h-4" />
          Report New Incident
        </button>
      </div>

      {/* Parametric Payout Showcase */}
      <ParametricPayoutShowcase />

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-6">
        {summaryStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card p-4"
          >
            <p className="text-[10px] uppercase tracking-widest text-yas-muted mb-2">{stat.label}</p>
            <p className={`text-2xl font-bold tabular-nums ${stat.color}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Claims Table */}
        <div className="flex-1 glass-card p-4 md:p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-yas-blue" />
            <h2 className="text-sm font-semibold text-yas-text">Claims Inbox</h2>
            <span className="ml-auto text-[10px] text-yas-muted">{claims.length} total</span>
          </div>
          <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
            <table className="w-full text-sm min-w-[600px] md:min-w-0">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {["Claim ID", "Asset", "Status", "Severity", "Est. Loss", "Submitted"].map(h => (
                    <th key={h} className="text-left pb-3 px-3 text-[10px] uppercase tracking-widest text-yas-muted font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {claims.map((claim, i) => {
                  const isSelected = claim.id === selectedClaim?.id;
                  const severityBorder: Record<string, string> = {
                    catastrophic: "#EF4444",
                    major: "#F97316",
                    moderate: "#F59E0B",
                    minor: "#22C55E",
                  };
                  const borderColor = severityBorder[claim.severity] ?? "transparent";
                  return (
                    <tr
                      key={claim.id}
                      onClick={() => {
                        setSelectedClaim(claim);
                        setApprovalStatus("idle");
                        setIsProcessing(false);
                      }}
                      className={`table-row-hover cursor-pointer border-b border-white/[0.04] ${isSelected ? "selected" : ""}`}
                      style={{ borderLeftColor: borderColor, borderLeftWidth: "3px" }}
                    >
                      <td className="py-3 px-3 text-yas-muted font-mono text-xs">{claim.id.toUpperCase()}</td>
                      <td className="py-3 px-3 text-yas-text font-medium text-xs">{assets.find(a => a.id === claim.assetId)?.name ?? claim.assetId}</td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                          claim.status === "submitted" ? "text-yas-blue bg-yas-blue/10 border-yas-blue/20" :
                          claim.status === "under_review" ? "text-yas-amber bg-yas-amber/10 border-yas-amber/20" :
                          claim.status === "approved" ? "text-yas-green bg-yas-green/10 border-yas-green/20" :
                          claim.status === "paid" ? "text-yas-teal bg-yas-teal/10 border-yas-teal/20" :
                          claim.status === "rejected" ? "text-yas-red bg-yas-red/10 border-yas-red/20" :
                          "text-orange-400 bg-orange-400/10 border-orange-400/20"
                        }`}>
                          {claim.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className={`py-3 px-3 text-xs font-semibold capitalize ${
                        claim.severity === "catastrophic" ? "text-yas-red" :
                        claim.severity === "major" ? "text-orange-400" :
                        claim.severity === "moderate" ? "text-yas-amber" : "text-yas-green"
                      }`}>{claim.severity}</td>
                      <td className="py-3 px-3 text-yas-text tabular-nums text-xs">{claim.currency} {claim.estimatedLoss.toLocaleString()}</td>
                      <td className="py-3 px-3 text-yas-muted text-xs">{new Date(claim.submittedAt).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Claim Detail Panel */}
        <AnimatePresence>
          {selectedClaim && (
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ type: "spring", stiffness: 400, damping: 40 }}
              className="w-full md:w-96 flex-shrink-0 glass-card p-5 flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-260px)]"
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-[10px] text-yas-muted font-mono">{selectedClaim.id.toUpperCase()}</p>
                    <h3 className="text-sm font-semibold text-yas-text mt-0.5">{selectedClaim.title}</h3>
                  </div>
                  <button
                    onClick={() => setSelectedClaim(null)}
                    className="text-yas-muted hover:text-yas-text text-xs px-2 py-1 rounded hover:bg-white/[0.04]"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-xs text-yas-subtext leading-relaxed">{selectedClaim.description}</p>
              </div>

              {/* Status & Severity */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div>
                  <p className="text-[9px] text-yas-muted mb-0.5">STATUS</p>
                  <p className={`text-xs font-bold ${statusConfig[selectedClaim.status]?.color ?? "text-yas-text"}`}>
                    {statusConfig[selectedClaim.status]?.label}
                  </p>
                </div>
                <div className="h-8 w-px bg-white/[0.08]" />
                <div>
                  <p className="text-[9px] text-yas-muted mb-0.5">SEVERITY</p>
                  <p className={`text-xs font-bold capitalize ${
                    selectedClaim.severity === "catastrophic" ? "text-yas-red" :
                    selectedClaim.severity === "major" ? "text-orange-400" :
                    selectedClaim.severity === "moderate" ? "text-yas-amber" : "text-yas-green"
                  }`}>{selectedClaim.severity}</p>
                </div>
                <div className="h-8 w-px bg-white/[0.08]" />
                <div>
                  <p className="text-[9px] text-yas-muted mb-0.5">ASSET</p>
                  <p className="text-xs font-bold text-yas-text">{getAsset(selectedClaim.assetId)?.name ?? selectedClaim.assetId}</p>
                </div>
              </div>

              {/* Financial */}
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <p className="text-[9px] uppercase tracking-widest text-yas-muted mb-3">Financial Summary</p>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-yas-subtext">Estimated Loss</span>
                    <span className="text-xs font-semibold text-yas-red tabular-nums">{selectedClaim.currency} {selectedClaim.estimatedLoss.toLocaleString()}</span>
                  </div>
                  {selectedClaim.approvedAmount && (
                    <div className="flex justify-between">
                      <span className="text-xs text-yas-subtext">Approved Amount</span>
                      <span className="text-xs font-semibold text-yas-green tabular-nums">{selectedClaim.currency} {selectedClaim.approvedAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-white/[0.04]">
                    <span className="text-xs text-yas-subtext">Submitted</span>
                    <span className="text-xs text-yas-muted">{new Date(selectedClaim.submittedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Evidence */}
              <div>
                <p className="text-[9px] uppercase tracking-widest text-yas-muted mb-2">Evidence ({selectedClaim.evidenceIds.length})</p>
                <div className="flex flex-col gap-2">
                  {getEvidence(selectedClaim.evidenceIds).map(ev => (
                    <div key={ev.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                      <FileText className="w-3.5 h-3.5 text-yas-muted flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-yas-text truncate">{ev.description}</p>
                        <p className="text-[9px] text-yas-muted uppercase">{ev.type.replace(/_/g, " ")}</p>
                      </div>
                      {ev.verified ? (
                        <CheckCircle className="w-3.5 h-3.5 text-yas-green flex-shrink-0" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-yas-amber flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Super Underwriter Payout Recommendation */}
              <div className="p-3 rounded-xl bg-yas-teal/5 border border-yas-teal/20">
                <p className="text-[9px] uppercase tracking-widest text-yas-teal mb-2 font-semibold flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-yas-teal" />
                  AI Super Underwriter Assessment
                </p>
                <p className="text-xs text-yas-subtext leading-relaxed">
                  {selectedClaim.status === "under_review"
                    ? `Confidence Score: 99.2%. Telemetry pattern matching (G-force anomalies & GPS overlap) indicates legitimate claim. Recommended payout: ${selectedClaim.currency} ${Math.round(selectedClaim.estimatedLoss * 0.92).toLocaleString()} (92% of estimate). Auto-execution ready.`
                    : selectedClaim.status === "evidence_requested"
                    ? "Dynamic risk profile updated. AI awaits operator evidence submission (2 of 3 required documents pending) to finalize payout vector."
                    : selectedClaim.status === "paid"
                    ? "Protocol executed successfully. Risk model retrained continuously on resolution payload."
                    : "Algorithmic review initiated. Syncing cross-chain oracle parameters."}
                </p>
              </div>

              {/* Payout Simulation */}
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <p className="text-[9px] uppercase tracking-widest text-yas-muted mb-2 font-semibold">Payout Simulation</p>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-yas-subtext">🏦 Bank Transfer</span>
                    <span className="text-xs font-semibold text-yas-text">
                      {selectedClaim.status === "approved" || selectedClaim.status === "paid"
                        ? "Completed"
                        : "~4h if approved now"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-yas-subtext">⛓️ Stablecoin</span>
                    <span className="text-xs font-semibold text-yas-teal">
                      {selectedClaim.status === "approved" || selectedClaim.status === "paid"
                        ? "Completed"
                        : "~2h if approved now"}
                    </span>
                  </div>
                  {selectedClaim.approvedAmount && (
                    <div className="mt-1 pt-1 border-t border-white/[0.04] flex items-center justify-between">
                      <span className="text-xs text-yas-muted">Payout amount</span>
                      <span className="text-xs font-bold text-yas-green tabular-nums">{selectedClaim.currency} {selectedClaim.approvedAmount.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              {["submitted", "under_review", "evidence_requested"].includes(selectedClaim.status) && (
                <div className="flex flex-col gap-3">
                  {!authenticated ? (
                    <button
                      onClick={(e) => { e.preventDefault(); login(); }}
                      className="w-full py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                      style={{ background: "rgba(255,255,255,0.06)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" }}
                    >
                      <Wallet className="w-4 h-4" />
                      Connect Wallet to Execute Protocol
                    </button>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {approvalStatus === "success" ? (
                        <div className="p-3 rounded-xl bg-yas-green/10 border border-yas-green/20 text-center text-xs font-semibold text-yas-green flex items-center justify-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Transaction Executed
                        </div>
                      ) : approvalStatus === "rejected" ? (
                        <div className="p-3 rounded-xl bg-yas-red/10 border border-yas-red/20 text-center text-xs font-semibold text-yas-red flex items-center justify-center gap-2">
                          <XCircle className="w-4 h-4" />
                          Claim Rejected On-Chain
                        </div>
                      ) : (
                        <div className="flex gap-3">
                          <button
                            disabled={isProcessing}
                            onClick={() => {
                              setIsProcessing(true);
                              setTimeout(() => {
                                setIsProcessing(false);
                                setApprovalStatus("success");
                              }, 1500);
                            }}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-yas-green/20 hover:bg-yas-green/30 text-yas-green text-xs font-semibold border border-yas-green/30 transition-colors disabled:opacity-50"
                          >
                            {isProcessing ? "Signing..." : <><CheckCircle className="w-3.5 h-3.5" /> Approve Payout</>}
                          </button>
                          <button
                            disabled={isProcessing}
                            onClick={() => {
                              setIsProcessing(true);
                              setTimeout(() => {
                                setIsProcessing(false);
                                setApprovalStatus("rejected");
                              }, 1500);
                            }}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-yas-red/20 hover:bg-yas-red/30 text-yas-red text-xs font-semibold border border-yas-red/30 transition-colors disabled:opacity-50"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Audit Log */}
              <div>
                <p className="text-[9px] uppercase tracking-widest text-yas-muted mb-2">Audit Log</p>
                <div className="flex flex-col gap-1.5">
                  {[
                    { action: "Claim submitted", time: new Date(selectedClaim.submittedAt).toLocaleString(), user: "System" },
                    { action: "Auto-policy check", time: new Date(new Date(selectedClaim.submittedAt).getTime() + 30000).toLocaleString(), user: "AI Underwriter" },
                    { action: "Evidence requested", time: new Date(selectedClaim.updatedAt).toLocaleString(), user: "Admin" },
                  ].map((log, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px]">
                      <span className="text-yas-muted w-28 flex-shrink-0">{log.time}</span>
                      <span className="text-yas-subtext">{log.action}</span>
                      <span className="text-yas-muted ml-auto">{log.user}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AgentFAB agents={['aria']} context={ariaContext} />
      <FNOLPanel
        isOpen={fnolOpen}
        onClose={() => setFnolOpen(false)}
        asset={null}
      />
    </div>
  );
}

// ─── Parametric Payout Showcase ────────────────────────────────────────────

function ParametricPayoutShowcase() {
  const steps = [
    { icon: "🔴", label: "Event Detected", time: "09:41:02", sub: "G-force: 6.2g", color: "#EF4444" },
    { icon: "📡", label: "Telemetry Confirmed", time: "09:41:08", sub: "6 seconds", color: "#F59E0B" },
    { icon: "🤖", label: "ARIA Assessment", time: "09:41:45", sub: "37 seconds", color: "#3B82F6" },
    { icon: "✅", label: "Payout Approved", time: "09:44:12", sub: "2m 10s total", color: "#22C55E" },
    { icon: "💰", label: "HKD 42,000 Initiated", time: "09:44:15", sub: "", color: "#14B8A6" },
  ];

  return (
    <div
      className="mb-6 rounded-2xl p-5 border relative overflow-hidden"
      style={{
        background: "rgba(13,18,35,0.8)",
        borderColor: "rgba(255,255,255,0.06)",
        borderLeft: "3px solid #14B8A6",
        boxShadow: "0 0 40px rgba(34,197,94,0.06), inset 0 0 60px rgba(20,184,166,0.03)",
      }}
    >
      {/* Subtle green ambient glow */}
      <div
        className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)",
          transform: "translate(30%, -30%)",
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-[#14B8A6]" />
            <span className="text-[10px] uppercase tracking-widest font-semibold text-[#14B8A6]">Parametric Payout — Live Example</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-[#94A3B8]">
            <span className="font-mono font-semibold text-[#F1F5F9]">HK-BOT-003</span>
            <span>·</span>
            <span>Collision</span>
            <span>·</span>
            <span>Today, 09:41</span>
          </div>
        </div>
        <div
          className="px-3 py-1.5 rounded-full text-xs font-bold"
          style={{ background: "rgba(34,197,94,0.12)", color: "#22C55E", border: "1px solid rgba(34,197,94,0.25)" }}
        >
          ✓ Paid
        </div>
      </div>

      {/* Timeline */}
      <div className="relative mb-4 overflow-x-auto">
        <div className="flex items-start gap-0 min-w-max md:min-w-0">
          {steps.map((step, i) => (
            <div key={i} className="flex items-start flex-1 min-w-[120px] md:min-w-0">
              <div className="flex flex-col items-center flex-1">
                {/* Connector line + dot */}
                <div className="flex items-center w-full mb-2">
                  {i > 0 && (
                    <div
                      className="flex-1 h-px"
                      style={{ background: "linear-gradient(90deg, rgba(20,184,166,0.4), rgba(20,184,166,0.6))" }}
                    />
                  )}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 border"
                    style={{
                      background: `${step.color}15`,
                      borderColor: `${step.color}40`,
                    }}
                  >
                    {step.icon}
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className="flex-1 h-px"
                      style={{ background: "linear-gradient(90deg, rgba(20,184,166,0.6), rgba(20,184,166,0.4))" }}
                    />
                  )}
                </div>
                <p className="text-[10px] font-semibold text-center px-1" style={{ color: step.color }}>{step.label}</p>
                <p className="text-[10px] font-mono text-[#94A3B8] mt-0.5">{step.time}</p>
                {step.sub && <p className="text-[9px] text-[#64748B] mt-0.5">{step.sub}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Callout */}
      <div
        className="rounded-xl p-3 flex items-center gap-3 relative z-10"
        style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.15)" }}
      >
        <CheckCircle className="w-5 h-5 text-[#22C55E] flex-shrink-0" />
        <p className="text-sm text-[#94A3B8]">
          <span className="font-bold text-white">2 minutes 13 seconds</span> from collision to payout approval.{" "}
          <span className="text-[#94A3B8]">No adjuster. No forms.</span>
        </p>
      </div>
    </div>
  );
}
