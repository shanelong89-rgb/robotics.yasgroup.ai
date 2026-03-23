"use client";

import { useState, useRef, useCallback } from "react";
import { X, Upload, CheckCircle, AlertTriangle, FileText, Clock } from "lucide-react";
import Link from "next/link";

interface FNOLAsset {
  id: string;
  name: string;
  type: string;
  status: string;
  batteryLevel: number;
  lat: number;
  lng: number;
  geography: string;
}

interface FNOLPanelProps {
  isOpen: boolean;
  onClose: () => void;
  asset?: FNOLAsset | null;
}

type IncidentType = "Collision" | "Fault" | "Battery Failure" | "Geofence Breach" | "Sensor Failure" | "Other";
type Severity = "Minor" | "Moderate" | "Severe";

const geographyLabel: Record<string, string> = {
  hong_kong: "Hong Kong",
  shenzhen: "Shenzhen",
  tokyo: "Tokyo",
  singapore: "Singapore",
};

const INCIDENT_TYPES: IncidentType[] = ["Collision", "Fault", "Battery Failure", "Geofence Breach", "Sensor Failure", "Other"];

const SEVERITY_CONFIG: Record<Severity, { color: string; bg: string; border: string; value: number }> = {
  Minor: { color: "#22C55E", bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.3)", value: 5000 },
  Moderate: { color: "#F59E0B", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)", value: 25000 },
  Severe: { color: "#EF4444", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.3)", value: 80000 },
};

