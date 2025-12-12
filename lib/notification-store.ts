/**
 * Notification Store
 * Manages notifications with real-time Socket.IO integration
 */

import { create } from 'zustand'
import { notificationsApi } from './api'
import type { Notification } from './types'

// ============================================================================
// Types
// ============================================================================

interface NotificationStore {
  // State
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  error: string | null

  // Actions
  fetchNotifications: () => Promise<void>
  addNotification: (notification: Notification) => void
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (id: string) => Promise<void>
  clearAll: () => void
  setError: (error: string | null) => void
}

// ============================================================================
// Helper Functions
// ============================================================================

function sortByDate(notifications: Notification[]): Notification[] {
  return [...notifications].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

// ============================================================================
// Store
// ============================================================================

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  // Initial state
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  // Fetch notifications from backend
  fetchNotifications: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await notificationsApi.getAll(0, 50)
      set({
        notifications: sortByDate(response.notifications),
        unreadCount: response.unreadCount,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch notifications'
      set({ error: message, isLoading: false })
    }
  },

  // Add notification (from Socket.IO)
  addNotification: (notification) => {
    console.log('📥 Adding notification to store:', notification)
    const state = get()
    const exists = state.notifications.some((n) => n.id === notification.id)
    
    if (exists) {
      console.log('⚠️  Notification already exists, skipping')
      return
    }

    const newUnreadCount = notification.isRead ? state.unreadCount : state.unreadCount + 1
    console.log(`🔢 Updating unread count: ${state.unreadCount} -> ${newUnreadCount}`)
    
    const updatedNotifications = sortByDate([notification, ...state.notifications])
    console.log(`📊 Total notifications after add: ${updatedNotifications.length}`)
    
    set({
      notifications: updatedNotifications,
      unreadCount: newUnreadCount,
    })
    
    console.log('✅ Notification added successfully. Store updated:', {
      totalNotifications: updatedNotifications.length,
      unreadCount: newUnreadCount
    })
  },

  // Mark single notification as read
  markAsRead: async (id) => {
    const state = get()
    const notification = state.notifications.find((n) => n.id === id)
    
    if (!notification || notification.isRead) return

    try {
      await notificationsApi.markAsRead(id)
      set({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to mark as read'
      set({ error: message })
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      await notificationsApi.markAllAsRead()
      set((state) => ({
        notifications: state.notifications.map((n) => ({
          ...n,
          isRead: true,
          readAt: n.readAt || new Date().toISOString(),
        })),
        unreadCount: 0,
      }))
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to mark all as read'
      set({ error: message })
    }
  },

  // Delete notification
  deleteNotification: async (id) => {
    const state = get()
    const notification = state.notifications.find((n) => n.id === id)
    const wasUnread = notification && !notification.isRead

    try {
      await notificationsApi.delete(id)
      set({
        notifications: state.notifications.filter((n) => n.id !== id),
        unreadCount: wasUnread
          ? Math.max(0, state.unreadCount - 1)
          : state.unreadCount,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete notification'
      set({ error: message })
    }
  },

  // Clear all notifications (local only)
  clearAll: () => {
    set({
      notifications: [],
      unreadCount: 0,
    })
  },

  // Set error
  setError: (error) => {
    set({ error })
  },
}))

// Debug function for development
if (typeof window !== 'undefined') {
  (window as any).notificationStore = useNotificationStore.getState
}

// Type re-export for backward compatibility with dropdown component
export type { Notification }
