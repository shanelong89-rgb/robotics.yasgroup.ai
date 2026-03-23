'use client'
import { X, Activity, Battery, MapPin, Shield, AlertTriangle, Zap } from 'lucide-react'
import { Asset } from '@/types'
import StatusChip from './StatusChip'
import RiskScoreBadge from './RiskScoreBadge'

interface MobileAssetSheetProps {
  asset: Asset | null
  onClose: () => void
}

function getRiskColor(score: number) {
  if (score >= 70) return '#EF4444'
  if (score >= 40) return '#F59E0B'
  return '#22C55E'
}

export default function MobileAssetSheet({ asset, onClose }: MobileAssetSheetProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-30 md:hidden"
        style={{
          background: 'rgba(0,0,0,0.4)',
          opacity: asset ? 1 : 0,
          pointerEvents: asset ? 'auto' : 'none',
          transition: 'opacity 0.2s ease',
        }}
      />
      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 rounded-t-3xl md:hidden"
        style={{
          background: 'rgba(10,14,26,0.98)',
          backdropFilter: 'blur(30px)',
          border: '1px solid rgba(255,255,255,0.10)',
          borderBottom: 'none',
          paddingBottom: 'env(safe-area-inset-bottom)',
          maxHeight: '75vh',
          overflowY: 'auto',
          transform: asset ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
          pointerEvents: asset ? 'auto' : 'none',
        }}
      >
        {asset && (
          <>
            {/* Tap handle to close */}
            <div className="flex justify-center pt-3 pb-1" onClick={onClose}>
              <div className="w-10 h-1 rounded-full bg-white/30 cursor-pointer" />
            </div>

            {/* Header */}
            <div className="px-5 pt-2 pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                    style={{
                      background: asset.status === 'critical' ? 'rgba(239,68,68,0.15)' :
                        asset.status === 'warning' ? 'rgba(245,158,11,0.15)' : 'rgba(59,130,246,0.15)',
                      border: `1px solid ${asset.status === 'critical' ? 'rgba(239,68,68,0.3)' :
                        asset.status === 'warning' ? 'rgba(245,158,11,0.3)' : 'rgba(59,130,246,0.3)'}`,
                    }}
                  >
                    {asset.type === 'robot' ? '🤖' : asset.type === 'ev' ? '🚗' : '🚐'}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-yas-text">{asset.name}</h3>
                    <p className="text-xs text-yas-muted">{asset.fleetId}</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/[0.06]">
                  <X className="w-4 h-4 text-yas-muted" />
                </button>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <StatusChip status={asset.status} />
                <RiskScoreBadge score={asset.riskScore} />
              </div>
            </div>

            {/* Stats grid */}
            <div className="px-4 pb-3 grid grid-cols-3 gap-3">
              {[
                { label: 'Battery', value: `${asset.batteryLevel}%`, icon: Battery, color: asset.batteryLevel < 20 ? '#EF4444' : '#22C55E' },
                { label: 'Risk Score', value: `${asset.riskScore}`, icon: Activity, color: getRiskColor(asset.riskScore) },
                { label: 'Health', value: `${asset.healthPercent}%`, icon: Zap, color: '#3B82F6' },
              ].map((stat) => {
                const Icon = stat.icon
                return (
                  <div
                    key={stat.label}
                    className="rounded-2xl p-3"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <Icon className="w-4 h-4 mb-1.5" style={{ color: stat.color }} />
                    <p className="text-base font-bold" style={{ color: stat.color }}>{stat.value}</p>
                    <p className="text-[10px] text-yas-muted mt-0.5">{stat.label}</p>
                  </div>
                )
              })}
            </div>

            {/* Location */}
            <div className="px-4 pb-3">
              <div className="rounded-2xl p-3 flex items-center gap-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <MapPin className="w-4 h-4 text-yas-muted flex-shrink-0" />
                <div>
                  <p className="text-xs text-yas-text font-medium">{asset.geography || 'Location active'}</p>
                  <p className="text-[10px] text-yas-muted">{asset.lat?.toFixed(4)}, {asset.lng?.toFixed(4)}</p>
                </div>
              </div>
            </div>

            {/* Coverage */}
            <div className="px-4 pb-3">
              <div className="rounded-2xl p-3" style={{ background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.18)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-3.5 h-3.5 text-yas-teal" />
                  <span className="text-[10px] uppercase tracking-widest text-yas-teal font-semibold">Protection Active</span>
                </div>
                <p className="text-sm font-semibold text-yas-text">UBI Coverage · HK$0.{Math.round(asset.riskScore * 0.45)}/hr</p>
                <p className="text-[10px] text-yas-muted mt-0.5">Physical Damage · Third-Party Liability</p>
              </div>
            </div>

            {/* Critical action */}
            {asset.status === 'critical' && (
              <div className="px-4 pb-5">
                <div className="rounded-2xl p-3" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.20)' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-[10px] uppercase tracking-widest text-red-400 font-semibold">Action Required</span>
                  </div>
                  <p className="text-xs text-yas-text">Critical fault detected. Initiate telemetry review and consider coverage hold until resolved.</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
