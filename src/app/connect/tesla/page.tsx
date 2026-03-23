'use client'

import { useEffect, useState, useCallback } from 'react'
import { Car, Zap, Shield, ChevronRight, CheckCircle2, AlertCircle, Wifi, WifiOff } from 'lucide-react'

interface TeslaVehicle {
  id: number
  vin: string
  display_name: string
  state: string
}

type PageState = 'loading' | 'connected' | 'disconnected' | 'error'

export default function ConnectTeslaPage() {
  const [pageState, setPageState] = useState<PageState>('loading')
  const [vehicles, setVehicles] = useState<TeslaVehicle[]>([])
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)

  const checkConnection = useCallback(async () => {
    try {
      const res = await fetch('/api/tesla/vehicles')
      if (res.status === 401) {
        setPageState('disconnected')
        return
      }
      if (!res.ok) {
        setPageState('error')
        setErrorMsg('Failed to fetch vehicle data')
        return
      }
      const data = await res.json() as { vehicles: TeslaVehicle[] }
      setVehicles(data.vehicles || [])
      setPageState('connected')
    } catch {
      setPageState('disconnected')
    }
  }, [])

  useEffect(() => {
    // Check for OAuth result in query params
    const params = new URLSearchParams(window.location.search)
    if (params.get('connected') === '1') {
      // Just returned from Tesla OAuth — load vehicles
      checkConnection()
    } else if (params.get('error')) {
      setPageState('error')
      setErrorMsg(decodeURIComponent(params.get('error') || 'oauth_error'))
    } else {
      checkConnection()
    }
  }, [checkConnection])

  const handleConnect = () => {
    setConnecting(true)
    window.location.href = '/api/auth/tesla'
  }

  const getStateColor = (state: string) => {
    switch (state.toLowerCase()) {
      case 'online': return '#81D8D0'
      case 'asleep': return '#F59E0B'
      default: return '#64748B'
    }
  }

  return (
    <div className="pt-6 md:pt-8 pb-24 md:pb-8 px-4 md:px-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Car className="w-5 h-5" style={{ color: '#81D8D0' }} />
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#81D8D0' }}>
            Vehicle Connect
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-yas-text mb-1">Connect Your Tesla</h1>
        <p className="text-sm" style={{ color: '#94A3B8' }}>
          Authorize YAS Assurance to access real-time vehicle telemetry for live risk monitoring
        </p>
      </div>

      {/* Loading state */}
      {pageState === 'loading' && (
        <div className="flex items-center justify-center py-16">
          <div
            className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: '#81D8D0', borderTopColor: 'transparent' }}
          />
        </div>
      )}

      {/* Connected state */}
      {pageState === 'connected' && (
        <div>
          {/* Status badge */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
            style={{ background: 'rgba(129,216,208,0.1)', color: '#81D8D0', border: '1px solid rgba(129,216,208,0.2)' }}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Tesla Account Connected
          </div>

          {/* Vehicle list */}
          {vehicles.length === 0 ? (
            <div
              className="rounded-2xl border p-8 text-center"
              style={{ background: '#111827', borderColor: 'rgba(255,255,255,0.08)' }}
            >
              <Car className="w-10 h-10 mx-auto mb-3" style={{ color: '#64748B' }} />
              <p className="text-sm" style={{ color: '#94A3B8' }}>No vehicles found in your Tesla account</p>
            </div>
          ) : (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-yas-text mb-3">
                {vehicles.length} Vehicle{vehicles.length !== 1 ? 's' : ''} Found
              </h2>
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="rounded-2xl border p-5 flex items-center justify-between"
                  style={{ background: '#111827', borderColor: 'rgba(255,255,255,0.08)' }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(129,216,208,0.08)' }}
                    >
                      <Car className="w-5 h-5" style={{ color: '#81D8D0' }} />
                    </div>
                    <div>
                      <div className="font-semibold text-yas-text">{vehicle.display_name}</div>
                      <div className="text-xs mt-0.5 font-mono" style={{ color: '#64748B' }}>
                        VIN: {vehicle.vin}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{
                        background: `${getStateColor(vehicle.state)}15`,
                        color: getStateColor(vehicle.state),
                      }}
                    >
                      {vehicle.state.toLowerCase() === 'online'
                        ? <Wifi className="w-3 h-3" />
                        : <WifiOff className="w-3 h-3" />
                      }
                      {vehicle.state}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reconnect */}
          <div className="mt-6">
            <button
              onClick={handleConnect}
              disabled={connecting}
              className="text-xs font-medium transition-all hover:opacity-80"
              style={{ color: '#64748B' }}
            >
              Re-authorize Tesla access →
            </button>
          </div>
        </div>
      )}

      {/* Disconnected state */}
      {pageState === 'disconnected' && (
        <div>
          {/* Feature highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
            {[
              { icon: Zap, label: 'Real-time telemetry', desc: 'Speed, battery, location streamed live' },
              { icon: Shield, label: 'Risk monitoring', desc: 'ARIA scores each drive automatically' },
              { icon: Car, label: 'Fleet visibility', desc: 'All connected vehicles in one view' },
            ].map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="rounded-2xl border p-4"
                style={{ background: '#111827', borderColor: 'rgba(255,255,255,0.06)' }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
                  style={{ background: 'rgba(129,216,208,0.08)' }}
                >
                  <Icon className="w-4 h-4" style={{ color: '#81D8D0' }} />
                </div>
                <div className="text-sm font-semibold text-yas-text mb-1">{label}</div>
                <div className="text-xs" style={{ color: '#64748B' }}>{desc}</div>
              </div>
            ))}
          </div>

          {/* Connect button */}
          <div
            className="rounded-2xl border p-8 text-center"
            style={{ background: '#111827', borderColor: 'rgba(129,216,208,0.15)' }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: 'rgba(129,216,208,0.08)', border: '1px solid rgba(129,216,208,0.2)' }}
            >
              <Car className="w-8 h-8" style={{ color: '#81D8D0' }} />
            </div>
            <h2 className="text-lg font-bold text-yas-text mb-2">Connect Tesla Account</h2>
            <p className="text-sm mb-6 max-w-xs mx-auto" style={{ color: '#94A3B8' }}>
              You&apos;ll be redirected to Tesla to authorize YAS. No passwords are shared.
            </p>

            <button
              onClick={handleConnect}
              disabled={connecting}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-60"
              style={{
                background: 'linear-gradient(135deg, #81D8D0, #4FB3AC)',
                color: '#0B0F16',
                boxShadow: '0 2px 20px rgba(129,216,208,0.3)',
              }}
            >
              {connecting ? (
                <>
                  <div
                    className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: '#0B0F16', borderTopColor: 'transparent' }}
                  />
                  Connecting…
                </>
              ) : (
                <>
                  Connect Tesla <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-[11px] mt-4" style={{ color: '#475569' }}>
              Permissions: vehicle data, location, offline access. You can revoke at any time from your Tesla account.
            </p>
          </div>
        </div>
      )}

      {/* Error state */}
      {pageState === 'error' && (
        <div
          className="rounded-2xl border p-6 flex items-start gap-4"
          style={{ background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.2)' }}
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#EF4444' }} />
          <div>
            <div className="text-sm font-semibold" style={{ color: '#EF4444' }}>
              Authorization failed
            </div>
            <div className="text-xs mt-1" style={{ color: '#94A3B8' }}>
              {errorMsg || 'An error occurred during Tesla authorization. Please try again.'}
            </div>
            <button
              onClick={handleConnect}
              className="mt-3 text-xs font-semibold transition-all hover:opacity-80"
              style={{ color: '#81D8D0' }}
            >
              Try again →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
