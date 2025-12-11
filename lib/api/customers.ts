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
   * Get customer statistics
   */
  async getStats() {
    return apiClient.get<{
      totalCustomers: number
      activeCount: number
      inactiveCount: number
      suspendedCount: number
      verifiedCount: number
    }>('/customers/stats')
  },

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
   * Get comprehensive customer details with KYC, documents, and services
   */
  async getDetailed(id: string, serviceType?: string) {
    const params = serviceType ? { service_type: serviceType } : undefined
    return apiClient.get<{
      id: string
      username: string
      email: string
      first_name: string
      last_name: string
      phone_number: string | null
      profile: string | null
      status: string
      isVerify: boolean
      created_at: string
      updated_at: string
      kyc_records: Array<{
        id: string
        kyc_level: string
        status: string
        dob: string | null
        nationality: string | null
        marital_status: string | null
        employment_status: string | null
        annual_income: string | null
        employer_name: string | null
        occupation: string | null
        investment_experience: number | null
        dependent_number: number | null
        source_of_funds: string | null
        risk_tolerance: string | null
        pep_flag: boolean | null
        tax_id: string | null
        fatca_status: string | null
        submitted_at: string | null
        reviewed_at: string | null
        reviewed_by: string | null
        rejection_reason: string | null
        created_at: string
        updated_at: string
      }>
      documents: Array<{
        id: string
        doc_type: string
        storage_ref: string
        kyc_id: string | null
        metadata: Record<string, unknown> | null
        created_at: string
      }>
      addresses: Array<{
        id: string
        address_line: string | null
        village: string | null
        postal_code: string | null
        country_id: string | null
        province_id: string | null
        district_id: string | null
        is_primary: boolean
        created_at: string
      }>
      services: Array<{
        service_id: string
        service_type: string
        active: boolean
        status: string
        subscription_duration: number | null
        subscription_fee: number | null
        subscription_expires_at: string | null
        invested_amount: number
        balance: number
        applied_at: string
        kyc_id: string | null
      }>
    }>(`/customers/${id}/detailed`, params)
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
