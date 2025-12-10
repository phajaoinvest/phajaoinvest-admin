/**
 * usePermissions Hook
 * Check user permissions in components
 */

import { useCallback } from 'react'
import { useAuthStore } from '@/lib/stores'

// ============================================================================
// Hook
// ============================================================================

export function usePermissions() {
  const { hasPermission, hasAnyPermission, hasAllPermissions, permissions, user } = useAuthStore()

  // Check single permission
  const can = useCallback(
    (permission: string) => hasPermission(permission),
    [hasPermission]
  )

  // Check if user has any of the given permissions
  const canAny = useCallback(
    (perms: string[]) => hasAnyPermission(perms),
    [hasAnyPermission]
  )

  // Check if user has all of the given permissions
  const canAll = useCallback(
    (perms: string[]) => hasAllPermissions(perms),
    [hasAllPermissions]
  )

  // Check if user is admin
  const isAdmin = user?.role?.name === 'admin' || user?.role?.name === 'super_admin'

  // Check if user is super admin
  const isSuperAdmin = user?.role?.name === 'super_admin'

  return {
    can,
    canAny,
    canAll,
    permissions,
    isAdmin,
    isSuperAdmin,
    user,
  }
}

// ============================================================================
// Permission Constants
// ============================================================================

export const PERMISSIONS = {
  // Customers
  CUSTOMERS_READ: 'customers:read',
  CUSTOMERS_CREATE: 'customers:create',
  CUSTOMERS_UPDATE: 'customers:update',
  CUSTOMERS_DELETE: 'customers:delete',

  // Users
  USERS_READ: 'users:read',
  USERS_CREATE: 'users:create',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',

  // Roles
  ROLES_READ: 'roles:read',
  ROLES_CREATE: 'roles:create',
  ROLES_UPDATE: 'roles:update',
  ROLES_DELETE: 'roles:delete',

  // Permissions
  PERMISSIONS_READ: 'permissions:read',
  PERMISSIONS_CREATE: 'permissions:create',
  PERMISSIONS_UPDATE: 'permissions:update',
  PERMISSIONS_DELETE: 'permissions:delete',

  // Stocks
  STOCKS_READ: 'stocks:read',
  STOCKS_CREATE: 'stocks:create',
  STOCKS_UPDATE: 'stocks:update',
  STOCKS_DELETE: 'stocks:delete',

  // Stock Categories
  STOCK_CATEGORIES_READ: 'stock-categories:read',
  STOCK_CATEGORIES_CREATE: 'stock-categories:create',
  STOCK_CATEGORIES_UPDATE: 'stock-categories:update',
  STOCK_CATEGORIES_DELETE: 'stock-categories:delete',

  // Invest Types
  INVEST_TYPES_READ: 'invest-types:read',
  INVEST_TYPES_CREATE: 'invest-types:create',
  INVEST_TYPES_UPDATE: 'invest-types:update',
  INVEST_TYPES_DELETE: 'invest-types:delete',

  // Bounds
  BOUNDS_READ: 'bounds:read',
  BOUNDS_CREATE: 'bounds:create',
  BOUNDS_UPDATE: 'bounds:update',
  BOUNDS_DELETE: 'bounds:delete',

  // Stock Transactions
  STOCK_TRANSACTIONS_READ: 'stock-transactions:read',

  // Audit Logs
  AUDIT_LOGS_READ: 'audit-logs:read',

  // Wallets
  WALLETS_APPROVE: 'wallets:approve',
  WALLETS_REJECT: 'wallets:reject',
} as const

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]
