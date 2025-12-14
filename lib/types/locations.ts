/**
 * Location Types
 * Types for Country, Province, District
 */

import { BaseEntity } from './common'

// ============================================================================
// Enums
// ============================================================================

export enum LocationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

// ============================================================================
// Country
// ============================================================================

export interface Country extends BaseEntity {
  name: string
  status: LocationStatus
}

// ============================================================================
// Province
// ============================================================================

export interface Province extends BaseEntity {
  name: string
  country_id: string
  status: LocationStatus
  country?: Country
}

// ============================================================================
// District
// ============================================================================

export interface District extends BaseEntity {
  name: string
  postcode: number | null
  province_id: string
  status: LocationStatus
  province?: Province
}

// ============================================================================
// Filters
// ============================================================================

export interface CountryFilters {
  include_inactive?: boolean
  [key: string]: string | number | boolean | undefined
}

export interface ProvinceFilters {
  country_id?: string
  include_inactive?: boolean
  [key: string]: string | number | boolean | undefined
}

export interface DistrictFilters {
  province_id?: string
  include_inactive?: boolean
  [key: string]: string | number | boolean | undefined
}
