/**
 * UI Store
 * Manages UI state like sidebar, modals, notifications
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ============================================================================
// Types
// ============================================================================

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  timestamp: number
}

interface Modal {
  id: string
  component: string
  props?: Record<string, unknown>
}

interface UIState {
  // Sidebar
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  
  // Theme
  theme: 'light' | 'dark' | 'system'
  
  // Notifications
  notifications: Notification[]
  
  // Modals
  activeModal: Modal | null
  
  // Loading overlays
  globalLoading: boolean
  loadingMessage: string | null

  // Actions
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebarCollapse: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  openModal: (modal: Omit<Modal, 'id'>) => void
  closeModal: () => void
  setGlobalLoading: (loading: boolean, message?: string) => void
}

// ============================================================================
// Store
// ============================================================================

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Initial state
      sidebarOpen: true,
      sidebarCollapsed: false,
      theme: 'system',
      notifications: [],
      activeModal: null,
      globalLoading: false,
      loadingMessage: null,

      // Sidebar actions
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebarCollapse: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      // Theme actions
      setTheme: (theme) => set({ theme }),

      // Notification actions
      addNotification: (notification) => {
        const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const newNotification: Notification = {
          ...notification,
          id,
          timestamp: Date.now(),
          duration: notification.duration ?? 5000,
        }

        set((state) => ({
          notifications: [...state.notifications, newNotification],
        }))

        // Auto-remove after duration
        if (newNotification.duration && newNotification.duration > 0) {
          setTimeout(() => {
            set((state) => ({
              notifications: state.notifications.filter((n) => n.id !== id),
            }))
          }, newNotification.duration)
        }
      },

      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }))
      },

      clearNotifications: () => set({ notifications: [] }),

      // Modal actions
      openModal: (modal) => {
        const id = `modal-${Date.now()}`
        set({ activeModal: { ...modal, id } })
      },

      closeModal: () => set({ activeModal: null }),

      // Loading actions
      setGlobalLoading: (loading, message) => {
        set({ globalLoading: loading, loadingMessage: message || null })
      },
    }),
    {
      name: 'phajaoinvest-ui',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
      }),
    }
  )
)

// ============================================================================
// Notification Helpers
// ============================================================================

export const notify = {
  success: (title: string, message?: string) => {
    useUIStore.getState().addNotification({ type: 'success', title, message })
  },
  error: (title: string, message?: string) => {
    useUIStore.getState().addNotification({ type: 'error', title, message })
  },
  warning: (title: string, message?: string) => {
    useUIStore.getState().addNotification({ type: 'warning', title, message })
  },
  info: (title: string, message?: string) => {
    useUIStore.getState().addNotification({ type: 'info', title, message })
  },
}
