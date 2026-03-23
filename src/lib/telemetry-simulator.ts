// Singleton Tesla telemetry simulator — runs in Next.js server process

interface RoutePoint {
  lat: number
  lng: number
  name: string
}

interface VehicleState {
  vin: string
  model: string
  routeName: string
  route: RoutePoint[]
  routeIndex: number
  routeProgress: number // 0–1 between current and next waypoint
  speed: number // km/h
  soc: number // %
  odometer: number // km
  selfDrivingMiles: number
  isRobotaxi: boolean
  shiftState: 'D' | 'P' | 'N'
  phase: 'accelerating' | 'cruising' | 'decelerating' | 'stopped'
  stopTimer: number
  targetSpeed: number
}

// HK routes (Central → Causeway Bay → Wanchai → Admiralty area)
const HK_ISLAND_ROUTE: RoutePoint[] = [
  { lat: 22.2810, lng: 114.1577, name: 'Central' },
  { lat: 22.2821, lng: 114.1637, name: 'Admiralty' },
  { lat: 22.2795, lng: 114.1712, name: 'Wanchai' },
  { lat: 22.2809, lng: 114.1829, name: 'Causeway Bay' },
  { lat: 22.2866, lng: 114.1940, name: 'North Point' },
  { lat: 22.2821, lng: 114.1637, name: 'Admiralty' }, // reverse
  { lat: 22.2810, lng: 114.1577, name: 'Central' },
]

// Kowloon route (TST → Jordan → Mong Kok → Yau Ma Tei)
const KOWLOON_ROUTE: RoutePoint[] = [
  { lat: 22.2988, lng: 114.1722, name: 'TST' },
  { lat: 22.3050, lng: 114.1700, name: 'Jordan' },
  { lat: 22.3122, lng: 114.1695, name: 'Yau Ma Tei' },
  { lat: 22.3204, lng: 114.1687, name: 'Mong Kok' },
  { lat: 22.3280, lng: 114.1701, name: 'Prince Edward' },
  { lat: 22.3204, lng: 114.1687, name: 'Mong Kok' }, // reverse
  { lat: 22.2988, lng: 114.1722, name: 'TST' },
]

// Airport Express route (Central → Tsing Yi → Lantau → Airport)
const AIRPORT_ROUTE: RoutePoint[] = [
  { lat: 22.2840, lng: 114.1580, name: 'HK Station' },
  { lat: 22.2994, lng: 114.1062, name: 'Kowloon Station' },
  { lat: 22.3578, lng: 114.1073, name: 'Tsing Yi' },
  { lat: 22.3634, lng: 113.9445, name: 'Tung Chung' },
  { lat: 22.3153, lng: 113.9364, name: 'Airport' },
  { lat: 22.3634, lng: 113.9445, name: 'Tung Chung' }, // reverse
  { lat: 22.2840, lng: 114.1580, name: 'HK Station' },
]

const DEMO_VEHICLES: Omit<VehicleState, 'speed' | 'soc' | 'odometer' | 'selfDrivingMiles' | 'shiftState' | 'phase' | 'stopTimer' | 'targetSpeed'>[] = [
  {
    vin: '5YJ3E1EA1PF000001',
    model: 'Model 3',
    routeName: 'HK Island',
    route: HK_ISLAND_ROUTE,
    routeIndex: 0,
    routeProgress: 0,
    isRobotaxi: false,
  },
  {
    vin: '5YJ3E1EA1PF000002',
    model: 'Model Y',
    routeName: 'Kowloon',
    route: KOWLOON_ROUTE,
    routeIndex: 0,
    routeProgress: 0,
    isRobotaxi: false,
  },
  {
    vin: '7SAXCBE50PF000003',
    model: 'Model X',
    routeName: 'Airport Express',
    route: AIRPORT_ROUTE,
    routeIndex: 0,
    routeProgress: 0,
    isRobotaxi: true,
  },
]

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function interpolatePosition(
  route: RoutePoint[],
  index: number,
  progress: number
): { lat: number; lng: number } {
  const from = route[index]
  const to = route[(index + 1) % route.length]
  return {
    lat: lerp(from.lat, to.lat, progress),
    lng: lerp(from.lng, to.lng, progress),
  }
}

class TelemetrySimulator {
  private vehicles: VehicleState[]
  private running = false
  private timer: ReturnType<typeof setInterval> | null = null
  private ingestUrl: string

