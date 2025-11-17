'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { useDashboardStore } from '@/lib/dashboard-store'
import { Plus, Search, MoreVertical, Eye, Edit2, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function StaffPage() {
  const staff = useDashboardStore((state) => state.staff)
  const roles = useDashboardStore((state) => state.roles)
  const addStaff = useDashboardStore((state) => state.addStaff)
  const updateStaff = useDashboardStore((state) => state.updateStaff)
  const deleteStaff = useDashboardStore((state) => state.deleteStaff)
  const addRole = useDashboardStore((state) => state.addRole)
  const updateRole = useDashboardStore((state) => state.updateRole)
  const deleteRole = useDashboardStore((state) => state.deleteRole)

  // Staff state
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showStaffModal, setShowStaffModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [staffFormData, setStaffFormData] = useState({
    number: '',
    first_name: '',
    last_name: '',
    username: '',
    password: '',
    gender: 'male' as 'male' | 'female' | 'other',
    tel: '',
    address: '',
    status: 'active' as 'active' | 'inactive' | 'suspended',
    profile: '',
    role_id: '',
    admin_role_id: '',
  })

  // Role state
  const [roleSearchTerm, setRoleSearchTerm] = useState('')
  const [roleCurrentPage, setRoleCurrentPage] = useState(1)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [showDeleteRoleModal, setShowDeleteRoleModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState<any>(null)
  const [isEditingRole, setIsEditingRole] = useState(false)
  const [roleFormData, setRoleFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  })

  const itemsPerPage = 10

  // Staff filtering and pagination
  const filteredStaff = staff.filter(
    (s) =>
      s.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.number.toLowerCase().includes(searchTerm.toLowerCase())
  )
  const totalStaffPages = Math.ceil(filteredStaff.length / itemsPerPage)
  const paginatedStaff = filteredStaff.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Role filtering and pagination
  const filteredRoles = roles.filter(
    (r) =>
      r.name.toLowerCase().includes(roleSearchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(roleSearchTerm.toLowerCase())
  )
  const totalRolePages = Math.ceil(filteredRoles.length / itemsPerPage)
  const paginatedRoles = filteredRoles.slice(
    (roleCurrentPage - 1) * itemsPerPage,
    roleCurrentPage * itemsPerPage
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
      admin_role_id: '',
    })
    setShowStaffModal(true)
  }

  const handleEditStaff = (staff: any) => {
    setIsEditing(true)
    setSelectedStaff(staff)
    setStaffFormData({
      number: staff.number,
      first_name: staff.first_name,
      last_name: staff.last_name || '',
      username: staff.username,
      password: '',
      gender: staff.gender,
      tel: staff.tel || '',
      address: staff.address || '',
      status: staff.status,
      profile: staff.profile || '',
      role_id: staff.role_id || '',
      admin_role_id: staff.admin_role_id || '',
    })
    setShowStaffModal(true)
  }

  const handleSaveStaff = () => {
    if (isEditing && selectedStaff) {
      updateStaff(selectedStaff.id, staffFormData)
    } else {
      addStaff({
        ...staffFormData,
        created_by: null,
        deleted_by: null,
      })
    }
    setShowStaffModal(false)
  }

  const handleDeleteStaff = () => {
    if (selectedStaff) {
      deleteStaff(selectedStaff.id)
      setShowDeleteModal(false)
      setSelectedStaff(null)
    }
  }

  // Role handlers
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

  const handleEditRole = (role: any) => {
    setIsEditingRole(true)
    setSelectedRole(role)
    setRoleFormData({
      name: role.name,
      description: role.description,
      permissions: role.permissions,
    })
    setShowRoleModal(true)
  }

  const handleSaveRole = () => {
    if (isEditingRole && selectedRole) {
      updateRole(selectedRole.id, roleFormData)
    } else {
      addRole(roleFormData)
    }
    setShowRoleModal(false)
  }

  const handleDeleteRole = () => {
    if (selectedRole) {
      deleteRole(selectedRole.id)
      setShowDeleteRoleModal(false)
      setSelectedRole(null)
    }
  }

  const permissionGroups = [
    {
      module: 'Dashboard',
      permissions: ['dashboard_view', 'dashboard_edit']
    },
    {
      module: 'Customer',
      permissions: ['customer_view', 'customer_create', 'customer_edit', 'customer_delete']
    },
    {
      module: 'Staff',
      permissions: ['staff_view', 'staff_create', 'staff_edit', 'staff_delete']
    },
    {
      module: 'Role',
      permissions: ['role_view', 'role_create', 'role_edit', 'role_delete']
    },
    {
      module: 'Packages',
      permissions: ['packages_view', 'packages_create', 'packages_edit', 'packages_delete']
    },
    {
      module: 'Investment',
      permissions: ['investment_view', 'investment_create', 'investment_edit', 'investment_delete']
    },
    {
      module: 'Stock Account',
      permissions: ['stock_account_view', 'stock_account_create', 'stock_account_edit', 'stock_account_delete']
    },
    {
      module: 'Stock Picks',
      permissions: ['stock_picks_view', 'stock_picks_create', 'stock_picks_edit', 'stock_picks_delete']
    },
    {
      module: 'Payment',
      permissions: ['payment_view', 'payment_create', 'payment_edit', 'payment_delete']
    },
    {
      module: 'Setting',
      permissions: ['setting_view', 'setting_edit']
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
    const parts = perm.split('_')
    return `Can ${parts[parts.length - 1]}`
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="staff" className="w-full">
        <TabsList className="bg-secondary/30">
          <TabsTrigger value="staff" className="text-sm">Staff Management</TabsTrigger>
          <TabsTrigger value="roles" className="text-sm">Roles & Permissions</TabsTrigger>
        </TabsList>

        {/* Staff Tab */}
        <TabsContent value="staff" className="space-y-6 mt-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50/50 to-transparent">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-light text-muted-foreground uppercase tracking-wider">Total Staff</p>
                    <p className="text-2xl font-light mt-1">{staff.length}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <span className="text-lg">👥</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50/50 to-transparent">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-light text-muted-foreground uppercase tracking-wider">Active Staff</p>
                    <p className="text-2xl font-light mt-1">{staff.filter((s) => s.status === 'active').length}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <span className="text-lg">✓</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/5 to-transparent">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-light text-muted-foreground uppercase tracking-wider">Total Roles</p>
                    <p className="text-2xl font-light mt-1">{roles.length}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-lg">🔑</span>
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
                  <CardTitle className="text-lg font-light">Staff Members</CardTitle>
                  <CardDescription className="text-sm">
                    Showing {paginatedStaff.length} of {filteredStaff.length} staff members
                  </CardDescription>
                </div>
                <Button onClick={handleAddStaff} className="bg-primary hover:bg-primary/90 text-sm h-9">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Staff
                </Button>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search staff by name, username, or number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-sm h-9"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
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
                    {paginatedStaff.map((member) => (
                      <tr key={member.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                        <td className="py-3 px-4 font-medium">{member.number}</td>
                        <td className="py-3 px-4">
                          {member.first_name} {member.last_name}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{member.username}</td>
                        <td className="py-3 px-4 capitalize">{member.gender}</td>
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
                    ))}
                  </tbody>
                </table>
                {paginatedStaff.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">No staff members found</div>
                )}
              </div>

              {/* Pagination */}
              {totalStaffPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalStaffPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalStaffPages, p + 1))}
                      disabled={currentPage === totalStaffPages}
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
          {/* Roles Table */}
          <Card className="border-0 shadow-sm overflow-hidden">
            <CardHeader className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-light">Roles & Permissions</CardTitle>
                  <CardDescription className="text-sm">
                    Showing {paginatedRoles.length} of {filteredRoles.length} roles
                  </CardDescription>
                </div>
                <Button onClick={handleAddRole} className="bg-primary hover:bg-primary/90 text-sm h-9">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Role
                </Button>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search roles..."
                  value={roleSearchTerm}
                  onChange={(e) => setRoleSearchTerm(e.target.value)}
                  className="pl-10 text-sm h-9"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
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
                        <td className="py-3 px-4 text-muted-foreground">{role.description}</td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {role.permissions.slice(0, 3).map((perm) => (
                              <Badge key={perm} variant="secondary" className="text-xs">
                                {perm.replace('_', ' ')}
                              </Badge>
                            ))}
                            {role.permissions.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{role.permissions.length - 3} more
                              </Badge>
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
                    onChange={(e) => setStaffFormData({ ...staffFormData, gender: e.target.value as any })}
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
                    onChange={(e) => setStaffFormData({ ...staffFormData, status: e.target.value as any })}
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
