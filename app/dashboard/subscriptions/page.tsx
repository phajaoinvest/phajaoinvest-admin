'use client'

import { format } from 'date-fns'
import { useState, useMemo, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { usePagination } from '@/hooks'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { subscriptionsApi } from '@/lib/api/subscriptions'
import type { PremiumMembershipSubscription } from '@/lib/types'
import { SubscriptionStatus } from '@/lib/types/subscriptions'
import { Search, Eye, Download, Calendar, FileText, Loader2, RefreshCw, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency, formatNumber } from '@/lib/utils'

// Map subscription duration to display text
const getDurationLabel = (months: number | null): string => {
  if (!months) return 'N/A'
  if (months === 3) return '3 Months'
  if (months === 6) return '6 Months'
  if (months === 12) return '12 Months'
  return `${months} Months`
}

// Get display status label and color
const getStatusDisplay = (status: string) => {
  const statusLower = status.toLowerCase()
  switch (statusLower) {
    case SubscriptionStatus.ACTIVE.toLowerCase():
      return { label: 'Active', color: 'bg-green-500/10 text-green-500 border-green-500/20' }
    case SubscriptionStatus.PENDING.toLowerCase():
      return { label: 'Pending', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' }
    case SubscriptionStatus.EXPIRED.toLowerCase():
      return { label: 'Expired', color: 'bg-gray-500/10 text-gray-500 border-gray-500/20' }
    case SubscriptionStatus.CANCELLED.toLowerCase():
      return { label: 'Cancelled', color: 'bg-red-500/10 text-red-500 border-red-500/20' }
    case SubscriptionStatus.SUSPENDED.toLowerCase():
      return { label: 'Suspended', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' }
    default:
      return { label: status, color: 'bg-gray-500/10 text-gray-500 border-gray-500/20' }
  }
}

export default function SubscriptionsPage() {
  const { toast } = useToast()

  // State for API data
  const [subscriptions, setSubscriptions] = useState<PremiumMembershipSubscription[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Pagination hook
  const { page, limit, setPage, setLimit, updateFromMeta } = usePagination({ initialLimit: 10 })
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  // Filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [durationFilter, setDurationFilter] = useState<string>('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Modal state
  const [selectedSubscription, setSelectedSubscription] = useState<PremiumMembershipSubscription | null>(null)
  const [viewModalOpen, setViewModalOpen] = useState(false)

  // Fetch subscriptions from API
  const fetchSubscriptions = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await subscriptionsApi.getAll({
        page: page,
        limit: limit,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined,
      })

      if (response.is_error) {
        throw new Error(response.message || 'Failed to fetch subscriptions')
      }

      const data = response.data || []

      setSubscriptions(data)
      setTotalPages(response.totalPages || 1)
      setTotalItems(response.total || 0)
      updateFromMeta({
        total: response.total || 0,
        page: response.page || 1,
        limit: response.limit || 10,
        totalPages: response.totalPages || 1,
      })
    } catch (err) {
      console.error('Error fetching subscriptions:', err)
      const message = err instanceof Error ? err.message : 'Failed to fetch subscriptions'
      setError(message)
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [page, limit, statusFilter, searchTerm, updateFromMeta, toast])

  // Initial fetch
  useEffect(() => {
    fetchSubscriptions()
  }, [fetchSubscriptions])

  // Filter subscriptions locally for client-side only filters (duration, date range)
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => {
      const matchesDuration = durationFilter === 'all' ||
        (sub.subscription_duration?.toString() === durationFilter)

      const appliedDate = new Date(sub.applied_at)
      const matchesStartDate = !startDate || appliedDate >= new Date(startDate)
      const matchesEndDate = !endDate || appliedDate <= new Date(endDate)

      return matchesDuration && matchesStartDate && matchesEndDate
    })
  }, [subscriptions, durationFilter, startDate, endDate])



  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Customer Name', 'Email', 'Duration', 'Applied Date', 'Status', 'Amount', 'Expires']
    const rows = filteredSubscriptions.map(sub => [
      `${sub.customer_info.first_name} ${sub.customer_info.last_name}`,
      sub.customer_info.email,
      getDurationLabel(sub.subscription_duration),
      format(new Date(sub.applied_at), 'MMM dd, yyyy'),
      getStatusDisplay(sub.status || 'pending').label,
      `USD ${formatNumber(sub.subscription_fee || 0)}`,
      sub.subscription_expires_at ? format(new Date(sub.subscription_expires_at), 'MMM dd, yyyy') : 'N/A'
    ])

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `subscriptions-${format(new Date(), 'yyyy-MM-dd')}.csv`
    link.click()
  }

  // Calculate stats
  const stats = useMemo(() => {
    const total = totalItems
    const pending = subscriptions.filter(s => s.status?.toLowerCase() === SubscriptionStatus.PENDING).length
    const active = subscriptions.filter(s => s.status?.toLowerCase() === SubscriptionStatus.ACTIVE).length
    const totalRevenue = subscriptions
      .filter(s => s.status?.toLowerCase() === SubscriptionStatus.ACTIVE)
      .reduce((sum, s) => sum + (s.subscription_fee || 0), 0)

    return { total, active, pending, totalRevenue }
  }, [subscriptions, totalItems])

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-card border-border/40">
          <div className="flex items-center justify-between">
            <div className='space-y-1'>
              <p className="text-sm text-muted-foreground">Total Subscriptions</p>
              <p className="text-lg font-semibold">{stats.total}</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Subscriptions</p>
              <p className="text-lg font-semibold mt-1">{stats.active}</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Approval</p>
              <p className="text-lg font-semibold mt-1">{stats.pending}</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-yellow-500" />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-lg font-semibold mt-1">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Download className="w-4 h-4 text-primary" />
            </div>
          </div>
        </Card>
      </div>

      {/* Table Card with Filters */}
      <Card className="bg-card border rounded-sm">
        <div className="p-4 space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 bg-background border-border/40"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3 rounded-md border border-border/40 bg-background text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={durationFilter}
              onChange={(e) => setDurationFilter(e.target.value)}
              className="h-9 px-3 rounded-md border border-border/40 bg-background text-sm"
            >
              <option value="all">All Durations</option>
              <option value="3">3 Months</option>
              <option value="6">6 Months</option>
              <option value="12">12 Months</option>
            </select>

            <Button onClick={exportToCSV} variant="outline" className="h-9">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>

            <Button onClick={fetchSubscriptions} variant="outline" className="h-9" disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <Input
              type="date"
              placeholder="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-9 bg-background border-border/40"
            />
            <Input
              type="date"
              placeholder="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-9 bg-background border-border/40"
            />
          </div>
        </div>

        {/* Loading/Error States */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchSubscriptions} variant="outline">
              Try Again
            </Button>
          </div>
        )}

        {/* Table */}
        {!isLoading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30 border-y border-border/40">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Customer</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Package</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Applied Date</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Amount</th>
                  <th className="text-center p-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredSubscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No pending subscriptions found
                    </td>
                  </tr>
                ) : (
                  filteredSubscriptions.map((sub) => (
                    <tr key={sub.service_id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-foreground">
                            {sub.customer_info.first_name} {sub.customer_info.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">{sub.customer_info.email}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-foreground">Premium Membership</p>
                        <p className="text-xs text-muted-foreground">{getDurationLabel(sub.subscription_duration)}</p>
                      </td>
                      <td className="p-4 text-sm text-foreground">
                        {format(new Date(sub.applied_at), 'MMM dd, yyyy')}
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className={`${getStatusDisplay(sub.status || 'pending').color} capitalize`}>
                          {getStatusDisplay(sub.status || 'pending').label}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm font-medium text-foreground">
                        USD {formatNumber(sub.subscription_fee || 0)}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setSelectedSubscription(sub)
                              setViewModalOpen(true)
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !error && totalPages > 1 && (
          <div className="p-4 border-t border-border/40 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredSubscriptions.length > 0 ? ((page - 1) * limit) + 1 : 0}-
              {Math.min(page * limit, totalItems)} of {totalItems} subscriptions
            </p>
            <div className="flex items-center gap-4">
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
                <span className="flex items-center px-3 text-sm">
                  Page {page} of {totalPages}
                </span>
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
          </div>
        )}
      </Card>

      {/* View Details Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Subscription Details</DialogTitle>
            <DialogDescription>Complete subscription information</DialogDescription>
          </DialogHeader>
          {selectedSubscription && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Name</p>
                    <p className="font-medium">{selectedSubscription.customer_info.first_name} {selectedSubscription.customer_info.last_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedSubscription.customer_info.email}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Username</p>
                    <p className="font-medium">{selectedSubscription.customer_info.username}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Subscription Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Service Type</p>
                    <p className="font-medium capitalize">{selectedSubscription.service_type?.replace(/_/g, ' ')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <p className="font-medium">{getDurationLabel(selectedSubscription.subscription_duration)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Applied Date</p>
                    <p className="font-medium">{format(new Date(selectedSubscription.applied_at), 'MMMM dd, yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Subscription Fee</p>
                    <p className="font-medium">
                      USD {formatNumber(selectedSubscription.subscription_fee)}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Subscription Status</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Service ID</p>
                    <p className="font-medium font-mono text-xs">{selectedSubscription.service_id}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <Badge variant="outline" className={`${getStatusDisplay(selectedSubscription.status || 'pending').color} capitalize`}>
                      {getStatusDisplay(selectedSubscription.status || 'pending').label}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Expires At</p>
                    <p className="font-medium">
                      {selectedSubscription.subscription_expires_at
                        ? format(new Date(selectedSubscription.subscription_expires_at), 'MMMM dd, yyyy')
                        : 'No expiration'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Latest Payment Status</p>
                    <p className="font-medium capitalize">
                      {selectedSubscription.latest_payment_status?.replace(/_/g, ' ') || 'N/A'}
                    </p>
                  </div>
                  {selectedSubscription.subscription_package_id && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Package ID</p>
                      <p className="font-medium font-mono text-xs">{selectedSubscription.subscription_package_id}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


    </div>
  )
}
