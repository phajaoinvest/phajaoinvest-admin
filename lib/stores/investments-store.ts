/**
 * Investments Store
 * Manages investment data with API integration
 */

import { create } from 'zustand'
import { investmentsAdminApi, interestRatesApi } from '@/lib/api'
import type { 
  InvestmentRequest, 
  ReturnRequest,
  InterestRateConfiguration,
  InvestmentFilters,
  ReturnRequestFilters,
  PaginationParams, 
  PaginationMeta 
} from '@/lib/types'

// ============================================================================
// Types
// ============================================================================

interface InvestmentsState {
  // Investments data
  investments: InvestmentRequest[]
  pendingInvestments: InvestmentRequest[]
  investmentsPagination: PaginationMeta
  investmentsFilters: InvestmentFilters
  
  // Return requests data
  returnRequests: ReturnRequest[]
  pendingReturns: ReturnRequest[]
  returnsPagination: PaginationMeta
  returnsFilters: ReturnRequestFilters
  
  // Interest rate configurations
  interestRateConfigs: InterestRateConfiguration[]
  
  // Loading states
  isLoading: boolean
  isLoadingPending: boolean
  isLoadingReturns: boolean
  isLoadingConfigs: boolean
  isApproving: boolean
  
  // Error
  error: string | null

  // Investment actions
  fetchPendingInvestments: (params?: PaginationParams & InvestmentFilters) => Promise<void>
  approveInvestment: (id: string, notes?: string) => Promise<void>
  setInvestmentsFilters: (filters: Partial<InvestmentFilters>) => void
  
  // Return request actions
  fetchPendingReturns: (params?: PaginationParams & ReturnRequestFilters) => Promise<void>
  approveReturn: (id: string, notes?: string) => Promise<void>
  markReturnPaid: (id: string) => Promise<void>
  setReturnsFilters: (filters: Partial<ReturnRequestFilters>) => void
  
