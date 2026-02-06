'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useUsersStore, useRolesStore } from '@/lib/stores'
import { useDebounce, usePagination } from '@/hooks'
import { User, Role, UserStatus, Gender } from '@/lib/types'
import { AlertTriangle } from 'lucide-react'
import { StaffStats } from './components/StaffStats'
import { StaffTable } from './components/StaffTable'
import { RoleTable } from './components/RoleTable'
import { StaffDialogs } from './components/StaffDialogs'
import { RoleDialogs } from './components/RoleDialogs'
import { PermissionsDialog } from './components/PermissionsDialog'

export default function StaffPage() {
  // Users Store state
  const {
    users,
    pagination: storePagination,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error: userError,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    clearError: clearUserError,
  } = useUsersStore()

  // Roles Store state
  const {
    roles,
    permissions,
    rolePermissions,
    isLoading: isRolesLoading,
    isCreating: isCreatingRole,
    isUpdating: isUpdatingRole,
    isDeleting: isDeletingRole,
    isLoadingPermissions,
    isAssigningPermissions,
    error: rolesError,
    fetchRoles,
    fetchPermissions,
    fetchRolePermissions,
    createRole,
    updateRole,
    deleteRole,
    assignMultiplePermissionsToRole,
    clearError: clearRolesError,
  } = useRolesStore()

  // Local state for search/filters
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | UserStatus>('all')
  const debouncedSearch = useDebounce(searchTerm, 300)

  // Pagination
  const {
    page,
    limit,
    totalPages,
    setPage,
    setLimit,
    updateFromMeta,
  } = usePagination({ initialLimit: 10 })

  // Role pagination
  const {
    page: rolePage,
    setPage: setRolePage,
  } = usePagination({ initialLimit: 10 })

  // Staff modal state
  const [showStaffModal, setShowStaffModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<User | null>(null)
  const [isEditingStaff, setIsEditingStaff] = useState(false)
  const [staffFormData, setStaffFormData] = useState({
    number: '',
    first_name: '',
    last_name: '',
    username: '',
    password: '',
    gender: 'male' as Gender,
    tel: '',
    address: '',
    status: 'active' as UserStatus,
    profile: '',
    role_id: '',
  })

  // Role modal state
  const [roleSearchTerm, setRoleSearchTerm] = useState('')
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [showDeleteRoleModal, setShowDeleteRoleModal] = useState(false)
  const [showPermissionsModal, setShowPermissionsModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [isEditingRole, setIsEditingRole] = useState(false)
  const [roleFormData, setRoleFormData] = useState({
    name: '',
    description: '',
  })
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])

  // Load initial data
  useEffect(() => {
    fetchRoles({ limit: 100 })
    fetchPermissions({ limit: 100 })
  }, [fetchRoles, fetchPermissions])

  // Load users
  const loadUsers = useCallback(() => {
    const params: Record<string, unknown> = {
      page,
      limit,
      search: debouncedSearch || undefined,
    }
    if (filterStatus !== 'all') {
      params.status = filterStatus
    }
    fetchUsers(params as Parameters<typeof fetchUsers>[0])
  }, [page, limit, debouncedSearch, filterStatus, fetchUsers])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  // Update pagination total when store pagination changes
  useEffect(() => {
    updateFromMeta(storePagination)
  }, [storePagination, updateFromMeta])

  // Reset page when search/filter changes
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, filterStatus, setPage])

  // Stats calculations
  const totalStaff = storePagination.total
  const activeStaff = users.filter((u) => u.status === 'active').length

  // Filter roles
  const filteredRoles = roles.filter((r) =>
    r.name.toLowerCase().includes(roleSearchTerm.toLowerCase()) ||
    (r.description || '').toLowerCase().includes(roleSearchTerm.toLowerCase())
  )

  // Paginate roles
  const roleItemsPerPage = 10
  const totalRolePages = Math.ceil(filteredRoles.length / roleItemsPerPage)
  const paginatedRoles = filteredRoles.slice(
    (rolePage - 1) * roleItemsPerPage,
    rolePage * roleItemsPerPage
  )

  // Staff handlers
  const handleAddStaff = () => {
    setIsEditingStaff(false)
    setSelectedStaff(null)
    setStaffFormData({
      number: '',
      first_name: '',
      last_name: '',
      username: '',
      password: '',
      gender: 'male' as Gender,
      tel: '',
      address: '',
      status: 'active' as UserStatus,
      profile: '',
      role_id: '',
    })
    setShowStaffModal(true)
  }

  const handleEditStaff = (user: User) => {
    setIsEditingStaff(true)
    setSelectedStaff(user)
    setStaffFormData({
      number: user.number || '',
      first_name: user.first_name,
      last_name: user.last_name || '',
      username: user.username,
      password: '',
      gender: user.gender || 'male',
      tel: user.tel || '',
      address: user.address || '',
      status: user.status,
      profile: user.profile || '',
      role_id: user.role_id || '',
    })
    setShowStaffModal(true)
  }

  const handleSaveStaff = async () => {
    try {
      if (isEditingStaff && selectedStaff) {
        await updateUser(selectedStaff.id, {
          number: staffFormData.number || undefined,
          first_name: staffFormData.first_name,
          last_name: staffFormData.last_name || undefined,
          gender: staffFormData.gender || undefined,
          tel: staffFormData.tel || undefined,
          address: staffFormData.address || undefined,
          status: staffFormData.status,
          profile: staffFormData.profile || undefined,
          role_id: staffFormData.role_id || undefined,
        })
      } else {
        await createUser({
          number: staffFormData.number || undefined,
          first_name: staffFormData.first_name,
          last_name: staffFormData.last_name || undefined,
          username: staffFormData.username,
          password: staffFormData.password,
          gender: staffFormData.gender || undefined,
          tel: staffFormData.tel || undefined,
          address: staffFormData.address || undefined,
          status: staffFormData.status,
          profile: staffFormData.profile || undefined,
          role_id: staffFormData.role_id || undefined,
        })
      }
      setShowStaffModal(false)
      loadUsers()
    } catch (err) {
      // Error is handled by the store
    }
  }

  const handleDeleteStaff = async () => {
    if (selectedStaff) {
      try {
        await deleteUser(selectedStaff.id)
        setShowDeleteModal(false)
        setSelectedStaff(null)
        loadUsers()
      } catch (err) {
        // Error is handled by the store
      }
    }
  }

  // Role handlers
  const handleAddRole = () => {
    setIsEditingRole(false)
    setSelectedRole(null)
    setRoleFormData({ name: '', description: '' })
    setSelectedPermissions([])
    setShowRoleModal(true)
  }

  const handleEditRole = (role: Role) => {
    setIsEditingRole(true)
    setSelectedRole(role)
    setRoleFormData({
      name: role.name,
      description: role.description || '',
    })
    setShowRoleModal(true)
  }

  const handleSaveRole = async () => {
    try {
      if (isEditingRole && selectedRole) {
        await updateRole(selectedRole.id, {
          name: roleFormData.name || undefined,
          description: roleFormData.description || undefined,
        })
      } else {
        await createRole({
          name: roleFormData.name,
          description: roleFormData.description || undefined,
        })
      }
      setShowRoleModal(false)
      fetchRoles({ limit: 100 })
    } catch (err) {
      // Error is handled by the store
    }
  }

  const handleDeleteRole = async () => {
    if (selectedRole) {
      try {
        await deleteRole(selectedRole.id)
        setShowDeleteRoleModal(false)
        setSelectedRole(null)
        fetchRoles({ limit: 100 })
      } catch (err) {
        // Error is handled by the store
      }
    }
  }

  const handleManagePermissions = async (role: Role) => {
    setSelectedRole(role)
    setShowPermissionsModal(true)

    // Load existing permissions for this role
    try {
      const perms = await fetchRolePermissions(role.id)
      // Extract permission IDs from role permissions
      const permIds = perms.map((rp) => rp.permission_id)
      setSelectedPermissions(permIds)
    } catch (err) {
      console.error('Failed to load role permissions:', err)
    }
  }

  const handleSavePermissions = async () => {
    if (selectedRole) {
      try {
        await assignMultiplePermissionsToRole(selectedRole.id, selectedPermissions)
        await fetchRoles({ page, limit })
        setShowPermissionsModal(false)
        setSelectedRole(null)
        setSelectedPermissions([])
      } catch (err) {
        // Error is handled by the store
      }
    }
  }

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((p) => p !== permissionId)
        : [...prev, permissionId]
    )
  }

  const formatPermissionName = (perm: string) => {
    const parts = perm.split(':')
    const action = parts[parts.length - 1]
    return `Can ${action}`
  }

  const error = userError || rolesError

  return (
    <div className="space-y-6">
      {/* Error display */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{error}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              clearUserError()
              clearRolesError()
            }}
          >
            Dismiss
          </Button>
        </div>
      )}

      <Tabs defaultValue="staff" className="w-full">
        <TabsList className="bg-secondary/30">
          <TabsTrigger value="staff" className="text-sm border">
            Staff Management
          </TabsTrigger>
          <TabsTrigger value="roles" className="text-sm border">
            Roles & Permissions
          </TabsTrigger>
        </TabsList>

        {/* Staff Tab */}
        <TabsContent value="staff" className="space-y-6 mt-6">
          <StaffStats
            totalStaff={totalStaff}
            activeStaff={activeStaff}
            roles={roles}
          />

          <StaffTable
            users={users}
            roles={roles}
            isLoading={isLoading}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            page={page}
            setPage={setPage}
            limit={limit}
            setLimit={setLimit}
            totalPages={totalPages}
            totalStaff={storePagination.total}
            onLoadUsers={loadUsers}
            onAddStaff={handleAddStaff}
            onEditStaff={handleEditStaff}
            onViewStaff={(user) => {
              setSelectedStaff(user)
              setShowViewModal(true)
            }}
            onDeleteStaff={(user) => {
              setSelectedStaff(user)
              setShowDeleteModal(true)
            }}
          />
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-6 mt-6">
          <RoleTable
            roles={paginatedRoles}
            isLoading={isRolesLoading}
            searchTerm={roleSearchTerm}
            setSearchTerm={setRoleSearchTerm}
            page={rolePage}
            setPage={setRolePage}
            totalPages={totalRolePages}
            totalRoles={filteredRoles.length}
            onAddRole={handleAddRole}
            onEditRole={handleEditRole}
            onDeleteRole={(role) => {
              setSelectedRole(role)
              setShowDeleteRoleModal(true)
            }}
            onManagePermissions={handleManagePermissions}
          />
        </TabsContent>
      </Tabs>

      <StaffDialogs
        showStaffModal={showStaffModal}
        setShowStaffModal={setShowStaffModal}
        isEditingStaff={isEditingStaff}
        staffFormData={staffFormData}
        setStaffFormData={setStaffFormData}
        isCreating={isCreating}
        isUpdating={isUpdating}
        handleSaveStaff={handleSaveStaff}
        roles={roles}
        showViewModal={showViewModal}
        setShowViewModal={setShowViewModal}
        selectedStaff={selectedStaff}
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        setSelectedStaff={setSelectedStaff}
        handleDeleteStaff={handleDeleteStaff}
        isDeleting={isDeleting}
      />

      <RoleDialogs
        showRoleModal={showRoleModal}
        setShowRoleModal={setShowRoleModal}
        isEditingRole={isEditingRole}
        roleFormData={roleFormData}
        setRoleFormData={setRoleFormData}
        isCreatingRole={isCreatingRole}
        isUpdatingRole={isUpdatingRole}
        handleSaveRole={handleSaveRole}
        showDeleteRoleModal={showDeleteRoleModal}
        setShowDeleteRoleModal={setShowDeleteRoleModal}
        selectedRole={selectedRole}
        setSelectedRole={setSelectedRole}
        handleDeleteRole={handleDeleteRole}
        isDeletingRole={isDeletingRole}
      />

      <PermissionsDialog
        isOpen={showPermissionsModal}
        onClose={() => {
          setShowPermissionsModal(false)
          setSelectedRole(null)
          setSelectedPermissions([])
        }}
        selectedRole={selectedRole}
        permissions={permissions}
        selectedPermissions={selectedPermissions}
        isLoadingPermissions={isLoadingPermissions}
        isAssigningPermissions={isAssigningPermissions}
        onTogglePermission={togglePermission}
        onSave={handleSavePermissions}
        formatPermissionName={formatPermissionName}
      />
    </div>
  )
}
