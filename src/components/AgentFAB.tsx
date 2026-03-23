'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X } from 'lucide-react'
import AgentChat from './AgentChat'

interface AgentFABProps {
  agents: Array<'aria' | 'cass'>
  context?: Record<string, unknown>
}

const agentConfig = {
  aria: { label: 'ARIA', subtitle: 'AI Super Underwriter', icon: '🛡️', color: '#3B82F6' },
  cass: { label: 'CASS', subtitle: 'AI Liquidity 0026 Yield', icon: '💎', color: '#14B8A6' }
}

export default function AgentFAB({ agents, context }: AgentFABProps) {
  const [openAgent, setOpenAgent] = useState<'aria' | 'cass' | null>(null)
  const [expanded, setExpanded] = useState(false)

  const handleFABClick = () => {
    if (openAgent) {
      setOpenAgent(null)
      return
    }
    if (agents.length === 1) {
      setOpenAgent(agents[0])
    } else {
      setExpanded(!expanded)
    }
  }

  return (
    <>
      {/* FAB stack — hide when a chat is open to avoid overlapping the send button */}
      <div className={`fixed bottom-24 md:bottom-6 right-4 md:right-6 z-[60] flex flex-col items-end gap-3 transition-opacity duration-200 ${openAgent ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <AnimatePresence>
          {expanded && agents.map((agentId, i) => {
            const cfg = agentConfig[agentId]
            return (
              <motion.button
                key={agentId}
                initial={{ opacity: 0, y: 20, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.85 }}
                transition={{ delay: i * 0.06, type: 'spring', stiffness: 400, damping: 30 }}
                onClick={() => { setOpenAgent(agentId); setExpanded(false) }}
                className="flex items-center gap-3 pl-4 pr-3 py-2.5 rounded-2xl shadow-2xl"
                style={{
                  background: 'rgba(10,14,26,0.96)',
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${cfg.color}35`,
                  boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${cfg.color}18`
                }}
              >
                <span className="text-base">{cfg.icon}</span>
                <div className="text-left">
                  <p className="text-xs font-bold text-yas-text leading-none">{cfg.label}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: cfg.color }}>{cfg.subtitle}</p>
                </div>
              </motion.button>
            )
          })}
        </AnimatePresence>

        {/* Main FAB */}
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={handleFABClick}
          className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl"
          style={{
            background: openAgent
              ? 'rgba(255,255,255,0.12)'
              : 'linear-gradient(135deg, #3B82F6, #14B8A6)',
            boxShadow: openAgent
              ? '0 4px 20px rgba(0,0,0,0.4)'
              : '0 8px 32px rgba(59,130,246,0.38)'
          }}
        >
          <AnimatePresence mode="wait">
            {expanded || openAgent ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <X className="w-6 h-6 text-white" />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Sparkles className="w-6 h-6 text-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Chat panel */}
      {openAgent && (
        <AgentChat
          agentId={openAgent}
          context={context}
          isOpen={!!openAgent}
          onClose={() => setOpenAgent(null)}
        />
      )}
    </>
  )
}
