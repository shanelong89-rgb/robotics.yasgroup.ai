"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, ChevronLeft, ChevronRight, Activity } from "lucide-react";
import { Asset, AssetType, AssetStatus, EventStreamEntry } from "@/types";
import { assets as demoAssets, kpiSummary as demoKpi, initialEventStream } from "@/lib/demo-data";
import RightControlPanel from "@/components/RightControlPanel";
import EventStreamItem from "@/components/EventStreamItem";
import { api, setAccessToken, getAccessToken, mapApiAsset } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { useCommandCenter } from "@/store/commandCenter";

// Dynamic imports — all mobile/heavy components load client-side only
const MobileAssetSheet = dynamic(() => import("@/components/MobileAssetSheet"), { ssr: false });
const MobileKPIStrip = dynamic(() => import("@/components/MobileKPIStrip"), { ssr: false });
const AgentFAB = dynamic(() => import("@/components/AgentFAB"), { ssr: false });
const FNOLPanel = dynamic(() => import("@/components/FNOLPanel"), { ssr: false });

// Dynamic import for Map to avoid SSR issues
const FleetMap = dynamic(() => import("@/components/FleetMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-yas-base">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-yas-blue border-t-transparent rounded-full animate-spin" />
        <span className="text-yas-muted text-sm">Loading map...</span>
      </div>
    </div>
  ),
});

