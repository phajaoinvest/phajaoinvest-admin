/**
 * Admin Pending Counts API Client
 * Fetches pending counts for services and payments
 */

import { apiClient } from './client'

// ============================================================================
// Types
// ============================================================================

export interface PendingCounts {
  // Services
  services: {
    premiumMembership: number
    internationalStockAccounts: number
    guaranteedReturns: number
    total: number
  }
  // Payments
  payments: {
    subscriptionPayments: number
    stockPickPayments: number
    deposits: number
    withdrawals: number
    investmentPayments: number
    total: number
  }
  // Grand total
  grandTotal: number
}

// ============================================================================
// API
// ============================================================================

export const pendingCountsApi = {
  /**
   * Get all pending counts for admin dashboard
   */
  getAll: async (): Promise<PendingCounts> => {
    const response = await apiClient.get<PendingCounts>('/admin/pending-counts')
    return response.data
  },
}
