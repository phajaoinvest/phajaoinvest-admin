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
   * Get all admin notifications with pagination
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
    }>('/admin/notifications', params)
    
    // Backend returns: { is_error, code, message, data: { notifications, total, unreadCount }, status_code }
    // We need to return the data object directly
    return response.data
  },

  /**
   * Get a single admin notification by ID
   */
  getById: async (id: string): Promise<Notification> => {
    const response = await apiClient.get<Notification>(`/admin/notifications/${id}`)
    return response.data
  },

  /**
   * Mark a single admin notification as read
   * @param notificationId - Notification ID to mark as read
   */
  markAsRead: async (notificationId: string): Promise<{ success: boolean }> => {
    const response = await apiClient.post<{ success: boolean }>(
      `/admin/notifications/${notificationId}/read`
    )
    return response.data
  },

  /**
   * Mark all admin notifications as read
   */
  markAllAsRead: async (): Promise<MarkAsReadResponse> => {
    const response = await apiClient.post<MarkAsReadResponse>(
      '/admin/notifications/read-all'
    )
    return response.data
  },

  /**
   * Delete an admin notification
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete<void>(`/admin/notifications/${id}`)
  },
}
