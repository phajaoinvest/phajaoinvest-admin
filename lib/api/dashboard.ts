/**
 * Dashboard API Service
 */

import { apiClient } from './client'

// ============================================================================
// Admin Dashboard
// ============================================================================

export const dashboardApi = {
  /**
   * Get admin dashboard statistics
   */
  async getStats() {
    return apiClient.get('/admin/dashboard/stats')
  },

  /**
   * Get recent activities for admin dashboard
   */
  async getRecentActivities(limit?: number) {
    return apiClient.get('/admin/dashboard/recent-activities', limit ? { limit } : undefined)
  },

  /**
   * Get revenue chart data
   */
  async getRevenueChart(year?: number) {
    return apiClient.get('/admin/dashboard/revenue-chart', year ? { year } : undefined)
  },

  /**
   * Get customer growth chart data
   */
  async getCustomerGrowthChart(year?: number) {
    return apiClient.get('/admin/dashboard/customer-growth-chart', year ? { year } : undefined)
  },
}

// ============================================================================
// Audit Logs
// ============================================================================

export const auditLogsApi = {
  /**
   * Get audit logs
   */
  async getAll(params?: {
    page?: number
    limit?: number
    action?: string
    entity?: string
    userId?: string
    startDate?: string
    endDate?: string
  }) {
    return apiClient.getPaginated('/audit-logs', params)
  },

  /**
   * Get audit log by ID
   */
  async getById(id: string) {
    return apiClient.get(`/audit-logs/${id}`)
  },
}

// ============================================================================
// Location Data
// ============================================================================

export const locationApi = {
  /**
   * Get countries
   */
  async getCountries() {
    return apiClient.get('/countries')
  },

  /**
   * Get provinces by country
   */
  async getProvinces(countryId?: string) {
    return apiClient.get('/provinces', countryId ? { country_id: countryId } : undefined)
  },

  /**
   * Get districts by province
   */
  async getDistricts(provinceId?: string) {
    return apiClient.get('/districts', provinceId ? { province_id: provinceId } : undefined)
  },
}

// ============================================================================
// Invest Types
// ============================================================================

export const investTypesApi = {
  /**
   * Get all invest types
   */
  async getAll(params?: { page?: number; limit?: number }) {
    return apiClient.getPaginated('/invest-types', params)
  },

  /**
   * Get by ID
   */
  async getById(id: string) {
    return apiClient.get(`/invest-types/${id}`)
  },

  /**
   * Create invest type
   */
  async create(data: { name: string; description?: string }) {
    return apiClient.post('/invest-types', data)
  },

  /**
   * Update invest type
   */
  async update(id: string, data: { name?: string; description?: string }) {
    return apiClient.patch(`/invest-types/${id}`, data)
  },

  /**
   * Delete invest type
   */
  async delete(id: string) {
    return apiClient.delete(`/invest-types/${id}`)
  },
}

// ============================================================================
// Bounds
// ============================================================================

export const boundsApi = {
  /**
   * Get all bounds
   */
  async getAll(params?: { page?: number; limit?: number }) {
    return apiClient.getPaginated('/bounds', params)
  },

  /**
   * Get by ID
   */
  async getById(id: string) {
    return apiClient.get(`/bounds/${id}`)
  },

  /**
   * Create bound
   */
  async create(data: { name: string; min_value?: number; max_value?: number }) {
    return apiClient.post('/bounds', data)
  },

  /**
   * Update bound
   */
  async update(id: string, data: { name?: string; min_value?: number; max_value?: number }) {
    return apiClient.patch(`/bounds/${id}`, data)
  },

  /**
   * Delete bound
   */
  async delete(id: string) {
    return apiClient.delete(`/bounds/${id}`)
  },
}
