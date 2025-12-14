/**
 * Auth Store
 * Manages authentication state with API integration
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { authApi, tokenManager, authEvents } from '@/lib/api'
import type { AuthUser, LoginRequest } from '@/lib/types'

// ============================================================================
// Types
// ============================================================================

interface AuthState {
  // State
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  permissions: string[]

  // Actions
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => Promise<void>
  setUser: (user: AuthUser | null) => void
  setError: (error: string | null) => void
  clearError: () => void
  checkAuth: () => void
  validateToken: () => Promise<boolean>
  hasPermission: (permission: string) => boolean
  hasAnyPermission: (permissions: string[]) => boolean
  hasAllPermissions: (permissions: string[]) => boolean
}

// ============================================================================
// Store
// ============================================================================

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      permissions: [],

      // Login
      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null })

        try {
          const response = await authApi.login(credentials)
          const { user } = response

          // Extract permissions from user's role
          const permissions = user.role?.permissions?.map((p) => p.name) || user.permissions || []

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            permissions,
          })
        } catch (error) {
          const message = error instanceof Error 
            ? error.message 
            : (error as { message?: string })?.message || 'Login failed'
          
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: message,
            permissions: [],
          })
          throw error
        }
      },

      // Logout
      logout: async () => {
        await authApi.logout()
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          permissions: [],
        })
      },

      // Validate token
      // Only logout if backend explicitly returns is_error: true or valid: false
      // Don't logout on network errors (backend not reachable)
      validateToken: async () => {
        try {
          const result = await authApi.verifyToken()
          
          // If it's a network error, don't logout - just return true to keep user logged in
          if (result.networkError) {
            console.warn('Token validation skipped due to network error - keeping user logged in')
            return true
          }
          
          // Only logout if backend explicitly said the token is invalid
          if (!result.valid) {
            console.log('Token invalid - backend explicitly rejected token')
            await get().logout()
            return false
          }
          
          return true
        } catch (error) {
          // Unexpected error - don't logout, just log the error
          console.error('Unexpected error during token validation:', error)
          return true
        }
      },

      // Set user manually
      setUser: (user) => {
        const permissions = user?.role?.permissions?.map((p) => p.name) || user?.permissions || []
        set({
          user,
          isAuthenticated: !!user,
          permissions,
        })
      },

      // Set error
      setError: (error) => set({ error }),

      // Clear error
      clearError: () => set({ error: null }),

      // Check if user is authenticated (on app load)
      checkAuth: () => {
        const hasToken = tokenManager.isAuthenticated()
        const { user, isAuthenticated } = get()
        
        // If no token, clear everything
        if (!hasToken) {
          if (isAuthenticated || user) {
            set({
              user: null,
              isAuthenticated: false,
              permissions: [],
            })
          }
          return
        }
        
        // If we have token and persisted user state, ensure isAuthenticated is true
        if (hasToken && user && !isAuthenticated) {
          const permissions = user.role?.permissions?.map((p) => p.name) || user.permissions || []
          set({
            isAuthenticated: true,
            permissions,
          })
        }
      },

      // Permission checks
      hasPermission: (permission: string) => {
        const { permissions, user } = get()
        // Super admin bypass
        if (user?.role?.name === 'super_admin' || user?.role?.name === 'admin') {
          return true
        }
        return permissions.includes(permission)
      },

      hasAnyPermission: (perms: string[]) => {
        const { permissions, user } = get()
        if (user?.role?.name === 'super_admin' || user?.role?.name === 'admin') {
          return true
        }
        return perms.some((p) => permissions.includes(p))
      },

      hasAllPermissions: (perms: string[]) => {
        const { permissions, user } = get()
        if (user?.role?.name === 'super_admin' || user?.role?.name === 'admin') {
          return true
        }
        return perms.every((p) => permissions.includes(p))
      },
    }),
    {
      name: 'phajaoinvest-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        permissions: state.permissions,
      }),
    }
  )
)

// ============================================================================
// Selectors
// ============================================================================

export const selectUser = (state: AuthState) => state.user
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated
export const selectIsLoading = (state: AuthState) => state.isLoading
export const selectError = (state: AuthState) => state.error
export const selectPermissions = (state: AuthState) => state.permissions
