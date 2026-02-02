/**
 * Roles Store
 * Manages role and permission data with API integration
 */

import { create } from 'zustand'
import { rolesApi, permissionsApi } from '@/lib/api'
import type { Role, Permission, PaginationParams, PaginationMeta, CreateRoleRequest, UpdateRoleRequest } from '@/lib/types'

// ============================================================================
// Types
// ============================================================================

interface RolePermission {
  id: string
  permission_id: string
  permission_name: string | null
  permission_code: string | null
  created_at: string
}

interface RolesState {
  // Data
  roles: Role[]
  currentRole: Role | null
  permissions: Permission[]
  rolePermissions: RolePermission[]
  
  // Pagination
  pagination: PaginationMeta
  
  // Loading states
  isLoading: boolean
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
  isLoadingPermissions: boolean
  isAssigningPermissions: boolean
  
  // Error
  error: string | null

  // Actions
  fetchRoles: (params?: PaginationParams) => Promise<void>
  fetchRoleById: (id: string) => Promise<Role | null>
  createRole: (data: CreateRoleRequest) => Promise<Role>
  updateRole: (id: string, data: UpdateRoleRequest) => Promise<Role>
  deleteRole: (id: string) => Promise<void>
  
  // Permissions
  fetchPermissions: (params?: PaginationParams) => Promise<void>
  fetchRolePermissions: (roleId: string) => Promise<void>
  assignPermissionToRole: (roleId: string, permissionId: string) => Promise<void>
  removePermissionFromRole: (roleId: string, permissionId: string) => Promise<void>
  assignMultiplePermissionsToRole: (roleId: string, permissionIds: string[]) => Promise<void>
  
  // Utility
  setCurrentRole: (role: Role | null) => void
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

export const useRolesStore = create<RolesState>((set, get) => ({
  // Initial state
  roles: [],
  currentRole: null,
  permissions: [],
  rolePermissions: [],
  pagination: initialPagination,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isLoadingPermissions: false,
  isAssigningPermissions: false,
  error: null,

  // Fetch all roles with pagination
  fetchRoles: async (params) => {
    set({ isLoading: true, error: null })

    try {
      const response = await rolesApi.getAll(params)

      set({
        roles: response.data,
        pagination: {
          total: response.total,
          page: response.page,
          limit: response.limit,
          totalPages: response.totalPages,
        },
        isLoading: false,
      })
    } catch (error) {
      const message = (error as { message?: string })?.message || 'Failed to fetch roles'
      set({ error: message, isLoading: false })
    }
  },

  // Fetch single role
  fetchRoleById: async (id) => {
    set({ isLoading: true, error: null })

    try {
      const response = await rolesApi.getById(id)
      set({ currentRole: response.data, isLoading: false })
      return response.data
    } catch (error) {
      const message = (error as { message?: string })?.message || 'Failed to fetch role'
      set({ error: message, isLoading: false })
      return null
    }
  },

  // Create new role
  createRole: async (data) => {
    set({ isCreating: true, error: null })

    try {
      const response = await rolesApi.create(data)
      
      set((state) => ({
        roles: [response.data, ...state.roles],
        isCreating: false,
      }))

      return response.data
    } catch (error) {
      const message = (error as { message?: string })?.message || 'Failed to create role'
      set({ error: message, isCreating: false })
      throw error
    }
  },

  // Update role
  updateRole: async (id, data) => {
    set({ isUpdating: true, error: null })

    try {
      const response = await rolesApi.update(id, data)
      
      set((state) => ({
        roles: state.roles.map((r) => (r.id === id ? response.data : r)),
        currentRole: state.currentRole?.id === id ? response.data : state.currentRole,
        isUpdating: false,
      }))

      return response.data
    } catch (error) {
      const message = (error as { message?: string })?.message || 'Failed to update role'
      set({ error: message, isUpdating: false })
      throw error
    }
  },

  // Delete role
  deleteRole: async (id) => {
    set({ isDeleting: true, error: null })

    try {
      await rolesApi.delete(id)
      
      set((state) => ({
        roles: state.roles.filter((r) => r.id !== id),
        currentRole: state.currentRole?.id === id ? null : state.currentRole,
        isDeleting: false,
      }))
    } catch (error) {
      const message = (error as { message?: string })?.message || 'Failed to delete role'
      set({ error: message, isDeleting: false })
      throw error
    }
  },

  // Fetch all permissions
  fetchPermissions: async (params) => {
    set({ isLoadingPermissions: true })

    try {
      const response = await permissionsApi.getAll(params)
      set({ permissions: response.data, isLoadingPermissions: false })
    } catch (error) {
      console.error('Failed to fetch permissions:', error)
      set({ isLoadingPermissions: false })
    }
  },

  // Fetch permissions for a specific role
  fetchRolePermissions: async (roleId) => {
    set({ isLoadingPermissions: true, error: null })

    try {
      const response = await rolesApi.getPermissions(roleId)
      set({ rolePermissions: response.data, isLoadingPermissions: false })
    } catch (error) {
      const message = (error as { message?: string })?.message || 'Failed to fetch role permissions'
      set({ error: message, isLoadingPermissions: false })
    }
  },

  // Assign single permission to role
  assignPermissionToRole: async (roleId, permissionId) => {
    set({ isAssigningPermissions: true, error: null })

    try {
      await rolesApi.assignPermission(roleId, permissionId)
      
      // Refresh role permissions
      const response = await rolesApi.getPermissions(roleId)
      set({ rolePermissions: response.data, isAssigningPermissions: false })
    } catch (error) {
      const message = (error as { message?: string })?.message || 'Failed to assign permission'
      set({ error: message, isAssigningPermissions: false })
      throw error
    }
  },

  // Remove permission from role
  removePermissionFromRole: async (roleId, permissionId) => {
    set({ isAssigningPermissions: true, error: null })

    try {
      await rolesApi.removePermission(roleId, permissionId)
      
      // Refresh role permissions
      const response = await rolesApi.getPermissions(roleId)
      set({ rolePermissions: response.data, isAssigningPermissions: false })
    } catch (error) {
      const message = (error as { message?: string })?.message || 'Failed to remove permission'
      set({ error: message, isAssigningPermissions: false })
      throw error
    }
  },

  // Assign multiple permissions to role
  assignMultiplePermissionsToRole: async (roleId, permissionIds) => {
    set({ isAssigningPermissions: true, error: null })

    try {
      await rolesApi.assignMultiplePermissions(roleId, permissionIds)
      
      // Refresh role permissions
      const response = await rolesApi.getPermissions(roleId)
      set({ rolePermissions: response.data, isAssigningPermissions: false })
    } catch (error) {
      const message = (error as { message?: string })?.message || 'Failed to assign permissions'
      set({ error: message, isAssigningPermissions: false })
      throw error
    }
  },

  // Set current role
  setCurrentRole: (role) => {
    set({ currentRole: role })
  },

  // Clear error
  clearError: () => {
    set({ error: null })
  },
}))
