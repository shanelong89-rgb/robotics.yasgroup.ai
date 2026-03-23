"use client";

import { useRef, useState } from "react";
import { ChevronRight, ArrowLeft, Plus, Trash2, Upload } from "lucide-react";
import type { OnboardState, AssetRow, AssetType } from "./OnboardFlow";

interface Props {
  state: OnboardState;
  update: (patch: Partial<OnboardState>) => void;
  onNext: () => void;
  onBack: () => void;
}

const ASSET_TYPES: AssetType[] = ["Robot", "EV", "AV"];
const ASSET_ICONS: Record<AssetType, string> = { Robot: "🤖", EV: "🚗", AV: "🚐" };

function totalAssets(assets: AssetRow[]) {
  return assets.reduce((sum, a) => sum + (a.qty || 0), 0);
}

function hasValidAsset(assets: AssetRow[]) {
  return assets.some((a) => a.name.trim() !== "" && a.qty > 0);
}

export default function Step2Fleet({ state, update, onNext, onBack }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const assets = state.assets;

  const setAssets = (next: AssetRow[]) => update({ assets: next });

  const addRow = () =>
    setAssets([...assets, { name: "", type: "Robot", qty: 1 }]);

  const removeRow = (i: number) =>
    setAssets(assets.filter((_, idx) => idx !== i));

  const updateRow = (i: number, patch: Partial<AssetRow>) =>
    setAssets(assets.map((a, idx) => (idx === i ? { ...a, ...patch } : a)));

  function parseCSV(text: string) {
    const lines = text.trim().split(/\r?\n/);
    const rows: AssetRow[] = [];
    for (const line of lines) {
      const parts = line.split(",").map((p) => p.trim());
      if (parts.length < 3) continue;
      const name = parts[0];
      const rawType = parts[1].toUpperCase();
      const type: AssetType =
        rawType === "EV" ? "EV" : rawType === "AV" ? "AV" : "Robot";
      const qty = parseInt(parts[2], 10);
      if (name && qty > 0) rows.push({ name, type, qty });
    }
    if (rows.length > 0) setAssets(rows);
  }

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === "string") parseCSV(text);
    };
    reader.readAsText(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  const canProceed = hasValidAsset(assets);
  const total = totalAssets(assets);

  return (
    <div className="pb-28 md:pb-8 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-yas-text mb-0.5">Fleet Composition</h2>
        <p className="text-xs text-yas-subtext">Add your fleet assets manually or upload a CSV file.</p>
      </div>

      {/* Live Count */}
      <div className="flex items-center gap-2">
        <span
          className="text-xs font-semibold px-3 py-1 rounded-full"
          style={{
            background: total > 0 ? "rgba(20,184,166,0.12)" : "rgba(255,255,255,0.05)",
            color: total > 0 ? "#14B8A6" : "#64748B",
            border: `1px solid ${total > 0 ? "rgba(20,184,166,0.3)" : "rgba(255,255,255,0.08)"}`,
          }}
        >
          {total} asset{total !== 1 ? "s" : ""} added
        </span>
        {!canProceed && (
          <span className="text-xs text-yas-muted">— at least 1 required to proceed</span>
        )}
      </div>

      {/* Asset Rows */}
      <div
        className="rounded-2xl p-5 space-y-3"
        style={{ background: "rgba(15,22,40,0.8)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="hidden md:grid grid-cols-[1fr_140px_100px_36px] gap-2 mb-1">
          <span className="text-[10px] text-yas-muted uppercase tracking-widest">Asset Name</span>
          <span className="text-[10px] text-yas-muted uppercase tracking-widest">Type</span>
          <span className="text-[10px] text-yas-muted uppercase tracking-widest">Qty</span>
          <span />
        </div>

        {assets.map((asset, i) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-[1fr_140px_100px_36px] gap-2 items-center">
            <input
              type="text"
              value={asset.name}
              onChange={(e) => updateRow(i, { name: e.target.value })}
              placeholder="e.g. Delivery Bot Alpha"
              className="w-full px-3 py-2 rounded-xl text-sm text-yas-text placeholder-yas-muted outline-none"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            />

            {/* Type selector */}
            <div className="flex gap-1">
              {ASSET_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => updateRow(i, { type: t })}
                  title={t}
                  className="flex-1 py-2 rounded-xl text-sm transition-all"
                  style={{
                    background: asset.type === t ? "rgba(20,184,166,0.15)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${asset.type === t ? "rgba(20,184,166,0.4)" : "rgba(255,255,255,0.08)"}`,
                  }}
                >
                  {ASSET_ICONS[t]}
                </button>
              ))}
            </div>

            <input
              type="number"
              min={1}
              value={asset.qty}
              onChange={(e) => updateRow(i, { qty: Math.max(1, parseInt(e.target.value) || 1) })}
              className="w-full px-3 py-2 rounded-xl text-sm text-yas-text outline-none"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            />

            <button
              onClick={() => removeRow(i)}
              disabled={assets.length === 1}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.15)",
                opacity: assets.length === 1 ? 0.3 : 1,
              }}
            >
              <Trash2 className="w-3.5 h-3.5" style={{ color: "#EF4444" }} />
            </button>
          </div>
        ))}

        <button
          onClick={addRow}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all"
          style={{
            background: "rgba(59,130,246,0.08)",
            border: "1px solid rgba(59,130,246,0.2)",
            color: "#3B82F6",
          }}
        >
          <Plus className="w-3.5 h-3.5" />
          Add Row
        </button>
      </div>

      {/* CSV Upload */}
      <div
        className="rounded-2xl p-5"
        style={{ background: "rgba(15,22,40,0.8)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <h3 className="text-xs font-semibold text-yas-subtext uppercase tracking-widest mb-3">
          Or Upload CSV
        </h3>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className="rounded-xl p-6 flex flex-col items-center gap-3 cursor-pointer transition-all duration-200"
          style={{
            border: `2px dashed ${dragOver ? "rgba(20,184,166,0.5)" : "rgba(255,255,255,0.1)"}`,
            background: dragOver ? "rgba(20,184,166,0.05)" : "rgba(255,255,255,0.02)",
          }}
        >
          <Upload className="w-6 h-6" style={{ color: "#64748B" }} />
          <div className="text-center">
            <p className="text-xs text-yas-text font-medium">Drop your CSV here or click to browse</p>
            <p className="text-[10px] text-yas-muted mt-1">Format: Name, Type (Robot/EV/AV), Quantity per row</p>
          </div>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#94A3B8",
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all"
          style={{
            background: canProceed ? "linear-gradient(135deg, #3B82F6, #14B8A6)" : "rgba(255,255,255,0.06)",
            color: canProceed ? "#fff" : "#64748B",
            boxShadow: canProceed ? "0 4px 20px rgba(59,130,246,0.25)" : "none",
            cursor: canProceed ? "pointer" : "not-allowed",
          }}
        >
          Operations Profile
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
