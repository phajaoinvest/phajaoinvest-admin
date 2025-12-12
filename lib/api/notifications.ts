/**
 * Notifications API Client
 * Handles communication with the backend notifications API
 */

import { apiClient, type ApiResponse } from './client'
import type {
  Notification,
  NotificationListResponse,
  MarkAsReadResponse,
} from '@/lib/types'

// ============================================================================
// Notifications API
// ============================================================================

export const notificationsApi = {
  /**
   * Get all notifications for the current user
   * @param skip - Number of notifications to skip (default: 0)
   * @param take - Number of notifications to retrieve (default: 50)
   */
  getAll: async (
    skip?: number,
    take?: number
  ): Promise<NotificationListResponse> => {
    const params: Record<string, number | undefined> = {}
    if (skip !== undefined) params.skip = skip
    if (take !== undefined) params.take = take
    
    const response = await apiClient.get<{
      notifications: Notification[]
      total: number
      unreadCount: number
    }>('/notifications', params)
    
    // Backend returns: { is_error, code, message, data: { notifications, total, unreadCount }, status_code }
    // We need to return the data object directly
    return response.data
  },

  /**
   * Get a single notification by ID
   */
  getById: async (id: string): Promise<Notification> => {
    const response = await apiClient.get<Notification>(`/notifications/${id}`)
    return response.data
  },

  /**
   * Mark notifications as read
   * @param notificationIds - Array of notification IDs to mark as read. If empty, marks all as read.
   */
  markAsRead: async (
    notificationIds?: string[]
  ): Promise<MarkAsReadResponse> => {
    const response = await apiClient.post<MarkAsReadResponse>(
      '/notifications/mark-read',
      { notificationIds }
    )
    return response.data
  },

  /**
   * Delete a notification
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete<void>(`/notifications/${id}`)
  },
}
