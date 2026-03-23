"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Claim } from "@/types";
import { assets } from "@/lib/demo-data";

const statusConfig: Record<string, { label: string; color: string }> = {
  submitted: { label: "Submitted", color: "text-yas-blue bg-yas-blue/10 border-yas-blue/20" },
  under_review: { label: "Under Review", color: "text-yas-amber bg-yas-amber/10 border-yas-amber/20" },
  evidence_requested: { label: "Evidence Req.", color: "text-orange-400 bg-orange-400/10 border-orange-400/20" },
  approved: { label: "Approved", color: "text-yas-green bg-yas-green/10 border-yas-green/20" },
  rejected: { label: "Rejected", color: "text-yas-red bg-yas-red/10 border-yas-red/20" },
  paid: { label: "Paid", color: "text-yas-teal bg-yas-teal/10 border-yas-teal/20" },
};

const severityConfig: Record<string, string> = {
  minor: "text-yas-green",
  moderate: "text-yas-amber",
  major: "text-orange-400",
  catastrophic: "text-yas-red",
};

interface ClaimsTableProps {
  claims: Claim[];
  onSelectClaim?: (claim: Claim) => void;
  selectedClaimId?: string;
}

export default function ClaimsTable({ claims, onSelectClaim, selectedClaimId }: ClaimsTableProps) {
  const [sortKey, setSortKey] = useState<keyof Claim>("submittedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = [...claims].sort((a, b) => {
    const av = a[sortKey];
    const bv = b[sortKey];
    if (!av || !bv) return 0;
    const cmp = av < bv ? -1 : av > bv ? 1 : 0;
    return sortDir === "asc" ? cmp : -cmp;
  });

  function toggleSort(key: keyof Claim) {
    if (sortKey === key) setSortDir(d => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  }

  function SortIcon({ k }: { k: keyof Claim }) {
    if (sortKey !== k) return <ChevronUp className="w-3 h-3 opacity-20" />;
    return sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />;
  }

  function getAssetName(assetId: string) {
    return assets.find(a => a.id === assetId)?.name ?? assetId;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/[0.06]">
            {[
              { key: "id" as keyof Claim, label: "Claim ID" },
              { key: "assetId" as keyof Claim, label: "Asset" },
              { key: "status" as keyof Claim, label: "Status" },
              { key: "severity" as keyof Claim, label: "Severity" },
              { key: "estimatedLoss" as keyof Claim, label: "Est. Loss" },
              { key: "submittedAt" as keyof Claim, label: "Submitted" },
            ].map(col => (
              <th
                key={col.key}
                className="text-left pb-3 px-3 text-yas-muted font-medium cursor-pointer hover:text-yas-subtext transition-colors"
                style={{ fontSize: "10px", letterSpacing: "0.08em" }}
                onClick={() => toggleSort(col.key)}
              >
                <div className="flex items-center gap-1 uppercase">
                  {col.label}
                  <SortIcon k={col.key} />
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((claim, i) => {
            const status = statusConfig[claim.status] ?? { label: claim.status, color: "text-yas-muted" };
            const isSelected = claim.id === selectedClaimId;
            return (
              <motion.tr
                key={claim.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => onSelectClaim?.(claim)}
                className={`border-b border-white/[0.04] hover:bg-white/[0.03] cursor-pointer transition-colors ${isSelected ? "bg-yas-blue/5 border-yas-blue/10" : ""}`}
              >
                <td className="py-3 px-3 text-yas-muted font-mono text-xs">{claim.id.toUpperCase()}</td>
                <td className="py-3 px-3 text-yas-text font-medium">{getAssetName(claim.assetId)}</td>
                <td className="py-3 px-3">
                  <span className={`inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full border ${status.color}`}>
                    {status.label}
                  </span>
                </td>
                <td className={`py-3 px-3 text-xs font-semibold capitalize ${severityConfig[claim.severity] ?? "text-yas-muted"}`}>
                  {claim.severity}
                </td>
                <td className="py-3 px-3 text-yas-text tabular-nums text-xs">
                  {claim.currency} {claim.estimatedLoss.toLocaleString()}
                </td>
                <td className="py-3 px-3 text-yas-muted text-xs">
                  {new Date(claim.submittedAt).toLocaleDateString()}
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
