'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useInvestmentsStore } from '@/lib/stores'
import { useDebounce, usePagination } from '@/hooks'
import type { InvestmentStatus } from '@/lib/types'
import {
  Search,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  MoreVertical,
  Eye,
  Ban,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Loader2,
  CheckCircle2
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function InvestmentsPage() {
  const router = useRouter()

  // Store state
  const {
    pendingInvestments,
    investmentsPagination,
    isLoadingPending,
    isApproving,
    error,
    fetchPendingInvestments,
    approveInvestment,
    clearError,
  } = useInvestmentsStore()

  // Local state for filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | InvestmentStatus>('all')
  const [sortBy, setSortBy] = useState<'most_invest' | 'least_invest' | 'none'>('none')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
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

  // Load investments
  const loadInvestments = useCallback(() => {
    const params: Record<string, unknown> = {
      page,
      limit,
      search: debouncedSearch || undefined,
    }
    if (statusFilter !== 'all') {
      params.status = statusFilter
    }
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate
    if (sortBy !== 'none') {
      params.sortBy = 'amount'
      params.sortOrder = sortBy === 'most_invest' ? 'DESC' : 'ASC'
    }
    fetchPendingInvestments(params as Parameters<typeof fetchPendingInvestments>[0])
  }, [page, limit, debouncedSearch, statusFilter, startDate, endDate, sortBy, fetchPendingInvestments])

  // Initial load and refetch on filter changes
  useEffect(() => {
    loadInvestments()
  }, [loadInvestments])

  // Update pagination total when store pagination changes
  useEffect(() => {
    updateFromMeta(investmentsPagination)
  }, [investmentsPagination, updateFromMeta])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, statusFilter, startDate, endDate, sortBy, setPage])

  // Stats calculations - using the current page data as approximation
  const stats = useMemo(() => {
    const totalInvested = pendingInvestments.reduce((sum, inv) => sum + Number(inv.amount || 0), 0)
    const approvedCount = pendingInvestments.filter((inv) => inv.status === 'approved').length
    const pendingCount = pendingInvestments.filter((inv) => inv.status === 'pending').length
    return {
      totalInvested,
      totalInvestments: investmentsPagination.total,
      approvedCount,
      pendingCount,
    }
  }, [pendingInvestments, investmentsPagination.total])

  const exportToCSV = () => {
    const headers = ['Customer ID', 'Amount', 'Status', 'Created At']
    const rows = pendingInvestments.map((inv) => [
      inv.customer_id,
      inv.amount,
      inv.status,
      inv.created_at,
    ])

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `investments_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const handleApprove = async (id: string) => {
    try {
      await approveInvestment(id)
      loadInvestments()
    } catch (err) {
      // Error handled by store
    }
  }

  const handleViewDetails = (id: string) => {
    router.push(`/dashboard/investments/${id}`)
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border border-yellow-300 rounded-sm">
          <CardContent className="py-0 px-6">
            <div className="flex items-center justify-between">
              <div className='space-y-2'>
                <p className="text-sm text-muted-foreground font-light">Total Invested</p>
                <p className="text-md font-bold text-foreground">${stats.totalInvested.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-green-300 rounded-sm">
          <CardContent className="py-0 px-6">
            <div className="flex items-center justify-between">
              <div className='space-y-2'>
                <p className="text-sm text-muted-foreground font-light">Approved</p>
                <p className="text-md font-bold text-green-500">{stats.approvedCount}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-4 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-blue-300 rounded-sm">
          <CardContent className="py-0 px-6">
            <div className="flex items-center justify-between">
              <div className='space-y-2'>
                <p className="text-sm text-muted-foreground font-light">Pending</p>
                <p className="text-md font-bold text-foreground">{stats.pendingCount}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Calendar className="w-4 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-purple-300 rounded-sm">
          <CardContent className="py-0 px-6">
            <div className="flex items-center justify-between">
              <div className='space-y-2'>
                <p className="text-sm text-muted-foreground font-light">Total Requests</p>
                <p className="text-md font-bold text-foreground">{stats.totalInvestments}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <TrendingUp className="w-4 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="bg-card border border-border/40 overflow-hidden">
        <CardContent className="px-4 py-2">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Filter by:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadInvestments}
                disabled={isLoadingPending}
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingPending ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-background border-border h-9"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | InvestmentStatus)}
                  className="px-3 h-9 rounded-md border border-border bg-background text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="closed">Closed</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <Input
                  type="date"
                  placeholder="Start Date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-background border-border h-9"
                />

                <Input
                  type="date"
                  placeholder="End Date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-background border-border h-9"
                />
                <div className="flex gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'most_invest' | 'least_invest' | 'none')}
                    className="px-3 h-9 rounded-md border border-border bg-background text-sm"
                  >
                    <option value="none">Sort By</option>
                    <option value="most_invest">Most Invested</option>
                    <option value="least_invest">Least Invested</option>
                  </select>
                </div>
              </div>
              <Button onClick={exportToCSV} variant="outline" size="sm" className="h-9" disabled={pendingInvestments.length === 0}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>

        <CardContent className="p-0">
          {isLoadingPending ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">No</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Customer ID</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Created At</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingInvestments.map((inv, index: number) => (
                    <tr key={inv.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-medium">
                        {((page - 1) * limit) + index + 1}
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {inv.customer_id}
                      </td>
                      <td className="py-3 px-4">${Number(inv.amount || 0).toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className={
                            inv.status === 'active'
                              ? 'bg-green-100 text-green-700 border-green-300'
                              : inv.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
                                : inv.status === 'completed'
                                  ? 'bg-blue-100 text-blue-700 border-blue-300'
                                  : 'bg-gray-100 text-gray-700 border-gray-300'
                          }
                        >
                          {inv.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {new Date(inv.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-card border-border">
                            <DropdownMenuItem onClick={() => handleViewDetails(inv.id)} className="cursor-pointer">
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {inv.status === 'pending' && (
                              <DropdownMenuItem
                                onClick={() => handleApprove(inv.id)}
                                className="cursor-pointer text-green-600 focus:text-green-600"
                                disabled={isApproving}
                              >
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Approve
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {pendingInvestments.length === 0 && (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  No investment requests found
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-border">
              <div className="text-sm text-muted-foreground">
                Showing {pendingInvestments.length > 0 ? ((page - 1) * limit) + 1 : 0}-
                {Math.min(page * limit, investmentsPagination.total)} of {investmentsPagination.total} investments
              </div>
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
                    disabled={page === 1 || isLoadingPending}
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
                    disabled={page === totalPages || isLoadingPending}
                    className="h-8"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
