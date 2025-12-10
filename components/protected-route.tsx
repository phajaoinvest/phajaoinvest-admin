'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores'
import { useAuthCheck } from '@/hooks'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  permissions?: string[]
  requireAll?: boolean
  /**
   * Enable periodic token validation
   * Default: true
   */
  enableAutoValidation?: boolean
  /**
   * Validation check interval in milliseconds
   * Default: 5 minutes
   */
  validationInterval?: number
}

export function ProtectedRoute({ 
  children, 
  permissions = [],
  requireAll = false,
  enableAutoValidation = true,
  validationInterval = 5 * 60 * 1000,
}: ProtectedRouteProps) {
  const router = useRouter()
  const { isAuthenticated, hasAnyPermission, hasAllPermissions, checkAuth, validateToken } = useAuthStore()
  const [isChecking, setIsChecking] = useState(true)

  // Enable periodic token validation
  useAuthCheck({
    enabled: enableAutoValidation && isAuthenticated,
    checkInterval: validationInterval,
    redirectPath: '/login',
  })

  useEffect(() => {
    const performCheck = async () => {
      checkAuth()
      
      // Validate token immediately if authenticated
      if (isAuthenticated) {
        const isValid = await validateToken()
        if (!isValid) {
          router.push('/login')
          return
        }
      }
      
      setIsChecking(false)
    }
    
    performCheck()
  }, [checkAuth, isAuthenticated, validateToken, router])

  useEffect(() => {
    if (!isChecking && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isChecking, router])

  // Show loading while checking auth
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null
  }

  // Check permissions if specified
  if (permissions.length > 0) {
    const hasPermission = requireAll 
      ? hasAllPermissions(permissions) 
      : hasAnyPermission(permissions)

    if (!hasPermission) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <h2 className="text-xl font-semibold text-destructive mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            You don&apos;t have permission to access this page.
          </p>
        </div>
      )
    }
  }

  return <>{children}</>
}
