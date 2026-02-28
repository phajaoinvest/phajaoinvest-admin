/**
 * Coupons API Service
 */

import { apiClient } from './client'
import type {
    PaginationParams,
    CouponGroup,
    CreateCouponRequest,
    UpdateCouponRequest,
} from '@/lib/types'

export const couponsApi = {
    /**
     * Get all coupons (admin)
     */
    async getAll(params?: PaginationParams) {
        return apiClient.getPaginated<CouponGroup>('/admin/coupons', params)
    },

    /**
     * Get coupon by ID (admin)
     */
    async getById(id: string) {
        return apiClient.get<CouponGroup>(`/admin/coupons/group/${id}`)
    },

    /**
     * Create coupon (admin)
     */
    async create(data: CreateCouponRequest) {
        return apiClient.post<CouponGroup>('/admin/coupons', data)
    },

    /**
     * Update coupon (admin)
     */
    async update(id: string, data: UpdateCouponRequest) {
        return apiClient.put<CouponGroup>(`/admin/coupons/${id}`, data)
    },

    /**
     * Delete coupon (admin)
     */
    async delete(id: string) {
        return apiClient.delete(`/admin/coupons/${id}`)
    }
}
