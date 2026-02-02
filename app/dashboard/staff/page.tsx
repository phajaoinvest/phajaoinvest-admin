'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { useUsersStore, useRolesStore } from '@/lib/stores'
import { useDebounce, usePagination } from '@/hooks'
import type { User, Role, UserStatus, Gender } from '@/lib/types'
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Eye, 
  Edit2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  User as UserIcon, 
  UserCheck, 
  KeyRound,
  RefreshCw,
  Loader2,
  AlertTriangle
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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

  // Permission groups
  const permissionGroups = [
    {
      module: 'Customers',
      permissions: ['customers:read', 'customers:create', 'customers:update', 'customers:delete'],
    },
    {
      module: 'Users (Staff)',
      permissions: ['users:read', 'users:create', 'users:update', 'users:delete'],
    },
    {
      module: 'Roles',
      permissions: ['roles:read', 'roles:create', 'roles:update', 'roles:delete'],
    },
    {
      module: 'Permissions',
      permissions: ['permissions:read', 'permissions:create', 'permissions:update', 'permissions:delete'],
    },
    {
      module: 'Stocks',
      permissions: ['stocks:read', 'stocks:create', 'stocks:update', 'stocks:delete'],
    },
    {
      module: 'Stock Categories',
      permissions: ['stock-categories:read', 'stock-categories:create', 'stock-categories:update', 'stock-categories:delete'],
    },
    {
      module: 'Invest Types',
      permissions: ['invest-types:read', 'invest-types:create', 'invest-types:update', 'invest-types:delete'],
    },
    {
      module: 'Bounds',
      permissions: ['bounds:read', 'bounds:create', 'bounds:update', 'bounds:delete'],
    },
    {
      module: 'Subscription Packages',
      permissions: ['subscription-packages:read', 'subscription-packages:create', 'subscription-packages:update', 'subscription-packages:delete'],
    },
    {
      module: 'Wallets',
      permissions: ['wallets:read', 'wallets:topup:approve', 'wallets:topup:reject'],
    },
    {
      module: 'Customer Stocks',
      permissions: ['customer-stocks:read'],
    },
    {
      module: 'Stock Transactions',
      permissions: ['stock-transactions:read'],
    },
    {
      module: 'Audit Logs',
      permissions: ['audit-logs:read'],
    },
  ]

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
      gender: 'male',
      tel: '',
      address: '',
      status: 'active',
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
      await fetchRolePermissions(role.id)
      // Extract permission IDs from role permissions
      const permIds = rolePermissions.map((rp) => rp.permission_id)
      setSelectedPermissions(permIds)
    } catch (err) {
      console.error('Failed to load role permissions:', err)
    }
  }

  const handleSavePermissions = async () => {
    if (selectedRole) {
      try {
        await assignMultiplePermissionsToRole(selectedRole.id, selectedPermissions)
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50/50 to-transparent rounded-sm">
              <CardContent className="py-0 px-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Total Staff
                    </p>
                    <p className="text-lg font-bold">{totalStaff}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <UserIcon size={18} className="text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50/50 to-transparent rounded-sm">
              <CardContent className="py-0 px-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Active Staff
                    </p>
                    <p className="text-lg font-bold">{activeStaff}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <UserCheck size={18} className="text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/5 to-transparent rounded-sm">
              <CardContent className="py-0 px-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Total Roles
                    </p>
                    <p className="text-lg font-bold">{roles.length}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <KeyRound size={18} className="text-yellow-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Staff Table */}
          <Card className="border-0 shadow-sm overflow-hidden">
            <CardHeader className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-md font-normal">Staff Members</CardTitle>
                  <CardDescription className="text-xs">
                    Showing {users.length > 0 ? (page - 1) * limit + 1 : 0}-
                    {Math.min(page * limit, storePagination.total)} of {storePagination.total} staff members
                  </CardDescription>
                </div>
                <div className="flex items-start justify-start gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search staff..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 text-sm h-9"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as 'all' | UserStatus)}
                    className="h-9 px-2.5 py-1.5 rounded-md border border-border text-sm bg-background"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={loadUsers}
                    disabled={isLoading}
                    className="h-9"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button
                    onClick={handleAddStaff}
                    className="bg-primary hover:bg-primary/90 text-sm h-9 text-white"
                  >
                    <Plus className="w-4 h-4" />
                    Add Staff
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border rounded-md bg-gray-100">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Staff ID
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Name
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Username
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Role
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center">
                          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-muted-foreground">
                          No staff members found
                        </td>
                      </tr>
                    ) : (
                      users.map((member) => (
                        <tr key={member.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                          <td className="py-3 px-4 font-medium">{member.number || '-'}</td>
                          <td className="py-3 px-4">
                            {member.first_name} {member.last_name}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">{member.username}</td>
                          <td className="py-3 px-4">
                            <span className="text-sm">
                              {roles.find((r) => r.id === member.role_id)?.name || 'No Role'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              variant={member.status === 'active' ? 'default' : 'secondary'}
                              className={
                                member.status === 'active'
                                  ? 'bg-green-100 text-green-700 hover:bg-green-100'
                                  : member.status === 'suspended'
                                    ? 'bg-red-100 text-red-700 hover:bg-red-100'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-100'
                              }
                            >
                              {member.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedStaff(member)
                                    setShowViewModal(true)
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditStaff(member)}>
                                  <Edit2 className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedStaff(member)
                                    setShowDeleteModal(true)
                                  }}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-muted-foreground">
                      Page {page} of {totalPages}
                    </div>
                    <select
                      value={limit}
                      onChange={(e) => setLimit(Number(e.target.value))}
                      className="h-8 px-2 rounded-md border border-border text-sm bg-background"
                    >
                      <option value={10}>10 per page</option>
                      <option value={25}>25 per page</option>
                      <option value={50}>50 per page</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1 || isLoading}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages || isLoading}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-6 mt-6">
          <Card className="border-0 shadow-sm overflow-hidden">
            <CardHeader className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-md font-bold">Roles & Permissions</CardTitle>
                  <CardDescription className="text-xs">
                    Showing {paginatedRoles.length} of {filteredRoles.length} roles
                  </CardDescription>
                </div>
                <div className="flex items-start justify-start gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search roles..."
                      value={roleSearchTerm}
                      onChange={(e) => setRoleSearchTerm(e.target.value)}
                      className="pl-10 text-sm h-9"
                    />
                  </div>
                  <Button
                    onClick={handleAddRole}
                    className="bg-primary hover:bg-primary/90 text-sm h-9 text-white"
                  >
                    <Plus className="w-4 h-4" />
                    Add Role
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-gray-100">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Role Name
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Description
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Permissions
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isRolesLoading ? (
                      <tr>
                        <td colSpan={4} className="py-12 text-center">
                          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                        </td>
                      </tr>
                    ) : paginatedRoles.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-muted-foreground">
                          No roles found
                        </td>
                      </tr>
                    ) : (
                      paginatedRoles.map((role) => (
                        <tr key={role.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                          <td className="py-3 px-4 font-medium">{role.name}</td>
                          <td className="py-3 px-4 text-muted-foreground text-xs">
                            {role.description || 'No description'}
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-xs text-muted-foreground">
                              {role.rolePermissions?.length || 0} permissions
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleManagePermissions(role)}
                                className="text-xs h-8"
                              >
                                <KeyRound className="h-3 w-3 mr-1" />
                                Permissions
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditRole(role)}>
                                    <Edit2 className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedRole(role)
                                      setShowDeleteRoleModal(true)
                                    }}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalRolePages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <div className="text-sm text-muted-foreground">
                    Page {rolePage} of {totalRolePages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRolePage(Math.max(1, rolePage - 1))}
                      disabled={rolePage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRolePage(Math.min(totalRolePages, rolePage + 1))}
                      disabled={rolePage === totalRolePages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Staff Create/Edit Modal */}
      {showStaffModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{isEditingStaff ? 'Edit Staff' : 'Add New Staff'}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowStaffModal(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isEditingStaff && (
                <>
                  <div>
                    <label className="text-sm font-medium">Username *</label>
                    <Input
                      value={staffFormData.username}
                      onChange={(e) =>
                        setStaffFormData({ ...staffFormData, username: e.target.value })
                      }
                      placeholder="Enter username"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Password *</label>
                    <Input
                      type="password"
                      value={staffFormData.password}
                      onChange={(e) =>
                        setStaffFormData({ ...staffFormData, password: e.target.value })
                      }
                      placeholder="Enter password"
                      className="mt-1"
                    />
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">First Name *</label>
                  <Input
                    value={staffFormData.first_name}
                    onChange={(e) =>
                      setStaffFormData({ ...staffFormData, first_name: e.target.value })
                    }
                    placeholder="Enter first name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Last Name</label>
                  <Input
                    value={staffFormData.last_name}
                    onChange={(e) =>
                      setStaffFormData({ ...staffFormData, last_name: e.target.value })
                    }
                    placeholder="Enter last name"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Staff ID</label>
                  <Input
                    value={staffFormData.number}
                    onChange={(e) =>
                      setStaffFormData({ ...staffFormData, number: e.target.value })
                    }
                    placeholder="Enter staff ID"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Gender</label>
                  <select
                    value={staffFormData.gender}
                    onChange={(e) =>
                      setStaffFormData({
                        ...staffFormData,
                        gender: e.target.value as Gender,
                      })
                    }
                    className="mt-1 h-9 px-2.5 py-1.5 rounded-md border border-border text-sm w-full"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <Input
                    value={staffFormData.tel}
                    onChange={(e) =>
                      setStaffFormData({ ...staffFormData, tel: e.target.value })
                    }
                    placeholder="Enter phone number"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Role</label>
                  <select
                    value={staffFormData.role_id}
                    onChange={(e) =>
                      setStaffFormData({ ...staffFormData, role_id: e.target.value })
                    }
                    className="mt-1 h-9 px-2.5 py-1.5 rounded-md border border-border text-sm w-full"
                  >
                    <option value="">Select a role</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Address</label>
                <Input
                  value={staffFormData.address}
                  onChange={(e) =>
                    setStaffFormData({ ...staffFormData, address: e.target.value })
                  }
                  placeholder="Enter address"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <select
                    value={staffFormData.status}
                    onChange={(e) =>
                      setStaffFormData({
                        ...staffFormData,
                        status: e.target.value as UserStatus,
                      })
                    }
                    className="mt-1 h-9 px-2.5 py-1.5 rounded-md border border-border text-sm w-full"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowStaffModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveStaff}
                  disabled={isCreating || isUpdating}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isCreating || isUpdating ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  {isEditingStaff ? 'Update' : 'Create'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Staff View Modal */}
      {showViewModal && selectedStaff && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Staff Details</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowViewModal(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground font-medium">Staff ID</label>
                  <p className="text-sm font-medium">{selectedStaff.number || '-'}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium">Status</label>
                  <Badge className="mt-1">{selectedStaff.status}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground font-medium">First Name</label>
                  <p className="text-sm font-medium">{selectedStaff.first_name}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium">Last Name</label>
                  <p className="text-sm font-medium">{selectedStaff.last_name || '-'}</p>
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium">Username</label>
                <p className="text-sm font-medium">{selectedStaff.username}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground font-medium">Gender</label>
                  <p className="text-sm font-medium capitalize">{selectedStaff.gender || '-'}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium">Phone</label>
                  <p className="text-sm font-medium">{selectedStaff.tel || '-'}</p>
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium">Address</label>
                <p className="text-sm font-medium">{selectedStaff.address || '-'}</p>
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium">Role</label>
                <p className="text-sm font-medium">
                  {roles.find((r) => r.id === selectedStaff.role_id)?.name || 'No Role Assigned'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Staff Delete Modal */}
      {showDeleteModal && selectedStaff && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-red-600">Delete Staff Member</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete{' '}
                <span className="font-semibold">{selectedStaff.first_name}</span>? This action cannot be
                undone.
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false)
                    setSelectedStaff(null)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteStaff}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeleting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Role Create/Edit Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{isEditingRole ? 'Edit Role' : 'Add New Role'}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRoleModal(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Role Name *</label>
                <Input
                  value={roleFormData.name}
                  onChange={(e) =>
                    setRoleFormData({ ...roleFormData, name: e.target.value })
                  }
                  placeholder="Enter role name"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={roleFormData.description}
                  onChange={(e) =>
                    setRoleFormData({ ...roleFormData, description: e.target.value })
                  }
                  placeholder="Enter role description"
                  className="mt-1 w-full px-3 py-2 border border-border rounded-md text-sm"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowRoleModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveRole}
                  disabled={isCreatingRole || isUpdatingRole || !roleFormData.name}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isCreatingRole || isUpdatingRole ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  {isEditingRole ? 'Update' : 'Create'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Role Delete Modal */}
      {showDeleteRoleModal && selectedRole && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-red-600">Delete Role</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete the role{' '}
                <span className="font-semibold">{selectedRole.name}</span>? This action cannot be
                undone.
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteRoleModal(false)
                    setSelectedRole(null)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteRole}
                  disabled={isDeletingRole}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeletingRole && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Permissions Management Modal */}
      {showPermissionsModal && selectedRole && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Manage Permissions for {selectedRole.name}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPermissionsModal(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoadingPermissions ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  {permissionGroups.map((group) => (
                    <div key={group.module} className="space-y-3">
                      <h3 className="font-semibold text-sm text-foreground">
                        {group.module}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pl-4">
                        {group.permissions.map((perm) => {
                          const permission = permissions.find((p) => p.name === perm)
                          return (
                            <div key={perm} className="flex items-center space-x-2">
                              <Checkbox
                                id={perm}
                                checked={selectedPermissions.includes(perm)}
                                onCheckedChange={() => togglePermission(perm)}
                              />
                              <label
                                htmlFor={perm}
                                className="text-sm font-medium cursor-pointer"
                              >
                                {formatPermissionName(perm)}
                              </label>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPermissionsModal(false)
                    setSelectedRole(null)
                    setSelectedPermissions([])
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSavePermissions}
                  disabled={isAssigningPermissions}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isAssigningPermissions && (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  )}
                  Save Permissions
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
