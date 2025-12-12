/**
 * Notification Types
 * Type definitions for the notification system
 */

// ============================================================================
// Enums (matching backend)
// ============================================================================

export enum NotificationRecipientType {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
}

export enum NotificationCategory {
  PREMIUM_MEMBERSHIP = 'premium_membership',
  INTERNATIONAL_STOCK_ACCOUNT = 'international_stock_account',
  GUARANTEED_RETURNS = 'guaranteed_returns',
  STOCK_PICK_PAYMENT = 'stock_pick_payment',
  TOP_UP = 'top_up',
  INVESTMENT_REQUEST = 'investment_request',
  INVESTMENT_RETURN = 'investment_return',
}

export enum NotificationAction {
  APPLIED = 'applied',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SUBMITTED = 'submitted',
}

// ============================================================================
// Interfaces (matching backend)
// ============================================================================

export interface NotificationMetadata {
  entityId: string // ID of the related entity (serviceId, paymentId, etc.)
  entityType: string // 'service', 'payment', 'stock-pick', 'investment', etc.
  customerName?: string
  customerEmail?: string
  amount?: number
  serviceType?: string
  status?: string
  adminName?: string
  reason?: string
  [key: string]: unknown
}

export interface Notification {
  id: string
  category: NotificationCategory
  action: NotificationAction
  recipientType: NotificationRecipientType
  recipientId: string
  title: string
  message: string
  metadata: NotificationMetadata
  isRead: boolean
  createdAt: string
  readAt?: string
  createdBy?: string
}

export interface NotificationListResponse {
  notifications: Notification[]
  total: number
  unreadCount: number
}

export interface MarkAsReadRequest {
  notificationIds?: string[]
}

export interface MarkAsReadResponse {
  count: number
}
