/**
 * Users API Service
 * Admin users management
 */

import { apiClient } from './client'
import type {
  PaginationParams,
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UserFilters,
  Role,
  CreateRoleRequest,
  UpdateRoleRequest,
  Permission,
  CreatePermissionRequest,
  UpdatePermissionRequest,
} from '@/lib/types'

// ============================================================================
// Users
// ============================================================================

export const usersApi = {
  /**
   * Get paginated list of users
   */
  async getAll(params?: PaginationParams & UserFilters) {
    return apiClient.getPaginated<User>('/users', params)
  },

  /**
   * Get user by ID
   */
  async getById(id: string) {
    return apiClient.get<User>(`/users/${id}`)
  },

  /**
   * Create new user
   */
  async create(data: CreateUserRequest) {
    return apiClient.post<User>('/users', data)
  },

  /**
   * Update user
   */
  async update(id: string, data: UpdateUserRequest) {
    return apiClient.patch<User>(`/users/${id}`, data)
  },

  /**
   * Delete user
   */
  async delete(id: string) {
    return apiClient.delete(`/users/${id}`)
  },
}

// ============================================================================
// Roles
// ============================================================================

export const rolesApi = {
  /**
   * Get paginated list of roles
   */
  async getAll(params?: PaginationParams) {
    return apiClient.getPaginated<Role>('/roles', params)
  },

  /**
   * Get role by ID
   */
  async getById(id: string) {
    return apiClient.get<Role>(`/roles/${id}`)
  },

  /**
   * Create new role
   */
  async create(data: CreateRoleRequest) {
    return apiClient.post<Role>('/roles', data)
  },

  /**
   * Update role
   */
  async update(id: string, data: UpdateRoleRequest) {
    return apiClient.patch<Role>(`/roles/${id}`, data)
  },

  /**
   * Delete role
   */
  async delete(id: string) {
    return apiClient.delete(`/roles/${id}`)
  },

  /**
   * Get role permissions
   */
  async getPermissions(roleId: string) {
    return apiClient.get<
      Array<{
        id: string
        permission_id: string
        permission_name: string | null
        permission_code: string | null
        created_at: string
      }>
    >(`/roles/${roleId}/permissions`)
  },

  /**
   * Assign permission to role
   */
  async assignPermission(roleId: string, permissionId: string) {
    return apiClient.post(`/roles/${roleId}/permissions`, { permission_id: permissionId })
  },

  /**
   * Remove permission from role
   */
  async removePermission(roleId: string, permissionId: string) {
    return apiClient.delete(`/roles/${roleId}/permissions/${permissionId}`)
  },

  /**
   * Assign multiple permissions to role
   */
  async assignMultiplePermissions(roleId: string, permissionIds: string[]) {
    return apiClient.post(`/roles/${roleId}/permissions/bulk`, { permission_ids: permissionIds })
  },
}

// ============================================================================
// Permissions
// ============================================================================

export const permissionsApi = {
  /**
   * Get paginated list of permissions
   */
  async getAll(params?: PaginationParams) {
    return apiClient.getPaginated<Permission>('/permissions', params)
  },

  /**
   * Get permission by ID
   */
  async getById(id: string) {
    return apiClient.get<Permission>(`/permissions/${id}`)
  },

  /**
   * Create new permission
   */
  async create(data: CreatePermissionRequest) {
    return apiClient.post<Permission>('/permissions', data)
  },

  /**
   * Update permission
   */
  async update(id: string, data: UpdatePermissionRequest) {
    return apiClient.patch<Permission>(`/permissions/${id}`, data)
  },

  /**
   * Delete permission
   */
  async delete(id: string) {
    return apiClient.delete(`/permissions/${id}`)
  },
}
