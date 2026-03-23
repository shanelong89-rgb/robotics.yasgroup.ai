'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Map, AlertTriangle, Shield, DollarSign, TrendingDown, Bell, Landmark } from 'lucide-react'
import { useMemo } from 'react'
import { alerts as demoAlerts } from '@/lib/demo-data'

const tabs = [
  { href: '/', label: 'Command', icon: Map, color: '#3B82F6' },
  { href: '/risk', label: 'Risk', icon: AlertTriangle, color: '#F59E0B' },
  { href: '/claims', label: 'Claims', icon: Shield, color: '#EF4444', badge: 3 },
  { href: '/invest', label: 'Invest', icon: Landmark, color: '#3B82F6' },
  { href: '/alerts', label: 'Alerts', icon: Bell, color: '#EF4444' },
]

export default function MobileBottomNav() {
  const pathname = usePathname()
  const criticalCount = useMemo(
    () => demoAlerts.filter((a) => a.severity === 'critical' && !a.acknowledged).length,
    []
  )

  // Hide nav on auth pages and public pages
  if (pathname === "/login" || pathname === "/signup" || pathname.startsWith("/demo")) return null

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{
        background: 'rgba(5, 8, 20, 0.97)',
        backdropFilter: 'saturate(180%) blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex items-center justify-around px-2 pt-2 pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href)
          const dynamicBadge = tab.href === '/alerts' ? criticalCount : tab.badge
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all relative"
              style={{ minWidth: 56 }}
            >
              {dynamicBadge && dynamicBadge > 0 && (
                <span
                  className="absolute top-0.5 right-2 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                  style={{ background: tab.href === '/alerts' ? '#EF4444' : '#EF4444' }}
                >
                  {dynamicBadge}
                </span>
              )}
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                style={{
                  background: isActive ? `${tab.color}20` : 'transparent',
                  border: isActive ? `1px solid ${tab.color}40` : '1px solid transparent',
                }}
              >
                <Icon
                  className="w-4 h-4 transition-colors"
                  style={{ color: isActive ? tab.color : '#64748B' }}
                />
              </div>
              <span
                className="text-[9px] font-medium transition-colors"
                style={{ color: isActive ? tab.color : '#64748B' }}
              >
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
