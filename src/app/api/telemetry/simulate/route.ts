import { NextRequest, NextResponse } from 'next/server'
import { telemetrySimulator } from '@/lib/telemetry-simulator'

export const dynamic = 'force-dynamic'

function checkSimAuth(req: NextRequest): boolean {
  const expectedSecret = process.env.TELEMETRY_INGEST_SECRET
  if (!expectedSecret) return true // if no secret set, allow (dev mode)
  const authHeader = req.headers.get('authorization')
  return authHeader === `Bearer ${expectedSecret}`
}

export async function GET(req: NextRequest) {
  if (!checkSimAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const vehicles = telemetrySimulator.getVehicles()
  return NextResponse.json({
    running: telemetrySimulator.isRunning(),
    vehicleCount: vehicles.length,
    vehicles: vehicles.map((v) => ({
      vin: v.vin,
      model: v.model,
      routeName: v.routeName,
      speed: v.speed,
      soc: v.soc,
      odometer: v.odometer,
      selfDrivingMiles: v.selfDrivingMiles,
      shiftState: v.shiftState,
      phase: v.phase,
      isRobotaxi: v.isRobotaxi,
    })),
    timestamp: new Date().toISOString(),
  })
}

export async function POST(req: NextRequest) {
  if (!checkSimAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json().catch(() => ({})) as { action?: string }
  const { action } = body

  switch (action) {
    case 'start':
      telemetrySimulator.start()
      return NextResponse.json({ success: true, running: true, message: 'Simulator started' })

    case 'stop':
      telemetrySimulator.stop()
      return NextResponse.json({ success: true, running: false, message: 'Simulator stopped' })

    case 'add_vehicle': {
      const v = telemetrySimulator.addVehicle()
      return NextResponse.json({
        success: true,
        vehicle: { vin: v.vin, model: v.model, routeName: v.routeName },
        message: `Added ${v.model} (${v.vin})`,
      })
    }

    default:
      return NextResponse.json({ error: 'Invalid action. Use start|stop|add_vehicle' }, { status: 400 })
  }
}
