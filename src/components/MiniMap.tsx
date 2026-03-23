"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { Asset } from "@/types";
import "leaflet/dist/leaflet.css";

function AssetMarker({ asset }: { asset: Asset }) {
  const map = useMap();

  useEffect(() => {
    const statusColor: Record<string, string> = {
      active: "#22C55E",
      idle: "#64748B",
      warning: "#F59E0B",
      critical: "#EF4444",
      offline: "#64748B",
    };

    const emoji = { robot: "🤖", ev: "🚗", av: "🚐" }[asset.type];
    const color = statusColor[asset.status];

    const icon = L.divIcon({
      html: `
        <div style="
          width: 40px; height: 40px; border-radius: 50%;
          background: rgba(10,14,26,0.9);
          border: 3px solid ${color};
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
          box-shadow: 0 0 16px ${color}60;
        ">${emoji}</div>
      `,
      className: "",
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    const marker = L.marker([asset.lat, asset.lng], { icon }).addTo(map);
    map.setView([asset.lat, asset.lng], 14);

    return () => { map.removeLayer(marker); };
  }, [asset, map]);

  return null;
}

export default function MiniMap({ asset }: { asset: Asset }) {
  return (
    <MapContainer
      center={[asset.lat, asset.lng]}
      zoom={14}
      style={{ height: "100%", width: "100%", minHeight: "180px" }}
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={20}
      />
      <AssetMarker asset={asset} />
    </MapContainer>
  );
}
