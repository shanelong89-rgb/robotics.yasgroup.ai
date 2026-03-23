import { create } from 'zustand'
import { mapApiAsset } from '@/lib/api'

interface AssetState {
  id: string
  name: string
  type: string
  fleetId: string
  status: string
  lat: number
  lng: number
  riskScore: number
  batteryLevel: number
  premiumBurnRate: number
  alertCount: number
  activeClaimId: string | null
  [key: string]: any
}

interface KPI {
  totalAssets: number
  activeAssets: number
  protectedAssets: number
  criticalAlerts: number
  criticalAlertCount: number
  claimsInProgress: number
  reserveCoverageRatio: number
  premiumAccruedToday: number
  totalReserveBalance: number
  [key: string]: any
}

interface Alert {
  id: string
  assetId: string
  fleetId: string
  severity: string
  title: string
  description: string
  status: string
  triggeredAt: string
  [key: string]: any
}

interface CommandCenterState {
  // Data
  assets: AssetState[]
  assetMap: Record<string, AssetState>  // O(1) lookup by assetId
  kpi: KPI | null
  alerts: Alert[]
  reserve: any
  fleets: any[]

  // Loading state
  isLoading: boolean
  isLoaded: boolean
  error: string | null
  lastLoadedAt: string | null

  // WS connection
  wsConnected: boolean

  // Actions
  loadSnapshot: (snapshot: any) => void
  updateAssetPosition: (assetId: string, lat: number, lng: number, speedKph?: number) => void
  addAlert: (alert: any) => void
  resolveAlert: (alertId: string) => void
  setWsConnected: (connected: boolean) => void
  setError: (error: string | null) => void
  setLoading: (loading: boolean) => void
}

export const useCommandCenter = create<CommandCenterState>((set, get) => ({
  assets: [],
  assetMap: {},
  kpi: null,
  alerts: [],
  reserve: null,
  fleets: [],
  isLoading: false,
  isLoaded: false,
  error: null,
  lastLoadedAt: null,
  wsConnected: false,

  loadSnapshot: (snapshot: any) => {
    const rawAssets = snapshot.assets || []
    const mappedAssets: AssetState[] = rawAssets.map((a: any) => {
      const mapped = mapApiAsset(a)
      return {
        ...a,
        ...mapped,
        id: a.assetId || a.id,
        name: a.assetName || a.name,
        type: (a.type || '').toLowerCase(),
        status: (a.status || 'active').toLowerCase(),
      }
    })

    // Build O(1) lookup map
    const assetMap: Record<string, AssetState> = {}
    for (const asset of mappedAssets) {
      assetMap[asset.id] = asset
    }

    set({
      assets: mappedAssets,
      assetMap,
      kpi: snapshot.kpi || null,
      alerts: (snapshot.alerts || []).map((a: any) => ({ ...a, id: a.id || a.alertId })),
      reserve: snapshot.reserve || snapshot.reserveSummary || null,
      fleets: snapshot.fleets || [],
      isLoaded: true,
      isLoading: false,
      error: null,
      lastLoadedAt: new Date().toISOString(),
    })
  },

  updateAssetPosition: (assetId: string, lat: number, lng: number, speedKph?: number) => {
    set((state) => {
      const existing = state.assetMap[assetId]
      if (!existing) return state  // unknown asset, ignore

      const updated = { ...existing, lat, lng, speedKph: speedKph ?? existing.speedKph }
      const newMap = { ...state.assetMap, [assetId]: updated }
      const newAssets = state.assets.map(a => a.id === assetId ? updated : a)

      return { assetMap: newMap, assets: newAssets }
    })
  },

  addAlert: (alert: any) => {
    set((state) => {
      // Deduplicate by alertId
      const alertId = alert.alertId || alert.id
      const exists = state.alerts.some(a => (a.id || a.alertId) === alertId)
      if (exists) return state

      const newAlert = { ...alert, id: alertId }
      return { alerts: [newAlert, ...state.alerts].slice(0, 200) }
    })
  },

  resolveAlert: (alertId: string) => {
    set((state) => ({
      alerts: state.alerts.map(a =>
        (a.id || a.alertId) === alertId ? { ...a, status: 'RESOLVED' } : a
      ),
    }))
  },

  setWsConnected: (connected: boolean) => set({ wsConnected: connected }),
  setError: (error: string | null) => set({ error }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
}))
