"use client";

import { useState, useRef, useCallback, DragEvent, ChangeEvent, useEffect } from "react";
import { Activity, Upload, Download, CheckCircle, ArrowRight, Zap, MapPin, Battery, Gauge, Play, Square, PlusCircle, AlertTriangle, TrendingDown } from "lucide-react";
import { assets } from "@/lib/demo-data";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LiveVehicle {
  vin: string;
  lastSeen: string;
  speed: number;
  soc: number;
  odometer: number;
  batteryRange: number;
  location: { lat: number; lng: number } | null;
  selfDrivingMiles: number;
  risk: { riskLevel: string; flags: string[] };
  model?: string;
  routeName?: string;
  simulated?: boolean;
}

interface SimulatorStatus {
  running: boolean;
  vehicleCount: number;
  vehicles: { vin: string; model: string; routeName: string }[];
}

interface TrafficSegment {
  id: string;
  name: string;
  speed: number;
  speedLimit: number;
  congestionLevel: "low" | "medium" | "high" | "severe";
}

// ─── CSV Upload helpers ───────────────────────────────────────────────────────

const SAMPLE_CSV = `asset_id,timestamp,battery_pct,speed_kmh,gforce,fault_code,lat,lng
HK-BOT-001,2026-03-22T08:00:00Z,87,12,0.3,,22.3193,114.1694
HK-BOT-002,2026-03-22T08:00:00Z,34,0,0.1,F-002,22.3195,114.1698
HK-BOT-003,2026-03-22T08:01:00Z,72,28,6.2,COLLISION,22.3190,114.1701
HK-EV-001,2026-03-22T08:00:00Z,91,45,0.4,,22.3188,114.1695
HK-EV-002,2026-03-22T08:00:00Z,18,0,0.1,BATT-LOW,22.3200,114.1700`;

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const vals = line.split(",");
    return Object.fromEntries(headers.map((h, i) => [h, (vals[i] ?? "").trim()]));
  });
}

function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const MOCK_RESCORE_REASONS: Record<string, string> = {
  improved: "Battery health improved; fault-free operation",
  worsened_gforce: "High G-force events detected (collision risk)",
  worsened_battery: "Critically low battery reported",
  improved_route: "Optimised route behaviour, fewer stops",
  neutral: "No significant change in telemetry pattern",
};

function generateRescoreResults() {
  const sample = [...assets].sort((a, b) => b.riskScore - a.riskScore).slice(0, 5);
  return sample.map((asset, i) => {
    const deltas = [8, -12, -7, 5, -9];
    const delta = deltas[i];
    const reasons = [
      MOCK_RESCORE_REASONS.improved,
      MOCK_RESCORE_REASONS.worsened_gforce,
      MOCK_RESCORE_REASONS.worsened_battery,
      MOCK_RESCORE_REASONS.improved_route,
      MOCK_RESCORE_REASONS.neutral,
    ];
    return {
      id: asset.name,
      prev: asset.riskScore,
      next: Math.max(0, Math.min(100, asset.riskScore + delta)),
      delta,
      reason: reasons[i],
    };
  });
}

// ─── Risk badge ───────────────────────────────────────────────────────────────

function RiskBadge({ level }: { level: string }) {
  const colors: Record<string, { bg: string; color: string }> = {
    CRITICAL: { bg: 'rgba(239,68,68,0.12)', color: '#EF4444' },
    ELEVATED: { bg: 'rgba(245,158,11,0.12)', color: '#F59E0B' },
    NORMAL: { bg: 'rgba(34,197,94,0.12)', color: '#22C55E' },
  };
  const c = colors[level] || colors.NORMAL;
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
      style={{ background: c.bg, color: c.color }}
    >
      {level}
    </span>
  );
}

// ─── SoC bar ──────────────────────────────────────────────────────────────────

