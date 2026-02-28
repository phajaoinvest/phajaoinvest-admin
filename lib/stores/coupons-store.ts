/**
 * Coupons Store
 */

import { create } from 'zustand'
import { couponsApi } from '@/lib/api'
import type {
    Coupon,
    CouponGroup,
    CreateCouponRequest,
    UpdateCouponRequest,
    PaginationParams,
    PaginationMeta
} from '@/lib/types'

interface CouponsState {
    coupons: CouponGroup[]
    pagination: PaginationMeta
    isLoading: boolean
    isProcessing: boolean
    error: string | null

    fetchCoupons: (params?: PaginationParams) => Promise<void>
    getCouponGroup: (id: string) => Promise<CouponGroup>
    createCoupon: (data: CreateCouponRequest) => Promise<CouponGroup>
    updateCoupon: (id: string, data: UpdateCouponRequest) => Promise<CouponGroup>
    deleteCoupon: (id: string) => Promise<void>
    clearError: () => void
}

const initialPagination: PaginationMeta = {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
}

export const useCouponsStore = create<CouponsState>((set) => ({
    coupons: [],
    pagination: initialPagination,
    isLoading: false,
    isProcessing: false,
    error: null,

    fetchCoupons: async (params) => {
        set({ isLoading: true, error: null })
        try {
            const response = await couponsApi.getAll(params)
            set({
                coupons: response.data,
                pagination: {
                    total: response.total,
                    page: response.page,
                    limit: response.limit,
                    totalPages: response.totalPages,
                },
                isLoading: false,
            })
        } catch (error) {
            set({ error: (error as any)?.message || 'Failed to fetch coupons', isLoading: false })
        }
    },

    getCouponGroup: async (id) => {
        set({ isProcessing: true, error: null })
        try {
            const response = await couponsApi.getById(id)
            set({ isProcessing: false })
            return response.data
        } catch (error) {
            set({ error: (error as any)?.message || 'Failed to fetch coupon details', isProcessing: false })
            throw error
        }
    },

    createCoupon: async (data) => {
        set({ isProcessing: true, error: null })
        try {
            const response = await couponsApi.create(data)
            set((state) => ({
                coupons: [response.data, ...state.coupons],
                isProcessing: false,
            }))
            return response.data
        } catch (error) {
            set({ error: (error as any)?.message || 'Failed to create coupon', isProcessing: false })
            throw error
        }
    },

    updateCoupon: async (id, data) => {
        set({ isProcessing: true, error: null })
        try {
            const response = await couponsApi.update(id, data)
            set((state) => ({
                coupons: state.coupons.map((c) => (c.id === id ? response.data : c)),
                isProcessing: false,
            }))
            return response.data
        } catch (error) {
            set({ error: (error as any)?.message || 'Failed to update coupon', isProcessing: false })
            throw error
        }
    },

    deleteCoupon: async (id) => {
        set({ isProcessing: true, error: null })
        try {
            await couponsApi.delete(id)
            set((state) => ({
                coupons: state.coupons.filter((c) => c.id !== id),
                isProcessing: false,
            }))
        } catch (error) {
            set({ error: (error as any)?.message || 'Failed to delete coupon', isProcessing: false })
            throw error
        }
    },

    clearError: () => set({ error: null }),
}))