  constructor() {
    this.ingestUrl =
      process.env.NEXT_PUBLIC_SITE_URL
        ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/telemetry/ingest`
        : 'http://localhost:3004/api/telemetry/ingest'

    this.vehicles = DEMO_VEHICLES.map((v) => ({
      ...v,
      speed: 0,
      soc: 85,
      odometer: Math.floor(Math.random() * 10000) + 5000,
      selfDrivingMiles: v.isRobotaxi ? Math.floor(Math.random() * 500) + 100 : 0,
      shiftState: 'P' as const,
      phase: 'stopped' as const,
      stopTimer: 0,
      targetSpeed: 60,
    }))

    // Auto-start in development
    if (process.env.NODE_ENV === 'development') {
      setTimeout(() => this.start(), 2000)
    }
  }

  getVehicles(): VehicleState[] {
    return this.vehicles
  }

  isRunning(): boolean {
    return this.running
  }

  addVehicle(): VehicleState {
    const idx = this.vehicles.length
    const routes = [HK_ISLAND_ROUTE, KOWLOON_ROUTE, AIRPORT_ROUTE]
    const routeNames = ['HK Island', 'Kowloon', 'Airport Express']
    const models = ['Model 3', 'Model Y', 'Model S']
    const routeIdx = idx % routes.length
    const newVin = `5YJ3E1EA1PF${String(100 + idx).padStart(6, '0')}`

    const v: VehicleState = {
      vin: newVin,
      model: models[routeIdx],
      routeName: routeNames[routeIdx],
      route: routes[routeIdx],
      routeIndex: 0,
      routeProgress: Math.random(),
      isRobotaxi: false,
      speed: 0,
      soc: 80 + Math.random() * 15,
      odometer: Math.floor(Math.random() * 8000) + 2000,
      selfDrivingMiles: 0,
      shiftState: 'P',
      phase: 'stopped',
      stopTimer: 0,
      targetSpeed: 50 + Math.random() * 30,
    }
    this.vehicles.push(v)
    return v
  }

  start(): void {
    if (this.running) return
    this.running = true
    this.timer = setInterval(() => this.tick(), 2000)
    console.log('[TelemetrySimulator] Started')
  }

  stop(): void {
    if (!this.running) return
    this.running = false
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
    // Park all vehicles
    this.vehicles.forEach((v) => {
      v.speed = 0
      v.shiftState = 'P'
      v.phase = 'stopped'
    })
    console.log('[TelemetrySimulator] Stopped')
  }

  private tick(): void {
    this.vehicles.forEach((v) => this.updateVehicle(v))
  }

  private updateVehicle(v: VehicleState): void {
    // Speed simulation
    if (v.phase === 'stopped') {
      v.stopTimer--
      v.speed = 0
      v.shiftState = 'P'
      if (v.stopTimer <= 0) {
        v.phase = 'accelerating'
        v.targetSpeed = 40 + Math.random() * 80
        v.shiftState = 'D'
      }
    } else if (v.phase === 'accelerating') {
      v.speed = Math.min(v.speed + 8 + Math.random() * 5, v.targetSpeed)
      if (Math.abs(v.speed - v.targetSpeed) < 5) {
        v.phase = 'cruising'
      }
      v.shiftState = 'D'
    } else if (v.phase === 'cruising') {
      // Small variation
      v.speed += (Math.random() - 0.5) * 6
      v.speed = Math.max(10, Math.min(v.speed, 120))
      // Occasionally decelerate
      if (Math.random() < 0.1) {
        v.phase = 'decelerating'
      }
      v.shiftState = 'D'
    } else if (v.phase === 'decelerating') {
      v.speed = Math.max(0, v.speed - 10 - Math.random() * 8)
      if (v.speed < 2) {
        v.speed = 0
        v.phase = 'stopped'
        v.stopTimer = Math.floor(Math.random() * 5) + 2
        v.shiftState = 'N'
      } else {
        v.shiftState = 'D'
      }
    }

    // Move along route
    if (v.speed > 0) {
      const distancePerTick = (v.speed / 3600) * 2 // km in 2s
      const segLen = this.segmentLength(v.route, v.routeIndex)
      v.routeProgress += distancePerTick / segLen

      if (v.routeProgress >= 1) {
        v.routeProgress = v.routeProgress - 1
        v.routeIndex = (v.routeIndex + 1) % (v.route.length - 1)
      }

      v.odometer += distancePerTick
      if (v.isRobotaxi) {
        v.selfDrivingMiles += distancePerTick * 0.621371
      }
    }

    // Battery drain
    v.soc = Math.max(5, v.soc - 0.003 - (v.speed / 120) * 0.005)

    // Post to ingest
    const pos = interpolatePosition(v.route, v.routeIndex, v.routeProgress)
    const payload = {
      vin: v.vin,
      VehicleSpeed: Math.round(v.speed * 10) / 10,
      Soc: Math.round(v.soc * 10) / 10,
      Odometer: Math.round(v.odometer * 10) / 10,
      EstBatteryRange: Math.round((v.soc / 100) * 550 * 10) / 10,
      ShiftState: v.speed > 0 ? 'D' : v.shiftState,
      SelfDrivingMilesSinceReset: Math.round(v.selfDrivingMiles * 10) / 10,
      Location: { lat: pos.lat, lng: pos.lng },
      model: v.model,
      routeName: v.routeName,
      simulated: true,
    }

    fetch(this.ingestUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch((err: Error) => {
      console.warn('[TelemetrySimulator] Ingest error:', err.message)
    })
  }

  private segmentLength(route: RoutePoint[], index: number): number {
    const from = route[index]
    const to = route[(index + 1) % route.length]
    const dLat = to.lat - from.lat
    const dLng = to.lng - from.lng
    // Rough km conversion
    return Math.sqrt(dLat * dLat + dLng * dLng) * 111
  }
}

// Singleton
declare global {
  // eslint-disable-next-line no-var
  var __telemetrySimulator: TelemetrySimulator | undefined
}

export const telemetrySimulator: TelemetrySimulator =
  global.__telemetrySimulator ?? (global.__telemetrySimulator = new TelemetrySimulator())

export type { VehicleState }
