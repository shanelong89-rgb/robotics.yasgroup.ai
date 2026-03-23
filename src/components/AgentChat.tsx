'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface AgentConfig {
  id: 'aria' | 'cass'
  name: string
  title: string
  avatar: string
  accentColor: string
  suggestedPrompts: string[]
}

const AGENTS: Record<string, AgentConfig> = {
  aria: {
    id: 'aria',
    name: 'ARIA',
    title: 'AI Super Underwriter',
    avatar: '🛡️',
    accentColor: '#3B82F6',
    suggestedPrompts: [
      'Assess risk for this asset',
      'What coverage do you recommend?',
      'How is the premium calculated?',
      'What are the top risk red flags?',
      'How can we reduce the risk score?'
    ]
  },
  cass: {
    id: 'cass',
    name: 'CASS',
    title: 'Capital Strategy Intelligence',
    avatar: '💎',
    accentColor: '#14B8A6',
    suggestedPrompts: [
      'Analyze current reserve health',
      'How should we deploy idle capital?',
      'Model the LP participation structure',
      'Explain the oracle payout architecture',
      'What yield strategy do you recommend?'
    ]
  }
}

interface AgentChatProps {
  agentId: 'aria' | 'cass'
  context?: Record<string, unknown>
  isOpen: boolean
  onClose: () => void
}

export default function AgentChat({ agentId, context, isOpen, onClose }: AgentChatProps) {
  const agent = AGENTS[agentId]
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting: Message = {
        role: 'assistant',
        content: agentId === 'aria'
          ? `**${agent.name} online.** I'm your underwriting intelligence for this platform.\n\nI can analyze asset risk profiles, recommend coverage structures, explain pricing logic, and flag underwriting concerns. What would you like to assess?`
          : `**${agent.name} online.** I'm your capital and treasury strategist.\n\nI can analyze your reserve pool health, model yield deployment strategies, design LP participation structures, and advise on oracle-triggered payout architecture. What's your priority?`,
        timestamp: new Date()
      }
      setMessages([greeting])
    }
  }, [isOpen, agentId, agent.name, messages.length])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    setShowSuggestions(false)
    const userMsg: Message = { role: 'user', content, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/agents/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId,
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          context
        })
      })
      const data = await res.json()
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Connection error. Please try again.',
        timestamp: new Date()
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const formatMessage = (content: string) => {
    if (!content || typeof content !== 'string') return null
    return content.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**') && !line.slice(2, -2).includes('**')) {
        return <p key={i} className="font-bold text-yas-text mb-1">{line.slice(2, -2)}</p>
      }
      if (line.startsWith('- ') || line.startsWith('🔴 ') || line.startsWith('🟡 ') || line.startsWith('✅ ') || line.startsWith('⚠️ ')) {
        const text = line.startsWith('- ') ? line.slice(2) : line
        return (
          <p key={i} className="text-yas-subtext ml-2 mb-0.5 text-[11px]">
            {line.startsWith('- ') ? '• ' : ''}{renderInlineBold(text)}
          </p>
        )
      }
      if (line.includes('**')) {
        return <p key={i} className="text-yas-subtext mb-1 text-[11px]">{renderInlineBold(line)}</p>
      }
      if (line.trim() === '') return <div key={i} className="h-1.5" />
      return <p key={i} className="text-yas-subtext mb-1 text-[11px]">{line}</p>
    })
  }

  const renderInlineBold = (text: string) => {
    const parts = text.split(/\*\*(.*?)\*\*/g)
    return parts.map((p, j) =>
      j % 2 === 1 ? <strong key={j} className="text-yas-text font-semibold">{p}</strong> : p
    )
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 40, scale: 0.97 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 40, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 350, damping: 38 }}
          className="fixed bottom-20 md:bottom-6 right-2 md:right-6 w-[calc(100vw-16px)] md:w-[380px] z-[55] flex flex-col rounded-2xl overflow-hidden"
          style={{
            maxHeight: 'calc(100vh - 160px)',
            boxShadow: `0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)`
          }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 p-4 flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, rgba(13,18,30,0.98), rgba(${agentId === 'aria' ? '59,130,246' : '20,184,166'},0.14))`,
              backdropFilter: 'blur(24px)',
              borderBottom: '1px solid rgba(255,255,255,0.07)'
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: `${agent.accentColor}18`, border: `1px solid ${agent.accentColor}35` }}
            >
              {agent.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-yas-text">{agent.name}</span>
                <span
                  className="px-1.5 py-0.5 rounded-full text-[9px] uppercase tracking-widest font-bold"
                  style={{ background: `${agent.accentColor}20`, color: agent.accentColor }}
                >
                  AI
                </span>
                <span className="flex items-center gap-1 ml-auto">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[9px] text-emerald-400 font-medium">Online</span>
                </span>
              </div>
              <p className="text-[10px] text-yas-muted truncate">{agent.title}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/[0.06] text-yas-muted hover:text-yas-text transition-colors ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto p-4 flex flex-col gap-3"
            style={{
              background: 'rgba(10,14,26,0.95)',
              backdropFilter: 'blur(24px)',
              minHeight: '280px',
              maxHeight: '420px'
            }}
          >
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {msg.role === 'assistant' && (
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0 mt-0.5"
                    style={{ background: `${agent.accentColor}18`, border: `1px solid ${agent.accentColor}30` }}
                  >
                    {agent.avatar}
                  </div>
                )}
                <div
                  className={`max-w-[82%] rounded-xl p-3 leading-relaxed ${msg.role === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
                  style={msg.role === 'user'
                    ? { background: `${agent.accentColor}22`, border: `1px solid ${agent.accentColor}30` }
                    : { background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.07)' }
                  }
                >
                  {msg.role === 'assistant'
                    ? <div className="text-xs">{formatMessage(msg.content)}</div>
                    : <p className="text-xs text-yas-text">{msg.content}</p>
                  }
                </div>
              </motion.div>
            ))}

            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                  style={{ background: `${agent.accentColor}18` }}
                >
                  {agent.avatar}
                </div>
                <div
                  className="rounded-xl rounded-tl-sm p-3"
                  style={{ background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <div className="flex gap-1 items-center h-3">
                    {[0, 1, 2].map(i => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full animate-bounce"
                        style={{ background: agent.accentColor, animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Suggested prompts */}
            {showSuggestions && messages.length <= 1 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="flex flex-col gap-1.5 mt-1"
              >
                <p className="text-[9px] uppercase tracking-widest text-yas-muted mb-0.5">Suggested</p>
                {agent.suggestedPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(prompt)}
                    className="text-left text-[11px] p-2.5 rounded-lg border transition-all hover:bg-white/[0.04]"
                    style={{
                      background: 'rgba(255,255,255,0.025)',
                      borderColor: 'rgba(255,255,255,0.07)',
                      color: '#94A3B8'
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            className="p-3 flex-shrink-0"
            style={{
              background: 'rgba(13,18,30,0.98)',
              backdropFilter: 'blur(24px)',
              borderTop: '1px solid rgba(255,255,255,0.06)'
            }}
          >
            <div className="flex gap-2 items-center">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
                placeholder={`Ask ${agent.name}...`}
                className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-yas-text placeholder-yas-muted focus:outline-none focus:border-white/[0.16] transition-colors"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-30"
                style={{ background: input.trim() && !isLoading ? agent.accentColor : 'rgba(255,255,255,0.08)' }}
              >
                <Send className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
