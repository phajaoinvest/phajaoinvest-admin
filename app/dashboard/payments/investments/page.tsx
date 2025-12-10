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
  TrendingUp, 
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Download,
  Target,
  Shield
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
import { formatCurrency, formatPercentage } from '@/lib/utils'

interface InvestmentRequest {
  id: string
  customer_id: string
  service_id: string
  payment_slip_url: string
  amount: string
  payment_date: Date | null
  customer_notes: string | null
  requested_investment_period: string | null
  requested_risk_tolerance: string | null
  requested_investment_goal: string | null
  calculated_tier: string | null
  calculated_interest_rate: string | null
  status: 'pending' | 'approved' | 'rejected'
  admin_notes: string | null
  reviewed_by: string | null
  reviewed_at: Date | null
  created_at: Date
  updated_at: Date
  customer: {
    id: string
    first_name: string
    last_name: string
    email: string
  }
  service: {
    id: string
    service_type: string
    balance: number
  }
}

interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

interface InvestmentStats {
  total: number
  pending: number
  approved: number
  rejected: number
}

export default function InvestmentPaymentsPage() {
  const [requests, setRequests] = useState<InvestmentRequest[]>([])
  const [stats, setStats] = useState<InvestmentStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  })

  // Modal state
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<InvestmentRequest | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(
        `${env.apiUrl}/investment-requests/admin/stats`,
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

  const fetchRequests = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      const response = await fetch(
        `${env.apiUrl}/investment-requests/admin/pending?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${tokenManager.getAccessToken()}`,
          },
        }
      )

      if (!response.ok) throw new Error('Failed to fetch investment requests')

      const result = await response.json()
      setRequests(result.data || [])
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
  }, [pagination.page, pagination.limit])

  useEffect(() => {
    fetchStats()
    fetchRequests()
  }, [fetchStats, fetchRequests])

  const handleViewDetails = (request: InvestmentRequest) => {
    setSelectedRequest(request)
    setAdminNotes(request.admin_notes || '')
    setViewModalOpen(true)
  }

  const handleApprove = async () => {
    if (!selectedRequest) return
    setIsProcessing(true)
    try {
      const response = await fetch(
        `${env.apiUrl}/investment-requests/admin/${selectedRequest.id}/approve`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${tokenManager.getAccessToken()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            admin_notes: adminNotes || undefined,
          }),
        }
      )

      if (!response.ok) throw new Error('Failed to approve investment request')

      await fetchRequests()
      setViewModalOpen(false)
      setSelectedRequest(null)
      setAdminNotes('')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to approve')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedRequest) return
    setIsProcessing(true)
    try {
      const response = await fetch(
        `${env.apiUrl}/investment-requests/admin/${selectedRequest.id}/reject`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            admin_notes: adminNotes || 'Investment request rejected by admin',
          }),
        }
      )

      if (!response.ok) throw new Error('Failed to reject investment request')

      await fetchRequests()
      setViewModalOpen(false)
      setSelectedRequest(null)
      setAdminNotes('')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to reject')
    } finally {
      setIsProcessing(false)
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

  const getTierBadge = (tier: string | null) => {
    if (!tier) return <Badge variant="outline">-</Badge>
    switch (tier.toLowerCase()) {
      case 'bronze':
        return <Badge className="bg-amber-100 text-amber-700">Bronze</Badge>
      case 'silver':
        return <Badge className="bg-gray-100 text-gray-700">Silver</Badge>
      case 'gold':
        return <Badge className="bg-yellow-100 text-yellow-700">Gold</Badge>
      default:
        return <Badge variant="outline">{tier}</Badge>
    }
  }

  const filteredRequests = requests.filter((request) => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = (
      request.customer.first_name.toLowerCase().includes(searchLower) ||
      request.customer.last_name.toLowerCase().includes(searchLower) ||
      request.customer.email.toLowerCase().includes(searchLower)
    )
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Investment Payments</h1>
        <p className="text-muted-foreground mt-1">
          Review and approve customer investment requests with payment slips
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
                    <TableHead>Amount</TableHead>
                    <TableHead>Tier / Interest</TableHead>
                    <TableHead>Investment Goal</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No investment requests found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {request.customer.first_name} {request.customer.last_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {request.customer.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{formatCurrency(Number(request.amount))}</div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {getTierBadge(request.calculated_tier)}
                            {request.calculated_interest_rate && (
                              <div className="text-sm text-muted-foreground">
                                {formatPercentage(Number(request.calculated_interest_rate) * 100)}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">
                              {request.requested_investment_goal || '-'}
                            </div>
                            <div className="text-muted-foreground">
                              {request.requested_investment_period || '-'} • {request.requested_risk_tolerance || '-'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {request.payment_date
                            ? new Date(request.payment_date).toLocaleDateString()
                            : new Date(request.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(request)}
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
                  Showing {filteredRequests.length} of {pagination.total} requests
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Investment Request Details</DialogTitle>
            <DialogDescription>
              Review and approve or reject the customer's investment request
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="space-y-2">
                <h3 className="font-semibold">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>{' '}
                    <span className="font-medium">
                      {selectedRequest.customer.first_name} {selectedRequest.customer.last_name}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>{' '}
                    <span className="font-medium">{selectedRequest.customer.email}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Current Balance:</span>{' '}
                    <span className="font-medium">{formatCurrency(selectedRequest.service.balance)}</span>
                  </div>
                </div>
              </div>

              {/* Investment Info */}
              <div className="space-y-2">
                <h3 className="font-semibold">Investment Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Amount:</span>{' '}
                    <span className="font-medium text-lg">{formatCurrency(Number(selectedRequest.amount))}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Calculated Tier:</span>{' '}
                    {getTierBadge(selectedRequest.calculated_tier)}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Interest Rate:</span>{' '}
                    <span className="font-medium">
                      {selectedRequest.calculated_interest_rate
                        ? formatPercentage(Number(selectedRequest.calculated_interest_rate) * 100)
                        : '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>{' '}
                    {getStatusBadge(selectedRequest.status)}
                  </div>
                </div>
              </div>

              {/* Investment Preferences */}
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Investment Preferences
                </h3>
                <div className="grid grid-cols-3 gap-4 text-sm bg-muted p-4 rounded-md">
                  <div>
                    <span className="text-muted-foreground block mb-1">Investment Goal:</span>
                    <span className="font-medium">{selectedRequest.requested_investment_goal || '-'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">Investment Period:</span>
                    <span className="font-medium">{selectedRequest.requested_investment_period || '-'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">
                      <Shield className="w-3 h-3 inline mr-1" />
                      Risk Tolerance:
                    </span>
                    <span className="font-medium">{selectedRequest.requested_risk_tolerance || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="space-y-2">
                <h3 className="font-semibold">Payment Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Payment Date:</span>{' '}
                    <span className="font-medium">
                      {selectedRequest.payment_date
                        ? new Date(selectedRequest.payment_date).toLocaleDateString()
                        : '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Submitted:</span>{' '}
                    <span className="font-medium">
                      {new Date(selectedRequest.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Slip */}
              {selectedRequest.payment_slip_url && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Payment Slip</h3>
                  <img
                    src={selectedRequest.payment_slip_url}
                    alt="Payment slip"
                    className="w-full max-h-96 object-contain rounded-md border"
                  />
                  <a
                    href={selectedRequest.payment_slip_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <Download className="w-4 h-4" />
                    Download payment slip
                  </a>
                </div>
              )}

              {/* Customer Notes */}
              {selectedRequest.customer_notes && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Customer Notes</h3>
                  <p className="text-sm text-muted-foreground p-3 bg-muted rounded-md">
                    {selectedRequest.customer_notes}
                  </p>
                </div>
              )}

              {/* Admin Notes */}
              {selectedRequest.status === 'pending' && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Admin Notes (Optional)</h3>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add notes about this investment approval/rejection..."
                    rows={3}
                  />
                </div>
              )}

              {/* Existing Admin Notes (if approved/rejected) */}
              {selectedRequest.admin_notes && selectedRequest.status !== 'pending' && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Admin Notes</h3>
                  <p className="text-sm text-muted-foreground p-3 bg-muted rounded-md">
                    {selectedRequest.admin_notes}
                  </p>
                  {selectedRequest.reviewed_at && (
                    <p className="text-xs text-muted-foreground">
                      Reviewed on {new Date(selectedRequest.reviewed_at).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {/* Actions */}
              {selectedRequest.status === 'pending' && (
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
                    onClick={handleReject}
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
                  <Button onClick={handleApprove} disabled={isProcessing}>
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Approving...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Approve & Create Investment
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
