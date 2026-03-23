import { NextResponse } from "next/server";

export const runtime = "nodejs";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RoadSegment {
  id: string;
  name: string;
  speed: number;
  speedLimit: number;
  congestionLevel: "low" | "medium" | "high" | "severe";
}

// ─── Cache ────────────────────────────────────────────────────────────────────

let cache: { data: RoadSegment[]; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// ─── Fallback data ────────────────────────────────────────────────────────────
// Realistic HK road segments with representative congestion scenarios

const FALLBACK_SEGMENTS: RoadSegment[] = [
  { id: "CHT-1", name: "Cross-Harbour Tunnel (Kowloon side)", speed: 18, speedLimit: 70, congestionLevel: "severe" },
  { id: "TMH-1", name: "Tuen Mun Highway (Tsing Lung Bridge)", speed: 35, speedLimit: 80, congestionLevel: "high" },
  { id: "R3-1", name: "Route 3 (Country Park Section)", speed: 42, speedLimit: 80, congestionLevel: "high" },
  { id: "LT-1", name: "Lion Rock Tunnel (N. Portal)", speed: 22, speedLimit: 70, congestionLevel: "severe" },
  { id: "TM-E3", name: "Tuen Mun Road (Castle Peak Rd)", speed: 28, speedLimit: 70, congestionLevel: "high" },
  { id: "TKT-1", name: "Tseung Kwan O Tunnel", speed: 55, speedLimit: 80, congestionLevel: "medium" },
  { id: "KT-1", name: "Kwai Tsing Road (Container Port)", speed: 48, speedLimit: 70, congestionLevel: "medium" },
  { id: "TC-1", name: "Tsing Cheung Road (Tsuen Wan)", speed: 62, speedLimit: 80, congestionLevel: "low" },
  { id: "ACE-1", name: "Airport Express Road (Lantau)", speed: 88, speedLimit: 100, congestionLevel: "low" },
  { id: "TKR-2", name: "Tolo Highway (Sha Tin section)", speed: 38, speedLimit: 70, congestionLevel: "high" },
];

// ─── XML Parser ───────────────────────────────────────────────────────────────

function parseCongestionLevel(speed: number, limit: number): RoadSegment["congestionLevel"] {
  const ratio = speed / limit;
  if (ratio >= 0.75) return "low";
  if (ratio >= 0.5) return "medium";
  if (ratio >= 0.25) return "high";
  return "severe";
}

function parseSpeedMapXML(xml: string): RoadSegment[] {
  const segments: RoadSegment[] = [];

  // Match <roadSaturation> or <road> elements
  const roadPattern = /<(?:roadSaturation|road|segment)[^>]*>([\s\S]*?)<\/(?:roadSaturation|road|segment)>/gi;
  let execMatch: RegExpExecArray | null;

  while ((execMatch = roadPattern.exec(xml)) !== null) {
    const block = execMatch[1];

    const idMatch = block.match(/<(?:id|roadId)[^>]*>([^<]+)<\/(?:id|roadId)>/i);
    const nameMatch = block.match(/<(?:name|roadName|description)[^>]*>([^<]+)<\/(?:name|roadName|description)>/i);
    const speedMatch = block.match(/<(?:speed|currentSpeed)[^>]*>([^<]+)<\/(?:speed|currentSpeed)>/i);
    const limitMatch = block.match(/<(?:speedLimit|maxSpeed)[^>]*>([^<]+)<\/(?:speedLimit|maxSpeed)>/i);

    if (!speedMatch) continue;

    const id = idMatch?.[1]?.trim() ?? `SEG-${segments.length + 1}`;
    const name = nameMatch?.[1]?.trim() ?? `Road Segment ${id}`;
    const speed = parseFloat(speedMatch[1].trim());
    const speedLimit = limitMatch ? parseFloat(limitMatch[1].trim()) : 80;

    if (isNaN(speed)) continue;

    segments.push({
      id,
      name,
      speed,
      speedLimit,
      congestionLevel: parseCongestionLevel(speed, speedLimit),
    });
  }

  return segments;
}

async function fetchLiveSegments(): Promise<RoadSegment[] | null> {
  try {
    const res = await fetch("https://resource.data.one.gov.hk/td/speedmap.xml", {
      signal: AbortSignal.timeout(8000),
      headers: { "User-Agent": "YAS-Assurance-Platform/1.0" },
      next: { revalidate: 0 },
    });

    if (!res.ok) return null;

    const xml = await res.text();
    // Guard against HTML/PHP error responses
    if (xml.trim().startsWith("<html") || xml.includes("Service Unavailable") || xml.includes("<?php")) {
      return null;
    }

    const parsed = parseSpeedMapXML(xml);
    return parsed.length >= 3 ? parsed : null;
  } catch {
    return null;
  }
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function GET() {
  // Serve from cache if fresh
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return NextResponse.json(cache.data, {
      headers: {
        "Cache-Control": "public, max-age=300",
        "X-Data-Source": "cache",
      },
    });
  }

  const live = await fetchLiveSegments();
  const segments = live ?? FALLBACK_SEGMENTS;
  const source = live ? "live" : "fallback";

  cache = { data: segments, fetchedAt: Date.now() };

  // Sort by congestion (most severe first)
  const congestionOrder: Record<RoadSegment["congestionLevel"], number> = {
    severe: 0,
    high: 1,
    medium: 2,
    low: 3,
  };
  const sorted = [...segments].sort(
    (a, b) =>
      congestionOrder[a.congestionLevel] - congestionOrder[b.congestionLevel] ||
      a.speed - b.speed
  );

  return NextResponse.json(sorted, {
    headers: {
      "Cache-Control": "public, max-age=300",
      "X-Data-Source": source,
      "X-Segment-Count": String(sorted.length),
    },
  });
}
