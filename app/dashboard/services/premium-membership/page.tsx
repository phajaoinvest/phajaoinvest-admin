'use client'

import { format } from 'date-fns'
import { useState, useMemo, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { subscriptionsApi } from '@/lib/api/subscriptions'
import type { PremiumMembershipSubscription } from '@/lib/types'
import { SubscriptionStatus } from '@/lib/types/subscriptions'
import { Search, Eye, Download, Calendar, FileText, Loader2, RefreshCw, CheckCircle } from 'lucide-react'
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
  const router = useRouter()

  // State for API data
  const [subscriptions, setSubscriptions] = useState<PremiumMembershipSubscription[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const itemsPerPage = 10

  // Filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [durationFilter, setDurationFilter] = useState<string>('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Fetch subscriptions from API
  const fetchSubscriptions = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      console.log('Fetching subscriptions...', { page: currentPage, limit: itemsPerPage, status: statusFilter, search: searchTerm })
      const response = await subscriptionsApi.getAll({
        page: currentPage,
        limit: itemsPerPage,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined,
      })

      console.log('API Response:', response)

      if (response.is_error) {
        throw new Error(response.message || 'Failed to fetch subscriptions')
      }

      const data = response.data || []
      console.log('Subscriptions data:', data)

      setSubscriptions(data)
      setTotalPages(response.totalPages || 1)
      setTotalItems(response.total || 0)
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
  }, [currentPage, statusFilter, searchTerm, toast])

  // Navigate to detail page
  const viewSubscriptionDetail = useCallback((sub: PremiumMembershipSubscription) => {
    router.push(`/dashboard/services/premium-membership/${sub.service_id}`)
  }, [router])

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
      <Card className="bg-card border-border/40">
        {/* Header with Actions */}
        <div className="flex items-center justify-between p-6 border-b border-border/40">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Premium Membership Subscriptions</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage and review customer subscription applications
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={exportToCSV}
              variant="outline"
              size="sm"
              disabled={filteredSubscriptions.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button onClick={fetchSubscriptions} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-border/40 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative col-span-1 md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer name or email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1) // Reset to first page on search
                }}
                className="pl-9"
              />
            </div>

            {/* Status Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  Status: {statusFilter === 'all' ? 'All' : getStatusDisplay(statusFilter).label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => { setStatusFilter('all'); setCurrentPage(1) }}>
                  All
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setStatusFilter(SubscriptionStatus.PENDING); setCurrentPage(1) }}>
                  Pending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setStatusFilter(SubscriptionStatus.ACTIVE); setCurrentPage(1) }}>
                  Active
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setStatusFilter(SubscriptionStatus.EXPIRED); setCurrentPage(1) }}>
                  Expired
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setStatusFilter(SubscriptionStatus.CANCELLED); setCurrentPage(1) }}>
                  Cancelled
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Duration Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  Duration: {durationFilter === 'all' ? 'All' : getDurationLabel(Number(durationFilter))}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => setDurationFilter('all')}>
                  All
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDurationFilter('3')}>
                  3 Months
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDurationFilter('6')}>
                  6 Months
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDurationFilter('12')}>
                  12 Months
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
            <span className="text-muted-foreground">Loading subscriptions...</span>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="flex flex-col items-center justify-center p-8">
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
                      No subscriptions found
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
                            onClick={() => viewSubscriptionDetail(sub)}
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
        {!isLoading && !error && (
          <div className="p-4 border-t border-border/40 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredSubscriptions.length} of {totalItems} subscriptions
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-3 text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
