'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { usePaymentsStore } from '@/lib/stores'
import { useDebounce, usePagination } from '@/hooks'
import { type Payment, PaymentStatus, SubscriptionStatus } from '@/lib/types'
import {
  Search,
  Download,
  CreditCard,
  TrendingUp,
  Package,
  Zap,
  MoreVertical,
  Eye,
  Check,
  X,
  AlertTriangle,
  RefreshCw,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function PaymentsPage() {
  // Store state
  const {
    payments: pendingPayments,
    paymentsPagination: storePagination,
    isLoading,
    isProcessing: isApproving,
    error,
    fetchPayments: fetchPendingPayments,
    approvePayment,
    rejectPayment,
    clearError,
  } = usePaymentsStore()

  // Local state for filters
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'membership' | 'investment' | 'stock' | 'stock_pick'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | PaymentStatus>('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 300)

  // Modal state
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<'approve' | 'reject' | null>(null)
  const [paymentToProcess, setPaymentToProcess] = useState<Payment | null>(null)

  // Pagination
  const {
    page,
    limit,
    totalPages,
    setPage,
    setLimit,
    updateFromMeta,
  } = usePagination({ initialLimit: 10 })

  // Track if initial load is done to prevent multiple requests
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // Load payments function (not in useCallback to avoid dependency issues)
  const loadPayments = useCallback((currentPage: number) => {
    const params: Record<string, unknown> = {
      page: currentPage,
      limit,
      search: debouncedSearch || undefined,
    }
    if (filterStatus !== 'all') {
      params.status = filterStatus
    }
    if (filterType !== 'all') {
      params.type = filterType
    }
    if (startDate !== '' && endDate !== '') {
      if (startDate) {
        params.startDate = new Date(startDate).toISOString()
      }
      if (endDate) {
        const endDateTime = new Date(endDate)
        endDateTime.setHours(23, 59, 59, 999)
        params.endDate = endDateTime.toISOString()
      }
    }
    fetchPendingPayments(params as Parameters<typeof fetchPendingPayments>[0])
  }, [limit, debouncedSearch, filterStatus, filterType, startDate, endDate, fetchPendingPayments])

  // Initial load only - runs once on mount
  useEffect(() => {
    loadPayments(1)
    setIsInitialLoad(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Refetch when filters change (but not on initial load)
  useEffect(() => {
    if (!isInitialLoad) {
      setPage(1)
      loadPayments(1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, filterStatus, filterType, startDate, endDate])

  // Refetch when page/limit changes (but not on initial load)
  useEffect(() => {
    if (!isInitialLoad) {
      loadPayments(page)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit])

  // Update pagination total when store pagination changes
  useEffect(() => {
    updateFromMeta(storePagination)
  }, [storePagination, updateFromMeta])

  // Calculate stats
  const stats = useMemo(() => {
    const total = pendingPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0)
    const pendingCount = pendingPayments.filter((p) => p.status === 'pending' || p.status === 'payment_slip_submitted').length
    const completedCount = pendingPayments.filter((p) => p.status === 'succeeded').length
    return { total, totalPayments: storePagination.total, pendingCount, completedCount }
  }, [pendingPayments, storePagination.total])

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment)
    setViewModalOpen(true)
  }

  const handleApprove = (payment: Payment) => {
    setPaymentToProcess(payment)
    setConfirmAction('approve')
    setConfirmModalOpen(true)
  }

  const handleReject = (payment: Payment) => {
    setPaymentToProcess(payment)
    setConfirmAction('reject')
    setConfirmModalOpen(true)
  }

  const confirmProcessPayment = async () => {
    if (!paymentToProcess || !confirmAction) return

    try {
      if (confirmAction === 'approve') {
        await approvePayment(paymentToProcess.id)
      } else {
        await rejectPayment(paymentToProcess.id, 'Rejected by admin')
      }
      loadPayments(page)
    } catch (err) {
      // Error handled by store
    }

    setConfirmModalOpen(false)
    setPaymentToProcess(null)
    setConfirmAction(null)
    setViewModalOpen(false)
  }

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'membership':
        return <Package className="w-4 h-4" />
      case 'investment':
        return <TrendingUp className="w-4 h-4" />
      case 'stock':
        return <Zap className="w-4 h-4" />
      case 'stock_pick':
        return <CreditCard className="w-4 h-4" />
      default:
        return <CreditCard className="w-4 h-4" />
    }
  }

  const getPaymentColor = (type: string) => {
    switch (type) {
      case 'membership':
        return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/50'
      case 'investment':
        return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/50'
      case 'stock':
        return 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950/50'
      case 'stock_pick':
        return 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950/50'
      default:
        return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-950/50'
    }
  }

  const getStatusColor = (status: PaymentStatus | string) => {
    switch (status) {
      case 'succeeded':
        return 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400'
      case 'pending':
      case 'payment_slip_submitted':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400'
      case 'failed':
      case 'canceled':
        return 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400'
      case 'processing':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400'
      case 'refunded':
      case 'partially_refunded':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-950/50 dark:text-gray-400'
    }
  }

  const exportToCSV = () => {
    const csvHeaders = ['Date', 'Customer ID', 'Amount', 'Status']
    const csvRows = pendingPayments.map((payment) => [
      payment.created_at,
      payment.customer_id,
      payment.amount?.toString() || '0',
      payment.status,
    ])

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `payments_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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

      {/* Payment Type Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-card">
          <CardContent className="py-0 px-6">
            <div className="text-start">
              <p className="text-xs text-muted-foreground font-medium mb-2">TOTAL AMOUNT</p>
              <p className="text-md text-bold text-foreground">${stats.total.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-blue-50 dark:bg-blue-950/30">
          <CardContent className="py-0 px-6">
            <div className="text-start">
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-2">TOTAL REQUESTS</p>
              <p className="text-md text-bold text-blue-900 dark:text-blue-300">{stats.totalPayments}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-yellow-50 dark:bg-yellow-950/30">
          <CardContent className="py-0 px-6">
            <div className="text-start">
              <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium mb-2">PENDING</p>
              <p className="text-md text-bold text-yellow-900 dark:text-yellow-300">{stats.pendingCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-green-50 dark:bg-green-950/30">
          <CardContent className="py-0 px-6">
            <div className="text-start">
              <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-2">COMPLETED</p>
              <p className="text-md text-bold text-green-900 dark:text-green-300">{stats.completedCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card className="border-0 shadow-sm overflow-hidden bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-md font-bold">Payment Transactions</CardTitle>
              <CardDescription className="text-xs">
                Showing {pendingPayments.length > 0 ? ((page - 1) * limit) + 1 : 0}-
                {Math.min(page * limit, storePagination.total)} of {storePagination.total} transactions
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => loadPayments(page)}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Button variant="outline" className="text-sm h-9" onClick={exportToCSV} disabled={pendingPayments.length === 0}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm h-9"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | PaymentStatus)}
              className="px-3 h-9 rounded-md border border-border text-sm bg-background"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="payment_slip_submitted">Payment Slip Submitted</option>
              <option value="processing">Processing</option>
              <option value="succeeded">Succeeded</option>
              <option value="failed">Failed</option>
              <option value="canceled">Canceled</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          <div className="flex gap-4 items-end mt-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Start date"
                className="h-9"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="End date"
                className="h-9"
              />
            </div>
            {(startDate || endDate) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setStartDate('')
                  setEndDate('')
                }}
                className="h-9"
              >
                Clear Dates
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">No</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Customer</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-center py-3 px-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingPayments.map((payment, index: number) => (
                    <tr key={payment.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4">{((page - 1) * limit) + index + 1}</td>
                      <td className="py-3 px-4 font-medium text-muted-foreground">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">
                            {payment.customer ? `${payment.customer.first_name} ${payment.customer.last_name || ''}`.trim() : payment.customer_id}
                          </p>
                          {payment.customer?.email && (
                            <p className="text-xs text-muted-foreground">{payment.customer.email}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-medium">${Number(payment.amount || 0).toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(payment)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {payment.status === PaymentStatus.PENDING && (
                              <>
                                <DropdownMenuItem onClick={() => handleApprove(payment)} disabled={isApproving}>
                                  <Check className="w-4 h-4 mr-2 text-green-600" />
                                  <span className="text-green-600">Approve</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleReject(payment)} disabled={isApproving}>
                                  <X className="w-4 h-4 mr-2 text-red-600" />
                                  <span className="text-red-600">Reject</span>
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {pendingPayments.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">No payments found</div>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-4">
                <p className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </p>
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
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages || isLoading}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Details Modal */}
      {viewModalOpen && selectedPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setViewModalOpen(false)}>
          <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-semibold">Payment Details</h2>
            </div>
            <div className="p-6 space-y-6">
              {/* Payment Information */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Payment Information</h3>
                <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Payment ID:</span>
                    <span className="text-sm font-medium font-mono">{selectedPayment.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Customer:</span>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {selectedPayment.customer ? `${selectedPayment.customer.first_name} ${selectedPayment.customer.last_name || ''}`.trim() : selectedPayment.customer_id}
                      </div>
                      {selectedPayment.customer?.email && (
                        <div className="text-xs text-muted-foreground">{selectedPayment.customer.email}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Date:</span>
                    <span className="text-sm font-medium">{new Date(selectedPayment.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Amount:</span>
                    <span className="text-lg font-semibold text-primary">${Number(selectedPayment.amount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <span className={`text-sm font-medium capitalize px-2 py-0.5 rounded ${getStatusColor(selectedPayment.status)}`}>
                      {selectedPayment.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-border flex justify-end gap-2">
              {selectedPayment.status === 'pending' && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => handleReject(selectedPayment)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleApprove(selectedPayment)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    disabled={isApproving}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                </>
              )}
              <Button variant="outline" onClick={() => setViewModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Approve/Reject Actions */}
      {confirmModalOpen && paymentToProcess && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4" onClick={() => setConfirmModalOpen(false)}>
          <div className="bg-background rounded-lg shadow-lg max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full ${confirmAction === 'approve' ? 'bg-green-100 dark:bg-green-950/50' : 'bg-red-100 dark:bg-red-950/50'}`}>
                  {confirmAction === 'approve' ? (
                    <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">
                    {confirmAction === 'approve' ? 'Approve Payment' : 'Reject Payment'}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {confirmAction === 'approve'
                      ? 'Are you sure you want to approve this payment? This action will mark the payment as completed.'
                      : 'Are you sure you want to reject this payment? This action will mark the payment as failed.'
                    }
                  </p>
                  <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-medium">${Number(paymentToProcess.amount || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Customer:</span>
                      <div className="text-right">
                        <div className="font-medium">
                          {paymentToProcess.customer ? `${paymentToProcess.customer.first_name} ${paymentToProcess.customer.last_name || ''}`.trim() : paymentToProcess.customer_id}
                        </div>
                        {paymentToProcess.customer?.email && (
                          <div className="text-xs text-muted-foreground">{paymentToProcess.customer.email}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Date:</span>
                      <span className="font-medium">{new Date(paymentToProcess.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-border flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={confirmProcessPayment}
                disabled={isApproving}
                className={confirmAction === 'approve'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
                }
              >
                {isApproving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : confirmAction === 'approve' ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Confirm Approval
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4 mr-2" />
                    Confirm Rejection
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
