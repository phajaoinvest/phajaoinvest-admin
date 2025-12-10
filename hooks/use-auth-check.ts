/**
 * useAuthCheck Hook
 * Periodic token validation to ensure user session is still valid
 */

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/auth-store'
import { authEvents } from '@/lib/api'

interface UseAuthCheckOptions {
  /**
   * Interval in milliseconds to check token validity
   * Default: 5 minutes (300000ms)
   */
  checkInterval?: number
  
  /**
   * Whether to enable automatic checking
   * Default: true
   */
  enabled?: boolean
  
  /**
   * Redirect path on auth failure
   * Default: '/login'
   */
  redirectPath?: string
}

/**
 * Hook to periodically validate authentication token
 * Automatically logs out user if token is expired or invalid
 */
export function useAuthCheck(options: UseAuthCheckOptions = {}) {
  const {
    checkInterval = 5 * 60 * 1000, // 5 minutes
    enabled = true,
    redirectPath = '/login',
  } = options

  const router = useRouter()
  const validateToken = useAuthStore((state) => state.validateToken)
  const logout = useAuthStore((state) => state.logout)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!enabled || !isAuthenticated) {
      return
    }

    // Validate immediately on mount
    validateToken()

    // Set up periodic validation
    intervalRef.current = setInterval(async () => {
      const isValid = await validateToken()
      if (!isValid) {
        router.push(redirectPath)
      }
    }, checkInterval)

    // Listen for logout events from token manager
    const unsubscribe = authEvents.onLogout(() => {
      logout()
      router.push(redirectPath)
    })

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      unsubscribe()
    }
  }, [enabled, isAuthenticated, checkInterval, redirectPath, validateToken, logout, router])
}

/**
 * Hook for one-time token validation on page load
 */
export function useAuthValidation(options: Pick<UseAuthCheckOptions, 'redirectPath'> = {}) {
  const { redirectPath = '/login' } = options
  const router = useRouter()
  const validateToken = useAuthStore((state) => state.validateToken)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(redirectPath)
      return
    }

    // Validate token once
    validateToken().then((isValid) => {
      if (!isValid) {
        router.push(redirectPath)
      }
    })
  }, [isAuthenticated, validateToken, router, redirectPath])
}
