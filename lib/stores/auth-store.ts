/**
 * Auth Store
 * Manages authentication state with API integration
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { authApi, tokenManager, authEvents, type TwoFactorRequiredResponse } from '@/lib/api'
import type { AuthUser, LoginRequest, LoginResponse } from '@/lib/types'

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
  // 2FA state
  requires2FA: boolean
  tempToken: string | null

  // Actions
  login: (credentials: LoginRequest) => Promise<{ requires2FA?: boolean }>
  complete2FALogin: (code?: string, backupCode?: string) => Promise<void>
  logout: () => Promise<void>
  setUser: (user: AuthUser | null) => void
  setError: (error: string | null) => void
  clearError: () => void
  clear2FA: () => void
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
      requires2FA: false,
      tempToken: null,

      // Login
      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null, requires2FA: false, tempToken: null })

        try {
          const response = await authApi.login(credentials)

          // Check if 2FA is required
          if ('requires_2fa' in response && response.requires_2fa) {
            set({
              isLoading: false,
              requires2FA: true,
              tempToken: response.temp_token,
            })
            return { requires2FA: true }
          }

          // Normal login - cast to LoginResponse
          const loginResponse = response as LoginResponse
          const { user } = loginResponse

          // Extract permissions from user's role
          const permissions = user.role?.permissions?.map((p) => p.name) || user.permissions || []

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            permissions,
            requires2FA: false,
            tempToken: null,
          })
          return {}
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
            requires2FA: false,
            tempToken: null,
          })
          throw error
        }
      },

      // Complete 2FA login
      complete2FALogin: async (code?: string, backupCode?: string) => {
        const { tempToken } = get()
        if (!tempToken) {
          throw new Error('No 2FA session found')
        }

        set({ isLoading: true, error: null })

        try {
          const response = await authApi.verify2FALogin(tempToken, code, backupCode)
          const { user } = response

          // Extract permissions from user's role
          const permissions = user.role?.permissions?.map((p) => p.name) || user.permissions || []

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            permissions,
            requires2FA: false,
            tempToken: null,
          })
        } catch (error) {
          const message = error instanceof Error
            ? error.message
            : (error as { message?: string })?.message || 'Invalid verification code'

          set({
            isLoading: false,
            error: message,
          })
          throw error
        }
      },

      // Clear 2FA state
      clear2FA: () => {
        set({
          requires2FA: false,
          tempToken: null,
          error: null,
        })
      },

      // Logout
      logout: async () => {
        try {
          await authApi.logout()
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            permissions: [],
            requires2FA: false,
            tempToken: null,
          })
        }
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
