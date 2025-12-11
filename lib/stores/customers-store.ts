/**
 * Customers Store
 * Manages customer data with API integration
 */

import { create } from 'zustand'
import { customersApi } from '@/lib/api'
import type { Customer, CustomerFilters, PaginationParams, PaginationMeta } from '@/lib/types'

// ============================================================================
// Types
// ============================================================================

interface CustomersState {
  // Data
  customers: Customer[]
  currentCustomer: Customer | null
  
  // Stats
  stats: {
    totalCustomers: number
    activeCount: number
    inactiveCount: number
    suspendedCount: number
    verifiedCount: number
  } | null
  
  // Pagination
  pagination: PaginationMeta
  
  // Filters
  filters: CustomerFilters
  
  // Loading states
  isLoading: boolean
  isLoadingStats: boolean
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
  
  // Error
  error: string | null

  // Actions
  fetchStats: () => Promise<void>
  fetchCustomers: (params?: PaginationParams & CustomerFilters) => Promise<void>
  fetchCustomerById: (id: string) => Promise<Customer | null>
  createCustomer: (data: Parameters<typeof customersApi.create>[0]) => Promise<Customer>
  updateCustomer: (id: string, data: Parameters<typeof customersApi.update>[1]) => Promise<Customer>
  deleteCustomer: (id: string) => Promise<void>
  setFilters: (filters: Partial<CustomerFilters>) => void
  resetFilters: () => void
  setCurrentCustomer: (customer: Customer | null) => void
  clearError: () => void
}

// ============================================================================
// Initial State
// ============================================================================

const initialFilters: CustomerFilters = {
  status: undefined,
  isVerify: undefined,
  search: undefined,
}

const initialPagination: PaginationMeta = {
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
}

// ============================================================================
// Store
// ============================================================================

export const useCustomersStore = create<CustomersState>((set, get) => ({
  // Initial state
  customers: [],
  currentCustomer: null,
  stats: null,
  pagination: initialPagination,
  filters: initialFilters,
  isLoading: false,
  isLoadingStats: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,

  // Fetch stats
  fetchStats: async () => {
    set({ isLoadingStats: true, error: null })

    try {
      const response = await customersApi.getStats()
      set({ stats: response.data, isLoadingStats: false })
    } catch (error) {
      const message = (error as { message?: string })?.message || 'Failed to fetch customer stats'
      set({ error: message, isLoadingStats: false })
    }
  },

  // Fetch customers with pagination and filters
  fetchCustomers: async (params) => {
    set({ isLoading: true, error: null })

    try {
      const { filters } = get()
      const response = await customersApi.getAll({
        ...filters,
        ...params,
      })

      set({
        customers: response.data,
        pagination: {
          total: response.total,
          page: response.page,
          limit: response.limit,
          totalPages: response.totalPages,
        },
        isLoading: false,
      })
    } catch (error) {
      const message = (error as { message?: string })?.message || 'Failed to fetch customers'
      set({ error: message, isLoading: false })
    }
  },

  // Fetch single customer
  fetchCustomerById: async (id) => {
    set({ isLoading: true, error: null })

    try {
      const response = await customersApi.getById(id)
      set({ currentCustomer: response.data, isLoading: false })
      return response.data
    } catch (error) {
      const message = (error as { message?: string })?.message || 'Failed to fetch customer'
      set({ error: message, isLoading: false })
      return null
    }
  },

  // Create customer
  createCustomer: async (data) => {
    set({ isCreating: true, error: null })

    try {
      const response = await customersApi.create(data)
      
      // Add to list
      set((state) => ({
        customers: [response.data, ...state.customers],
        isCreating: false,
      }))

      return response.data
    } catch (error) {
      const message = (error as { message?: string })?.message || 'Failed to create customer'
      set({ error: message, isCreating: false })
      throw error
    }
  },

  // Update customer
  updateCustomer: async (id, data) => {
    set({ isUpdating: true, error: null })

    try {
      const response = await customersApi.update(id, data)
      
      // Update in list
      set((state) => ({
        customers: state.customers.map((c) => (c.id === id ? response.data : c)),
        currentCustomer: state.currentCustomer?.id === id ? response.data : state.currentCustomer,
        isUpdating: false,
      }))

      return response.data
    } catch (error) {
      const message = (error as { message?: string })?.message || 'Failed to update customer'
      set({ error: message, isUpdating: false })
      throw error
    }
  },

  // Delete customer
  deleteCustomer: async (id) => {
    set({ isDeleting: true, error: null })

    try {
      await customersApi.delete(id)
      
      // Remove from list
      set((state) => ({
        customers: state.customers.filter((c) => c.id !== id),
        currentCustomer: state.currentCustomer?.id === id ? null : state.currentCustomer,
        isDeleting: false,
      }))
    } catch (error) {
      const message = (error as { message?: string })?.message || 'Failed to delete customer'
      set({ error: message, isDeleting: false })
      throw error
    }
  },

  // Set filters
  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }))
  },

  // Reset filters
  resetFilters: () => {
    set({ filters: initialFilters })
  },

  // Set current customer
  setCurrentCustomer: (customer) => {
    set({ currentCustomer: customer })
  },

  // Clear error
  clearError: () => {
    set({ error: null })
  },
}))

// ============================================================================
// Selectors
// ============================================================================

export const selectCustomers = (state: CustomersState) => state.customers
export const selectCurrentCustomer = (state: CustomersState) => state.currentCustomer
export const selectPagination = (state: CustomersState) => state.pagination
export const selectFilters = (state: CustomersState) => state.filters
export const selectIsLoading = (state: CustomersState) => state.isLoading
export const selectError = (state: CustomersState) => state.error
