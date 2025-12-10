/**
 * Payments Store
 * Manages payments and subscription data with API integration
 */

import { create } from 'zustand'
import { packagesApi, paymentsApi, walletsAdminApi } from '@/lib/api'
import { PaymentStatus } from '@/lib/types'
import type { 
  Payment,
  SubscriptionPackage,
  TopUpRequest,
  PaymentFilters,
  PackageFilters,
  PaginationParams, 
  PaginationMeta 
} from '@/lib/types'

// ============================================================================
// Types
// ============================================================================

interface PaymentsState {
  // Payments data
  payments: Payment[]
  paymentsPagination: PaginationMeta
  paymentsFilters: PaymentFilters
  
  // Packages data
  packages: SubscriptionPackage[]
  packagesPagination: PaginationMeta
  packagesFilters: PackageFilters
  
  // Top-up requests
  pendingTopUps: TopUpRequest[]
  
  // Loading states
  isLoading: boolean
  isLoadingPackages: boolean
  isLoadingTopUps: boolean
  isProcessing: boolean
  
  // Error
  error: string | null

  // Payment actions
  fetchPayments: (params?: PaginationParams & PaymentFilters) => Promise<void>
  approvePayment: (id: string, notes?: string) => Promise<void>
  rejectPayment: (id: string, reason: string) => Promise<void>
  setPaymentsFilters: (filters: Partial<PaymentFilters>) => void
  
  // Package actions
  fetchPackages: (params?: PaginationParams & PackageFilters) => Promise<void>
  createPackage: (data: Parameters<typeof packagesApi.create>[0]) => Promise<SubscriptionPackage>
  updatePackage: (id: string, data: Parameters<typeof packagesApi.update>[1]) => Promise<SubscriptionPackage>
  deletePackage: (id: string) => Promise<void>
  setPackagesFilters: (filters: Partial<PackageFilters>) => void
  
  // Top-up actions
  approveTopUp: (id: string, notes?: string) => Promise<void>
  rejectTopUp: (id: string, reason: string) => Promise<void>
  
  // Common actions
  clearError: () => void
}

// ============================================================================
// Initial State
// ============================================================================

const initialPagination: PaginationMeta = {
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
}

// ============================================================================
// Store
// ============================================================================

export const usePaymentsStore = create<PaymentsState>((set, get) => ({
  // Initial state
  payments: [],
  paymentsPagination: initialPagination,
  paymentsFilters: {},
  packages: [],
  packagesPagination: initialPagination,
  packagesFilters: {},
  pendingTopUps: [],
  isLoading: false,
  isLoadingPackages: false,
  isLoadingTopUps: false,
  isProcessing: false,
  error: null,

  // ========== Payment Actions ==========

  fetchPayments: async (params) => {
    set({ isLoading: true, error: null })

    try {
      const { paymentsFilters } = get()
      const response = await paymentsApi.getAll({
        ...paymentsFilters,
        ...params,
      })

      set({
        payments: response.data,
        paymentsPagination: {
          total: response.total,
          page: response.page,
          limit: response.limit,
          totalPages: response.totalPages,
        },
        isLoading: false,
      })
    } catch (error) {
      const message = (error as { message?: string })?.message || 'Failed to fetch payments'
      set({ error: message, isLoading: false })
    }
  },

  approvePayment: async (id, notes) => {
    set({ isProcessing: true, error: null })

    try {
      await paymentsApi.approve(id, notes)
      
      set((state) => ({
        payments: state.payments.map((p) =>
          p.id === id ? { ...p, status: PaymentStatus.APPROVED } : p
        ),
        isProcessing: false,
      }))
    } catch (error) {
      const message = (error as { message?: string })?.message || 'Failed to approve payment'
      set({ error: message, isProcessing: false })
      throw error
    }
  },

  rejectPayment: async (id, reason) => {
    set({ isProcessing: true, error: null })

    try {
      await paymentsApi.reject(id, reason)
      
      set((state) => ({
        payments: state.payments.map((p) =>
          p.id === id ? { ...p, status: PaymentStatus.REJECTED } : p
        ),
        isProcessing: false,
      }))
    } catch (error) {
      const message = (error as { message?: string })?.message || 'Failed to reject payment'
      set({ error: message, isProcessing: false })
      throw error
    }
  },

  setPaymentsFilters: (filters) => {
    set((state) => ({
      paymentsFilters: { ...state.paymentsFilters, ...filters },
    }))
  },

  // ========== Package Actions ==========

  fetchPackages: async (params) => {
    set({ isLoadingPackages: true, error: null })

    try {
      const { packagesFilters } = get()
      const response = await packagesApi.getAll({
        ...packagesFilters,
        ...params,
      })

      set({
        packages: response.data,
        packagesPagination: {
          total: response.total,
          page: response.page,
          limit: response.limit,
          totalPages: response.totalPages,
        },
        isLoadingPackages: false,
      })
    } catch (error) {
      const message = (error as { message?: string })?.message || 'Failed to fetch packages'
      set({ error: message, isLoadingPackages: false })
    }
  },

  createPackage: async (data) => {
    set({ isProcessing: true, error: null })

    try {
      const response = await packagesApi.create(data)
      set((state) => ({
        packages: [response.data, ...state.packages],
        isProcessing: false,
      }))
      return response.data
    } catch (error) {
      const message = (error as { message?: string })?.message || 'Failed to create package'
      set({ error: message, isProcessing: false })
      throw error
    }
  },

  updatePackage: async (id, data) => {
    set({ isProcessing: true, error: null })

    try {
      const response = await packagesApi.update(id, data)
      set((state) => ({
        packages: state.packages.map((p) => (p.id === id ? response.data : p)),
        isProcessing: false,
      }))
      return response.data
    } catch (error) {
      const message = (error as { message?: string })?.message || 'Failed to update package'
      set({ error: message, isProcessing: false })
      throw error
    }
  },

  deletePackage: async (id) => {
    set({ isProcessing: true, error: null })

    try {
      await packagesApi.delete(id)
      set((state) => ({
        packages: state.packages.filter((p) => p.id !== id),
        isProcessing: false,
      }))
    } catch (error) {
      const message = (error as { message?: string })?.message || 'Failed to delete package'
      set({ error: message, isProcessing: false })
      throw error
    }
  },

  setPackagesFilters: (filters) => {
    set((state) => ({
      packagesFilters: { ...state.packagesFilters, ...filters },
    }))
  },

  // ========== Top-up Actions ==========

  approveTopUp: async (id, notes) => {
    set({ isProcessing: true, error: null })

    try {
      await walletsAdminApi.approveTopUp(id, notes ? { admin_notes: notes } : undefined)
      
      set((state) => ({
        pendingTopUps: state.pendingTopUps.filter((t) => t.id !== id),
        isProcessing: false,
      }))
    } catch (error) {
      const message = (error as { message?: string })?.message || 'Failed to approve top-up'
      set({ error: message, isProcessing: false })
      throw error
    }
  },

  rejectTopUp: async (id, reason) => {
    set({ isProcessing: true, error: null })

    try {
      await walletsAdminApi.rejectTopUp(id, { rejection_reason: reason })
      
      set((state) => ({
        pendingTopUps: state.pendingTopUps.filter((t) => t.id !== id),
        isProcessing: false,
      }))
    } catch (error) {
      const message = (error as { message?: string })?.message || 'Failed to reject top-up'
      set({ error: message, isProcessing: false })
      throw error
    }
  },

  // ========== Common Actions ==========

  clearError: () => {
    set({ error: null })
  },
}))
