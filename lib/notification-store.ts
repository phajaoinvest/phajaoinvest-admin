import { create } from 'zustand'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  created_at: string
  link?: string
}

interface NotificationStore {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  deleteNotification: (id: string) => void
  clearAll: () => void
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [
    {
      id: '1',
      title: 'New Customer Registration',
      message: 'John Doe has registered as a new customer',
      type: 'info',
      read: false,
      created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      link: '/dashboard/customers',
    },
    {
      id: '2',
      title: 'Payment Received',
      message: 'Payment of $299.99 received from Jane Smith',
      type: 'success',
      read: false,
      created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      link: '/dashboard/payments',
    },
    {
      id: '3',
      title: 'Pending Payment Approval',
      message: '4 payments are waiting for your approval',
      type: 'warning',
      read: false,
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      link: '/dashboard/payments',
    },
    {
      id: '4',
      title: 'Stock Account Suspended',
      message: 'Account SA-2024-005 has been suspended due to suspicious activity',
      type: 'error',
      read: true,
      created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      link: '/dashboard/stock-accounts',
    },
    {
      id: '5',
      title: 'New Investment Request',
      message: 'Alice Johnson requested a new investment of $50,000',
      type: 'info',
      read: true,
      created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      link: '/dashboard/investments',
    },
  ],
  unreadCount: 3,
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),
  deleteNotification: (id) =>
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id)
      const wasUnread = notification && !notification.read
      return {
        notifications: state.notifications.filter((n) => n.id !== id),
        unreadCount: wasUnread ? state.unreadCount - 1 : state.unreadCount,
      }
    }),
  clearAll: () =>
    set({
      notifications: [],
      unreadCount: 0,
    }),
}))
