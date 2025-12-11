/**
 * Investments API Service
 */

import { apiClient } from './client'
import type {
  PaginationParams,
  InvestmentRequest,
  InvestmentSummary,
  InvestmentTransaction,
  InvestmentFilters,
  ReturnRequest,
  ReturnRequestFilters,
  InterestRateConfiguration,
  InterestTierInfo,
  CreateInvestmentRequest,
  CreateReturnRequest,
  ApproveInvestmentRequest,
  ApproveReturnRequest,
  CreateInterestRateConfigRequest,
  UpdateInterestRateConfigRequest,
  CalculateTierRequest,
  CalculateTierResponse,
  RiskTolerance,
} from '@/lib/types'

// ============================================================================
// Investment Requests (Customer)
// ============================================================================

export const investmentsApi = {
  /**
   * Submit investment request
   */
  async create(data: CreateInvestmentRequest) {
    return apiClient.post<InvestmentRequest>('/investment-requests', data)
  },

  /**
   * Get my investment summary
   */
  async getMySummary() {
    return apiClient.get<InvestmentSummary>('/investment-requests/my-summary')
  },

  /**
   * Get my transaction history
   */
  async getMyTransactions(params?: PaginationParams) {
    return apiClient.getPaginated<InvestmentTransaction>(
      '/investment-requests/my-transactions',
      params
    )
  },

  /**
   * Create return request
   */
  async createReturnRequest(data: CreateReturnRequest) {
    return apiClient.post<ReturnRequest>('/investment-requests/return-request', data)
  },

  /**
   * Get interest tiers
   */
  async getInterestTiers() {
    return apiClient.get<InterestTierInfo[]>('/investment-requests/interest-tiers')
  },

  /**
   * Calculate tier for amount
   */
  async calculateTier(data: CalculateTierRequest) {
    return apiClient.post<CalculateTierResponse>('/investment-requests/calculate-tier', data)
  },
}

// ============================================================================
// Investment Admin
// ============================================================================

export const investmentsAdminApi = {
  /**
   * Get pending investment requests
   */
  async getPendingRequests(params?: PaginationParams & InvestmentFilters) {
    return apiClient.getPaginated<InvestmentRequest>('/investment-requests/admin', params)
  },

  /**
   * Approve investment
   */
  async approve(id: string, data?: ApproveInvestmentRequest) {
    return apiClient.put(`/investment-requests/admin/${id}/approve`, data)
  },

  /**
   * Reject investment
   */
  async reject(id: string, adminNotes?: string) {
    return apiClient.put(`/investment-requests/admin/${id}/reject`, { admin_notes: adminNotes })
  },

  /**
   * Get pending return requests
   */
  async getPendingReturns(params?: PaginationParams & ReturnRequestFilters) {
    return apiClient.getPaginated<ReturnRequest>(
      '/investment-requests/admin/pending-returns',
      params
    )
  },

  /**
   * Approve return request
   */
  async approveReturn(id: string, data?: ApproveReturnRequest) {
    return apiClient.put(`/investment-requests/admin/returns/${id}/approve`, data)
  },

  /**
   * Reject return request
   */
  async rejectReturn(id: string, reason?: string) {
    return apiClient.put(`/investment-requests/admin/returns/${id}/reject`, { reason })
  },

  /**
   * Mark return as paid
   */
  async markReturnPaid(id: string) {
    return apiClient.put(`/investment-requests/admin/returns/${id}/mark-paid`)
  },
}

// ============================================================================
// Interest Rate Configuration
// ============================================================================

export const interestRatesApi = {
  /**
   * Get all configurations
   */
  async getAll() {
    return apiClient.get<InterestRateConfiguration[]>('/admin/interest-rates/configurations')
  },

  /**
   * Get by risk tolerance
   */
  async getByRiskTolerance(riskTolerance: RiskTolerance) {
    return apiClient.get<InterestRateConfiguration[]>(
      `/admin/interest-rates/configurations/risk/${riskTolerance}`
    )
  },

  /**
   * Get by ID
   */
  async getById(id: string) {
    return apiClient.get<InterestRateConfiguration>(`/admin/interest-rates/configurations/${id}`)
  },

  /**
   * Create configuration
   */
  async create(data: CreateInterestRateConfigRequest) {
    return apiClient.post<InterestRateConfiguration>('/admin/interest-rates/configurations', data)
  },

  /**
   * Update configuration
   */
  async update(id: string, data: UpdateInterestRateConfigRequest) {
    return apiClient.put<InterestRateConfiguration>(
      `/admin/interest-rates/configurations/${id}`,
      data
    )
  },

  /**
   * Deactivate configuration
   */
  async deactivate(id: string) {
    return apiClient.delete(`/admin/interest-rates/configurations/${id}`)
  },

  /**
   * Calculate interest rate
   */
  async calculate(data: { amount: number; risk_tolerance: RiskTolerance }) {
    return apiClient.post('/admin/interest-rates/calculate', data)
  },
}
