// SSR-safe socket.io client — only initializes in browser
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000'

let socket: any = null

export function getSocket(): any {
  if (typeof window === 'undefined') return null  // SSR guard

  if (!socket) {
    // Dynamically import socket.io-client only in browser
    const { io } = require('socket.io-client')
    socket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    })

    socket.on('connect', () => {
      console.log('[WS] Connected to YAS API')
    })

    socket.on('disconnect', () => {
      console.log('[WS] Disconnected')
    })

    socket.on('connect_error', (err: Error) => {
      console.warn('[WS] Connection error:', err.message)
    })
  }
  return socket
}

export function subscribeToFleet(fleetId: string) {
  const s = getSocket()
  if (s) s.emit('subscribe:fleet', { fleetId })
}

export function subscribeToAsset(assetId: string) {
  const s = getSocket()
  if (s) s.emit('subscribe:asset', { assetId })
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
