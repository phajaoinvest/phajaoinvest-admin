/**
 * Users Store (Admin Staff)
 * Manages admin user data with API integration
 */

import { create } from 'zustand'
import { usersApi, rolesApi } from '@/lib/api'
import type { User, Role, UserFilters, PaginationParams, PaginationMeta } from '@/lib/types'

// ============================================================================
// Types
// ============================================================================

interface UsersState {
  // Data
  users: User[]
  currentUser: User | null
  roles: Role[]
  
  // Pagination
  pagination: PaginationMeta
  
  // Filters
  filters: UserFilters
  
  // Loading states
  isLoading: boolean
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
  isLoadingRoles: boolean
  
  // Error
  error: string | null

  // Actions
  fetchUsers: (params?: PaginationParams & UserFilters) => Promise<void>
  fetchUserById: (id: string) => Promise<User | null>
  createUser: (data: Parameters<typeof usersApi.create>[0]) => Promise<User>
  updateUser: (id: string, data: Parameters<typeof usersApi.update>[1]) => Promise<User>
  deleteUser: (id: string) => Promise<void>
  fetchRoles: () => Promise<void>
  setFilters: (filters: Partial<UserFilters>) => void
  resetFilters: () => void
  setCurrentUser: (user: User | null) => void
  clearError: () => void
}

// ============================================================================
// Initial State
// ============================================================================

const initialFilters: UserFilters = {
  status: undefined,
  role_id: undefined,
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

export const useUsersStore = create<UsersState>((set, get) => ({
  // Initial state
  users: [],
  currentUser: null,
  roles: [],
  pagination: initialPagination,
  filters: initialFilters,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isLoadingRoles: false,
  error: null,

  // Fetch users with pagination and filters
  fetchUsers: async (params) => {
    set({ isLoading: true, error: null })

    try {
      const { filters } = get()
      const response = await usersApi.getAll({
        ...filters,
        ...params,
      })

      set({
        users: response.data,
        pagination: {
          total: response.total,
          page: response.page,
          limit: response.limit,
          totalPages: response.totalPages,
        },
        isLoading: false,
      })
    } catch (error) {
      const message = (error as { message?: string })?.message || 'Failed to fetch users'
      set({ error: message, isLoading: false })
    }
  },

  // Fetch single user
  fetchUserById: async (id) => {
    set({ isLoading: true, error: null })

    try {
      const response = await usersApi.getById(id)
      set({ currentUser: response.data, isLoading: false })
      return response.data
    } catch (error) {
      const message = (error as { message?: string })?.message || 'Failed to fetch user'
      set({ error: message, isLoading: false })
      return null
    }
  },

  // Create user
  createUser: async (data) => {
    set({ isCreating: true, error: null })

    try {
      const response = await usersApi.create(data)
      
      set((state) => ({
        users: [response.data, ...state.users],
        isCreating: false,
      }))

      return response.data
    } catch (error) {
      const message = (error as { message?: string })?.message || 'Failed to create user'
      set({ error: message, isCreating: false })
      throw error
    }
  },

  // Update user
  updateUser: async (id, data) => {
    set({ isUpdating: true, error: null })

    try {
      const response = await usersApi.update(id, data)
      
      set((state) => ({
        users: state.users.map((u) => (u.id === id ? response.data : u)),
        currentUser: state.currentUser?.id === id ? response.data : state.currentUser,
        isUpdating: false,
      }))

      return response.data
    } catch (error) {
      const message = (error as { message?: string })?.message || 'Failed to update user'
      set({ error: message, isUpdating: false })
      throw error
    }
  },

  // Delete user
  deleteUser: async (id) => {
    set({ isDeleting: true, error: null })

    try {
      await usersApi.delete(id)
      
      set((state) => ({
        users: state.users.filter((u) => u.id !== id),
        currentUser: state.currentUser?.id === id ? null : state.currentUser,
        isDeleting: false,
      }))
    } catch (error) {
      const message = (error as { message?: string })?.message || 'Failed to delete user'
      set({ error: message, isDeleting: false })
      throw error
    }
  },

  // Fetch roles
  fetchRoles: async () => {
    set({ isLoadingRoles: true })

    try {
      const response = await rolesApi.getAll({ limit: 100 })
      set({ roles: response.data, isLoadingRoles: false })
    } catch (error) {
      console.error('Failed to fetch roles:', error)
      set({ isLoadingRoles: false })
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

  // Set current user
  setCurrentUser: (user) => {
    set({ currentUser: user })
  },

  // Clear error
  clearError: () => {
    set({ error: null })
  },
}))
