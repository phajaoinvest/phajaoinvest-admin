/**
 * Investment Types
 */

import { BaseEntity, InvestmentStatus, RiskTolerance, InterestTier, PaymentStatus } from './common'

// ============================================================================
// Investment Request
// ============================================================================

export interface InvestmentRequest extends BaseEntity {
  customer_id: string
  amount: number
  risk_tolerance: RiskTolerance
  interest_rate: number
  interest_tier: InterestTier
  status: InvestmentStatus
  start_date: string | null
  end_date: string | null
  maturity_date: string | null
  expected_return: number
  actual_return: number | null
  approved_by: string | null
  approved_at: string | null
  customer?: {
    id: string
    first_name: string
    last_name: string | null
    email: string
  }
}

// ============================================================================
// Investment Summary
// ============================================================================

export interface InvestmentSummary {
  total_invested: number
  total_returns: number
  current_value: number
  pending_investments: number
  active_investments: number
  completed_investments: number
  average_return_rate: number
}

// ============================================================================
// Investment Transaction
// ============================================================================

export interface InvestmentTransaction extends BaseEntity {
  investment_id: string
  type: 'deposit' | 'withdrawal' | 'return' | 'interest'
  amount: number
  balance_after: number
  description: string | null
  status: string
}

// ============================================================================
// Return Request
// ============================================================================

export interface ReturnRequest extends BaseEntity {
  customer_id: string
  investment_id: string
  amount: number
  status: 'pending' | 'approved' | 'rejected' | 'paid'
  bank_account: string | null
  bank_name: string | null
  approved_by: string | null
  approved_at: string | null
  paid_at: string | null
  rejection_reason: string | null
}

// ============================================================================
// Interest Rate Configuration
// ============================================================================

export interface InterestRateConfiguration extends BaseEntity {
  risk_tolerance: RiskTolerance
  tier_name: InterestTier
  min_amount: number
  max_amount: number
  interest_rate: number
  lock_period_days: number
  is_active: boolean
  description: string | null
}

// ============================================================================
// Interest Tier
// ============================================================================

export interface InterestTierInfo {
  tier: InterestTier
  min_amount: number
  max_amount: number
  interest_rate: number
  lock_period_days: number
}

// ============================================================================
// DTOs
// ============================================================================

export interface CreateInvestmentRequest {
  amount: number
  risk_tolerance: RiskTolerance
}

export interface CreateReturnRequest {
  investment_id: string
  amount: number
  bank_account?: string
  bank_name?: string
}

export interface ApproveInvestmentRequest {
  admin_notes?: string
}

export interface ApproveReturnRequest {
  admin_notes?: string
}

export interface CreateInterestRateConfigRequest {
  risk_tolerance: RiskTolerance
  tier_name: InterestTier
  min_amount: number
  max_amount: number
  interest_rate: number
  lock_period_days: number
  description?: string
}

export interface UpdateInterestRateConfigRequest {
  min_amount?: number
  max_amount?: number
  interest_rate?: number
  lock_period_days?: number
  is_active?: boolean
  description?: string
}

export interface CalculateTierRequest {
  amount: number
  risk_tolerance: RiskTolerance
}

export interface CalculateTierResponse {
  tier: InterestTier
  interest_rate: number
  lock_period_days: number
  expected_return: number
}

// ============================================================================
// Filters
// ============================================================================

export interface InvestmentFilters {
  customer_id?: string
  status?: InvestmentStatus
  risk_tolerance?: RiskTolerance
  startDate?: string
  endDate?: string
  minAmount?: number
  maxAmount?: number
}

export interface ReturnRequestFilters {
  customer_id?: string
  status?: 'pending' | 'approved' | 'rejected' | 'paid'
  startDate?: string
  endDate?: string
}
