/**
 * Customer Types
 */

import { BaseEntity, CustomerStatus, SoftDeletable, KycLevel, KycStatus } from './common'

// ============================================================================
// Customer Entity
// ============================================================================

export interface Customer extends BaseEntity, SoftDeletable {
  first_name: string
  last_name: string | null
  username: string
  email: string
  phone_number: string | null
  status: CustomerStatus
  isVerify: boolean
  profile: string | null
  address: string | null
  kyc_level?: KycLevel
  kyc_status?: KycStatus
  services?: Array<{
    id: string
    customer_id: string
    service_type: string
    active: boolean
    applied_at: string
  }>
}

// ============================================================================
// DTOs
// ============================================================================

export interface CreateCustomerRequest {
  first_name: string
  last_name?: string
  username: string
  email: string
  password: string
  phone_number?: string
  address?: string
}

export interface UpdateCustomerRequest {
  first_name?: string
  last_name?: string
  phone_number?: string
  address?: string
  status?: CustomerStatus
  profile?: string
}

// ============================================================================
// Filters
// ============================================================================

export interface CustomerFilters {
  status?: CustomerStatus
  isVerify?: boolean
  kyc_level?: KycLevel
  kyc_status?: KycStatus
  search?: string
  startDate?: string
  endDate?: string
}

// ============================================================================
// Customer Services
// ============================================================================

export interface CustomerService extends BaseEntity {
  customer_id: string
  service_type: string
  status: string
  kyc_level: KycLevel
  kyc_status: KycStatus
  approved_at: string | null
  approved_by: string | null
  rejected_at: string | null
  rejected_by: string | null
  rejection_reason: string | null
}

export interface CustomerServiceApplication {
  service_type: string
  kyc_documents?: string[]
}

// ============================================================================
// KYC
// ============================================================================

export interface KycRecord extends BaseEntity {
  customer_id: string
  customer: Customer
  service_type: string
  kyc_level: KycLevel
  status: KycStatus
  documents: string[]
  reviewed_by: string | null
  reviewed_at: string | null
  rejection_reason: string | null
}
