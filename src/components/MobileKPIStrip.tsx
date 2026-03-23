'use client'

interface KPI {
  label: string
  value: string | number
  color?: string
  urgent?: boolean
}

interface MobileKPIStripProps {
  kpis: KPI[]
}

export default function MobileKPIStrip({ kpis }: MobileKPIStripProps) {
  return (
    <div
      className="flex items-center gap-0 overflow-x-auto scrollbar-none md:hidden"
      style={{ paddingLeft: 16, paddingRight: 16 }}
    >
      {kpis.map((kpi, i) => (
        <div
          key={kpi.label}
          className="flex-shrink-0 flex flex-col items-center px-4 py-2 relative"
          style={{ animation: `fadeInDown 0.3s ease ${i * 0.05}s both` }}
        >
          {i > 0 && (
            <div className="absolute left-0 top-2 bottom-2 w-px bg-white/[0.08]" />
          )}
          <span
            className="text-lg font-bold tabular-nums leading-none"
            style={{ color: kpi.urgent ? '#EF4444' : (kpi.color || '#F1F5F9') }}
          >
            {kpi.value}
          </span>
          <span className="text-[9px] uppercase tracking-widest text-yas-muted mt-0.5 whitespace-nowrap">
            {kpi.label}
          </span>
        </div>
      ))}
    </div>
  )
}