function SocBar({ soc }: { soc: number }) {
  const color = soc < 15 ? '#EF4444' : soc < 30 ? '#F59E0B' : '#81D8D0';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.min(100, soc)}%`, background: color }}
        />
      </div>
      <span className="text-xs font-semibold tabular-nums" style={{ color, minWidth: 36 }}>
        {soc.toFixed(1)}%
      </span>
    </div>
  );
}

// ─── Live Vehicle Card ────────────────────────────────────────────────────────

function VehicleCard({ v, isDemo }: { v: LiveVehicle; isDemo: boolean }) {
  const age = v.lastSeen
    ? Math.floor((Date.now() - new Date(v.lastSeen).getTime()) / 1000)
    : 999;
  const isStale = age > 10;

  return (
    <div
      className="rounded-2xl border p-5 transition-all"
      style={{
        background: '#111827',
        borderColor: isStale ? 'rgba(255,255,255,0.05)' : 'rgba(129,216,208,0.15)',
      }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-yas-text">{v.model || 'Tesla'}</span>
            {isDemo ? (
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                style={{ background: 'rgba(129,216,208,0.12)', color: '#81D8D0' }}
              >
                LIVE DEMO
              </span>
            ) : (
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                style={{ background: 'rgba(34,197,94,0.12)', color: '#22C55E' }}
              >
                LIVE TESLA
              </span>
            )}
          </div>
          <div className="text-[10px] font-mono mt-0.5" style={{ color: '#475569' }}>
            {v.vin}
          </div>
        </div>
        <RiskBadge level={v.risk.riskLevel} />
      </div>

      {/* Route */}
      {v.routeName && (
        <div className="flex items-center gap-1.5 mb-3 text-xs" style={{ color: '#64748B' }}>
          <MapPin className="w-3 h-3" />
          {v.routeName}
          {v.location && (
            <span className="font-mono ml-1">
              ({v.location.lat.toFixed(4)}, {v.location.lng.toFixed(4)})
            </span>
          )}
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div
          className="rounded-xl p-3"
          style={{ background: 'rgba(255,255,255,0.03)' }}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <Gauge className="w-3 h-3" style={{ color: '#81D8D0' }} />
            <span className="text-[10px] uppercase tracking-wider" style={{ color: '#64748B' }}>Speed</span>
          </div>
          <span className="text-lg font-bold text-yas-text tabular-nums">
            {v.speed.toFixed(0)}
          </span>
          <span className="text-[10px] ml-1" style={{ color: '#64748B' }}>km/h</span>
        </div>
        <div
          className="rounded-xl p-3"
          style={{ background: 'rgba(255,255,255,0.03)' }}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <Zap className="w-3 h-3" style={{ color: '#81D8D0' }} />
            <span className="text-[10px] uppercase tracking-wider" style={{ color: '#64748B' }}>Range</span>
          </div>
          <span className="text-lg font-bold text-yas-text tabular-nums">
            {v.batteryRange.toFixed(0)}
          </span>
          <span className="text-[10px] ml-1" style={{ color: '#64748B' }}>km</span>
        </div>
      </div>

      {/* Battery bar */}
      <div className="mb-2">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Battery className="w-3 h-3" style={{ color: '#64748B' }} />
          <span className="text-[10px] uppercase tracking-wider" style={{ color: '#64748B' }}>Battery</span>
        </div>
        <SocBar soc={v.soc} />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3">
        <span className="text-[10px]" style={{ color: '#475569' }}>
          ODO {v.odometer.toFixed(0)} km
        </span>
        {v.selfDrivingMiles > 0 && (
          <span className="text-[10px]" style={{ color: '#81D8D0' }}>
            FSD {v.selfDrivingMiles.toFixed(1)} mi
          </span>
        )}
        <span
          className="text-[10px]"
          style={{ color: isStale ? '#EF4444' : '#22C55E' }}
        >
          {isStale ? `${age}s ago` : 'live'}
        </span>
      </div>
    </div>
  );
}

// ─── Traffic Risk Panel ───────────────────────────────────────────────────────

const CONGESTION_CONFIG: Record<TrafficSegment["congestionLevel"], { label: string; color: string; bg: string; icon: string }> = {
  severe: { label: "SEVERE", color: "#EF4444", bg: "rgba(239,68,68,0.10)", icon: "🔴" },
  high:   { label: "HIGH",   color: "#F59E0B", bg: "rgba(245,158,11,0.10)", icon: "🟠" },
  medium: { label: "MED",    color: "#EAB308", bg: "rgba(234,179,8,0.10)",  icon: "🟡" },
  low:    { label: "LOW",    color: "#22C55E", bg: "rgba(34,197,94,0.10)",  icon: "🟢" },
};

function TrafficRiskPanel() {
  const [segments, setSegments] = useState<TrafficSegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState(false);

  const fetchTraffic = useCallback(async () => {
    try {
      const res = await fetch("/api/risk/traffic-speed");
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json() as TrafficSegment[];
      setSegments(data.slice(0, 5));
      setLastUpdated(new Date());
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTraffic();
    const interval = setInterval(fetchTraffic, 5 * 60 * 1000); // refresh every 5 min
    return () => clearInterval(interval);
  }, [fetchTraffic]);

  const speedRatio = (s: TrafficSegment) => ((s.speed / s.speedLimit) * 100).toFixed(0);

  return (
    <div
      className="rounded-2xl border p-5 mb-6"
      style={{ background: "#111827", borderColor: "rgba(239,68,68,0.15)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(239,68,68,0.1)" }}
          >
            <AlertTriangle className="w-4 h-4" style={{ color: "#EF4444" }} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-yas-text">HK Live Traffic Risk</h3>
            <p className="text-[10px]" style={{ color: "#64748B" }}>
              Top 5 congested corridors · underwriting risk multiplier reference
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-[10px]" style={{ color: "#475569" }}>
              {lastUpdated.toLocaleTimeString("en-HK", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: error ? "#EF4444" : "#22C55E" }}
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-6">
          <div
            className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "#EF4444", borderTopColor: "transparent" }}
          />
          <span className="ml-2 text-xs" style={{ color: "#64748B" }}>Fetching HK traffic data…</span>
        </div>
      ) : segments.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-xs" style={{ color: "#64748B" }}>No traffic data available</p>
        </div>
      ) : (
        <div className="space-y-2">
          {segments.map((seg) => {
            const cfg = CONGESTION_CONFIG[seg.congestionLevel];
            const ratio = Number(speedRatio(seg));
            return (
              <div
                key={seg.id}
                className="rounded-xl p-3 flex items-center gap-3"
                style={{ background: cfg.bg, border: `1px solid ${cfg.color}22` }}
              >
                {/* Congestion badge */}
                <div
                  className="flex-shrink-0 w-16 text-center px-2 py-1 rounded-lg text-[10px] font-bold"
                  style={{ background: `${cfg.color}22`, color: cfg.color }}
                >
                  {cfg.icon} {cfg.label}
                </div>

                {/* Road info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 flex-shrink-0" style={{ color: "#64748B" }} />
                    <span className="text-xs font-semibold text-yas-text truncate">{seg.name}</span>
                  </div>
                  {/* Speed bar */}
                  <div className="flex items-center gap-2 mt-1.5">
                    <div
                      className="flex-1 h-1.5 rounded-full"
                      style={{ background: "rgba(255,255,255,0.06)" }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(100, ratio)}%`, background: cfg.color }}
                      />
                    </div>
                    <span className="text-[10px] tabular-nums flex-shrink-0" style={{ color: cfg.color }}>
                      {ratio}%
                    </span>
                  </div>
                </div>

                {/* Speed stats */}
                <div className="flex-shrink-0 text-right">
                  <div className="flex items-center gap-1 justify-end">
                    <TrendingDown className="w-3 h-3" style={{ color: cfg.color }} />
                    <span className="text-sm font-bold tabular-nums" style={{ color: cfg.color }}>
                      {seg.speed}
                    </span>
                    <span className="text-[10px]" style={{ color: "#475569" }}>/ {seg.speedLimit} km/h</span>
                  </div>
                  <div className="text-[10px] mt-0.5" style={{ color: "#475569" }}>
                    {seg.id}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer note */}
      <div
        className="mt-3 pt-3 flex items-center gap-1.5 text-[10px]"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)", color: "#475569" }}
      >
        <AlertTriangle className="w-3 h-3" />
        ARIA applies 1.35× tunnel premium · 1.15× high-gradient route multiplier · Source: HK Transport Dept
      </div>
    </div>
  );
}

