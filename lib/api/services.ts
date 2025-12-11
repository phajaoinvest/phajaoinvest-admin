/**
 * Customer Services API
 * Handles customer service applications and admin approvals
 */

import { apiClient } from './client'
import type { ApiResponse, PaginatedResponse } from './client'

// ============================================================================
// Types
// ============================================================================

export interface PendingServiceApplication {
  service_id: string
  customer_id: string
  customer_info: {
    username: string
    email: string
    first_name: string
    last_name: string
    phone_number?: string
  }
  service_type: 'premium_membership' | 'premium_stock_picks' | 'international_stock_account' | 'guaranteed_returns'
  active: boolean
  requires_payment: boolean
  subscription_duration?: number | null
  subscription_fee?: number | null
  subscription_expires_at?: string | null
  invested_amount?: number
  balance?: number
  applied_at: string
  kyc_info?: {
    kyc_id: string
    kyc_level: string
    kyc_status: string
    reviewed_at: string | null
  }
  payment_info?: {
    payment_id: string
    amount: number
    paid_at: string | null
    status: string
    payment_slip_url?: string
  }
}

export interface ServiceStats {
  service_type: string
  total_pending: number
  pending_with_payment: number
  pending_kyc_review: number
  approved_this_month: number
  rejected_this_month: number
  avg_approval_time_hours: number | null
}

export interface AllServicesStats {
  by_service: ServiceStats[]
  total_pending: number
  total_active: number
}

export interface ApproveServiceRequest {
  service_id: string
}

export interface RejectServiceRequest {
  service_id: string
  rejection_reason?: string
}

export interface ApproveServiceResponse {
  status: string
  service_id: string
  service_type: string
  kyc_level?: string
  payment?: any
}

// ============================================================================
// API Service
// ============================================================================

const SERVICES_ENDPOINTS = {
  PENDING_PREMIUM_MEMBERSHIP: '/customers/services/admin/premium-membership',
  PENDING_INTERNATIONAL_STOCK: '/customers/services/admin/international-stock-account',
  PENDING_GUARANTEED_RETURNS: '/customers/services/admin/guaranteed-returns',
  PENDING_ALL_SERVICES: '/customers/services/admin/all-services',
  SERVICE_STATS: '/customers/services/admin/stats',
  APPROVE_SERVICE: (serviceId: string) => `/customers/services/${serviceId}/approve`,
  REJECT_SERVICE: (serviceId: string) => `/customers/services/${serviceId}/reject`,
  APPROVE_PAYMENT: (paymentId: string) => `/customers/services/admin/payments/${paymentId}/approve`,
  REJECT_PAYMENT: (paymentId: string) => `/customers/services/admin/payments/${paymentId}/reject`,
} as const

export const servicesAdminApi = {
  /**
   * Get pending premium membership applications
   */
  async getPendingPremiumMemberships(params?: {
    page?: number
    limit?: number
    payment_status?: string
    search?: string
  }): Promise<PaginatedResponse<PendingServiceApplication>> {
    return apiClient.getPaginated<PendingServiceApplication>(
      SERVICES_ENDPOINTS.PENDING_PREMIUM_MEMBERSHIP,
      params
    )
  },

  /**
   * Get pending international stock account applications
   */
  async getInternationalStockAccounts(params?: {
    page?: number
    limit?: number
    kyc_status?: string
    search?: string
  }): Promise<PaginatedResponse<PendingServiceApplication>> {
    return apiClient.getPaginated<PendingServiceApplication>(
      SERVICES_ENDPOINTS.PENDING_INTERNATIONAL_STOCK,
      params
    )
  },

  /**
   * Get pending guaranteed returns applications
   */
  async getPendingGuaranteedReturns(params?: {
    page?: number
    limit?: number
    kyc_status?: string
    search?: string
  }): Promise<PaginatedResponse<PendingServiceApplication>> {
    return apiClient.getPaginated<PendingServiceApplication>(
      SERVICES_ENDPOINTS.PENDING_GUARANTEED_RETURNS,
      params
    )
  },

  /**
   * Get all pending service applications
   */
  async getAllPendingServices(params?: {
    service_type?: string
    page?: number
    limit?: number
  }): Promise<PaginatedResponse<PendingServiceApplication>> {
    return apiClient.getPaginated<PendingServiceApplication>(
      SERVICES_ENDPOINTS.PENDING_ALL_SERVICES,
      params
    )
  },

  /**
   * Get service statistics
   */
  async getServiceStats(): Promise<ApiResponse<AllServicesStats>> {
    return apiClient.get<AllServicesStats>(SERVICES_ENDPOINTS.SERVICE_STATS)
  },

  /**
   * Approve a service application
   */
  async approveService(serviceId: string): Promise<ApiResponse<ApproveServiceResponse>> {
    return apiClient.post<ApproveServiceResponse>(
      SERVICES_ENDPOINTS.APPROVE_SERVICE(serviceId),
      {}
    )
  },

  /**
   * Reject a service application
   */
  async rejectService(
    serviceId: string,
    rejectionReason?: string
  ): Promise<ApiResponse<any>> {
    return apiClient.post(
      SERVICES_ENDPOINTS.REJECT_SERVICE(serviceId),
      { rejection_reason: rejectionReason }
    )
  },

  /**
   * Approve a payment slip
   */
  async approvePayment(
    paymentId: string,
    adminNotes?: string
  ): Promise<ApiResponse<any>> {
    return apiClient.post(
      SERVICES_ENDPOINTS.APPROVE_PAYMENT(paymentId),
      { admin_notes: adminNotes }
    )
  },

  /**
   * Reject a payment slip
   */
  async rejectPayment(
    paymentId: string,
    adminNotes?: string
  ): Promise<ApiResponse<any>> {
    return apiClient.post(
      SERVICES_ENDPOINTS.REJECT_PAYMENT(paymentId),
      { admin_notes: adminNotes }
    )
  },
}
