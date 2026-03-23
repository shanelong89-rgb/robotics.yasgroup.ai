"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Bell, CheckCircle, AlertTriangle, Info, XCircle, Eye } from "lucide-react";
import { alerts as demoAlerts, assets } from "@/lib/demo-data";
import { Alert } from "@/types";

type FilterType = "all" | "critical" | "warning" | "info";

function getRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

function severityToFilter(severity: string): FilterType {
  if (severity === "critical") return "critical";
  if (severity === "high" || severity === "medium") return "warning";
  return "info";
}

function accentColor(filter: FilterType): string {
  if (filter === "critical") return "#EF4444";
  if (filter === "warning") return "#F59E0B";
  return "#3B82F6";
}

export default function AlertsPage() {
  const assetMap = useMemo(
    () => Object.fromEntries(assets.map((a) => [a.id, a])),
    []
  );

  const [filter, setFilter] = useState<FilterType>("all");
  const [acknowledged, setAcknowledged] = useState<Set<string>>(
    new Set(demoAlerts.filter((a) => a.acknowledged).map((a) => a.id))
  );

  // Mock push notification for first unacknowledged critical alert on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    const firstCritical = demoAlerts.find(
      (a) => a.severity === "critical" && !a.acknowledged
    );
    if (firstCritical) {
      try {
        new Notification("YAS Fleet Alert", {
          body: "Critical: " + (firstCritical.description || firstCritical.title),
          icon: "/yas-logo.png",
        });
      } catch {
        // Notification may fail in some contexts — silently ignore
      }
    }
  }, []);

  const allAlerts: Alert[] = demoAlerts;

  const filtered = allAlerts.filter((alert) => {
    if (filter === "all") return true;
    return severityToFilter(alert.severity) === filter;
  });

  const criticalCount = allAlerts.filter((a) => a.severity === "critical").length;
  const warningCount = allAlerts.filter((a) => ["high", "medium"].includes(a.severity)).length;
  const infoCount = allAlerts.filter((a) => ["low"].includes(a.severity)).length;
  const acknowledgedCount = acknowledged.size;

  const filters: { key: FilterType; label: string; color: string; count: number }[] = [
    { key: "all", label: "All", color: "#94A3B8", count: allAlerts.length },
    { key: "critical", label: "Critical", color: "#EF4444", count: criticalCount },
    { key: "warning", label: "Warning", color: "#F59E0B", count: warningCount },
    { key: "info", label: "Info", color: "#3B82F6", count: infoCount },
  ];

  return (
    <div className="pt-6 md:pt-8 pb-24 md:pb-8 px-4 md:px-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-5 h-5" style={{ color: "#EF4444" }} />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#EF4444" }}>
              Alert Centre
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-yas-text mb-1">Alert Centre</h1>
          <p className="text-sm" style={{ color: "#94A3B8" }}>
            Real-time fleet monitoring events
          </p>
        </div>

        {/* Summary Strip */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 p-4 rounded-2xl border"
          style={{ background: "#131929", borderColor: "rgba(255,255,255,0.08)" }}
        >
          {[
            { label: "Total", value: allAlerts.length, color: "#94A3B8" },
            { label: "Critical", value: criticalCount, color: "#EF4444" },
            { label: "Warning", value: warningCount, color: "#F59E0B" },
            { label: "Acknowledged", value: acknowledgedCount, color: "#22C55E" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold" style={{ color: stat.color }}>
                {stat.value}
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#64748B" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{
                background: filter === f.key ? `${f.color}18` : "rgba(255,255,255,0.04)",
                color: filter === f.key ? f.color : "#64748B",
                border: filter === f.key ? `1px solid ${f.color}40` : "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {f.label}
              <span
                className="w-4 h-4 rounded-full flex items-center justify-center text-[9px]"
                style={{ background: filter === f.key ? `${f.color}30` : "rgba(255,255,255,0.08)" }}
              >
                {f.count}
              </span>
            </button>
          ))}
        </div>

        {/* Alert Cards */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div
              className="text-center py-12 rounded-2xl border text-sm"
              style={{ background: "#131929", borderColor: "rgba(255,255,255,0.08)", color: "#64748B" }}
            >
              No alerts in this category.
            </div>
          )}
          {filtered.map((alert) => {
            const isAcknowledged = acknowledged.has(alert.id);
            const filt = severityToFilter(alert.severity);
            const color = accentColor(filt);
            const asset = assetMap[alert.assetId];

            return (
              <div
                key={alert.id}
                className="relative rounded-2xl border overflow-hidden transition-all"
                style={{
                  background: "#131929",
                  borderColor: isAcknowledged ? "rgba(255,255,255,0.05)" : `${color}25`,
                  opacity: isAcknowledged ? 0.65 : 1,
                }}
              >
                {/* Left accent bar */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1"
                  style={{ background: isAcknowledged ? "#64748B" : color }}
                />

                <div className="pl-4 pr-4 py-4 flex flex-col md:flex-row md:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-semibold text-yas-text">{alert.title}</span>
                      {isAcknowledged && (
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
                          style={{ background: "rgba(34,197,94,0.1)", color: "#22C55E" }}
                        >
                          <CheckCircle className="w-2.5 h-2.5" /> Acknowledged
                        </span>
                      )}
                      {/* Severity badge */}
                      <span
                        className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full"
                        style={{
                          background: `${color}15`,
                          color: color,
                        }}
                      >
                        {alert.severity}
                      </span>
                      {/* Type badge */}
                      <span
                        className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(255,255,255,0.06)", color: "#64748B" }}
                      >
                        {alert.type.replace(/_/g, " ")}
                      </span>
                    </div>

                    {asset && (
                      <div className="text-xs mb-1" style={{ color: "#14B8A6" }}>
                        {asset.name} · {asset.fleetId}
                      </div>
                    )}

                    <p className="text-xs leading-relaxed" style={{ color: "#94A3B8" }}>
                      {alert.description}
                    </p>

                    <div className="text-[10px] mt-1.5" style={{ color: "#64748B" }}>
                      {getRelativeTime(alert.timestamp)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!isAcknowledged ? (
                      <button
                        onClick={() => setAcknowledged((prev) => { const next = new Set(Array.from(prev)); next.add(alert.id); return next; })}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                        style={{
                          background: "rgba(34,197,94,0.1)",
                          color: "#22C55E",
                          border: "1px solid rgba(34,197,94,0.2)",
                        }}
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Acknowledge
                      </button>
                    ) : (
                      <div
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                        style={{ background: "rgba(100,116,139,0.1)", color: "#64748B", border: "1px solid rgba(100,116,139,0.2)" }}
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Done
                      </div>
                    )}
                    <Link
                      href={`/asset/${alert.assetId}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                      style={{
                        background: "rgba(59,130,246,0.1)",
                        color: "#3B82F6",
                        border: "1px solid rgba(59,130,246,0.2)",
                      }}
                    >
                      <Eye className="w-3.5 h-3.5" /> View Asset
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
  );
}
