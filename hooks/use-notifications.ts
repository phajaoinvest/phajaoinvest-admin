/**
 * useNotifications Hook
 * Real-time notifications with Socket.IO integration
 */

'use client'

import { useEffect, useCallback, useState, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '@/lib/stores/auth-store'
import { tokenManager } from '@/lib/api'
import type { Notification } from '@/lib/types'

// ============================================================================
// Types
// ============================================================================

interface UseNotificationsReturn {
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  reconnect: () => void
}

// ============================================================================
// Configuration
// ============================================================================

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
const SOCKET_NAMESPACE = '/notifications'
const RECONNECTION_ATTEMPTS = 5
const RECONNECTION_DELAY = 3000

// ============================================================================
// Socket Instance (singleton)
// ============================================================================

let socket: Socket | null = null

function createSocket(token: string): Socket {
  return io(`${SOCKET_URL}${SOCKET_NAMESPACE}`, {
    auth: { token },
    reconnection: true,
    reconnectionAttempts: RECONNECTION_ATTEMPTS,
    reconnectionDelay: RECONNECTION_DELAY,
    transports: ['websocket', 'polling'],
  })
}

// ============================================================================
// Hook
// ============================================================================

export function useNotifications(
  onNotification?: (notification: Notification) => void
): UseNotificationsReturn {
  const { user, isAuthenticated } = useAuthStore()
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Use ref to store callback and avoid re-registering listeners
  const onNotificationRef = useRef(onNotification)
  
  // Update ref when callback changes
  useEffect(() => {
    onNotificationRef.current = onNotification
  }, [onNotification])

  const connect = useCallback(() => {
    if (!isAuthenticated || socket?.connected) return

    const token = tokenManager.getAccessToken()
    if (!token) {
      setError('No authentication token')
      return
    }

    if (!user) {
      setError('No user information')
      return
    }

    setIsConnecting(true)
    setError(null)

    // Create or reconnect socket
    if (!socket) {
      socket = createSocket(token)
    } else if (socket.disconnected) {
      socket.auth = { token }
      socket.connect()
    }

    // Connection events
    socket.on('connect', () => {
      console.log('✅ Socket.IO connected')
      console.log('👤 Current user:', {
        id: user.id,
        username: user.username,
        hasRole: !!user.role,
        roleName: user.role?.name
      })
      setIsConnected(true)
      setIsConnecting(false)
      setError(null)

      // Subscribe to notifications after connection
      // Admin users use 'admin' as userId, regular customers use their own userId
      const subscribeData = {
        userId: user.role ? 'admin' : user.id, // If user has a role, they're an admin
        type: (user.role ? 'admin' : 'customer') as 'admin' | 'customer'
      }
      console.log('📡 Subscribing to notifications:', subscribeData)
      socket?.emit('subscribe', subscribeData)
    })

    // Listen for subscribe confirmation
    socket.on('subscribe-response', (response: { success: boolean; message: string }) => {
      console.log('✅ Subscribe response:', response)
    })

    socket.on('disconnect', (reason) => {
      console.log('❌ Socket.IO disconnected:', reason)
      setIsConnected(false)
    })

    socket.on('connect_error', (err) => {
      console.error('Socket.IO connection error:', err)
      setIsConnecting(false)
      setError(err.message || 'Connection failed')
    })

    // Notification events - backend emits 'new-notification' not 'notification'
    socket.on('new-notification', (notification: Notification) => {
      console.log('🔔 New notification received:', notification)
      console.log('🔔 Callback exists:', !!onNotificationRef.current)
      if (onNotificationRef.current) {
        console.log('🔔 Calling notification callback...')
        onNotificationRef.current(notification)
      } else {
        console.warn('⚠️ No notification callback registered!')
      }
    })

    socket.on('initial-notifications', (notifications: Notification[]) => {
      console.log('📦 Initial notifications received:', notifications.length)
    })
    
    console.log('✅ Socket.IO event listeners registered')

    return () => {
      socket?.off('connect')
      socket?.off('disconnect')
      socket?.off('connect_error')
      socket?.off('new-notification')
      socket?.off('initial-notifications')
      socket?.off('subscribe-response')
    }
  }, [isAuthenticated, user])

  const reconnect = useCallback(() => {
    socket?.disconnect()
    socket = null
    connect()
  }, [connect])

  // Connect on mount and when auth changes
  useEffect(() => {
    if (!isAuthenticated || !user) {
      // Disconnect when logged out
      if (socket) {
        socket.disconnect()
        socket = null
      }
      setIsConnected(false)
      setIsConnecting(false)
      return
    }

    const cleanup = connect()
    return cleanup
  }, [isAuthenticated, user, connect])

  return {
    isConnected,
    isConnecting,
    error,
    reconnect,
  }
}
