/**
 * Customers API Service
 */

import { apiClient } from './client'
import type {
  PaginationParams,
  Customer,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CustomerFilters,
  CustomerService,
  CustomerServiceApplication,
  KycRecord,
} from '@/lib/types'

// ============================================================================
// Customers
// ============================================================================

export const customersApi = {
  /**
   * Get paginated list of customers
   */
  async getAll(params?: PaginationParams & CustomerFilters) {
    return apiClient.getPaginated<Customer>('/customers', params)
  },

  /**
   * Get customer by ID
   */
  async getById(id: string) {
    return apiClient.get<Customer>(`/customers/${id}`)
  },

  /**
   * Create new customer
   */
  async create(data: CreateCustomerRequest) {
    return apiClient.post<Customer>('/customers', data)
  },

  /**
   * Update customer
   */
  async update(id: string, data: UpdateCustomerRequest) {
    return apiClient.patch<Customer>(`/customers/${id}`, data)
  },

  /**
   * Delete customer
   */
  async delete(id: string) {
    return apiClient.delete(`/customers/${id}`)
  },

  /**
   * Get current customer profile (for customer auth)
   */
  async getProfile() {
    return apiClient.get<Customer>('/customers/profile/me')
  },

  /**
   * Admin: Update customer status
   */
  async updateStatus(id: string, status: 'active' | 'inactive' | 'ban' | 'deleted') {
    return apiClient.put<Customer>(`/customers/${id}/status`, { status })
  },

  /**
   * Admin: Ban customer
   */
  async ban(id: string) {
    return apiClient.put<Customer>(`/customers/${id}/ban`)
  },

  /**
   * Admin: Activate customer
   */
  async activate(id: string) {
    return apiClient.put<Customer>(`/customers/${id}/activate`)
  },

  /**
   * Admin: Deactivate customer
   */
  async deactivate(id: string) {
    return apiClient.put<Customer>(`/customers/${id}/deactivate`)
  },
}

// ============================================================================
// Customer Services
// ============================================================================

export const customerServicesApi = {
  /**
   * Get customer's services
   */
  async getMyServices() {
    return apiClient.get<CustomerService[]>('/customers/services/my-services')
  },

  /**
   * Apply for a service
   */
  async applyForService(data: CustomerServiceApplication) {
    return apiClient.post<CustomerService>('/customers/services/apply', data)
  },

  /**
   * Top up service balance
   */
  async topUp(serviceId: string, amount: number) {
    return apiClient.post(`/customers/services/${serviceId}/topup`, { amount })
  },

  /**
   * Admin: Approve service application
   */
  async approve(serviceId: string) {
    return apiClient.post(`/customers/services/admin/${serviceId}/approve`)
  },

  /**
   * Admin: Reject service application
   */
  async reject(serviceId: string, reason: string) {
    return apiClient.post(`/customers/services/admin/${serviceId}/reject`, { reason })
  },

  /**
   * Admin: Get KYC records
   */
  async getKycRecords(params?: PaginationParams) {
    return apiClient.getPaginated<KycRecord>('/customers/services/admin/kyc', params)
  },
}

// ============================================================================
// Premium Membership
// ============================================================================

export const premiumMembershipApi = {
  /**
   * Apply for premium membership
   */
  async apply(packageId: string, paymentSlip?: string) {
    return apiClient.post('/customers/services/premium-membership/apply', {
      package_id: packageId,
      payment_slip: paymentSlip,
    })
  },

  /**
   * Get my subscriptions
   */
  async getMySubscriptions() {
    return apiClient.get('/customers/services/subscriptions/my')
  },

  /**
   * Admin: Get pending membership requests
   */
  async getPendingRequests(params?: PaginationParams) {
    return apiClient.getPaginated('/customers/services/admin/premium-membership', params)
  },
}

// ============================================================================
// Payments
// ============================================================================

export const customerPaymentsApi = {
  /**
   * Get payment history
   */
  async getHistory(params?: PaginationParams) {
    return apiClient.getPaginated('/customers/services/payments/history', params)
  },

  /**
   * Admin: Get payment audit logs
   */
  async getAuditLogs(params?: PaginationParams) {
    return apiClient.getPaginated('/customers/services/admin/payments/audit', params)
  },

  /**
   * Admin: Approve payment
   */
  async approve(paymentId: string, notes?: string) {
    return apiClient.post(`/customers/services/admin/payments/${paymentId}/approve`, { notes })
  },

  /**
   * Admin: Reject payment
   */
  async reject(paymentId: string, reason: string) {
    return apiClient.post(`/customers/services/admin/payments/${paymentId}/reject`, { reason })
  },
}
