/**
 * Subscription & Package Types
 */

import { BaseEntity, ServiceType, PaymentStatus } from './common'

// ============================================================================
// Subscription Package
// ============================================================================

export interface SubscriptionPackage extends BaseEntity {
  service_type: ServiceType | string
  duration_months: number
  price: number | string // backend returns string from numeric type
  currency: string
  description: string | null
  features: string[] | null
  active: boolean
}

// ============================================================================
// Customer Subscription
// ============================================================================

export interface CustomerSubscription extends BaseEntity {
  customer_id: string
  package_id: string
  start_date: string
  end_date: string
  status: 'active' | 'expired' | 'cancelled'
  auto_renew: boolean
  package?: SubscriptionPackage
  customer?: {
    id: string
    first_name: string
    last_name: string | null
    email: string
  }
}

// ============================================================================
// Pending Premium Membership (from backend)
// ============================================================================

export interface PendingPremiumMembership {
  service_id: string
  customer_id: string
  customer_info: {
    username: string
    email: string
    first_name: string
    last_name: string
  }
  service_type: ServiceType | string
  subscription_duration: 3 | 6 | 12 | null
  subscription_fee: number | null
  applied_at: string
  payment_info: {
    payment_id: string
    amount: number
    paid_at: string
    status: PaymentStatus | string
    payment_slip_url?: string
  }
}

// ============================================================================
// Payment
// ============================================================================

export interface Payment extends BaseEntity {
  customer_id: string
  subscription_id: string | null
  amount: number
  currency: string
  status: PaymentStatus
  payment_method: string | null
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
  subscription?: CustomerSubscription
}

// ============================================================================
// Premium Membership
// ============================================================================

export interface PremiumMembershipRequest extends BaseEntity {
  customer_id: string
  package_id: string
  status: PaymentStatus
  payment_slip: string | null
  approved_by: string | null
  approved_at: string | null
  rejected_by: string | null
  rejected_at: string | null
  rejection_reason: string | null
  customer?: {
    id: string
    first_name: string
    last_name: string | null
    email: string
  }
  package?: SubscriptionPackage
}

// ============================================================================
// DTOs
// ============================================================================

export interface CreatePackageRequest {
  service_type: ServiceType | string
  duration_months: number
  price: number
  currency?: string
  description?: string
  features?: string[]
  active?: boolean
}

export interface UpdatePackageRequest {
  service_type?: ServiceType | string
  duration_months?: number
  price?: number
  currency?: string
  description?: string
  features?: string[]
  active?: boolean
}

export interface ApplyPremiumMembershipRequest {
  package_id: string
  payment_slip?: string
}

export interface ApprovePaymentRequest {
  admin_notes?: string
}

export interface RejectPaymentRequest {
  rejection_reason: string
}

// ============================================================================
// Filters
// ============================================================================

export interface PackageFilters {
  service_type?: ServiceType | string
  active?: boolean
  q?: string // search text
}

export interface SubscriptionFilters {
  customer_id?: string
  package_id?: string
  status?: 'active' | 'expired' | 'cancelled'
  startDate?: string
  endDate?: string
}

export interface PaymentFilters {
  customer_id?: string
  status?: PaymentStatus
  startDate?: string
  endDate?: string
  minAmount?: number
  maxAmount?: number
}
