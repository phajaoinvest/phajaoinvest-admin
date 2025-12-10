'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { useUsersStore } from '@/lib/stores'
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
  // Store state
  const {
    users,
    roles,
    pagination: storePagination,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    isLoadingRoles,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    fetchRoles,
    clearError,
  } = useUsersStore()

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

  // Staff modal state
  const [showStaffModal, setShowStaffModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<User | null>(null)
  const [isEditing, setIsEditing] = useState(false)
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

  // Role state
  const [roleSearchTerm, setRoleSearchTerm] = useState('')
  const [roleCurrentPage, setRoleCurrentPage] = useState(1)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [showDeleteRoleModal, setShowDeleteRoleModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [isEditingRole, setIsEditingRole] = useState(false)
  const [roleFormData, setRoleFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  })

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

  // Initial load and refetch on filter changes
  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  // Load roles
  useEffect(() => {
    fetchRoles()
  }, [fetchRoles])

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

  // Role filtering (client-side since roles are typically small list)
  const filteredRoles = roles.filter(
    (r) =>
      r.name.toLowerCase().includes(roleSearchTerm.toLowerCase()) ||
      (r.description || '').toLowerCase().includes(roleSearchTerm.toLowerCase())
  )
  const roleItemsPerPage = 10
  const totalRolePages = Math.ceil(filteredRoles.length / roleItemsPerPage)
  const paginatedRoles = filteredRoles.slice(
    (roleCurrentPage - 1) * roleItemsPerPage,
    roleCurrentPage * roleItemsPerPage
  )

  // Staff handlers
  const handleAddStaff = () => {
    setIsEditing(false)
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
    setIsEditing(true)
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
      if (isEditing && selectedStaff) {
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

  // Role handlers - Note: Role API needs to be connected when available
  const handleAddRole = () => {
    setIsEditingRole(false)
    setSelectedRole(null)
    setRoleFormData({
      name: '',
      description: '',
      permissions: [],
    })
    setShowRoleModal(true)
  }

  const handleEditRole = (role: Role) => {
    setIsEditingRole(true)
    setSelectedRole(role)
    setRoleFormData({
      name: role.name,
      description: role.description || '',
      permissions: role.permissions || [],
    })
    setShowRoleModal(true)
  }

  const handleSaveRole = async () => {
    // TODO: Connect to roles API when available
    // For now, roles are managed through the users store
    setShowRoleModal(false)
  }

  const handleDeleteRole = async () => {
    if (selectedRole) {
      // TODO: Connect to roles API when available
      setShowDeleteRoleModal(false)
      setSelectedRole(null)
    }
  }

  // Permission groups matching backend format: <resource>:<action>
  const permissionGroups = [
    {
      module: 'Customers',
      permissions: ['customers:read', 'customers:create', 'customers:update', 'customers:delete']
    },
    {
      module: 'Users (Staff)',
      permissions: ['users:read', 'users:create', 'users:update', 'users:delete']
    },
    {
      module: 'Roles',
      permissions: ['roles:read', 'roles:create', 'roles:update', 'roles:delete']
    },
    {
      module: 'Permissions',
      permissions: ['permissions:read', 'permissions:create', 'permissions:update', 'permissions:delete']
    },
    {
      module: 'Stocks',
      permissions: ['stocks:read', 'stocks:create', 'stocks:update', 'stocks:delete']
    },
    {
      module: 'Stock Categories',
      permissions: ['stock-categories:read', 'stock-categories:create', 'stock-categories:update', 'stock-categories:delete']
    },
    {
      module: 'Invest Types',
      permissions: ['invest-types:read', 'invest-types:create', 'invest-types:update', 'invest-types:delete']
    },
    {
      module: 'Bounds',
      permissions: ['bounds:read', 'bounds:create', 'bounds:update', 'bounds:delete']
    },
    {
      module: 'Subscription Packages',
      permissions: ['subscription-packages:read', 'subscription-packages:create', 'subscription-packages:update', 'subscription-packages:delete']
    },
    {
      module: 'Wallets',
      permissions: ['wallets:read', 'wallets:topup:approve', 'wallets:topup:reject']
    },
    {
      module: 'Customer Stocks',
      permissions: ['customer-stocks:read']
    },
    {
      module: 'Stock Transactions',
      permissions: ['stock-transactions:read']
    },
    {
      module: 'Audit Logs',
      permissions: ['audit-logs:read']
    },
  ]

  const togglePermission = (permission: string) => {
    setRoleFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }))
  }

  const formatPermissionName = (perm: string) => {
    // Convert 'customers:read' to 'Can read'
    const parts = perm.split(':')
    const action = parts[parts.length - 1]
    return `Can ${action}`
  }

  return (
    <div className="space-y-6">
      {/* Error display */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={clearError}>
            Dismiss
          </Button>
        </div>
      )}

      <Tabs defaultValue="staff" className="w-full">
        <TabsList className="bg-secondary/30">
          <TabsTrigger value="staff" className="text-sm border">Staff Management</TabsTrigger>
          <TabsTrigger value="roles" className="text-sm border">Roles & Permissions</TabsTrigger>
        </TabsList>

        {/* Staff Tab */}
        <TabsContent value="staff" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50/50 to-transparent rounded-sm">
              <CardContent className="py-0 px-4">
                <div className="flex items-center justify-between">
                  <div className='space-y-2'>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Staff</p>
                    <p className="text-lg font-bold">{totalStaff}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <UserIcon size={18} className='text-blue-500' />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50/50 to-transparent rounded-sm">
              <CardContent className="py-0 px-4">
                <div className="flex items-center justify-between">
                  <div className='space-y-2'>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Active Staff</p>
                    <p className="text-lg font-bold">{activeStaff}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <UserCheck size={18} className='text-green-500' />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/5 to-transparent rounded-sm">
              <CardContent className="py-0 px-4">
                <div className="flex items-center justify-between">
                  <div className='space-y-2'>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Roles</p>
                    <p className="text-lg font-bold">{roles.length}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <KeyRound size={18} className='text-yellow-500' />
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
                    Showing {users.length > 0 ? ((page - 1) * limit) + 1 : 0}-
                    {Math.min(page * limit, storePagination.total)} of {storePagination.total} staff members
                  </CardDescription>
                </div>
                <div className="flex items-start justify-start gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search staff by name, username, or number..."
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
                  <Button onClick={handleAddStaff} className="bg-primary hover:bg-primary/90 text-sm h-9 text-white">
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
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Staff ID</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Username</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Gender</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Phone</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center">
                          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
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
                          <td className="py-3 px-4 capitalize">{member.gender || '-'}</td>
                          <td className="py-3 px-4 text-muted-foreground">{member.tel || '-'}</td>
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
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditStaff(member)}>
                                  <Edit2 className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedStaff(member)
                                    setShowDeleteModal(true)
                                  }}
                                  className="text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
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
                {users.length === 0 && !isLoading && (
                  <div className="text-center py-8 text-muted-foreground text-sm">No staff members found</div>
                )}
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
                  <Button onClick={handleAddRole} className="bg-primary hover:bg-primary/90 text-sm h-9 text-white">
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
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Role Name</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Description</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Permissions</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRoles.map((role) => (
                      <tr key={role.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                        <td className="py-3 px-4 font-medium">{role.name}</td>
                        <td className="py-3 px-4 text-muted-foreground">{role.description || '-'}</td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {(role.permissions || []).slice(0, 3).map((perm) => (
                              <Badge key={typeof perm === 'string' ? perm : perm} variant="secondary" className="text-xs">
                                {typeof perm === 'string' ? perm.replace(':', ' ') : perm}
                              </Badge>
                            ))}
                            {(role.permissions || []).length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{(role.permissions || []).length - 3} more
                              </Badge>
                            )}
                            {(!role.permissions || role.permissions.length === 0) && (
                              <span className="text-xs text-muted-foreground">No permissions</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditRole(role)}>
                                <Edit2 className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedRole(role)
                                  setShowDeleteRoleModal(true)
                                }}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {paginatedRoles.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">No roles found</div>
                )}
              </div>

              {/* Pagination */}
              {totalRolePages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <div className="text-sm text-muted-foreground">
                    Page {roleCurrentPage} of {totalRolePages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRoleCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={roleCurrentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRoleCurrentPage((p) => Math.min(totalRolePages, p + 1))}
                      disabled={roleCurrentPage === totalRolePages}
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
            <CardHeader>
              <CardTitle className="text-lg font-light">
                {isEditing ? 'Edit Staff Member' : 'Add New Staff Member'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Staff Number</label>
                  <Input
                    placeholder="STF001"
                    value={staffFormData.number}
                    onChange={(e) => setStaffFormData({ ...staffFormData, number: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Username</label>
                  <Input
                    placeholder="username"
                    value={staffFormData.username}
                    onChange={(e) => setStaffFormData({ ...staffFormData, username: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">First Name</label>
                  <Input
                    placeholder="John"
                    value={staffFormData.first_name}
                    onChange={(e) => setStaffFormData({ ...staffFormData, first_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Last Name</label>
                  <Input
                    placeholder="Doe"
                    value={staffFormData.last_name}
                    onChange={(e) => setStaffFormData({ ...staffFormData, last_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Password</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={staffFormData.password}
                    onChange={(e) => setStaffFormData({ ...staffFormData, password: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Gender</label>
                  <select
                    value={staffFormData.gender}
                    onChange={(e) => setStaffFormData({ ...staffFormData, gender: e.target.value as Gender })}
                    className="w-full px-3 py-2 rounded-md border border-border text-sm"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Phone</label>
                  <Input
                    placeholder="+1 (555) 123-4567"
                    value={staffFormData.tel}
                    onChange={(e) => setStaffFormData({ ...staffFormData, tel: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Status</label>
                  <select
                    value={staffFormData.status}
                    onChange={(e) => setStaffFormData({ ...staffFormData, status: e.target.value as UserStatus })}
                    className="w-full px-3 py-2 rounded-md border border-border text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium mb-1 block">Address</label>
                  <Input
                    placeholder="123 Main St, City, State"
                    value={staffFormData.address}
                    onChange={(e) => setStaffFormData({ ...staffFormData, address: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Role</label>
                  <select
                    value={staffFormData.role_id}
                    onChange={(e) => setStaffFormData({ ...staffFormData, role_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border border-border text-sm"
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
              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setShowStaffModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveStaff} className="bg-primary hover:bg-primary/90">
                  {isEditing ? 'Update Staff' : 'Add Staff'}
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
              <CardTitle className="text-lg font-light">Staff Details</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowViewModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Staff Number</p>
                  <p className="font-medium">{selectedStaff.number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Username</p>
                  <p className="font-medium">{selectedStaff.username}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">
                    {selectedStaff.first_name} {selectedStaff.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p className="font-medium capitalize">{selectedStaff.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedStaff.tel || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge
                    variant={selectedStaff.status === 'active' ? 'default' : 'secondary'}
                    className={
                      selectedStaff.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : selectedStaff.status === 'suspended'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                    }
                  >
                    {selectedStaff.status}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{selectedStaff.address || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created At</p>
                  <p className="font-medium">{new Date(selectedStaff.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Updated At</p>
                  <p className="font-medium">{new Date(selectedStaff.updated_at).toLocaleDateString()}</p>
                </div>
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
              <CardTitle className="text-lg font-light text-destructive">Delete Staff Member</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete{' '}
                <span className="font-medium text-foreground">
                  {selectedStaff.first_name} {selectedStaff.last_name}
                </span>
                ? This action cannot be undone.
              </p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteStaff}>
                  Delete Staff
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Role Create/Edit Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-lg font-light">
                {isEditingRole ? 'Edit Role' : 'Add New Role'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-1 block">Role Name</label>
                <Input
                  placeholder="Manager"
                  value={roleFormData.name}
                  onChange={(e) => setRoleFormData({ ...roleFormData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Description</label>
                <Input
                  placeholder="Describe the role..."
                  value={roleFormData.description}
                  onChange={(e) => setRoleFormData({ ...roleFormData, description: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-3 block">Permissions</label>
                <div className="space-y-4">
                  {permissionGroups.map((group) => (
                    <div key={group.module} className="border border-border rounded-lg p-4">
                      <h4 className="text-sm font-semibold mb-3 text-foreground">{group.module}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {group.permissions.map((perm) => (
                          <label
                            key={perm}
                            className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-secondary/20 transition-colors"
                          >
                            <Checkbox
                              checked={roleFormData.permissions.includes(perm)}
                              onCheckedChange={() => togglePermission(perm)}
                            />
                            <span className="text-sm">{formatPermissionName(perm)}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setShowRoleModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveRole} className="bg-primary hover:bg-primary/90">
                  {isEditingRole ? 'Update Role' : 'Add Role'}
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
              <CardTitle className="text-lg font-light text-destructive">Delete Role</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete the role{' '}
                <span className="font-medium text-foreground">{selectedRole.name}</span>? This action cannot be
                undone.
              </p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowDeleteRoleModal(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteRole}>
                  Delete Role
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
