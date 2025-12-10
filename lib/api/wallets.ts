/**
 * Wallets API Service
 */

import { apiClient } from './client'
import type {
  PaginationParams,
  Wallet,
  TopUpRequest,
  TransferHistory,
  TopUpFilters,
  TransferHistoryFilters,
  RequestTopUpDto,
  ApproveTopUpRequest,
  RejectTopUpRequest,
} from '@/lib/types'

// ============================================================================
// Wallets
// ============================================================================

export const walletsApi = {
  /**
   * Get my wallet
   */
  async getMyWallet() {
    return apiClient.get<Wallet>('/wallets/me')
  },

  /**
   * Request top up
   */
  async requestTopUp(data: RequestTopUpDto) {
    return apiClient.post<TopUpRequest>('/wallets/topup', data)
  },
}

// ============================================================================
// Wallet Admin
// ============================================================================

export const walletsAdminApi = {
  /**
   * Get pending top up requests
   */
  async getPendingTopUps(params?: PaginationParams) {
    return apiClient.getPaginated<TopUpRequest>('/wallets/admin/pending-topups', params)
  },

  /**
   * Get all top up requests with filters
   */
  async getAllTopUps(params?: PaginationParams & TopUpFilters) {
    return apiClient.getPaginated<TopUpRequest>('/wallets/admin/topups', params)
  },

  /**
   * Approve top up request
   */
  async approveTopUp(topupId: string, data?: ApproveTopUpRequest) {
    return apiClient.post(`/wallets/topup/${topupId}/approve`, data)
  },

  /**
   * Reject top up request
   */
  async rejectTopUp(topupId: string, data: RejectTopUpRequest) {
    return apiClient.post(`/wallets/topup/${topupId}/reject`, data)
  },
}

// ============================================================================
// Transfer History (Customer)
// ============================================================================

export const transferHistoryApi = {
  /**
   * Get my transfers
   */
  async getMyTransfers(params?: PaginationParams & TransferHistoryFilters) {
    return apiClient.getPaginated<TransferHistory>('/transfer-history/my-transfers', params)
  },

  /**
   * Get transfer by ID
   */
  async getById(id: string) {
    return apiClient.get<TransferHistory>(`/transfer-history/${id}`)
  },
}

// ============================================================================
// Transfer History (Admin)
// ============================================================================

export const transferHistoryAdminApi = {
  /**
   * Get all transfers
   */
  async getAll(params?: PaginationParams & TransferHistoryFilters) {
    return apiClient.getPaginated<TransferHistory>('/admin/transfer-history', params)
  },

  /**
   * Get transfer by ID
   */
  async getById(id: string) {
    return apiClient.get<TransferHistory>(`/admin/transfer-history/${id}`)
  },
}