  // Interest rate actions
  fetchInterestRateConfigs: () => Promise<void>
  createInterestRateConfig: (data: Parameters<typeof interestRatesApi.create>[0]) => Promise<InterestRateConfiguration>
  updateInterestRateConfig: (id: string, data: Parameters<typeof interestRatesApi.update>[1]) => Promise<InterestRateConfiguration>
  deactivateInterestRateConfig: (id: string) => Promise<void>
  
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

export const useInvestmentsStore = create<InvestmentsState>((set, get) => ({
  // Initial state
  investments: [],
  pendingInvestments: [],
  investmentsPagination: initialPagination,
  investmentsFilters: {},
  returnRequests: [],
  pendingReturns: [],
  returnsPagination: initialPagination,
  returnsFilters: {},
  interestRateConfigs: [],
  isLoading: false,
  isLoadingPending: false,
  isLoadingReturns: false,
  isLoadingConfigs: false,
  isApproving: false,
  error: null,

  // ========== Investment Actions ==========

  fetchPendingInvestments: async (params) => {
    set({ isLoadingPending: true, error: null })

    try {
      const { investmentsFilters } = get()
      const response = await investmentsAdminApi.getPendingRequests({
        ...investmentsFilters,
        ...params,
      })

      set({
        pendingInvestments: response.data,
        investmentsPagination: {
          total: response.total,
          page: response.page,
          limit: response.limit,
          totalPages: response.totalPages,
        },
        isLoadingPending: false,
      })
    } catch (error) {
      const message = (error as { message?: string })?.message || 'Failed to fetch pending investments'
      set({ error: message, isLoadingPending: false })
    }
  },

  approveInvestment: async (id, notes) => {
    set({ isApproving: true, error: null })

    try {
      await investmentsAdminApi.approve(id, notes ? { admin_notes: notes } : undefined)
      
      set((state) => ({
        pendingInvestments: state.pendingInvestments.filter((inv) => inv.id !== id),
        isApproving: false,
      }))
    } catch (error) {
      const message = (error as { message?: string })?.message || 'Failed to approve investment'
      set({ error: message, isApproving: false })
      throw error
    }
  },

  setInvestmentsFilters: (filters) => {
    set((state) => ({
      investmentsFilters: { ...state.investmentsFilters, ...filters },
    }))
  },

  // ========== Return Request Actions ==========

  fetchPendingReturns: async (params) => {
    set({ isLoadingReturns: true, error: null })

    try {
      const { returnsFilters } = get()
      const response = await investmentsAdminApi.getPendingReturns({
        ...returnsFilters,
        ...params,
      })

      set({
        pendingReturns: response.data,
        returnsPagination: {
          total: response.total,
          page: response.page,
          limit: response.limit,
          totalPages: response.totalPages,
        },
        isLoadingReturns: false,
      })
    } catch (error) {
      const message = (error as { message?: string })?.message || 'Failed to fetch pending returns'
      set({ error: message, isLoadingReturns: false })
    }
  },

  approveReturn: async (id, notes) => {
    set({ isApproving: true, error: null })

    try {
      await investmentsAdminApi.approveReturn(id, notes ? { admin_notes: notes } : undefined)
      
      set((state) => ({
        pendingReturns: state.pendingReturns.map((ret) =>
          ret.id === id ? { ...ret, status: 'approved' as const } : ret
        ),
        isApproving: false,
      }))
    } catch (error) {
      const message = (error as { message?: string })?.message || 'Failed to approve return'
      set({ error: message, isApproving: false })
      throw error
    }
  },

  markReturnPaid: async (id) => {
    set({ isApproving: true, error: null })

    try {
      await investmentsAdminApi.markReturnPaid(id)
      
      set((state) => ({
        pendingReturns: state.pendingReturns.filter((ret) => ret.id !== id),
        isApproving: false,
      }))
    } catch (error) {
      const message = (error as { message?: string })?.message || 'Failed to mark return as paid'
      set({ error: message, isApproving: false })
      throw error
    }
  },

  setReturnsFilters: (filters) => {
    set((state) => ({
      returnsFilters: { ...state.returnsFilters, ...filters },
    }))
  },

  // ========== Interest Rate Actions ==========

  fetchInterestRateConfigs: async () => {
    set({ isLoadingConfigs: true, error: null })

    try {
      const response = await interestRatesApi.getAll()
      set({ interestRateConfigs: response.data, isLoadingConfigs: false })
    } catch (error) {
      const message = (error as { message?: string })?.message || 'Failed to fetch interest rate configurations'
      set({ error: message, isLoadingConfigs: false })
    }
  },

  createInterestRateConfig: async (data) => {
    set({ isLoading: true, error: null })

    try {
      const response = await interestRatesApi.create(data)
      set((state) => ({
        interestRateConfigs: [...state.interestRateConfigs, response.data],
        isLoading: false,
      }))
      return response.data
    } catch (error) {
      const message = (error as { message?: string })?.message || 'Failed to create interest rate configuration'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  updateInterestRateConfig: async (id, data) => {
    set({ isLoading: true, error: null })

    try {
      const response = await interestRatesApi.update(id, data)
      set((state) => ({
        interestRateConfigs: state.interestRateConfigs.map((config) =>
          config.id === id ? response.data : config
        ),
        isLoading: false,
      }))
      return response.data
    } catch (error) {
      const message = (error as { message?: string })?.message || 'Failed to update interest rate configuration'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  deactivateInterestRateConfig: async (id) => {
    set({ isLoading: true, error: null })

    try {
      await interestRatesApi.deactivate(id)
      set((state) => ({
        interestRateConfigs: state.interestRateConfigs.map((config) =>
          config.id === id ? { ...config, is_active: false } : config
        ),
        isLoading: false,
      }))
    } catch (error) {
      const message = (error as { message?: string })?.message || 'Failed to deactivate interest rate configuration'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  // ========== Common Actions ==========

  clearError: () => {
    set({ error: null })
  },
}))
