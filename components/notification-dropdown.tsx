'use client'

import { useEffect, useCallback } from 'react'
import { Bell, Check, Info, AlertTriangle, X, CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useNotificationStore, type Notification } from '@/lib/notification-store'
import { useNotifications } from '@/hooks'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { toast } from '@/hooks/use-toast'
import { NotificationCategory } from '@/lib/types/notifications'

export function NotificationDropdown() {
  const router = useRouter()

  // Use individual selectors for better reactivity
  const notifications = useNotificationStore((state) => state.notifications)
  const unreadCount = useNotificationStore((state) => state.unreadCount)
  const markAsRead = useNotificationStore((state) => state.markAsRead)
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead)
  const clearAll = useNotificationStore((state) => state.clearAll)
  const fetchNotifications = useNotificationStore((state) => state.fetchNotifications)
  const addNotification = useNotificationStore((state) => state.addNotification)

  // Stable callback for handling new notifications
  const handleNewNotification = useCallback((notification: Notification) => {

    // Add notification to store
    addNotification(notification)

    // Show toast for new notification
    toast({
      title: notification.title,
      description: notification.message,
      variant: notification.action === 'rejected' ? 'destructive' : 'default',
    })
  }, [addNotification])

  // Connect to Socket.IO and handle real-time notifications
  const { isConnected } = useNotifications(handleNewNotification)

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])


  const getToastVariant = (action: string): 'default' | 'destructive' => {
    return action === 'rejected' ? 'destructive' : 'default'
  }

  const getIcon = (action: string) => {
    switch (action) {
      case 'approved':
        return <Check className="w-4 h-4 text-green-500" />
      case 'submitted':
        return <Info className="w-4 h-4 text-blue-500" />
      case 'rejected':
        return <X className="w-4 h-4 text-red-500" />
      case 'applied':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      default:
        return <Info className="w-4 h-4 text-blue-500" />
    }
  }

  const getNavigationPath = (notification: Notification): string | null => {
    const { category, metadata } = notification
    const entityId = metadata?.entityId as string | undefined

    if (!entityId) return null

    // Map notification categories to their detail pages
    switch (category) {
      case NotificationCategory.STOCK_PICK_PAYMENT:
        return `/dashboard/payments/stock-picks/${entityId}`

      case NotificationCategory.PREMIUM_MEMBERSHIP:
      case NotificationCategory.INTERNATIONAL_STOCK_ACCOUNT:
      case NotificationCategory.GUARANTEED_RETURNS:
        // These are service applications - check if it's a payment or service
        if (metadata?.entityType === 'payment') {
          return `/dashboard/payments/subscriptions/${entityId}`
        }
        return `/dashboard/services/${entityId}`

      case NotificationCategory.TOP_UP:
        // Top-up transfers
        return `/dashboard/payments/transfers/${entityId}`

      case NotificationCategory.INVESTMENT_REQUEST:
      case NotificationCategory.INVESTMENT_RETURN:
        // Investment requests
        return `/dashboard/payments/investments/${entityId}`

      default:
        return null
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id)

    // Navigate to the appropriate details page
    const path = getNavigationPath(notification)
    if (path) {
      router.push(path)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative text-sm">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-medium">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
          <span className="sr-only">{unreadCount} unread notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-[400px] overflow-y-auto">
        <div className="flex items-center justify-between px-2 py-2">
          <div className="flex items-center gap-2">
            <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
            {isConnected && (
              <div className="w-2 h-2 bg-green-500 rounded-full" title="Connected" />
            )}
          </div>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-auto py-1 px-2 text-xs"
            >
              <CheckCheck className="w-3 h-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            {isConnected ? 'No notifications' : 'Connecting...'}
          </div>
        ) : (
          <>
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex-col items-start gap-1 p-3 cursor-pointer ${!notification.isRead ? 'border-l-2 border-primary bg-card' : 'bg-card'
                  }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-2 w-full">
                  <div className="mt-0.5">{getIcon(notification.action)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-tight">
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
            {notifications.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <div className="p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAll}
                    className="w-full text-xs text-destructive hover:text-destructive"
                  >
                    Clear all notifications
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