function getNowDatetimeLocal(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

function randomBetween(min: number, max: number, decimals = 0): number {
  const val = Math.random() * (max - min) + min;
  return decimals > 0 ? parseFloat(val.toFixed(decimals)) : Math.round(val);
}

export default function FNOLPanel({ isOpen, onClose, asset }: FNOLPanelProps) {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [claimId, setClaimId] = useState("");

  // Step 1 fields
  const [incidentType, setIncidentType] = useState<IncidentType>("Collision");
  const [datetime, setDatetime] = useState(getNowDatetimeLocal);
  const [location, setLocation] = useState(() =>
    asset ? (geographyLabel[asset.geography] ?? asset.geography) : ""
  );
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<Severity>("Minor");

  // Step 2 fields
  const [photos, setPhotos] = useState<{ name: string; url: string }[]>([]);
  const [witness, setWitness] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Telemetry snapshot (computed once)
  const [telemetry] = useState(() => ({
    battery: asset?.batteryLevel ?? 0,
    speed: incidentType === "Collision" ? randomBetween(0, 45) : 0,
    gforce: incidentType === "Collision" ? randomBetween(2.1, 8.4, 1) : null,
    gps: asset ? `${asset.lat.toFixed(4)}, ${asset.lng.toFixed(4)}` : "N/A",
    ts: new Date().toISOString(),
  }));

  const handleClose = useCallback(() => {
    // Reset state on close
    setStep(1);
    setSubmitted(false);
    setClaimId("");
    setIncidentType("Collision");
    setDatetime(getNowDatetimeLocal());
    setLocation(asset ? (geographyLabel[asset.geography] ?? asset.geography) : "");
    setDescription("");
    setSeverity("Minor");
    setPhotos([]);
    setWitness("");
    onClose();
  }, [asset, onClose]);

  const handleFileAdd = useCallback((files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(file => {
      const url = URL.createObjectURL(file);
      setPhotos(prev => [...prev, { name: file.name, url }]);
    });
  }, []);

  const handleSubmit = useCallback(() => {
    const id = `CLM-${Math.floor(100000 + Math.random() * 900000)}`;
    setClaimId(id);
    setSubmitted(true);
  }, []);

  // Panel transform styles
  const panelStyle: React.CSSProperties = {
    transition: "transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)",
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[59] bg-black/60"
        style={{
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 0.3s ease",
          backdropFilter: "blur(2px)",
        }}
        onClick={handleClose}
      />

      {/* Desktop: Right slide-in panel */}
      <div
        className="hidden md:flex fixed top-0 right-0 bottom-0 z-[60] w-[480px] flex-col"
        style={{
          ...panelStyle,
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          background: "rgba(13,18,35,0.98)",
          backdropFilter: "saturate(180%) blur(40px)",
          borderLeft: "1px solid rgba(255,255,255,0.09)",
          boxShadow: "-12px 0 60px rgba(0,0,0,0.5)",
        }}
      >
        <PanelContent
          step={step}
          setStep={setStep}
          submitted={submitted}
          claimId={claimId}
          asset={asset}
          incidentType={incidentType}
          setIncidentType={setIncidentType}
          datetime={datetime}
          setDatetime={setDatetime}
          location={location}
          setLocation={setLocation}
          description={description}
          setDescription={setDescription}
          severity={severity}
          setSeverity={setSeverity}
          photos={photos}
          setPhotos={setPhotos}
          witness={witness}
          setWitness={setWitness}
          dragOver={dragOver}
          setDragOver={setDragOver}
          fileInputRef={fileInputRef}
          handleFileAdd={handleFileAdd}
          handleSubmit={handleSubmit}
          handleClose={handleClose}
          telemetry={telemetry}
        />
      </div>

      {/* Mobile: Bottom sheet */}
      <div
        className="md:hidden fixed left-0 right-0 bottom-0 z-[60] flex flex-col rounded-t-3xl"
        style={{
          ...panelStyle,
          transform: isOpen ? "translateY(0)" : "translateY(100%)",
          maxHeight: "90vh",
          background: "rgba(13,18,35,0.99)",
          backdropFilter: "saturate(180%) blur(40px)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderBottom: "none",
          boxShadow: "0 -12px 60px rgba(0,0,0,0.5)",
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>
        <PanelContent
          step={step}
          setStep={setStep}
          submitted={submitted}
          claimId={claimId}
          asset={asset}
          incidentType={incidentType}
          setIncidentType={setIncidentType}
          datetime={datetime}
          setDatetime={setDatetime}
          location={location}
          setLocation={setLocation}
          description={description}
          setDescription={setDescription}
          severity={severity}
          setSeverity={setSeverity}
          photos={photos}
          setPhotos={setPhotos}
          witness={witness}
          setWitness={setWitness}
          dragOver={dragOver}
          setDragOver={setDragOver}
          fileInputRef={fileInputRef}
          handleFileAdd={handleFileAdd}
          handleSubmit={handleSubmit}
          handleClose={handleClose}
          telemetry={telemetry}
        />
      </div>
    </>
  );
}

interface PanelContentProps {
  step: number;
  setStep: (s: number) => void;
  submitted: boolean;
  claimId: string;
  asset?: FNOLAsset | null;
  incidentType: IncidentType;
  setIncidentType: (t: IncidentType) => void;
  datetime: string;
  setDatetime: (d: string) => void;
  location: string;
  setLocation: (l: string) => void;
  description: string;
  setDescription: (d: string) => void;
  severity: Severity;
  setSeverity: (s: Severity) => void;
  photos: { name: string; url: string }[];
  setPhotos: React.Dispatch<React.SetStateAction<{ name: string; url: string }[]>>;
  witness: string;
  setWitness: (w: string) => void;
  dragOver: boolean;
  setDragOver: (d: boolean) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileAdd: (files: FileList | null) => void;
  handleSubmit: () => void;
  handleClose: () => void;
  telemetry: { battery: number; speed: number; gforce: number | null; gps: string; ts: string };
}

function PanelContent({
  step, setStep, submitted, claimId, asset,
  incidentType, setIncidentType,
  datetime, setDatetime,
  location, setLocation,
  description, setDescription,
  severity, setSeverity,
  photos, setPhotos,
  witness, setWitness,
  dragOver, setDragOver,
  fileInputRef, handleFileAdd,
  handleSubmit, handleClose,
  telemetry,
}: PanelContentProps) {
  const claimValue = SEVERITY_CONFIG[severity].value;

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Header */}
      <div
        className="flex-shrink-0 px-5 py-4 border-b border-white/[0.08]"
        style={{ borderTop: "2px solid #EF4444" }}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Report Incident</h2>
            {asset && (
              <p className="text-xs text-[#94A3B8] mt-0.5">{asset.name} · {asset.id.toUpperCase()}</p>
            )}
            {!asset && (
              <p className="text-xs text-[#94A3B8] mt-0.5">New incident report</p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-white hover:bg-white/[0.06]"
            style={{ transition: "color 0.15s, background 0.15s" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step indicator */}
        {!submitted && (
          <div className="flex items-center justify-center gap-3 mt-4">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      background: s < step ? "#14B8A6" : s === step ? "#14B8A6" : "transparent",
                      border: s <= step ? "2px solid #14B8A6" : "2px solid rgba(100,116,139,0.5)",
                      transition: "all 0.3s ease",
                    }}
                  />
                  <span
                    className="text-[9px] font-medium uppercase tracking-widest"
                    style={{ color: s <= step ? "#14B8A6" : "#64748B" }}
                  >
                    {s === 1 ? "Details" : s === 2 ? "Evidence" : "Review"}
                  </span>
                </div>
                {s < 3 && (
                  <div
                    className="w-12 h-px mb-4"
                    style={{
                      background: s < step ? "#14B8A6" : "rgba(100,116,139,0.3)",
                      transition: "background 0.3s ease",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {submitted ? (
          <SuccessState claimId={claimId} onClose={handleClose} />
        ) : step === 1 ? (
          <Step1
            asset={asset}
            incidentType={incidentType}
            setIncidentType={setIncidentType}
            datetime={datetime}
            setDatetime={setDatetime}
            location={location}
            setLocation={setLocation}
            description={description}
            setDescription={setDescription}
            severity={severity}
            setSeverity={setSeverity}
          />
        ) : step === 2 ? (
          <Step2
            asset={asset}
            incidentType={incidentType}
            photos={photos}
            setPhotos={setPhotos}
            witness={witness}
            setWitness={setWitness}
            dragOver={dragOver}
            setDragOver={setDragOver}
            fileInputRef={fileInputRef}
            handleFileAdd={handleFileAdd}
            telemetry={telemetry}
          />
        ) : (
          <Step3
            asset={asset}
            incidentType={incidentType}
            datetime={datetime}
            location={location}
            description={description}
            severity={severity}
            claimValue={claimValue}
            photos={photos}
            witness={witness}
          />
        )}
      </div>

      {/* Footer nav */}
      {!submitted && (
        <div
          className="flex-shrink-0 p-4 border-t border-white/[0.08]"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)" }}
        >
          <div className="flex gap-3">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-white/[0.08] text-[#94A3B8] hover:text-white hover:bg-white/[0.04]"
                style={{ transition: "all 0.15s" }}
              >
                Back
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{
                  background: "linear-gradient(135deg, #14B8A6, #0891B2)",
                  boxShadow: "0 4px 20px rgba(20,184,166,0.25)",
                }}
              >
                Continue →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{
                  background: "linear-gradient(135deg, #EF4444, #DC2626)",
                  boxShadow: "0 4px 20px rgba(239,68,68,0.25)",
                }}
              >
                Submit FNOL Report
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Step 1: Incident Details ────────────────────────────────────────────────

function Step1({
  asset, incidentType, setIncidentType,
  datetime, setDatetime,
  location, setLocation,
  description, setDescription,
  severity, setSeverity,
}: {
  asset?: FNOLAsset | null;
  incidentType: IncidentType; setIncidentType: (t: IncidentType) => void;
  datetime: string; setDatetime: (d: string) => void;
  location: string; setLocation: (l: string) => void;
  description: string; setDescription: (d: string) => void;
  severity: Severity; setSeverity: (s: Severity) => void;
}) {
  return (
    <div className="p-5 space-y-5">
      {/* Asset */}
      {asset && (
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-[#64748B] mb-1.5 font-medium">Asset</label>
          <div
            className="px-3 py-2.5 rounded-xl border text-sm font-medium text-[#F1F5F9]"
            style={{ background: "rgba(59,130,246,0.08)", borderColor: "rgba(59,130,246,0.2)" }}
          >
            {asset.name} <span className="text-[#64748B] font-mono text-xs ml-1">({asset.id.toUpperCase()})</span>
          </div>
        </div>
      )}

      {/* Incident Type */}
      <div>
        <label className="block text-[10px] uppercase tracking-widest text-[#64748B] mb-1.5 font-medium">Incident Type</label>
        <div className="flex flex-wrap gap-2">
          {INCIDENT_TYPES.map(t => (
            <button
              key={t}
              onClick={() => setIncidentType(t)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{
                background: incidentType === t ? "rgba(20,184,166,0.15)" : "rgba(255,255,255,0.04)",
                color: incidentType === t ? "#14B8A6" : "#94A3B8",
                border: `1px solid ${incidentType === t ? "rgba(20,184,166,0.35)" : "rgba(255,255,255,0.07)"}`,
                transition: "all 0.15s",
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Date/Time */}
      <div>
        <label className="block text-[10px] uppercase tracking-widest text-[#64748B] mb-1.5 font-medium">Date & Time</label>
        <input
          type="datetime-local"
          value={datetime}
          onChange={e => setDatetime(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl text-sm text-[#F1F5F9] outline-none"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            colorScheme: "dark",
          }}
        />
      </div>

      {/* Location */}
      <div>
        <label className="block text-[10px] uppercase tracking-widest text-[#64748B] mb-1.5 font-medium">Location</label>
        <input
          type="text"
          value={location}
          onChange={e => setLocation(e.target.value)}
          placeholder="e.g. Hong Kong, Wan Chai District"
          className="w-full px-3 py-2.5 rounded-xl text-sm text-[#F1F5F9] placeholder-[#64748B] outline-none"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-[10px] uppercase tracking-widest text-[#64748B] mb-1.5 font-medium">Brief Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value.slice(0, 500))}
          placeholder="Describe what happened..."
          rows={3}
          className="w-full px-3 py-2.5 rounded-xl text-sm text-[#F1F5F9] placeholder-[#64748B] outline-none resize-none"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        />
        <p className="text-[10px] text-[#64748B] text-right mt-1">{description.length}/500</p>
      </div>

      {/* Severity */}
      <div>
        <label className="block text-[10px] uppercase tracking-widest text-[#64748B] mb-1.5 font-medium">Severity</label>
        <div className="grid grid-cols-3 gap-2">
          {(["Minor", "Moderate", "Severe"] as Severity[]).map(s => {
            const cfg = SEVERITY_CONFIG[s];
            return (
              <button
                key={s}
                onClick={() => setSeverity(s)}
                className="py-2.5 rounded-xl text-xs font-bold"
                style={{
                  background: severity === s ? cfg.bg : "rgba(255,255,255,0.03)",
                  color: severity === s ? cfg.color : "#64748B",
                  border: `1px solid ${severity === s ? cfg.border : "rgba(255,255,255,0.06)"}`,
                  transition: "all 0.15s",
                }}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Step 2: Evidence ────────────────────────────────────────────────────────

function Step2({
  asset, incidentType, photos, setPhotos, witness, setWitness,
  dragOver, setDragOver, fileInputRef, handleFileAdd, telemetry,
}: {
  asset?: FNOLAsset | null;
  incidentType: IncidentType;
  photos: { name: string; url: string }[];
  setPhotos: React.Dispatch<React.SetStateAction<{ name: string; url: string }[]>>;
  witness: string; setWitness: (w: string) => void;
  dragOver: boolean; setDragOver: (d: boolean) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileAdd: (files: FileList | null) => void;
  telemetry: { battery: number; speed: number; gforce: number | null; gps: string; ts: string };
}) {
  return (
    <div className="p-5 space-y-5">
      {/* Photo Upload */}
      <div>
        <label className="block text-[10px] uppercase tracking-widest text-[#64748B] mb-1.5 font-medium">Photo Evidence</label>
        <div
          className="rounded-xl border-2 border-dashed p-6 text-center cursor-pointer"
          style={{
            borderColor: dragOver ? "#14B8A6" : "rgba(255,255,255,0.1)",
            background: dragOver ? "rgba(20,184,166,0.06)" : "rgba(255,255,255,0.02)",
            transition: "all 0.15s",
          }}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => {
            e.preventDefault();
            setDragOver(false);
            handleFileAdd(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-6 h-6 mx-auto mb-2" style={{ color: dragOver ? "#14B8A6" : "#64748B" }} />
          <p className="text-xs text-[#94A3B8] font-medium">Drop photos here or click to upload</p>
          <p className="text-[10px] text-[#64748B] mt-1">Mock only — no files transferred</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={e => handleFileAdd(e.target.files)}
          />
        </div>

        {/* Thumbnails */}
        {photos.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {photos.map((p, i) => (
              <div key={i} className="relative group">
                <img
                  src={p.url}
                  alt={p.name}
                  className="w-16 h-16 object-cover rounded-lg border border-white/[0.08]"
                />
                <button
                  onClick={() => setPhotos(prev => prev.filter((_, j) => j !== i))}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#EF4444] text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100"
                  style={{ transition: "opacity 0.15s" }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Telemetry Snapshot */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-1.5 h-1.5 rounded-full bg-[#14B8A6] animate-pulse"
          />
          <label className="text-[10px] uppercase tracking-widest text-[#64748B] font-medium">Auto-Attached Telemetry Snapshot</label>
        </div>
        <div
          className="rounded-xl p-4 border space-y-2"
          style={{ background: "rgba(20,184,166,0.05)", borderColor: "rgba(20,184,166,0.15)" }}
        >
          {[
            { label: "Battery", value: `${telemetry.battery}%` },
            { label: "Speed at incident", value: incidentType === "Collision" ? `${telemetry.speed} km/h` : "0 km/h" },
            { label: "G-force", value: incidentType === "Collision" ? `${telemetry.gforce}g` : "N/A" },
            { label: "GPS", value: asset ? `${asset.lat.toFixed(4)}°N, ${asset.lng.toFixed(4)}°E` : "N/A" },
            { label: "Timestamp", value: telemetry.ts },
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="text-[11px] text-[#64748B]">{row.label}</span>
              <span className="text-[11px] text-[#F1F5F9] font-mono font-medium">{row.value}</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-[#64748B] mt-1.5 flex items-center gap-1.5">
          <CheckCircle className="w-3 h-3 text-[#22C55E]" />
          Telemetry auto-attached from asset sensors
        </p>
      </div>

      {/* Witness */}
      <div>
        <label className="block text-[10px] uppercase tracking-widest text-[#64748B] mb-1.5 font-medium">Witness Contact <span className="normal-case text-[#475569]">(optional)</span></label>
        <input
          type="text"
          value={witness}
          onChange={e => setWitness(e.target.value)}
          placeholder="Name and contact number"
          className="w-full px-3 py-2.5 rounded-xl text-sm text-[#F1F5F9] placeholder-[#64748B] outline-none"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        />
      </div>
    </div>
  );
}

// ─── Step 3: Review & Submit ─────────────────────────────────────────────────

function Step3({
  asset, incidentType, datetime, location, description, severity, claimValue, photos, witness,
}: {
  asset?: FNOLAsset | null;
  incidentType: IncidentType;
  datetime: string;
  location: string;
  description: string;
  severity: Severity;
  claimValue: number;
  photos: { name: string; url: string }[];
  witness: string;
}) {
  const cfg = SEVERITY_CONFIG[severity];
  return (
    <div className="p-5 space-y-4">
      {/* Summary Card */}
      <div
        className="rounded-xl border p-4 space-y-3"
        style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.07)" }}
      >
        <p className="text-[10px] uppercase tracking-widest text-[#64748B] font-medium">Report Summary</p>

        {[
          { label: "Asset", value: asset ? `${asset.name} (${asset.id.toUpperCase()})` : "Manual entry" },
          { label: "Incident", value: incidentType },
          { label: "Date & Time", value: datetime.replace("T", " ") },
          { label: "Location", value: location || "—" },
          { label: "Description", value: description || "—" },
          { label: "Photos", value: photos.length > 0 ? `${photos.length} attached` : "None" },
          { label: "Witness", value: witness || "None" },
        ].map(row => (
          <div key={row.label} className="flex items-start justify-between gap-4">
            <span className="text-xs text-[#64748B] flex-shrink-0 w-24">{row.label}</span>
            <span className="text-xs text-[#F1F5F9] text-right font-medium">{row.value}</span>
          </div>
        ))}

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-[#64748B]">Severity</span>
          <span
            className="text-xs font-bold px-2.5 py-0.5 rounded-full"
            style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
          >
            {severity}
          </span>
        </div>
      </div>

      {/* Estimated Claim Value */}
      <div
        className="rounded-xl border p-4 flex items-center justify-between"
        style={{ background: "rgba(239,68,68,0.05)", borderColor: "rgba(239,68,68,0.15)" }}
      >
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#64748B] font-medium mb-1">Estimated Claim Value</p>
          <p className="text-2xl font-bold text-[#F1F5F9] tabular-nums">HKD {claimValue.toLocaleString()}</p>
          <p className="text-[10px] text-[#64748B] mt-0.5">Based on {severity.toLowerCase()} severity</p>
        </div>
        <AlertTriangle className="w-8 h-8 text-[#EF4444] opacity-40" />
      </div>

      {/* Coverage Status */}
      <div
        className="rounded-xl border p-4 flex items-center gap-3"
        style={{ background: "rgba(34,197,94,0.06)", borderColor: "rgba(34,197,94,0.2)" }}
      >
        <CheckCircle className="w-5 h-5 text-[#22C55E] flex-shrink-0" />
        <div>
          <p className="text-xs font-semibold text-[#22C55E]">Active — covered</p>
          <p className="text-[11px] text-[#64748B] mt-0.5">Comprehensive fleet policy · YAS MicroInsurance</p>
        </div>
      </div>

      <p className="text-[11px] text-[#64748B] text-center leading-relaxed">
        By submitting, you confirm the information above is accurate. A claims officer will review within 2 hours.
      </p>
    </div>
  );
}

// ─── Success State ────────────────────────────────────────────────────────────

function SuccessState({ claimId, onClose }: { claimId: string; onClose: () => void }) {
  const timeline = [
    { label: "Submitted", sub: "Now", done: true },
    { label: "Under Review", sub: "~2h", done: false },
    { label: "Evidence Requested", sub: "~24h", done: false },
    { label: "Assessment", sub: "~72h", done: false },
    { label: "Payout", sub: "TBD", done: false },
  ];

  return (
    <div className="p-5 flex flex-col items-center">
      {/* Icon */}
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4 mt-2"
        style={{ background: "rgba(34,197,94,0.15)", border: "2px solid rgba(34,197,94,0.3)" }}
      >
        <CheckCircle className="w-8 h-8 text-[#22C55E]" />
      </div>

      <h3 className="text-lg font-bold text-white mb-1">Report Submitted</h3>
      <p className="text-sm text-[#94A3B8] text-center mb-1">
        Our claims team will contact you within 2 hours.
      </p>
      <div
        className="px-4 py-2 rounded-full mb-6"
        style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)" }}
      >
        <span className="text-sm font-bold text-[#3B82F6] font-mono">{claimId}</span>
      </div>

      {/* Timeline */}
      <div className="w-full mb-6">
        <p className="text-[10px] uppercase tracking-widest text-[#64748B] font-medium mb-3">Claims Timeline</p>
        <div className="relative">
          {/* Progress line */}
          <div
            className="absolute top-3 left-3 right-3 h-px"
            style={{ background: "rgba(255,255,255,0.06)" }}
          />
          <div
            className="absolute top-3 left-3 h-px"
            style={{ width: "0%", background: "#14B8A6" }}
          />
          <div className="flex items-start justify-between relative">
            {timeline.map((t, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center z-10 flex-shrink-0"
                  style={{
                    background: i === 0 ? "#22C55E" : "rgba(255,255,255,0.05)",
                    border: `2px solid ${i === 0 ? "#22C55E" : "rgba(255,255,255,0.12)"}`,
                  }}
                >
                  {i === 0 && <CheckCircle className="w-3 h-3 text-white" />}
                  {i > 0 && <Clock className="w-2.5 h-2.5 text-[#64748B]" />}
                </div>
                <p className="text-[9px] text-center font-medium" style={{ color: i === 0 ? "#22C55E" : "#64748B" }}>
                  {t.label}
                </p>
                <p className="text-[9px] text-[#475569]">{t.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 w-full">
        <Link
          href="/claims"
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-center"
          style={{
            background: "rgba(59,130,246,0.12)",
            color: "#3B82F6",
            border: "1px solid rgba(59,130,246,0.25)",
          }}
          onClick={onClose}
        >
          View in Claims
        </Link>
        <button
          onClick={onClose}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-white/[0.08] text-[#94A3B8] hover:text-white hover:bg-white/[0.04]"
          style={{ transition: "all 0.15s" }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
