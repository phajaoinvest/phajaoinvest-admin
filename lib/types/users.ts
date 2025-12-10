/**
 * User Types (Admin Users)
 */

import { BaseEntity, UserStatus, Gender, Auditable, SoftDeletable } from './common'

// ============================================================================
// User Entity
// ============================================================================

export interface User extends BaseEntity, Auditable, SoftDeletable {
  number: string
  first_name: string
  last_name: string | null
  username: string
  gender: Gender
  tel: string | null
  address: string | null
  status: UserStatus
  profile: string | null
  role_id: string | null
  admin_role_id: string | null
  role?: Role | null
}

// ============================================================================
// Role & Permission
// ============================================================================

export interface Role extends BaseEntity {
  name: string
  description?: string | null
  status?: 'active' | 'inactive'
  // Permissions are only populated when fetching single role with relations
  permissions?: string[]
  rolePermissions?: RolePermission[]
}

export interface RolePermission extends BaseEntity {
  name: string
  status: 'active' | 'inactive'
  role_id: string
  permission_id: string
  permission?: Permission
}

export interface Permission extends BaseEntity {
  name: string
  description?: string | null
  group_name?: string | null
  status?: 'active' | 'inactive'
}

// ============================================================================
// DTOs
// ============================================================================

export interface CreateUserRequest {
  number?: string
  first_name: string
  last_name?: string
  username: string
  password: string
  gender: Gender
  tel?: string
  address?: string
  status?: UserStatus
  role_id?: string
}

export interface UpdateUserRequest {
  first_name?: string
  last_name?: string
  gender?: Gender
  tel?: string
  address?: string
  status?: UserStatus
  role_id?: string
  profile?: string
}

export interface CreateRoleRequest {
  name: string
  description?: string
  permission_ids: string[]
}

export interface UpdateRoleRequest {
  name?: string
  description?: string
  permission_ids?: string[]
}

export interface CreatePermissionRequest {
  name: string
  description?: string
  module: string
}

export interface UpdatePermissionRequest {
  name?: string
  description?: string
  module?: string
}

// ============================================================================
// Filters
// ============================================================================

export interface UserFilters {
  status?: UserStatus
  role_id?: string
  gender?: Gender
  search?: string
}
