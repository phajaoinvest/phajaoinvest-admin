/**
 * Stock Picks API Client
 * Admin endpoints for managing stock picks and customer pick approvals
 */

import { apiClient } from './client'
import type { ApiResponse, PaginatedResponse } from './client'

// ============================================================================
// Types
// ============================================================================

export enum StockPickStatus {
  GOOD = 'good',
  VERY_GOOD = 'very_good',
  EXCELLENT = 'excellent',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum StockPickAvailability {
  AVAILABLE = 'available',
  SOLD_OUT = 'sold_out',
  COMING_SOON = 'coming_soon',
}

export enum StockPickRiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high',
}

export enum StockPickRecommendation {
  STRONG_BUY = 'strong_buy',
  BUY = 'buy',
  HOLD = 'hold',
  SELL = 'sell',
  STRONG_SELL = 'strong_sell',
}

export enum CustomerServiceType {
  PREMIUM_MEMBERSHIP = 'premium_membership',
  INTERNATIONAL_STOCK_ACCOUNT = 'international_stock_account',
  GUARANTEED_RETURNS = 'guaranteed_returns',
  PREMIUM_STOCK_PICKS = 'premium_stock_picks',
}

export enum CustomerPickStatus {
  SELECTED = 'selected',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  DELIVERED = 'delivered',
}

export interface StockPick {
  id: string
  stock_symbol: string
  company: string | null
  description: string
  status: StockPickStatus
  availability: StockPickAvailability
  service_type: CustomerServiceType
  admin_notes: string | null
  target_price: number | null
  current_price: number | null
  sale_price: number
  risk_level: StockPickRiskLevel | null
  recommendation: StockPickRecommendation | null
  expected_return_min_percent: number | null
  expected_return_max_percent: number | null
  time_horizon_min_months: number | null
  time_horizon_max_months: number | null
  sector: string | null
  analyst_name: string | null
  tier_label: string | null
  key_points: string[] | null
  email_delivery: boolean
  expires_at: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  created_by_id: string | null
  updated_by_id: string | null
}

export interface CustomerStockPick {
  id: string
  customer_id: string
  stock_pick_id: string
  status: CustomerPickStatus
  selected_at: string
  payment_slip_url: string | null
  payment_verified_at: string | null
  admin_approved_at: string | null
  admin_approved_by_id: string | null
  admin_response: string | null
  email_sent_at: string | null
  stock_pick: StockPick
  customer: {
    id: string
    first_name: string
    last_name: string
    email: string
    tel: string | null
  }
}

export interface CreateStockPickDto {
  stock_symbol: string
  company?: string
  description: string
  status: StockPickStatus
  service_type: CustomerServiceType
  admin_notes?: string
  target_price?: number
  current_price?: number
  sale_price: number
  risk_level?: StockPickRiskLevel
  recommendation?: StockPickRecommendation
  expected_return_min_percent?: number
  expected_return_max_percent?: number
  time_horizon_min_months?: number
  time_horizon_max_months?: number
  sector?: string
  analyst_name?: string
  tier_label?: string
  key_points?: string[]
  email_delivery?: boolean
  expires_at?: string
}

export interface UpdateStockPickDto {
  description?: string
  company?: string
  status?: StockPickStatus
  availability?: StockPickAvailability
  admin_notes?: string
  target_price?: number
  current_price?: number
  sale_price?: number
  risk_level?: StockPickRiskLevel
  recommendation?: StockPickRecommendation
  expected_return_min_percent?: number
  expected_return_max_percent?: number
  time_horizon_min_months?: number
  time_horizon_max_months?: number
  sector?: string
  analyst_name?: string
  tier_label?: string
  key_points?: string[]
  email_delivery?: boolean
  expires_at?: string
  is_active?: boolean
}

export interface StockPickFilterDto {
  service_type?: CustomerServiceType
  status?: StockPickStatus
  availability?: StockPickAvailability
  is_active?: boolean
  page?: number
  limit?: number
}

export interface AdminApprovePickDto {
  admin_response?: string
  approve: boolean
}

// ============================================================================
// API Functions
// ============================================================================

export const stockPicksAdminApi = {
  /**
   * Create a new stock pick (Admin only)
   */
  createStockPick: async (
    data: CreateStockPickDto
  ): Promise<ApiResponse<StockPick>> => {
    return apiClient.post('/admin/stock-picks', data)
  },

  /**
   * Get all stock picks with filtering (Admin only)
   */
  getAllStockPicks: async (
    filters?: StockPickFilterDto
  ): Promise<PaginatedResponse<StockPick>> => {
    const params: Record<string, string | number | boolean | undefined> = {}
    
    if (filters) {
      if (filters.service_type) params.service_type = filters.service_type
      if (filters.status) params.status = filters.status
      if (filters.availability) params.availability = filters.availability
      if (filters.is_active !== undefined) params.is_active = filters.is_active
      if (filters.page) params.page = filters.page
      if (filters.limit) params.limit = filters.limit
    }
    
    return apiClient.getPaginated('/admin/stock-picks', params)
  },

  /**
   * Update a stock pick (Admin only)
   */
  updateStockPick: async (
    id: string,
    data: UpdateStockPickDto
  ): Promise<ApiResponse<StockPick>> => {
    return apiClient.put(`/admin/stock-picks/${id}`, data)
  },

  /**
   * Delete a stock pick (Admin only)
   */
  deleteStockPick: async (id: string): Promise<ApiResponse<{ id: string }>> => {
    return apiClient.delete(`/admin/stock-picks/${id}`)
  },

  /**
   * Get pending customer picks awaiting approval
   */
  getPendingApprovals: async (
    page?: number,
    limit?: number
  ): Promise<PaginatedResponse<CustomerStockPick>> => {
    const params: Record<string, string | number | boolean | undefined> = {}
    if (page) params.page = page
    if (limit) params.limit = limit
    
    return apiClient.getPaginated('/admin/stock-picks/customer-picks', params)
  },

  /**
   * Approve a customer stock pick selection
   */
  approveCustomerPick: async (
    id: string,
    data: AdminApprovePickDto
  ): Promise<ApiResponse<CustomerStockPick>> => {
    return apiClient.post(`/admin/stock-picks/customer-picks/${id}/approve`, data)
  },

  /**
   * Reject a customer stock pick selection
   */
  rejectCustomerPick: async (
    id: string,
    admin_response: string
  ): Promise<ApiResponse<CustomerStockPick>> => {
    return apiClient.post(`/admin/stock-picks/customer-picks/${id}/reject`, {
      admin_response,
    })
  },
}
