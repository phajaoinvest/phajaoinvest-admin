/**
 * Subscriptions API Service
 */

import { apiClient } from './client'
import type {
  PaginationParams,
  SubscriptionPackage,
  CustomerSubscription,
  Payment,
  PackageFilters,
  SubscriptionFilters,
  PaymentFilters,
  CreatePackageRequest,
  UpdatePackageRequest,
  PendingPremiumMembership,
  PremiumMembershipSubscription,
  PremiumMembershipDetail,
} from '@/lib/types'

// ============================================================================
// Admin Subscription Packages
// ============================================================================

export const packagesApi = {
  /**
   * Get all packages (admin)
   */
  async getAll(params?: PaginationParams & PackageFilters) {
    return apiClient.getPaginated<SubscriptionPackage>('/admin/subscription-packages', params)
  },

  /**
   * Get package by ID (admin)
   */
  async getById(id: string) {
    return apiClient.get<SubscriptionPackage>(`/admin/subscription-packages/${id}`)
  },

  /**
   * Create package (admin)
   */
  async create(data: CreatePackageRequest) {
    return apiClient.post<SubscriptionPackage>('/admin/subscription-packages', data)
  },

  /**
   * Update package (admin)
   */
  async update(id: string, data: UpdatePackageRequest) {
    return apiClient.put<SubscriptionPackage>(`/admin/subscription-packages/${id}`, data)
  },

  /**
   * Delete package (admin)
   */
  async delete(id: string) {
    return apiClient.delete(`/admin/subscription-packages/${id}`)
  },

  /**
   * Toggle package active status (admin)
   */
  async toggleActive(id: string) {
    return apiClient.put<SubscriptionPackage>(`/admin/subscription-packages/${id}/toggle-active`)
  },
}

// ============================================================================
// Premium Membership Subscriptions (Admin)
// ============================================================================

export const subscriptionsApi = {
  /**
   * Get all premium membership subscriptions from customer_services (admin)
   */
  async getAll(params?: PaginationParams & { status?: string; search?: string }) {
    return apiClient.getPaginated<PremiumMembershipSubscription>('/customers/services/admin/premium-membership/subscriptions', params)
  },

  /**
   * Get detailed premium membership subscription context (admin)
   */
  async getDetail(serviceId: string) {
    return apiClient.get<PremiumMembershipDetail>(`/customers/services/admin/premium-membership/${serviceId}/details`)
  },

  /**
   * Get pending premium membership applications (admin) - legacy payments-based
   */
  async getPending(params?: PaginationParams & { status?: string; search?: string }) {
    return apiClient.getPaginated<PendingPremiumMembership>('/customers/services/admin/premium-membership', params)
  },

  /**
   * Get all subscriptions (admin) - if endpoint exists
   */
  async getAllLegacy(params?: PaginationParams & SubscriptionFilters) {
    return apiClient.getPaginated<CustomerSubscription>('/subscriptions', params)
  },

  /**
   * Get subscription by ID
   */
  async getById(id: string) {
    return apiClient.get<CustomerSubscription>(`/subscriptions/${id}`)
  },

  /**
   * Approve payment slip (admin)
   */
  async approvePayment(paymentId: string, adminNotes?: string) {
    return apiClient.post(`/customers/services/admin/payments/${paymentId}/approve`, { admin_notes: adminNotes })
  },

  /**
   * Reject payment slip (admin)
   */
  async rejectPayment(paymentId: string, reason: string, adminNotes?: string) {
    return apiClient.post(`/customers/services/admin/payments/${paymentId}/reject`, { 
      rejection_reason: reason,
      admin_notes: adminNotes 
    })
  },
}

// ============================================================================
// Payments (Admin)
// ============================================================================

export const paymentsApi = {
  /**
   * Get all payments
   */
  async getAll(params?: PaginationParams & PaymentFilters) {
    return apiClient.getPaginated<Payment>('/payments', params)
  },

  /**
   * Get payment by ID
   */
  async getById(id: string) {
    return apiClient.get<Payment>(`/payments/${id}`)
  },

  /**
   * Approve payment
   */
  async approve(id: string, notes?: string) {
    return apiClient.post(`/customers/services/admin/payments/${id}/approve`, { admin_notes: notes })
  },

  /**
   * Reject payment
   */
  async reject(id: string, reason: string) {
    return apiClient.post(`/customers/services/admin/payments/${id}/reject`, { 
      rejection_reason: reason,
      admin_notes: reason 
    })
  },
}