export default function CommandCenter() {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [fnolOpen, setFnolOpen] = useState(false);
  const [fnolAsset, setFnolAsset] = useState<Asset | null>(null);
  const [liveAssets, setLiveAssets] = useState<Asset[]>(demoAssets);
  const [leftRailOpen, setLeftRailOpen] = useState(true);
  const [eventStream, setEventStream] = useState<EventStreamEntry[]>(initialEventStream);
  const [filterType, setFilterType] = useState<AssetType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<AssetStatus | "all">("all");
  const [filterFleet, setFilterFleet] = useState<string>("all");
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [kpiData, setKpiData] = useState(demoKpi);
  const [secondsAgo, setSecondsAgo] = useState(0);

  const { loadSnapshot, updateAssetPosition, addAlert } = useCommandCenter();

  // Last-updated counter
  useEffect(() => {
    const timer = setInterval(() => setSecondsAgo(s => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load real data from API on mount, with demo fallback
  useEffect(() => {
    async function loadRealData() {
      try {
        if (!getAccessToken()) {
          const loginResult = await api.auth.login('admin@yas.io', 'demo1234');
          setAccessToken(loginResult.accessToken);
        }

        const snapshot = await api.command.snapshot();
        loadSnapshot(snapshot);

        if (snapshot.assets && snapshot.assets.length > 0) {
          const mappedAssets = snapshot.assets.map((a: any) => mapApiAsset(a) as unknown as Asset);
          setLiveAssets(mappedAssets);
        }

        if (snapshot.kpi) {
          setKpiData({
            ...demoKpi,
            ...snapshot.kpi,
            totalAssets: snapshot.kpi.totalAssets,
            protectedAssets: snapshot.kpi.protectedAssets,
            reserveBalance: snapshot.kpi.totalReserveBalance,
            coverageRatio: snapshot.kpi.reserveCoverageRatio,
          });
        }

        console.log('[API] Loaded real snapshot:', snapshot.assets?.length, 'assets');
      } catch (err) {
        console.warn('[API] Could not load real data, using demo data:', err);
      }
    }

    loadRealData();
  }, [loadSnapshot]);

  // Connect Socket.io for live updates
  useEffect(() => {
    let socket: any;
    try {
      socket = getSocket();

      socket.on('asset:location_update', (envelope: any) => {
        const p = envelope.payload || envelope;
        updateAssetPosition(p.assetId, p.lat, p.lng, p.speedKph);
        setLiveAssets(prev =>
          prev.map(a =>
            a.id === p.assetId ? { ...a, lat: p.lat, lng: p.lng } : a
          )
        );
      });

      socket.on('alert:new', (envelope: any) => {
        const p = envelope.payload || envelope;
        addAlert(p);
        const newEvent: EventStreamEntry = {
          id: `ws-alert-${Date.now()}`,
          type: 'alert',
          severity: (p.severity || 'info').toLowerCase() as 'info' | 'warning' | 'critical',
          title: p.title || 'Alert',
          description: p.description || '',
          timestamp: p.timestamp || new Date().toISOString(),
        };
        setEventStream(prev => [newEvent, ...prev].slice(0, 50));
      });

      socket.on('telemetry:event', (envelope: any) => {
        const p = envelope.payload || envelope;
        const newEvent: EventStreamEntry = {
          id: `ws-tel-${Date.now()}`,
          type: 'telemetry',
          severity: 'info',
          title: p.eventType || 'Telemetry',
          description: p.summary || 'Event received',
          timestamp: p.timestamp || new Date().toISOString(),
        };
        setEventStream(prev => [newEvent, ...prev].slice(0, 50));
      });
    } catch (err) {
      console.warn('[WS] Socket.io unavailable');
    }

    return () => {
      if (socket) {
        socket.off('asset:location_update');
        socket.off('alert:new');
        socket.off('telemetry:event');
      }
    };
  }, [updateAssetPosition, addAlert]);

  // Fallback local simulation
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (Math.random() > 0.8) {
        const randomEvent: EventStreamEntry = {
          id: `ev-live-${Date.now()}`,
          type: Math.random() > 0.7 ? "alert" : Math.random() > 0.5 ? "telemetry" : "reserve",
          severity: Math.random() > 0.8 ? "warning" : "info",
          title: ["Route optimized", "Heartbeat received", "Position updated", "Premium accrued", "Risk score updated"][
            Math.floor(Math.random() * 5)
          ],
          description: ["All systems nominal", "Asset reporting telemetry", "Daily premium increment logged", "Position fix acquired"][
            Math.floor(Math.random() * 4)
          ],
          timestamp: new Date().toISOString(),
        };
        setEventStream(prev => [randomEvent, ...prev].slice(0, 50));
      }
    }, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const filteredAssets = liveAssets.filter(a => {
    if (filterType !== "all" && a.type !== filterType) return false;
    if (filterStatus !== "all" && a.status !== filterStatus) return false;
    if (filterFleet !== "all" && a.fleetId !== filterFleet) return false;
    return true;
  });

  const criticalCount = liveAssets.filter(a => a.status === "critical").length;
  const warningCount = liveAssets.filter(a => a.status === "warning").length;

  return (
    <div className="overflow-hidden" style={{ height: '100dvh', position: 'fixed', inset: 0 }}>
      {/* ===================== MOBILE LAYOUT ===================== */}

      {/* Mobile compact header */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-12"
        style={{
          background: 'rgba(5,8,20,0.97)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <span className="text-sm font-black text-white tracking-tight">YAS</span>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] text-yas-muted uppercase tracking-widest">Live</span>
        </div>
        <button onClick={() => setFilterDrawerOpen(!filterDrawerOpen)} className="p-2">
          <Filter className="w-4 h-4 text-yas-muted" />
        </button>
      </div>

      {/* Mobile KPI strip */}
      <div
        className="md:hidden fixed top-12 left-0 right-0 z-40"
        style={{
          background: 'rgba(5,8,20,0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <MobileKPIStrip kpis={[
          { label: 'Assets', value: liveAssets.filter(a => a.status === 'active').length },
          { label: 'Protected', value: kpiData.protectedAssets },
          { label: 'Alerts', value: criticalCount, urgent: criticalCount > 0 },
          { label: 'Claims', value: kpiData.claimsInProgress },
          { label: 'Reserve', value: `${(kpiData.reserveCoverageRatio || 3.1).toFixed(1)}x` },
        ]} />
      </div>

      {/* Mobile full-screen map */}
      <div className="md:hidden fixed inset-0 top-0 z-0">
        <FleetMap
          assets={filteredAssets}
          selectedAsset={selectedAsset}
          onAssetSelect={setSelectedAsset}
        />
      </div>

      {/* Mobile asset sheet */}
      <MobileAssetSheet asset={selectedAsset} onClose={() => setSelectedAsset(null)} />

      {/* Mobile filter drawer — pure CSS, no framer-motion */}
      <>
        <div
          className="fixed inset-0 z-40 md:hidden bg-black/50"
          style={{
            opacity: filterDrawerOpen ? 1 : 0,
            pointerEvents: filterDrawerOpen ? 'auto' : 'none',
            transition: 'opacity 0.2s ease',
          }}
          onClick={() => setFilterDrawerOpen(false)}
        />
        <div
          className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl md:hidden p-5"
          style={{
            background: 'rgba(10,14,26,0.99)',
            border: '1px solid rgba(255,255,255,0.10)',
            borderBottom: 'none',
            paddingBottom: 'calc(env(safe-area-inset-bottom) + 20px)',
            transform: filterDrawerOpen ? 'translateY(0)' : 'translateY(100%)',
            transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
            pointerEvents: filterDrawerOpen ? 'auto' : 'none',
          }}
        >
              <div className="flex justify-center mb-4">
                <div className="w-10 h-1 rounded-full bg-white/20" />
              </div>
              <h3 className="text-sm font-bold text-yas-text mb-4">Filter Fleet</h3>

              <p className="text-[9px] uppercase tracking-widest text-yas-muted mb-2">Asset Type</p>
              <div className="flex gap-2 mb-4">
                {(['all', 'robot', 'ev', 'av'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setFilterType(t)}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                    style={{
                      background: filterType === t ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)',
                      color: filterType === t ? '#3B82F6' : '#94A3B8',
                      border: `1px solid ${filterType === t ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.08)'}`,
                    }}
                  >
                    {t === 'all' ? 'All' : t.toUpperCase()}
                  </button>
                ))}
              </div>

              <p className="text-[9px] uppercase tracking-widest text-yas-muted mb-2">Status</p>
              <div className="flex flex-wrap gap-2 mb-5">
                {(['all', 'active', 'warning', 'critical', 'idle', 'offline'] as const).map(s => {
                  const colors: Record<string, string> = {
                    active: '#22C55E', warning: '#F59E0B', critical: '#EF4444',
                    idle: '#64748B', offline: '#334155', all: '#3B82F6',
                  };
                  return (
                    <button
                      key={s}
                      onClick={() => setFilterStatus(s as AssetStatus | 'all')}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all capitalize"
                      style={{
                        background: filterStatus === s ? `${colors[s]}20` : 'rgba(255,255,255,0.05)',
                        color: filterStatus === s ? colors[s] : '#94A3B8',
                        border: `1px solid ${filterStatus === s ? `${colors[s]}40` : 'rgba(255,255,255,0.08)'}`,
                      }}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setFilterDrawerOpen(false)}
                className="w-full py-3 rounded-2xl text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #3B82F6, #14B8A6)' }}
              >
                Apply Filters
              </button>
        </div>
      </>

      {/* ===================== DESKTOP LAYOUT ===================== */}
      <div className="hidden md:flex h-[calc(100vh-56px)] flex-col overflow-hidden">
        {/* Ambient background gradients */}
        <div
          className="pointer-events-none"
          style={{ position: "fixed", zIndex: -1, top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <div style={{
            position: "absolute", top: "-10%", right: "-5%",
            width: "500px", height: "500px",
            background: "radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 70%)",
          }} />
          <div style={{
            position: "absolute", bottom: "-10%", left: "-5%",
            width: "500px", height: "500px",
            background: "radial-gradient(circle, rgba(20,184,166,0.03) 0%, transparent 70%)",
          }} />
        </div>

        {/* KPI Strip */}
        <div className="flex-shrink-0 px-4 py-2 border-b border-white/[0.06] bg-yas-surface/60 relative">
          <div className="flex items-center gap-0">
            {[
              { label: "ACTIVE ASSETS", value: liveAssets.filter(a => a.status === "active").length, color: "#22C55E" },
              { label: "PROTECTED", value: kpiData.protectedAssets, color: "#14B8A6" },
              { label: "CRITICAL", value: criticalCount, color: criticalCount > 0 ? "#EF4444" : "#64748B" },
              { label: "CLAIMS", value: kpiData.claimsInProgress, color: "#F59E0B" },
              { label: "RESERVE", value: `${kpiData.reserveCoverageRatio}×`, color: "#3B82F6" },
              { label: "PREMIUM TODAY", value: `HK$${kpiData.premiumAccruedToday.toLocaleString()}`, color: "#94A3B8" },
            ].map((kpi, i, arr) => (
              <div key={kpi.label} className="flex items-center flex-1 animate-fade-up">
                <div className="flex-1 px-3 py-1">
                  <p className="text-[9px] uppercase tracking-widest text-yas-muted font-medium mb-0.5">{kpi.label}</p>
                  <p className="text-[18px] font-bold tabular-nums leading-tight" style={{ color: kpi.color }}>{kpi.value}</p>
                </div>
                {i < arr.length - 1 && (
                  <div className="w-px h-8 bg-white/[0.06] flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-3">
            <span className="text-[9px] text-yas-muted">
              Updated {secondsAgo === 0 ? "just now" : `${secondsAgo}s ago`}
            </span>
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yas-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-yas-green"></span>
            </span>
            <span className="text-[9px] text-yas-green font-medium uppercase tracking-widest">Live</span>
          </div>
        </div>

        {/* Main Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Rail */}
          <AnimatePresence>
            {leftRailOpen && (
              <motion.div
                initial={{ x: -220, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -220, opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ width: 220 }}
                className="flex-shrink-0 border-r border-white/[0.06] bg-yas-surface/40 overflow-y-auto overflow-x-hidden"
              >
                <div className="p-4 w-[220px]">
                  <div className="flex items-center gap-2 mb-4">
                    <Filter className="w-3.5 h-3.5 text-yas-muted" />
                    <span className="text-[10px] uppercase tracking-widest text-yas-muted font-medium">Filters</span>
                  </div>

                  <FilterSection label="Asset Type">
                    {(["all", "robot", "ev", "av"] as const).map(t => (
                      <FilterButton key={t} active={filterType === t} onClick={() => setFilterType(t)}>
                        {t === "all" ? "All Types" : t === "robot" ? "🤖 Robots" : t === "ev" ? "🚗 EVs" : "🚐 AVs"}
                      </FilterButton>
                    ))}
                  </FilterSection>

                  <FilterSection label="Status">
                    {(["all", "active", "warning", "critical", "idle"] as const).map(s => (
                      <FilterButton key={s} active={filterStatus === s} onClick={() => setFilterStatus(s)}>
                        {s === "all" ? "All Status" : s.charAt(0).toUpperCase() + s.slice(1)}
                      </FilterButton>
                    ))}
                  </FilterSection>

                  <FilterSection label="Fleet">
                    <FilterButton active={filterFleet === "all"} onClick={() => setFilterFleet("all")}>All Fleets</FilterButton>
                    <FilterButton active={filterFleet === "fleet-hk-alpha"} onClick={() => setFilterFleet("fleet-hk-alpha")}>HK Robotics</FilterButton>
                    <FilterButton active={filterFleet === "fleet-sz-ev"} onClick={() => setFilterFleet("fleet-sz-ev")}>SZ EV Grid</FilterButton>
                    <FilterButton active={filterFleet === "fleet-tky-av"} onClick={() => setFilterFleet("fleet-tky-av")}>Tokyo AV</FilterButton>
                    <FilterButton active={filterFleet === "fleet-sg-log"} onClick={() => setFilterFleet("fleet-sg-log")}>SG Logistics</FilterButton>
                  </FilterSection>

                  <div className="mt-4 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <p className="text-[9px] uppercase tracking-widest text-yas-muted mb-2">Showing</p>
                    <p className="text-lg font-bold text-yas-text tabular-nums">{filteredAssets.length}</p>
                    <p className="text-[10px] text-yas-muted">of {liveAssets.length} assets</p>
                    {warningCount > 0 && (
                      <div className="mt-2 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-yas-amber" />
                        <span className="text-[10px] text-yas-amber">{warningCount} warning</span>
                      </div>
                    )}
                    {criticalCount > 0 && (
                      <div className="mt-1 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-yas-red animate-pulse" />
                        <span className="text-[10px] text-yas-red">{criticalCount} critical</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toggle button */}
          <button
            onClick={() => setLeftRailOpen(v => !v)}
            className="flex-shrink-0 w-5 flex items-center justify-center bg-yas-surface/40 border-r border-white/[0.06] hover:bg-white/[0.04] transition-colors"
          >
            {leftRailOpen ? (
              <ChevronLeft className="w-3 h-3 text-yas-muted" />
            ) : (
              <ChevronRight className="w-3 h-3 text-yas-muted" />
            )}
          </button>

          {/* Map Area */}
          <div className="flex-1 relative overflow-hidden">
            <FleetMap
              assets={filteredAssets}
              selectedAsset={selectedAsset}
              onAssetSelect={setSelectedAsset}
            />

            {/* Map legend */}
            <div
              className="absolute bottom-4 left-4 flex gap-2 z-[1000]"
              style={{ pointerEvents: "none" }}
            >
              {[
                { color: "bg-yas-green", label: "Normal" },
                { color: "bg-yas-amber", label: "Warning" },
                { color: "bg-yas-red", label: "Critical" },
                { color: "bg-yas-muted", label: "Idle" },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-yas-panel/90 border border-white/[0.06] backdrop-blur-sm">
                  <div className={`w-2 h-2 rounded-full ${color}`} />
                  <span className="text-[10px] text-yas-subtext">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Event Stream */}
        <div
          className="flex-shrink-0 border-t border-white/[0.06] bg-yas-surface/60"
          style={{ height: "96px" }}
        >
          <div className="flex items-center gap-3 px-4 py-1.5 border-b border-white/[0.04]">
            <Activity className="w-3 h-3 text-yas-blue animate-pulse" />
            <span className="text-[9px] uppercase tracking-widest text-yas-muted font-medium">Live Event Stream</span>
            <div className="flex items-center gap-1.5 ml-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yas-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-yas-green"></span>
              </span>
              <span className="text-[9px] text-yas-green font-medium">LIVE</span>
            </div>
          </div>
          <div className="overflow-x-auto flex gap-0" style={{ height: "68px" }}>
            <div className="flex min-w-max">
              {eventStream.slice(0, 12).map((event, i) => (
                <div key={event.id} className="w-72 flex-shrink-0 border-r border-white/[0.04]">
                  <EventStreamItem event={event} index={i} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Control Panel */}
        <RightControlPanel
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
          onReportIncident={(a) => { setFnolAsset(a); setFnolOpen(true); }}
        />

        <AgentFAB
          agents={['aria', 'cass']}
          context={{
            fleetName: selectedAsset?.fleetId ?? 'All Fleets',
            asset: selectedAsset ?? undefined,
            riskScore: selectedAsset?.riskScore,
            pools: { firstLoss: 2400000, shared: 8700000 },
            pendingLiabilities: 89200,
          }}
        />

        <FNOLPanel
          isOpen={fnolOpen}
          onClose={() => { setFnolOpen(false); setFnolAsset(null); }}
          asset={fnolAsset}
        />

        {!selectedAsset && (
          <div
            className="fixed right-4 top-1/2 -translate-y-1/2 z-40 pointer-events-none"
            style={{ opacity: 0.7 }}
          >
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-card px-4 py-3 flex items-center gap-3 border border-white/[0.06]"
            >
              <motion.span
                animate={{ x: [-2, 2, -2] }}
                transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                className="text-yas-blue text-sm"
              >
                ←
              </motion.span>
              <span className="text-xs text-yas-muted whitespace-nowrap">Select an asset on the map</span>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <p className="text-[9px] uppercase tracking-widest text-yas-muted font-medium mb-2">{label}</p>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-left text-xs px-2.5 py-1.5 rounded-lg transition-all ${
        active
          ? "bg-yas-blue/20 text-yas-blue border border-yas-blue/30"
          : "text-yas-muted hover:text-yas-subtext hover:bg-white/[0.04] border border-transparent"
      }`}
    >
      {children}
    </button>
  );
}
