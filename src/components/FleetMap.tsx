"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { Asset, AssetType, AssetStatus } from "@/types";
import "leaflet/dist/leaflet.css";

// Fix leaflet default icon issue in Next.js
if (typeof window !== "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  });
}

const statusColor: Record<AssetStatus, string> = {
  active: "#22C55E",
  idle: "#64748B",
  warning: "#F59E0B",
  critical: "#EF4444",
  offline: "#64748B",
};

const typeEmoji: Record<AssetType, string> = {
  robot: "🤖",
  ev: "🚗",
  av: "🚐",
};

function createAssetIcon(asset: Asset): L.DivIcon {
  const color = statusColor[asset.status];
  const emoji = typeEmoji[asset.type];
  const isPulse = asset.status === "critical";
  const isWarn = asset.status === "warning";

  const html = `
    <div style="position: relative; width: 40px; height: 40px; cursor: pointer;">
      ${isPulse ? `
        <div style="position:absolute;inset:-8px;border-radius:50%;background:${color};opacity:0.12;animation:ping 1s ease-out infinite;"></div>
        <div style="position:absolute;inset:-4px;border-radius:50%;border:1.5px solid ${color};opacity:0.35;animation:ping 1.5s ease-out infinite 0.3s;"></div>
      ` : isWarn ? `
        <div style="position:absolute;inset:-4px;border-radius:50%;border:1px solid ${color};opacity:0.4;animation:ping 2s ease-out infinite;"></div>
      ` : ""}
      <div style="
        width:40px;height:40px;border-radius:50%;
        background:linear-gradient(135deg, rgba(15,22,40,0.95), rgba(10,14,26,0.98));
        border:2px solid ${color};
        display:flex;align-items:center;justify-content:center;
        font-size:15px;
        box-shadow: 0 0 16px ${color}50, inset 0 1px 0 rgba(255,255,255,0.08);
        position:relative;z-index:2;
      ">
        ${emoji}
      </div>
      ${asset.status === "critical" ? `
        <div style="position:absolute;top:-2px;right:-2px;width:10px;height:10px;border-radius:50%;background:#EF4444;border:1.5px solid #0A0E1A;z-index:3;animation:pulse 1s ease-in-out infinite;"></div>
      ` : ""}
    </div>
  `;

  return L.divIcon({
    html,
    className: "",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
}

interface MarkersLayerProps {
  assets: Asset[];
  selectedAsset: Asset | null;
  onAssetSelect: (asset: Asset) => void;
}

function MarkersLayer({ assets, selectedAsset, onAssetSelect }: MarkersLayerProps) {
  const map = useMap();
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!layerGroupRef.current) {
      layerGroupRef.current = L.layerGroup().addTo(map);
    }

    const group = layerGroupRef.current;
    const currentIds = new Set(assets.map(a => a.id));

    // Remove markers no longer in assets
    markersRef.current.forEach((marker, id) => {
      if (!currentIds.has(id)) {
        group.removeLayer(marker);
        markersRef.current.delete(id);
      }
    });

    // Add/update markers
    assets.forEach(asset => {
      const existing = markersRef.current.get(asset.id);
      const icon = createAssetIcon(asset);

      if (existing) {
        existing.setLatLng([asset.lat, asset.lng]);
        existing.setIcon(icon);
      } else {
        const marker = L.marker([asset.lat, asset.lng], { icon })
          .on("click", () => onAssetSelect(asset));
        group.addLayer(marker);
        markersRef.current.set(asset.id, marker);
      }
    });
  }, [assets, map, onAssetSelect]);

  // Update tooltips/popups
  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      const asset = assets.find(a => a.id === id);
      if (!asset) return;

      const popupContent = `
        <div class="yas-popup-inner" style="
          background: rgba(13,19,38,0.97);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 12px 14px;
          min-width: 180px;
          font-family: Inter, sans-serif;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
        ">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <span style="font-size: 18px;">${typeEmoji[asset.type]}</span>
            <div>
              <p style="color: #F1F5F9; font-size: 12px; font-weight: 600; margin: 0;">${asset.name}</p>
              <p style="color: #475569; font-size: 10px; margin: 0; font-family: monospace;">${asset.id.toUpperCase()}</p>
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="
              color: ${statusColor[asset.status]};
              font-size: 10px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.08em;
              background: ${statusColor[asset.status]}18;
              padding: 2px 6px;
              border-radius: 4px;
              border: 1px solid ${statusColor[asset.status]}30;
            ">${asset.status}</span>
            <span style="color: #64748B; font-size: 10px; font-family: monospace;">Risk: <span style="color: ${asset.riskScore > 60 ? "#EF4444" : asset.riskScore > 35 ? "#F59E0B" : "#22C55E"}; font-weight: 700;">${asset.riskScore}</span></span>
          </div>
          <p style="color: #64748B; font-size: 10px; margin-top: 6px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 6px;">${asset.lastEvent}</p>
        </div>
      `;

      if (!marker.getPopup()) {
        marker.bindPopup(popupContent, {
          closeButton: false,
          className: "yas-popup",
          offset: [0, -20],
        });
      } else {
        marker.setPopupContent(popupContent);
      }
    });
  }, [assets]);

  return null;
}

// Set initial zoom to 6
function InitialZoom() {
  const map = useMap();
  useEffect(() => {
    map.setZoom(6);
  }, [map]);
  return null;
}

interface FleetMapProps {
  assets: Asset[];
  selectedAsset: Asset | null;
  onAssetSelect: (asset: Asset) => void;
}

export default function FleetMap({ assets, selectedAsset, onAssetSelect }: FleetMapProps) {
  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      {/* Inject keyframe styles */}
      <style>{`
        @keyframes ping {
          0% { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(2); opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      <MapContainer
        center={[26, 118]}
        zoom={6}
        style={{ height: "100%", width: "100%", background: "#0A0E1A" }}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          subdomains="abcd"
          maxZoom={20}
        />
        <InitialZoom />
        <MarkersLayer
          assets={assets}
          selectedAsset={selectedAsset}
          onAssetSelect={onAssetSelect}
        />
      </MapContainer>

      {/* Vignette overlay */}
      <div
        className="map-vignette"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          boxShadow: "inset 0 0 120px rgba(0,0,0,0.6)",
          zIndex: 500,
        }}
      />

      {/* Top-left LIVE FEED badge */}
      <div
        style={{
          position: "absolute",
          top: "16px",
          left: "16px",
          zIndex: 1000,
          pointerEvents: "none",
        }}
      >
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          background: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "20px",
          padding: "5px 12px",
          fontSize: "10px",
          color: "#22C55E",
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}>
          <span style={{
            display: "inline-block",
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: "#22C55E",
            animation: "pulse 1.5s ease-in-out infinite",
          }} />
          LIVE FEED · 84 ASSETS · 4 FLEETS
        </div>
      </div>

      {/* Bottom-right zoom indicator */}
      <div
        style={{
          position: "absolute",
          bottom: "80px",
          right: "16px",
          zIndex: 1000,
          pointerEvents: "none",
        }}
      >
        <div style={{
          background: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "8px",
          padding: "6px 10px",
          textAlign: "center",
        }}>
          <p style={{ fontSize: "9px", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "2px" }}>Zoom</p>
          <p style={{ fontSize: "13px", fontWeight: 700, color: "#94A3B8", fontFamily: "monospace" }}>L6</p>
        </div>
      </div>
    </div>
  );
}
