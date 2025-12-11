'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useCustomersStore } from '@/lib/stores'
import { useDebounce, usePagination } from '@/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Search, Eye, Ban, Trash2, MoreVertical, Mail, Phone,
  Calendar, ChevronLeft, ChevronRight, AlertTriangle,
  Download, UserRoundX, UserRoundCheck, Users, BadgeCheck,
  ShieldX, Loader2, RefreshCw
} from 'lucide-react'
import type { Customer } from '@/lib/types'
import { CustomerStatus } from '@/lib/types'

export default function CustomersPage() {
  const router = useRouter()

  // Store
  const {
    customers,
    stats,
    pagination: storePagination,
    isLoading,
    isLoadingStats,
    error,
    fetchStats,
    fetchCustomers,
    updateCustomer,
    deleteCustomer,
    clearError
  } = useCustomersStore()

  // Local state
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | CustomerStatus>('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null)
  const [customerToBan, setCustomerToBan] = useState<Customer | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isBanning, setIsBanning] = useState(false)

  // Hooks
  const debouncedSearch = useDebounce(searchTerm, 300)
  const { page, limit, setPage, setLimit } = usePagination({ initialLimit: 10 })

  // Fetch customers on mount and when filters change
  const loadCustomers = useCallback(async () => {
    await fetchCustomers({
      page,
      limit,
      search: debouncedSearch || undefined,
      status: filterStatus !== 'all' ? filterStatus : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    })
  }, [fetchCustomers, page, limit, debouncedSearch, filterStatus, startDate, endDate])

  useEffect(() => {
    loadCustomers()
    fetchStats()
  }, [loadCustomers, fetchStats])

  // Use stats from backend, fallback to current page data if not loaded
  const totalCustomers = stats?.totalCustomers
  const activeCount = stats?.activeCount
  const inactiveCount = stats?.inactiveCount
  const suspendedCount = stats?.suspendedCount

  const handleDeleteConfirm = async () => {
    if (!customerToDelete) return

    setIsDeleting(true)
    try {
      await deleteCustomer(customerToDelete.id)
      setCustomerToDelete(null)
    } catch {
      // Error handled in store
    } finally {
      setIsDeleting(false)
    }
  }

  const handleBanConfirm = async () => {
    if (!customerToBan) return

    setIsBanning(true)
    try {
      await updateCustomer(customerToBan.id, { status: CustomerStatus.SUSPENDED })
      setCustomerToBan(null)
    } catch {
      // Error handled in store
    } finally {
      setIsBanning(false)
    }
  }

  const exportToCSV = () => {
    const headers = ['Username', 'First Name', 'Last Name', 'Email', 'Phone', 'Status', 'Verified', 'Created']
    const rows = customers.map(c => [
      c.username,
      c.first_name,
      c.last_name || '',
      c.email,
      c.phone_number || '',
      c.status,
      c.isVerify ? 'Yes' : 'No',
      new Date(c.created_at).toLocaleDateString()
    ])

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const totalPages = storePagination.totalPages

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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow rounded-md cursor-pointer">
          <CardContent className="py-0 px-5">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Total Customers
                </p>
                <p className="text-2xl font-bold text-foreground mt-1">{totalCustomers}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow rounded-md cursor-pointer">
          <CardContent className="py-0 px-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Active
                </p>
                <p className="text-2xl font-bold text-green-600 mt-1">{activeCount}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <UserRoundCheck className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow rounded-sm cursor-pointer">
          <CardContent className="py-0 px-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Inactive
                </p>
                <p className="text-2xl font-bold text-gray-600 mt-1">{inactiveCount}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <UserRoundX className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow rounded-sm cursor-pointer">
          <CardContent className="py-0 px-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Suspended
                </p>
                <p className="text-2xl font-bold text-gray-600 mt-1">{suspendedCount}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <UserRoundX className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border/50 bg-secondary/20">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-md font-medium">Customer Lists</CardTitle>
                <CardDescription className="text-xs">
                  Showing {customers.length > 0 ? ((page - 1) * limit) + 1 : 0}-
                  {Math.min(page * limit, storePagination.total)} of {storePagination.total} customers
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadCustomers}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="grid grid-cols-3 lg:grid-cols-4 gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-9 text-sm"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as 'all' | CustomerStatus)}
                  className="h-9 px-2.5 py-1.5 rounded-md border border-border text-sm bg-background"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="ban">Baned</option>
                </select>
                <Input
                  type="date"
                  placeholder="Start Date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-9 text-sm"
                />
                <Input
                  type="date"
                  placeholder="End Date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div className='w-1/2 flex items-end justify-end'>
                <Button
                  onClick={exportToCSV}
                  variant="outline"
                  className="text-sm"
                  disabled={customers.length === 0}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/30">
                  <tr className="border-b border-border/50">
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                      No
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                      Name
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                      Email
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                      Phone
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                      Services
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                      Verified
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                      Created
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer, index) => (
                    <tr
                      key={customer.id}
                      className="border-b border-border/30 hover:bg-secondary/20 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span className="font-medium text-foreground">
                          {((page - 1) * limit) + index + 1}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-foreground">
                          {customer.first_name} {customer.last_name || ''}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-foreground">{customer.email}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {customer.phone_number ? (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-foreground">{customer.phone_number}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className={`text-xs font-medium ${customer.status === 'active'
                            ? 'border-green-300 bg-green-50 text-green-700'
                            : customer.status === 'suspended'
                              ? 'border-orange-300 bg-orange-50 text-orange-700'
                              : 'border-gray-300 bg-gray-50 text-gray-700'
                            }`}
                        >
                          {customer.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {customer.services && customer.services.length > 0 ? (
                            customer.services.map((service, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className={`text-[10px] px-1.5 py-0.5 ${service.service_type === 'premium_membership'
                                  ? 'border-purple-300 bg-purple-50 text-purple-700'
                                  : service.service_type === 'international_stock_account'
                                    ? 'border-blue-300 bg-blue-50 text-blue-700'
                                    : service.service_type === 'guaranteed_returns'
                                      ? 'border-green-300 bg-green-50 text-green-700'
                                      : service.service_type === 'premium_stock_picks'
                                        ? 'border-orange-300 bg-orange-50 text-orange-700'
                                        : 'border-gray-300 bg-gray-50 text-gray-700'
                                  }`}
                              >
                                {service.service_type.replace(/_/g, ' ')}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {customer.isVerify ? (
                          <BadgeCheck className="w-5 h-5 text-green-600" />
                        ) : (
                          <ShieldX className="w-5 h-5 text-gray-400" />
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-foreground">
                            {new Date(customer.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-secondary"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem
                                onClick={() => router.push(`/dashboard/customers/${customer.id}`)}
                                className="cursor-pointer"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setCustomerToBan(customer)}
                                className="cursor-pointer text-orange-600 focus:text-orange-600"
                              >
                                <Ban className="w-4 h-4 mr-2" />
                                Ban Account
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setCustomerToDelete(customer)}
                                className="cursor-pointer text-destructive focus:text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {customers.length === 0 && !isLoading && (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  No customers found matching your search
                </div>
              )}
            </div>
          )}
        </CardContent>

        {totalPages > 1 && (
          <div className="border-t border-border/50 px-4 py-3 flex items-center justify-between bg-secondary/10">
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
                <option value={100}>100 per page</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1 || isLoading}
                className="h-8"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages || isLoading}
                className="h-8"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Ban Customer Modal */}
      {customerToBan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md border-0 shadow-2xl">
            <CardHeader className="border-b border-border/50 bg-orange-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-orange-900">
                    Ban Customer Account
                  </CardTitle>
                  <CardDescription className="text-sm mt-1 text-orange-700">
                    This will suspend the customer's access
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-sm text-foreground mb-4">
                Are you sure you want to ban the customer{' '}
                <span className="font-semibold">
                  {customerToBan.first_name} {customerToBan.last_name}
                </span>{' '}
                (@{customerToBan.username})? They will no longer be able to access their account.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={handleBanConfirm}
                  className="flex-1 bg-orange-600 hover:bg-orange-700"
                >
                  <Ban className="w-4 h-4 mr-2" />
                  Ban Account
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCustomerToBan(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {customerToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md border-0 shadow-2xl">
            <CardHeader className="border-b border-border/50 bg-destructive/10">
              <CardTitle className="text-lg font-semibold text-destructive">
                Delete Customer
              </CardTitle>
              <CardDescription className="text-sm mt-1">
                This action cannot be undone
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-sm text-foreground mb-4">
                Are you sure you want to delete the customer{' '}
                <span className="font-semibold">
                  {customerToDelete.first_name} {customerToDelete.last_name}
                </span>{' '}
                (@{customerToDelete.username})?
              </p>
              <div className="flex gap-3">
                <Button
                  variant="destructive"
                  onClick={handleDeleteConfirm}
                  className="flex-1"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCustomerToDelete(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
