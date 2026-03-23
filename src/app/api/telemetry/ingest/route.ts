import { NextRequest, NextResponse } from 'next/server'

// In-memory store — VIN → latest telemetry (Phase 4: PostgreSQL)
const telemetryStore = new Map<string, Record<string, unknown>>()

function extractAriaSignals(data: Record<string, unknown>) {
  const speed = Number(data.VehicleSpeed || 0)
  const soc = Number(data.Soc || 100)
  const flags: string[] = []
  if (speed > 100) flags.push('HIGH_SPEED')
  if (soc < 15) flags.push('LOW_BATTERY')
  if (soc < 5) flags.push('CRITICAL_BATTERY')
  const riskLevel = flags.includes('CRITICAL_BATTERY') ? 'CRITICAL'
    : flags.length > 0 ? 'ELEVATED' : 'NORMAL'
  return { speed, soc, riskLevel, flags }
}

export async function POST(req: NextRequest) {
  try {
    const expectedSecret = process.env.TELEMETRY_INGEST_SECRET
    if (!expectedSecret && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
    }
    if (expectedSecret) {
      const authHeader = req.headers.get('authorization')
      const legacyHeader = req.headers.get('x-yas-telemetry-secret')
      const bearerOk = authHeader === `Bearer ${expectedSecret}`
      const legacyOk = legacyHeader === expectedSecret
      if (!bearerOk && !legacyOk) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }
    const record = await req.json()
    const vin = String(record?.vin || record?.VIN || 'unknown')
    const updated = { ...(telemetryStore.get(vin) || {}), ...record, vin, lastSeen: new Date().toISOString() }
    telemetryStore.set(vin, updated)
    const signals = extractAriaSignals(updated)
    console.log('[Tesla Telemetry]', vin, signals)
    return NextResponse.json({ success: true, vin, signals })
  } catch {
    return NextResponse.json({ error: 'Parse error' }, { status: 400 })
  }
}

export async function GET(req: NextRequest) {
  const expectedSecret = process.env.TELEMETRY_INGEST_SECRET
  if (!expectedSecret && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }
  if (expectedSecret) {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }
  const vehicles = Array.from(telemetryStore.entries()).map(([vin, data]) => ({
    vin,
    lastSeen: data.lastSeen,
    speed: data.VehicleSpeed || 0,
    soc: data.Soc || 0,
    odometer: data.Odometer || 0,
    batteryRange: data.EstBatteryRange || 0,
    location: data.Location || null,
    selfDrivingMiles: data.SelfDrivingMilesSinceReset || 0,
    risk: extractAriaSignals(data as Record<string, unknown>),
  }))
  return NextResponse.json({ vehicles, count: vehicles.length, timestamp: new Date().toISOString() })
}
