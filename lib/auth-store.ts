/**
 * Auth Store Re-export
 * This file re-exports from the main stores location for backward compatibility
 * @deprecated Import from '@/lib/stores' instead
 */

export { useAuthStore, selectUser, selectIsAuthenticated, selectIsLoading, selectError, selectPermissions } from './stores/auth-store'
