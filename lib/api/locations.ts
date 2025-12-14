/**
 * Locations API Service
 * Country, Province, District management
 */

import { apiClient } from './client'
import type {
  Country,
  Province,
  District,
  CountryFilters,
  ProvinceFilters,
  DistrictFilters,
} from '@/lib/types'

// ============================================================================
// Countries
// ============================================================================

export const countriesApi = {
  /**
   * Get list of countries
   */
  list: async (params?: Record<string, string | number | boolean | undefined>): Promise<Country[]> => {
    const shouldPaginate = !!params && (params.page !== undefined || params.limit !== undefined)

    if (shouldPaginate) {
      const res = await apiClient.getPaginated<Country>('/countries', params)
      return res.data ?? []
    }

    const res = await apiClient.request<unknown>('/countries', { params })
    if (Array.isArray(res)) return res as Country[]
    if (res && typeof res === 'object' && Array.isArray((res as any).data)) return (res as any).data as Country[]
    return []
  },

  async getAll(params?: CountryFilters) {
    return this.list(params)
  },
}

// ============================================================================
// Provinces
// ============================================================================

export const provincesApi = {
  /**
   * Get list of provinces (optional country filter)
   */
  list: async (params?: Record<string, string | number | boolean | undefined>): Promise<Province[]> => {
    const shouldPaginate = !!params && (params.page !== undefined || params.limit !== undefined)

    if (shouldPaginate) {
      const res = await apiClient.getPaginated<Province>('/provinces', params)
      return res.data ?? []
    }

    const res = await apiClient.request<unknown>('/provinces', { params })
    if (Array.isArray(res)) return res as Province[]
    if (res && typeof res === 'object' && Array.isArray((res as any).data)) return (res as any).data as Province[]
    return []
  },

  async getAll(params?: ProvinceFilters) {
    return this.list(params)
  },
}

// ============================================================================
// Districts
// ============================================================================

export const districtsApi = {
  /**
   * Get list of districts (optional province filter)
   */
  list: async (params?: Record<string, string | number | boolean | undefined>): Promise<District[]> => {
    const shouldPaginate = !!params && (params.page !== undefined || params.limit !== undefined)

    if (shouldPaginate) {
      const res = await apiClient.getPaginated<District>('/districts', params)
      return res.data ?? []
    }

    const res = await apiClient.request<unknown>('/districts', { params })
    if (Array.isArray(res)) return res as District[]
    if (res && typeof res === 'object' && Array.isArray((res as any).data)) return (res as any).data as District[]
    return []
  },

  async getAll(params?: DistrictFilters) {
    return this.list(params)
  },
}
