'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('App error:', error?.message, error?.stack, error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-yas-base p-8">
      <div className="max-w-lg w-full rounded-2xl p-6" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
        <h2 className="text-yas-red font-bold text-lg mb-2">Runtime Error</h2>
        <p className="text-yas-subtext text-sm mb-4 font-mono break-all">{error.message}</p>
        {error.stack && (
          <pre className="text-[10px] text-yas-muted overflow-auto max-h-48 mb-4 bg-black/30 rounded p-3">
            {error.stack}
          </pre>
        )}
        <button
          onClick={reset}
          className="px-4 py-2 rounded-xl text-sm font-medium text-white"
          style={{ background: '#3B82F6' }}
        >
          Try again
        </button>
      </div>
    </div>
  )
}
