/**
 * Wallet Types
 */

import { BaseEntity, PaymentStatus } from './common'

// ============================================================================
// Wallet Entity
// ============================================================================

export interface Wallet extends BaseEntity {
  customer_id: string
  balance: number
  currency: string
  is_active: boolean
  customer?: {
    id: string
    first_name: string
    last_name: string | null
    email: string
  }
}

// ============================================================================
// Top Up Request
// ============================================================================

export interface TopUpRequest extends BaseEntity {
  customer_id: string
  wallet_id: string
  amount: number
  status: PaymentStatus
  payment_slip: string | null
  bank_reference: string | null
  approved_by: string | null
  approved_at: string | null
  rejected_by: string | null
  rejected_at: string | null
  rejection_reason: string | null
  customer?: {
    id: string
    first_name: string
    last_name: string | null
  }
}

// ============================================================================
// Transfer History
// ============================================================================

export interface TransferHistory extends BaseEntity {
  customer_id: string
  wallet_id: string
  type: 'deposit' | 'withdrawal' | 'transfer_in' | 'transfer_out' | 'investment' | 'return'
  amount: number
  balance_before: number
  balance_after: number
  description: string | null
  reference: string | null
  status: string
  customer?: {
    id: string
    first_name: string
    last_name: string | null
  }
}

// ============================================================================
// DTOs
// ============================================================================

export interface RequestTopUpDto {
  amount: number
  payment_slip?: string
  bank_reference?: string
}

export interface ApproveTopUpRequest {
  admin_notes?: string
}

export interface RejectTopUpRequest {
  rejection_reason: string
}

// ============================================================================
// Filters
// ============================================================================

export interface TopUpFilters {
  customer_id?: string
  status?: PaymentStatus
  startDate?: string
  endDate?: string
  minAmount?: number
  maxAmount?: number
}

export interface TransferHistoryFilters {
  customer_id?: string
  type?: string
  status?: string
  startDate?: string
  endDate?: string
}
