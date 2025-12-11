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
    ChevronRight
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
import { formatCurrency, formatNumber } from '@/lib/utils'

interface StockPick {
    id: string
    symbol: string
    company_name: string
    service_type: string
    current_price: number
    target_price: number
    recommendation_date: Date
    status: string
}

interface CustomerStockPick {
    id: string
    customer_id: string
    stock_pick_id: string
    status: 'selected' | 'payment_submitted' | 'approved' | 'rejected' | 'email_sent'
    customer_notes: string | null
    admin_response: string | null
    payment_slip_url: string | null
    payment_slip_filename: string | null
    payment_amount: number | null
    payment_reference: string | null
    payment_submitted_at: Date | null
    selected_price: number | null
    approved_at: Date | null
    created_at: Date
    // Backend adds these fields
    customer_email?: string
    customer_name?: string
    stock_symbol?: string
    customer?: {
        id: string
        first_name: string
        last_name: string
        email: string
    }
    stock_pick?: StockPick
}

interface PaginationMeta {
    total: number
    page: number
    limit: number
    totalPages: number
}

interface StockPickStats {
    total: number
    selected: number
    payment_submitted: number
    approved: number
    rejected: number
    email_sent: number
}

export default function StockPickPaymentsPage() {
    const [picks, setPicks] = useState<CustomerStockPick[]>([])
    const [stats, setStats] = useState<StockPickStats | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState<'all' | 'selected' | 'payment_submitted' | 'approved' | 'rejected' | 'email_sent'>('payment_submitted')
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
    const [selectedPick, setSelectedPick] = useState<CustomerStockPick | null>(null)
    const [adminResponse, setAdminResponse] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)

    const fetchStats = useCallback(async () => {
        try {
            const response = await fetch(
                `${env.apiUrl}/admin/stock-picks/customer-picks/stats`,
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

    const fetchPicks = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
            })

            // Add status filter if not 'all'
            if (filterStatus !== 'all') {
                params.append('status', filterStatus)
            }

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
                `${env.apiUrl}/admin/stock-picks/customer-picks?${params}`,
                {
                    headers: {
                        'Authorization': `Bearer ${tokenManager.getAccessToken()}`,
                    },
                }
            )

            if (!response.ok) throw new Error('Failed to fetch stock pick payments')

            const result = await response.json()
            setPicks(result.data || [])
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
    }, [pagination.page, pagination.limit, filterStatus, startDate, endDate])

    useEffect(() => {
        fetchStats()
    }, [fetchStats])

    useEffect(() => {
        fetchPicks()
    }, [fetchPicks])

    const handleViewDetails = (pick: CustomerStockPick) => {
        setSelectedPick(pick)
        setAdminResponse(pick.admin_response || '')
        setViewModalOpen(true)
    }

    const handleApprove = async () => {
        if (!selectedPick) return
        setIsProcessing(true)
        try {
            const response = await fetch(
                `${env.apiUrl}/admin/stock-picks/customer-picks/${selectedPick.id}/approve`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${tokenManager.getAccessToken()}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        admin_response: adminResponse,
                    }),
                }
            )

            if (!response.ok) throw new Error('Failed to approve payment')

            await fetchPicks()
            setViewModalOpen(false)
            setSelectedPick(null)
            setAdminResponse('')
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to approve')
        } finally {
            setIsProcessing(false)
        }
    }

    const handleReject = async () => {
        if (!selectedPick) return
        setIsProcessing(true)
        try {
            const response = await fetch(
                `${env.apiUrl}/admin/stock-picks/customer-picks/${selectedPick.id}/reject`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${tokenManager.getAccessToken()}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        admin_response: adminResponse || 'Payment rejected by admin',
                    }),
                }
            )

            if (!response.ok) throw new Error('Failed to reject payment')

            await fetchPicks()
            setViewModalOpen(false)
            setSelectedPick(null)
            setAdminResponse('')
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to reject')
        } finally {
            setIsProcessing(false)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'payment_submitted':
                return <Badge className="bg-yellow-100 text-yellow-700">Payment Submitted</Badge>
            case 'approved':
                return <Badge className="bg-green-100 text-green-700">Approved</Badge>
            case 'rejected':
                return <Badge className="bg-red-100 text-red-700">Rejected</Badge>
            default:
                return <Badge>{status}</Badge>
        }
    }

    const filteredPicks = picks.filter((pick) => {
        const searchLower = searchTerm.toLowerCase()
        return (
            pick.customer_name?.toLowerCase().includes(searchLower) ||
            pick.customer_email?.toLowerCase().includes(searchLower) ||
            pick.customer?.first_name?.toLowerCase().includes(searchLower) ||
            pick.customer?.last_name?.toLowerCase().includes(searchLower) ||
            pick.customer?.email?.toLowerCase().includes(searchLower) ||
            pick.stock_symbol?.toLowerCase().includes(searchLower) ||
            pick.stock_pick?.symbol?.toLowerCase().includes(searchLower) ||
            pick.stock_pick?.company_name?.toLowerCase().includes(searchLower)
        )
    })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Stock Pick Payments</h1>
                <p className="text-muted-foreground mt-1">
                    Manage customer stock pick selections and payment approvals
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Picks</CardTitle>
                        <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.total || 0}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Pending Payment</CardTitle>
                        <Clock className="w-4 h-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.payment_submitted || 0}</div>
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

            {/* Filters and Search */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by customer name, email, or stock symbol..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="payment_submitted">Payment Submitted</SelectItem>
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
                                        <TableHead>Stock</TableHead>
                                        <TableHead>Service Type</TableHead>
                                        <TableHead>Payment Amount</TableHead>
                                        <TableHead>Submitted At</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredPicks.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                                No stock pick payments found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredPicks.map((pick) => (
                                            <TableRow key={pick.id}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">
                                                            {pick.customer_name || (pick.customer ? `${pick.customer.first_name} ${pick.customer.last_name}` : 'N/A')}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {pick.customer_email || pick.customer?.email || 'N/A'}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{pick.stock_symbol || pick.stock_pick?.symbol || 'N/A'}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {pick.stock_pick?.company_name || '-'}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {pick.stock_pick?.service_type?.replace('_', ' ').toUpperCase() || 'STOCK PICK'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">
                                                        {pick.payment_amount ? formatCurrency(pick.payment_amount) : '-'}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {pick.payment_submitted_at
                                                        ? new Date(pick.payment_submitted_at).toLocaleDateString()
                                                        : '-'}
                                                </TableCell>
                                                <TableCell>{getStatusBadge(pick.status)}</TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleViewDetails(pick)}
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
                                    Showing {filteredPicks.length} of {pagination.total} picks
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
                        <DialogTitle>Stock Pick Payment Details</DialogTitle>
                        <DialogDescription>
                            Review and approve or reject the customer's stock pick payment
                        </DialogDescription>
                    </DialogHeader>

                    {selectedPick && (
                        <div className="space-y-6">
                            {/* Customer Info */}
                            <div className="space-y-2">
                                <h3 className="font-semibold">Customer Information</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Name:</span>{' '}
                                        <span className="font-medium">
                                            {selectedPick.customer_name || (selectedPick.customer ? `${selectedPick.customer.first_name} ${selectedPick.customer.last_name}` : 'N/A')}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Email:</span>{' '}
                                        <span className="font-medium">{selectedPick.customer_email || selectedPick.customer?.email || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Stock Info */}
                            <div className="space-y-2">
                                <h3 className="font-semibold">Stock Information</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Symbol:</span>{' '}
                                        <span className="font-medium">{selectedPick.stock_symbol || selectedPick.stock_pick?.symbol || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Company:</span>{' '}
                                        <span className="font-medium">{selectedPick.stock_pick?.company_name || '-'}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Current Price:</span>{' '}
                                        <span className="font-medium">
                                            {selectedPick.stock_pick?.current_price ? formatCurrency(selectedPick.stock_pick.current_price) : '-'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Target Price:</span>{' '}
                                        <span className="font-medium">
                                            {selectedPick.stock_pick?.target_price ? formatCurrency(selectedPick.stock_pick.target_price) : '-'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Selected Price:</span>{' '}
                                        <span className="font-medium">
                                            {selectedPick.selected_price ? formatCurrency(selectedPick.selected_price) : '-'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Service Type:</span>{' '}
                                        <Badge variant="outline">
                                            {selectedPick.stock_pick?.service_type?.replace('_', ' ').toUpperCase() || 'STOCK PICK'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div className="space-y-2">
                                <h3 className="font-semibold">Payment Information</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Amount:</span>{' '}
                                        <span className="font-medium">
                                            {selectedPick.payment_amount ? formatCurrency(selectedPick.payment_amount) : '-'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Reference:</span>{' '}
                                        <span className="font-medium">{selectedPick.payment_reference || '-'}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Submitted:</span>{' '}
                                        <span className="font-medium">
                                            {selectedPick.payment_submitted_at
                                                ? new Date(selectedPick.payment_submitted_at).toLocaleString()
                                                : '-'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Status:</span>{' '}
                                        {getStatusBadge(selectedPick.status)}
                                    </div>
                                </div>
                            </div>

                            {/* Payment Slip */}
                            {selectedPick.payment_slip_url && (
                                <div className="space-y-2">
                                    <h3 className="font-semibold">Payment Slip</h3>
                                    <img
                                        src={selectedPick.payment_slip_url}
                                        alt="Payment slip"
                                        className="w-full max-h-96 object-contain rounded-md border"
                                    />
                                    <a
                                        href={selectedPick.payment_slip_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 hover:underline"
                                    >
                                        View full size
                                    </a>
                                </div>
                            )}

                            {/* Customer Notes */}
                            {selectedPick.customer_notes && (
                                <div className="space-y-2">
                                    <h3 className="font-semibold">Customer Notes</h3>
                                    <p className="text-sm text-muted-foreground p-3 bg-muted rounded-md">
                                        {selectedPick.customer_notes}
                                    </p>
                                </div>
                            )}

                            {/* Admin Response */}
                            {selectedPick.status === 'payment_submitted' && (
                                <div className="space-y-2">
                                    <h3 className="font-semibold">Admin Response</h3>
                                    <Textarea
                                        value={adminResponse}
                                        onChange={(e) => setAdminResponse(e.target.value)}
                                        placeholder="Enter response message (optional)"
                                        rows={3}
                                    />
                                </div>
                            )}

                            {/* Actions */}
                            {selectedPick.status === 'payment_submitted' && (
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
