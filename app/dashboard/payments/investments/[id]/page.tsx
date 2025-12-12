'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { env } from '@/lib/config/env'
import { tokenManager } from '@/lib/api/client'
import {
    ArrowLeft,
    Check,
    X,
    Loader2,
    Calendar,
    DollarSign,
    FileText,
    User,
    Mail,
    TrendingUp,
    Target,
    Shield,
    Clock,
    CheckCircle,
    XCircle,
    Download,
} from 'lucide-react'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'

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
    service?: {
        id: string
        service_type: string
        balance: number
    }
}

const statusColors: Record<string, { bg: string; text: string; icon: any }> = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
    approved: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
    rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
}

export default function InvestmentDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const requestId = params.id as string

    const [request, setRequest] = useState<InvestmentRequest | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isProcessing, setIsProcessing] = useState(false)
    const [adminNotes, setAdminNotes] = useState('')

    useEffect(() => {
        if (requestId) {
            fetchRequestDetails()
        }
    }, [requestId])

    const fetchRequestDetails = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(
                `${env.apiUrl}/investment-requests/admin/${requestId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${tokenManager.getAccessToken()}`,
                    },
                }
            )

            if (!response.ok) {
                throw new Error('Failed to fetch investment request details')
            }

            const result = await response.json()
            setRequest(result.data)
            setAdminNotes(result.data.admin_notes || '')
        } catch (err) {
            console.error('Failed to load investment request details:', err)
            toast({
                title: 'Error',
                description: 'Failed to load investment request details',
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleApprove = async () => {
        if (!adminNotes.trim()) {
            toast({
                title: 'Validation Error',
                description: 'Please provide admin notes',
                variant: 'destructive',
            })
            return
        }

        setIsProcessing(true)
        try {
            const response = await fetch(
                `${env.apiUrl}/investment-requests/admin/${requestId}/approve`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${tokenManager.getAccessToken()}`,
                    },
                    body: JSON.stringify({ admin_notes: adminNotes }),
                }
            )

            if (!response.ok) {
                throw new Error('Failed to approve investment request')
            }

            toast({
                title: 'Success',
                description: 'Investment request approved successfully',
            })

            await fetchRequestDetails()
        } catch (err) {
            console.error('Approval failed:', err)
            toast({
                title: 'Error',
                description: 'Failed to approve investment request',
                variant: 'destructive',
            })
        } finally {
            setIsProcessing(false)
        }
    }

    const handleReject = async () => {
        if (!adminNotes.trim()) {
            toast({
                title: 'Validation Error',
                description: 'Please provide rejection reason',
                variant: 'destructive',
            })
            return
        }

        setIsProcessing(true)
        try {
            const response = await fetch(
                `${env.apiUrl}/investment-requests/admin/${requestId}/reject`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${tokenManager.getAccessToken()}`,
                    },
                    body: JSON.stringify({ admin_notes: adminNotes }),
                }
            )

            if (!response.ok) {
                throw new Error('Failed to reject investment request')
            }

            toast({
                title: 'Success',
                description: 'Investment request rejected',
            })

            await fetchRequestDetails()
        } catch (err) {
            console.error('Rejection failed:', err)
            toast({
                title: 'Error',
                description: 'Failed to reject investment request',
                variant: 'destructive',
            })
        } finally {
            setIsProcessing(false)
        }
    }

    const getStatusInfo = (status: string) => {
        return statusColors[status] || { bg: 'bg-gray-100', text: 'text-gray-800', icon: Clock }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!request) {
        return (
            <div className="container mx-auto p-6">
                <Card>
                    <CardContent className="p-6">
                        <p className="text-center text-muted-foreground">Investment request not found</p>
                        <Button
                            onClick={() => router.push('/dashboard/payments/investments')}
                            className="mt-4 mx-auto block"
                        >
                            Back to Investments
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const statusInfo = getStatusInfo(request.status)
    const StatusIcon = statusInfo.icon

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push('/dashboard/payments/investments')}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Investment Request Details</h1>
                        <p className="text-muted-foreground">
                            Request ID: {request.id.slice(0, 8)}...
                        </p>
                    </div>
                </div>
                <Badge className={`${statusInfo.bg} ${statusInfo.text} text-sm py-1 px-3`}>
                    <StatusIcon className="h-4 w-4 mr-1" />
                    {request.status.toUpperCase()}
                </Badge>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Customer & Investment Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Customer Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Customer Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Name</p>
                                    <p className="font-medium">{`${request.customer.first_name} ${request.customer.last_name}`}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-medium">{request.customer.email}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Investment Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Investment Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Investment Amount</p>
                                    <p className="font-medium text-lg">{formatCurrency(parseFloat(request.amount))}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Calculated Tier</p>
                                    <Badge variant="outline" className="text-sm">
                                        {request.calculated_tier?.toUpperCase() || 'N/A'}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Interest Rate</p>
                                    <p className="font-medium text-green-600">
                                        {request.calculated_interest_rate ? formatPercentage(parseFloat(request.calculated_interest_rate)) : 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Risk Tolerance</p>
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-4 w-4" />
                                        <p className="font-medium">{request.requested_risk_tolerance?.toUpperCase() || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm text-muted-foreground">Investment Period</p>
                                    <p className="font-medium">{request.requested_investment_period || 'N/A'}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm text-muted-foreground">Investment Goal</p>
                                    <p className="font-medium">{request.requested_investment_goal || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Payment Date</p>
                                    <p className="font-medium">
                                        {request.payment_date ? new Date(request.payment_date).toLocaleString() : 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Created At</p>
                                    <p className="font-medium">
                                        {new Date(request.created_at).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* Customer Notes */}
                            {request.customer_notes && (
                                <div className="pt-4 border-t">
                                    <p className="text-sm text-muted-foreground mb-2">Customer Notes</p>
                                    <p className="text-sm bg-muted p-3 rounded-md">
                                        {request.customer_notes}
                                    </p>
                                </div>
                            )}

                            {/* Payment Slip */}
                            {request.payment_slip_url && (
                                <div className="pt-4 border-t">
                                    <p className="text-sm text-muted-foreground mb-2">Payment Slip</p>
                                    <div className="flex items-center gap-4 mb-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => window.open(request.payment_slip_url, '_blank')}
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            View Slip
                                        </Button>
                                    </div>
                                    <div className="mt-4">
                                        <img
                                            src={request.payment_slip_url}
                                            alt="Payment slip"
                                            className="w-full max-w-md border rounded-lg"
                                        />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Admin Actions */}
                <div className="space-y-6">
                    {/* Status Timeline */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Status Timeline
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="mt-1">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Created</p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(request.created_at).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            {request.reviewed_at && (
                                <div className="flex items-start gap-3">
                                    <div className="mt-1">
                                        {request.status === 'approved' ? (
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                        ) : (
                                            <XCircle className="h-4 w-4 text-red-600" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">
                                            {request.status === 'approved' ? 'Approved' : 'Rejected'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(request.reviewed_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Admin Response Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Admin Response
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {request.status === 'pending' ? (
                                <>
                                    <Textarea
                                        placeholder="Enter your response or notes..."
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        rows={6}
                                        className="resize-none"
                                    />
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={handleApprove}
                                            disabled={isProcessing || !adminNotes.trim()}
                                            className="flex-1 bg-green-600 hover:bg-green-700"
                                        >
                                            {isProcessing ? (
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            ) : (
                                                <Check className="h-4 w-4 mr-2" />
                                            )}
                                            Approve
                                        </Button>
                                        <Button
                                            onClick={handleReject}
                                            disabled={isProcessing || !adminNotes.trim()}
                                            variant="destructive"
                                            className="flex-1"
                                        >
                                            {isProcessing ? (
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            ) : (
                                                <X className="h-4 w-4 mr-2" />
                                            )}
                                            Reject
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <div className="bg-muted p-4 rounded-md">
                                    <p className="text-sm font-medium mb-2">Previous Response:</p>
                                    <p className="text-sm">{request.admin_notes || 'No response provided'}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
