/**
 * Common Types
 * Shared types used across the application
 */

// ============================================================================
// Pagination
// ============================================================================

export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
  [key: string]: string | number | boolean | undefined
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

// ============================================================================
// Enums
// ============================================================================

export enum CustomerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export enum KycLevel {
  BASIC = 'BASIC',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

export enum KycStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

// Matches backend CustomerServiceType enum
export enum ServiceType {
  PREMIUM_MEMBERSHIP = 'premium_membership',
  PREMIUM_STOCK_PICKS = 'premium_stock_picks',
  INTERNATIONAL_STOCK_ACCOUNT = 'international_stock_account',
  GUARANTEED_RETURNS = 'guaranteed_returns',
}

export enum RiskTolerance {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAYMENT_SLIP_SUBMITTED = 'payment_slip_submitted',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  CANCELED = 'canceled',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
}

export enum StockPickStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum StockPickAvailability {
  AVAILABLE = 'available',
  SOLD_OUT = 'sold_out',
  COMING_SOON = 'coming_soon',
}

export enum InvestmentStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  COMPLETED = 'completed',
  CLOSED = 'closed',
  CANCELLED = 'cancelled',
}

export enum InterestTier {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
}

// ============================================================================
// Common Interfaces
// ============================================================================

export interface BaseEntity {
  id: string
  created_at: string
  updated_at: string
}

export interface SoftDeletable {
  deleted_by: string | null
  deleted_at?: string | null
}

export interface Auditable {
  created_by: string | null
  updated_by?: string | null
}

// ============================================================================
// Date Range Filter
// ============================================================================

export interface DateRangeFilter {
  startDate?: string
  endDate?: string
}

// ============================================================================
// Sort Options
// ============================================================================

export interface SortOptions {
  field: string
  direction: 'asc' | 'desc'
}
