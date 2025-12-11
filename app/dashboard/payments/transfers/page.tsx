'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { env } from '@/lib/config/env'
import { tokenManager } from '@/lib/api/client'
import {
  Search,
  Eye,
  Check,
  X,
  ArrowUpCircle,
  ArrowDownCircle,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Download
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { formatCurrency } from '@/lib/utils'

interface TransferHistory {
  id: string
  identify: 'recharge' | 'withdraw' | 'call_payment' | 'video_payment' | 'chat_payment' | 'invest'
  amount: number
  payment_slip: string | null
  service_id: string | null
  status: 'pending' | 'approved' | 'rejected'
  approved_by: string | null
  rejected_by: string | null
  customer_id: string
  created_at: Date
  updated_at: Date
  customer: {
    id: string
    first_name: string
    last_name: string
    email: string
  }
  service?: {
    id: string
    service_type: string
  }
}

interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

interface TransferStats {
  total: number
  pending: number
  approved: number
  rejected: number
}

export default function TransfersPage() {
  const [transfers, setTransfers] = useState<TransferHistory[]>([])
  const [stats, setStats] = useState<TransferStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'recharge' | 'withdraw' | 'invest'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  })

  // Modal state
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedTransfer, setSelectedTransfer] = useState<TransferHistory | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(
        `${env.apiUrl}/admin/transfer-history/stats`,
        {
          headers: {
            'Authorization': `Bearer ${tokenManager.getAccessToken()}`,
          },
        }
      )

      if (!response.ok) throw new Error('Failed to fetch stats')

      const result = await response.json()
      setStats(result.data || null)
    } catch (err) {
      console.error('Failed to load stats:', err)
    }
  }, [])

  const fetchTransfers = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sort: 'created_at',
        order: 'DESC',
      })

      // Add date filters if provided
      if (startDate !== '' && endDate !== '') {
        if (startDate) {
          params.append('start_date', new Date(startDate).toISOString())
        }
        if (endDate) {
          const endDateTime = new Date(endDate)
          endDateTime.setHours(23, 59, 59, 999)
          params.append('end_date', endDateTime.toISOString())
        }
      }

      const response = await fetch(
        `${env.apiUrl}/admin/transfer-history?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${tokenManager.getAccessToken()}`,
          },
        }
      )

      if (!response.ok) throw new Error('Failed to fetch transfers')

      const result = await response.json()
      setTransfers(result.data || [])
      setPagination({
        total: result.total || 0,
        page: result.page || 1,
        limit: result.limit || 10,
        totalPages: result.totalPages || 0,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [pagination.page, pagination.limit, startDate, endDate])

  useEffect(() => {
    fetchStats()
    fetchTransfers()
  }, [fetchStats, fetchTransfers])

  const handleViewDetails = (transfer: TransferHistory) => {
    setSelectedTransfer(transfer)
    setViewModalOpen(true)
  }

  const handleApprove = async (transfer: TransferHistory) => {
    setIsProcessing(true)
    try {
      const response = await fetch(
        `${env.apiUrl}/admin/transfer-history/${transfer.id}/approve`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${tokenManager.getAccessToken()}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) throw new Error('Failed to approve transfer')

      await fetchTransfers()
      setViewModalOpen(false)
      setSelectedTransfer(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to approve')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async (transfer: TransferHistory) => {
    setIsProcessing(true)
    try {
      const response = await fetch(
        `${env.apiUrl}/admin/transfer-history/${transfer.id}/reject`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${tokenManager.getAccessToken()}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) throw new Error('Failed to reject transfer')

      await fetchTransfers()
      setViewModalOpen(false)
      setSelectedTransfer(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to reject')
    } finally {
      setIsProcessing(false)
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'recharge':
        return (
          <Badge className="bg-green-100 text-green-700">
            <ArrowUpCircle className="w-3 h-3 mr-1" />
            Deposit
          </Badge>
        )
      case 'withdraw':
        return (
          <Badge className="bg-red-100 text-red-700">
            <ArrowDownCircle className="w-3 h-3 mr-1" />
            Withdrawal
          </Badge>
        )
      case 'invest':
        return <Badge className="bg-blue-100 text-blue-700">Investment</Badge>
      case 'call_payment':
        return <Badge className="bg-purple-100 text-purple-700">Call Payment</Badge>
      case 'video_payment':
        return <Badge className="bg-pink-100 text-pink-700">Video Payment</Badge>
      case 'chat_payment':
        return <Badge className="bg-orange-100 text-orange-700">Chat Payment</Badge>
      default:
        return <Badge>{type}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>
      case 'approved':
        return <Badge className="bg-green-100 text-green-700">Approved</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700">Rejected</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const filteredTransfers = transfers.filter((transfer) => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = (
      transfer.customer.first_name.toLowerCase().includes(searchLower) ||
      transfer.customer.last_name.toLowerCase().includes(searchLower) ||
      transfer.customer.email.toLowerCase().includes(searchLower)
    )
    const matchesType = filterType === 'all' || transfer.identify === filterType
    const matchesStatus = filterStatus === 'all' || transfer.status === filterStatus
    return matchesSearch && matchesType && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Deposits & Withdrawals</h1>
        <p className="text-muted-foreground mt-1">
          Manage customer deposit and withdrawal requests
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="w-4 h-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pending || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.approved || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.rejected || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={(v: any) => setFilterType(v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="recharge">Deposits</SelectItem>
                <SelectItem value="withdraw">Withdrawals</SelectItem>
                <SelectItem value="invest">Investments</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-4 items-end mt-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Start date"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="End date"
              />
            </div>
            {(startDate || endDate) && (
              <Button
                variant="outline"
                onClick={() => {
                  setStartDate('')
                  setEndDate('')
                }}
              >
                Clear Dates
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransfers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No transfers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransfers.map((transfer) => (
                      <TableRow key={transfer.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {transfer.customer.first_name} {transfer.customer.last_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {transfer.customer.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getTypeBadge(transfer.identify)}</TableCell>
                        <TableCell>
                          <div className="font-medium">{formatCurrency(transfer.amount)}</div>
                        </TableCell>
                        <TableCell>
                          {new Date(transfer.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(transfer.status)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(transfer)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredTransfers.length} of {pagination.total} transfers
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
                    disabled={pagination.page === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination((p) => ({ ...p, page: Math.min(p.totalPages, p.page + 1) }))}
                    disabled={pagination.page === pagination.totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* View Details Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Transfer Details</DialogTitle>
            <DialogDescription>
              Review and approve or reject the customer's transfer request
            </DialogDescription>
          </DialogHeader>

          {selectedTransfer && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="space-y-2">
                <h3 className="font-semibold">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>{' '}
                    <span className="font-medium">
                      {selectedTransfer.customer.first_name} {selectedTransfer.customer.last_name}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>{' '}
                    <span className="font-medium">{selectedTransfer.customer.email}</span>
                  </div>
                </div>
              </div>

              {/* Transfer Info */}
              <div className="space-y-2">
                <h3 className="font-semibold">Transfer Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Type:</span>{' '}
                    {getTypeBadge(selectedTransfer.identify)}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Amount:</span>{' '}
                    <span className="font-medium text-lg">{formatCurrency(selectedTransfer.amount)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Date:</span>{' '}
                    <span className="font-medium">
                      {new Date(selectedTransfer.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>{' '}
                    {getStatusBadge(selectedTransfer.status)}
                  </div>
                </div>
              </div>

              {/* Payment Slip */}
              {selectedTransfer.payment_slip && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Payment Slip</h3>
                  <img
                    src={selectedTransfer.payment_slip}
                    alt="Payment slip"
                    className="w-full max-h-96 object-contain rounded-md border"
                  />
                  <a
                    href={selectedTransfer.payment_slip}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <Download className="w-4 h-4" />
                    Download payment slip
                  </a>
                </div>
              )}

              {/* Actions */}
              {selectedTransfer.status === 'pending' && (
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setViewModalOpen(false)}
                    disabled={isProcessing}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleReject(selectedTransfer)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Rejecting...
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4 mr-2" />
                        Reject
                      </>
                    )}
                  </Button>
                  <Button onClick={() => handleApprove(selectedTransfer)} disabled={isProcessing}>
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Approving...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Approve
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
