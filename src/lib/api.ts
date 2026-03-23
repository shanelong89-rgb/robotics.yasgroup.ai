const API_BASE = '/api'

let _accessToken: string | null = null

export function setAccessToken(token: string) {
  _accessToken = token
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('yas_access_token', token)
  }
}

export function getAccessToken(): string | null {
  if (_accessToken) return _accessToken
  if (typeof window !== 'undefined') {
    return window.localStorage.getItem('yas_access_token')
  }
  return null
}

export function clearAccessToken() {
  _accessToken = null
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem('yas_access_token')
  }
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getAccessToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || res.statusText)
  }

  return res.json()
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    me: () => apiFetch('/auth/me'),
    logout: () => apiFetch('/auth/logout', { method: 'POST' }),
  },
  command: {
    snapshot: () => apiFetch('/command/snapshot'),
    livePositions: () => apiFetch('/command/assets/live'),
  },
  assets: {
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : ''
      return apiFetch(`/assets${qs}`)
    },
    get: (id: string) => apiFetch(`/assets/${id}`),
    telemetry: (id: string) => apiFetch(`/assets/${id}/telemetry`),
    alerts: (id: string) => apiFetch(`/assets/${id}/alerts`),
    updateStatus: (id: string, status: string) =>
      apiFetch(`/assets/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  },
  fleets: {
    list: () => apiFetch('/fleets'),
    get: (id: string) => apiFetch(`/fleets/${id}`),
  },
  alerts: {
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : ''
      return apiFetch(`/alerts${qs}`)
    },
    update: (id: string, data: any) => apiFetch(`/alerts/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  },
  claims: {
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : ''
      return apiFetch(`/claims${qs}`)
    },
    get: (id: string) => apiFetch(`/claims/${id}`),
    create: (data: any) => apiFetch('/claims', { method: 'POST', body: JSON.stringify(data) }),
    review: (id: string, data: any) => apiFetch(`/claims/${id}/review`, { method: 'PATCH', body: JSON.stringify(data) }),
  },
  treasury: {
    summary: () => apiFetch('/treasury/summary'),
    pools: () => apiFetch('/treasury/pools'),
    movements: () => apiFetch('/treasury/movements'),
  },
  operators: {
    list: () => apiFetch('/operators'),
    get: (id: string) => apiFetch(`/operators/${id}`),
  },
}

export function mapApiAsset(a: any) {
  return {
    id: a.assetId || a.id,
    name: a.assetName || a.name,
    type: (a.type || '').toLowerCase() as 'robot' | 'ev' | 'av',
    fleetId: a.fleetId,
    status: (a.status || 'active').toLowerCase() as 'active' | 'idle' | 'warning' | 'critical' | 'offline',
    lat: a.lat || 0,
    lng: a.lng || 0,
    riskScore: a.riskScore || 0,
    batteryLevel: a.batteryPct || a.batteryLevel || 80,
    healthPercent: a.batteryPct || 80,
    operatingHours: a.uptimeHours || 0,
    lastEvent: a.lastEvent?.summary || a.lastEvent || 'Heartbeat',
    lastEventTime: a.lastEvent?.recordedAt || a.locationUpdatedAt || new Date().toISOString(),
    coveragePolicyId: a.activeCoverage?.policyId,
    premiumBurnRate: a.premiumBurnRate || 0,
    geography: detectGeography(a.lat, a.lng),
    alertCount: a.alertCount || 0,
    highestAlertSeverity: a.highestAlertSeverity || 'NONE',
    riskMultiplier: a.riskMultiplier || 1.0,
    activeClaimId: a.activeClaimId,
    activeClaimStatus: a.activeClaimStatus,
    fleetName: a.fleetName,
    operatorId: a.operatorId,
  }
}

function detectGeography(lat?: number, lng?: number): 'hong_kong' | 'shenzhen' | 'tokyo' | 'singapore' {
  if (!lat || !lng) return 'hong_kong'
  if (lat >= 22.28 && lat <= 22.38 && lng >= 114.10 && lng <= 114.22) return 'hong_kong'
  if (lat >= 22.52 && lat <= 22.60 && lng >= 113.88 && lng <= 114.05) return 'shenzhen'
  if (lat >= 35.65 && lat <= 35.72 && lng >= 139.68 && lng <= 139.78) return 'tokyo'
  if (lat >= 1.28 && lat <= 1.38 && lng >= 103.78 && lng <= 103.90) return 'singapore'
  return 'hong_kong'
}
