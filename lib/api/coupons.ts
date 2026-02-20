/**
 * Coupons API Service
 */

import { apiClient } from './client'
import type {
    PaginationParams,
    Coupon,
    CreateCouponRequest,
    UpdateCouponRequest,
} from '@/lib/types'

export const couponsApi = {
    /**
     * Get all coupons (admin)
     */
    async getAll(params?: PaginationParams) {
        return apiClient.getPaginated<Coupon>('/admin/coupons', params)
    },

    /**
     * Get coupon by ID (admin)
     */
    async getById(id: string) {
        return apiClient.get<Coupon>(`/admin/coupons/${id}`)
    },

    /**
     * Create coupon (admin)
     */
    async create(data: CreateCouponRequest) {
        return apiClient.post<Coupon>('/admin/coupons', data)
    },

    /**
     * Update coupon (admin)
     */
    async update(id: string, data: UpdateCouponRequest) {
        return apiClient.put<Coupon>(`/admin/coupons/${id}`, data)
    },

    /**
     * Delete coupon (admin)
     */
    async delete(id: string) {
        return apiClient.delete(`/admin/coupons/${id}`)
    }
}