// ─── Page state ───────────────────────────────────────────────────────────────

type PageState = "idle" | "preview" | "scoring" | "results" | "applied";

export default function TelemetryPage() {
  // CSV upload state
  const [state, setState] = useState<PageState>("idle");
  const [dragging, setDragging] = useState(false);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [filename, setFilename] = useState("");
  const [rescoreResults] = useState(generateRescoreResults);
  const inputRef = useRef<HTMLInputElement>(null);

  // Live telemetry state
  const [liveVehicles, setLiveVehicles] = useState<LiveVehicle[]>([]);
  const [simStatus, setSimStatus] = useState<SimulatorStatus | null>(null);
  const [simLoading, setSimLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'live' | 'import'>('live');

  // Poll live telemetry
  useEffect(() => {
    const poll = async () => {
      try {
        const [vehicleRes, simRes] = await Promise.all([
          fetch('/api/telemetry/ingest'),
          fetch('/api/telemetry/simulate'),
        ]);
        if (vehicleRes.ok) {
          const data = await vehicleRes.json() as { vehicles: LiveVehicle[] };
          setLiveVehicles(data.vehicles || []);
        }
        if (simRes.ok) {
          const data = await simRes.json() as SimulatorStatus;
          setSimStatus(data);
        }
      } catch {
        // ignore
      }
    };

    poll();
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSimAction = async (action: 'start' | 'stop' | 'add_vehicle') => {
    setSimLoading(true);
    try {
      const res = await fetch('/api/telemetry/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        const data = await res.json() as SimulatorStatus & { running?: boolean };
        if ('running' in data) {
          setSimStatus((prev) => prev ? { ...prev, running: data.running ?? prev.running } : null);
        }
      }
    } catch {
      // ignore
    } finally {
      setSimLoading(false);
    }
  };

  // Identify which VINs are from simulator
  const simVins = new Set((simStatus?.vehicles || []).map((v) => v.vin));
  const simVinMap = new Map((simStatus?.vehicles || []).map((v) => [v.vin, v]));

  // CSV handlers
  const processFile = useCallback((file: File) => {
    setFilename(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text);
      setRows(parsed);
      setState("preview");
      setTimeout(() => {
        setState("scoring");
        setTimeout(() => setState("results"), 2000);
      }, 600);
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const previewRows = rows.slice(0, 10);
  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
  const improvedCount = rescoreResults.filter((r) => r.delta < 0).length;
  const worsenedCount = rescoreResults.filter((r) => r.delta > 0).length;

  return (
    <div className="pt-6 md:pt-8 pb-24 md:pb-8 px-4 md:px-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-5 h-5" style={{ color: '#81D8D0' }} />
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#81D8D0' }}>
            Telemetry
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-yas-text mb-1">Telemetry Monitor</h1>
        <p className="text-sm" style={{ color: '#94A3B8' }}>
          Live Tesla vehicle data and fleet risk re-scoring
        </p>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{ background: '#111827' }}>
        {(['live', 'import'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={
              activeTab === tab
                ? { background: 'rgba(129,216,208,0.12)', color: '#81D8D0' }
                : { color: '#64748B' }
            }
          >
            {tab === 'live' ? '⚡ Live Monitor' : '📥 Import CSV'}
          </button>
        ))}
      </div>

      {/* ── LIVE TAB ── */}
      {activeTab === 'live' && (
        <div>
          {/* HK Live Traffic Risk */}
          <TrafficRiskPanel />

          {/* Simulator controls */}
          <div
            className="rounded-2xl border p-4 mb-6 flex flex-wrap items-center gap-3"
            style={{ background: '#111827', borderColor: 'rgba(129,216,208,0.1)' }}
          >
            <div className="flex items-center gap-2 mr-auto">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: simStatus?.running ? '#22C55E' : '#64748B' }}
              />
              <span className="text-sm font-semibold text-yas-text">
                {simStatus?.running ? 'Simulator Running' : 'Simulator Stopped'}
              </span>
              {simStatus && (
                <span className="text-xs" style={{ color: '#64748B' }}>
                  — {simStatus.vehicleCount} vehicle{simStatus.vehicleCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            <button
              onClick={() => handleSimAction(simStatus?.running ? 'stop' : 'start')}
              disabled={simLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90 disabled:opacity-50"
              style={{
                background: simStatus?.running
                  ? 'rgba(239,68,68,0.12)'
                  : 'linear-gradient(135deg, #81D8D0, #4FB3AC)',
                color: simStatus?.running ? '#EF4444' : '#0B0F16',
              }}
            >
              {simStatus?.running
                ? <><Square className="w-3 h-3" /> Stop</>
                : <><Play className="w-3 h-3" /> Start</>
              }
            </button>

            <button
              onClick={() => handleSimAction('add_vehicle')}
              disabled={simLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90 disabled:opacity-50"
              style={{
                background: 'rgba(129,216,208,0.08)',
                color: '#81D8D0',
                border: '1px solid rgba(129,216,208,0.2)',
              }}
            >
              <PlusCircle className="w-3 h-3" /> Add Vehicle
            </button>
          </div>

          {/* Live vehicle grid */}
          {liveVehicles.length === 0 ? (
            <div
              className="rounded-2xl border p-12 text-center"
              style={{ background: '#111827', borderColor: 'rgba(255,255,255,0.06)' }}
            >
              <Activity className="w-10 h-10 mx-auto mb-3" style={{ color: '#1E293B' }} />
              <p className="text-sm font-semibold text-yas-text mb-1">No live vehicles yet</p>
              <p className="text-xs" style={{ color: '#64748B' }}>
                Start the simulator or connect a Tesla to see real-time data
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {liveVehicles.map((v) => {
                const simInfo = simVinMap.get(v.vin);
                const enriched: LiveVehicle = {
                  ...v,
                  model: (v.model as string | undefined) || simInfo?.model,
                  routeName: (v.routeName as string | undefined) || simInfo?.routeName,
                  simulated: (v.simulated as boolean | undefined) ?? simVins.has(v.vin),
                };
                return (
                  <VehicleCard
                    key={v.vin}
                    v={enriched}
                    isDemo={simVins.has(v.vin)}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── IMPORT TAB ── */}
      {activeTab === 'import' && (
        <div>
          {/* Upload Zone */}
          <div className="mb-8">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className="relative rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-all"
              style={{
                background: dragging ? "rgba(59,130,246,0.08)" : "rgba(15,22,40,0.6)",
                borderColor: dragging ? "#3B82F6" : "rgba(59,130,246,0.3)",
              }}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
              />
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "rgba(59,130,246,0.1)" }}
              >
                <Upload className="w-6 h-6" style={{ color: "#3B82F6" }} />
              </div>
              <div className="text-base font-semibold text-yas-text mb-1">
                Drop your telemetry CSV here, or click to browse
              </div>
              <div className="text-xs mb-4" style={{ color: "#64748B" }}>
                Columns: asset_id, timestamp, battery_pct, speed_kmh, gforce, fault_code, lat, lng
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  downloadCSV(SAMPLE_CSV, "yas-telemetry-sample.csv");
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
                style={{
                  background: "rgba(59,130,246,0.1)",
                  color: "#3B82F6",
                  border: "1px solid rgba(59,130,246,0.2)",
                }}
              >
                <Download className="w-3.5 h-3.5" /> Download Sample CSV
              </button>
              {filename && (
                <div
                  className="mt-4 text-xs font-medium px-3 py-1.5 rounded-full inline-block"
                  style={{ background: "rgba(34,197,94,0.1)", color: "#22C55E" }}
                >
                  ✓ {filename} uploaded
                </div>
              )}
            </div>
          </div>

          {/* Parsed Data Preview */}
          {(state === "preview" || state === "scoring" || state === "results" || state === "applied") && rows.length > 0 && (
            <div className="mb-8">
              <h2 className="text-base font-bold text-yas-text mb-3">
                Parsed Data Preview
                <span className="ml-2 text-xs font-normal" style={{ color: "#64748B" }}>
                  (first {Math.min(10, rows.length)} of {rows.length} rows)
                </span>
              </h2>
              <div className="rounded-2xl border overflow-hidden" style={{ background: "#131929", borderColor: "rgba(255,255,255,0.08)" }}>
                <div className="overflow-x-auto">
                  <table className="w-full font-mono text-xs">
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        {headers.map((h) => (
                          <th key={h} className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#64748B" }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewRows.map((row, i) => (
                        <tr key={i} style={{ borderBottom: i < previewRows.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                          {headers.map((h) => (
                            <td key={h} className="px-4 py-2 text-xs" style={{ color: row[h] ? "#F1F5F9" : "#3B3F4B" }}>
                              {row[h] || "—"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Scoring spinner */}
          {state === "scoring" && (
            <div className="mb-8 rounded-2xl border p-8 text-center" style={{ background: "#131929", borderColor: "rgba(59,130,246,0.2)" }}>
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#3B82F6", borderTopColor: "transparent" }} />
                <span className="text-base font-semibold text-yas-text">ARIA is re-scoring your fleet...</span>
              </div>
              <p className="text-xs" style={{ color: "#64748B" }}>Analysing telemetry patterns, fault signatures, and behavioural anomalies</p>
            </div>
          )}

          {/* Results */}
          {(state === "results" || state === "applied") && (
            <div className="mb-8">
              <h2 className="text-base font-bold text-yas-text mb-1">Risk Re-scoring Results</h2>
              <div className="flex items-center gap-4 mb-4 text-xs" style={{ color: "#94A3B8" }}>
                <span><span className="font-bold" style={{ color: "#22C55E" }}>{improvedCount}</span> assets improved</span>
                <span><span className="font-bold" style={{ color: "#EF4444" }}>{worsenedCount}</span> assets worsened</span>
                <span><span className="font-bold" style={{ color: "#14B8A6" }}>{rescoreResults.length}</span> assets updated</span>
              </div>
              <div className="rounded-2xl border overflow-hidden" style={{ background: "#131929", borderColor: "rgba(255,255,255,0.08)" }}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        {["Asset ID", "Previous Score", "New Score", "Delta", "Key Change Reason"].map((h) => (
                          <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "#64748B" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rescoreResults.map((r, i) => {
                        const improved = r.delta < 0;
                        const deltaColor = improved ? "#22C55E" : r.delta > 0 ? "#EF4444" : "#64748B";
                        return (
                          <tr key={r.id} style={{ borderBottom: i < rescoreResults.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                            <td className="px-5 py-3.5 font-mono text-xs text-yas-text">{r.id}</td>
                            <td className="px-5 py-3.5 text-sm" style={{ color: "#94A3B8" }}>{r.prev}</td>
                            <td className="px-5 py-3.5 text-sm font-semibold" style={{ color: deltaColor }}>{r.next}</td>
                            <td className="px-5 py-3.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: `${deltaColor}15`, color: deltaColor }}>
                                {r.delta > 0 ? "+" : ""}{r.delta}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-xs" style={{ color: "#94A3B8" }}>{r.reason}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-5">
                {state === "results" && (
                  <button
                    onClick={() => setState("applied")}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                    style={{ background: "linear-gradient(135deg, #14B8A6, #0D9488)", color: "#fff", boxShadow: "0 2px 16px rgba(20,184,166,0.25)" }}
                  >
                    Apply Updated Risk Scores <ArrowRight className="w-4 h-4" />
                  </button>
                )}
                {state === "applied" && (
                  <div className="flex items-center gap-3 p-4 rounded-2xl border" style={{ background: "rgba(34,197,94,0.08)", borderColor: "rgba(34,197,94,0.2)" }}>
                    <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: "#22C55E" }} />
                    <div>
                      <div className="text-sm font-semibold" style={{ color: "#22C55E" }}>Risk profiles updated.</div>
                      <div className="text-xs mt-0.5" style={{ color: "#94A3B8" }}>Premium adjustments will be reflected in your next billing cycle.</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
