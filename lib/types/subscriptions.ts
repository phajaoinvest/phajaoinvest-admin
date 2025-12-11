/**
 * Subscription & Package Types
 */

import { BaseEntity, ServiceType, PaymentStatus, CustomerStatus, KycLevel, KycStatus } from './common'

// ============================================================================
// Subscription Status Enum (matches backend)
// ============================================================================

export enum SubscriptionStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  SUSPENDED = 'suspended',
}

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
// Premium Membership Subscription (from customer_services table)
// ============================================================================

export interface PremiumMembershipSubscription {
  service_id: string
  customer_id: string
  customer_info: {
    username: string
    email: string
    first_name: string
    last_name: string
  }
  service_type: ServiceType | string
  active: boolean
  subscription_duration: 3 | 6 | 12 | null
  subscription_fee: number | null
  subscription_expires_at: string | null
  subscription_package_id: string | null
  applied_at: string
  latest_payment_status?: PaymentStatus | string | null
  status: SubscriptionStatus | string // Status from backend entity
}

export interface PremiumMembershipDetail {
  service: {
    id: string
    service_type: ServiceType | string
    status: SubscriptionStatus | string
    active: boolean
    requires_payment: boolean
    applied_at: string
    subscription_duration: number | null
    subscription_fee: number | null
    subscription_expires_at: string | null
    subscription_package_id: string | null
    balance: number
    invested_amount: number
    kyc_id: string | null
  }
  customer: {
    id: string
    username: string
    email: string
    first_name: string
    last_name: string | null
    phone_number: string | null
    status: CustomerStatus | string
    isVerify: boolean
    profile: string | null
    created_at: string
    updated_at: string
  }
  package: {
    id: string
    service_type: ServiceType | string
    duration_months: number
    price: number
    currency: string
    description: string | null
    features: string[] | null
    active: boolean
  } | null
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
  payments: Array<{
    id: string
    status: PaymentStatus | string
    amount: number
    currency: string
    payment_method: string
    payment_type: string
    description: string | null
    payment_slip_url: string | null
    payment_slip_filename: string | null
    payment_reference: string | null
    admin_notes: string | null
    paid_at: string | null
    created_at: string
    updated_at: string
  }>
}

// ============================================================================
// Pending Premium Membership (from payments table - legacy)
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
    email: string | null
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
