import { NextResponse } from 'next/server'
import { assets, alerts, fleets, kpiSummary } from '@/lib/demo-data'

export async function GET() {
  return NextResponse.json({
    assets: assets.map(a => ({
      assetId: a.id,
      assetName: a.name,
      type: a.type,
      fleetId: a.fleetId,
      status: a.status,
      lat: a.lat,
      lng: a.lng,
      riskScore: a.riskScore,
      batteryPct: a.batteryLevel,
      uptimeHours: a.operatingHours,
      lastEvent: { summary: a.lastEvent, recordedAt: a.lastEventTime },
      premiumBurnRate: a.premiumBurnRate,
    })),
    alerts,
    fleets,
    kpi: {
      totalAssets: assets.length,
      protectedAssets: kpiSummary.protectedAssets,
      totalReserveBalance: 11100000,
      reserveCoverageRatio: kpiSummary.reserveCoverageRatio,
      criticalAlerts: kpiSummary.criticalAlerts,
      claimsInProgress: kpiSummary.claimsInProgress,
      premiumAccruedToday: kpiSummary.premiumAccruedToday,
    },
    timestamp: new Date().toISOString(),
  })
}
