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
    Clock,
    CheckCircle,
    XCircle,
    Download,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'

interface StockPick {
    id: string
    stock_symbol: string
    company: string | null
    description: string
    service_type: string
    current_price: number | null
    target_price: number | null
    sale_price: number
    status: string
    availability: string | null
    risk_level: string | null
    recommendation: string | null
    expected_return_min_percent: number | null
    expected_return_max_percent: number | null
    time_horizon_min_months: number | null
    time_horizon_max_months: number | null
    sector: string | null
    analyst_name: string | null
    admin_notes: string | null
    created_at: Date
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
    customer_email: string
    customer_name: string
    stock_symbol: string
    customer?: {
        id: string
        first_name: string
        last_name: string
        email: string
    }
    stock_pick?: StockPick
}

const statusColors: Record<string, { bg: string; text: string; icon: any }> = {
    selected: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Clock },
    payment_submitted: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
    approved: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
    rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
    email_sent: { bg: 'bg-purple-100', text: 'text-purple-800', icon: Mail },
}

export default function StockPickPaymentDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const pickId = params.id as string

    const [pick, setPick] = useState<CustomerStockPick | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isProcessing, setIsProcessing] = useState(false)
    const [adminResponse, setAdminResponse] = useState('')

    useEffect(() => {
        if (pickId) {
            fetchPickDetails()
        }
    }, [pickId])

    const fetchPickDetails = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(
                `${env.apiUrl}/admin/stock-picks/customer-picks/${pickId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${tokenManager.getAccessToken()}`,
                    },
                }
            )

            if (!response.ok) {
                throw new Error('Failed to fetch pick details')
            }

            const result = await response.json()
            setPick(result.data)
            setAdminResponse(result.data.admin_response || '')
        } catch (err) {
            console.error('Failed to load pick details:', err)
            toast({
                title: 'Error',
                description: 'Failed to load payment details',
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleApprove = async () => {
        if (!adminResponse.trim()) {
            toast({
                title: 'Validation Error',
                description: 'Please provide admin response',
                variant: 'destructive',
            })
            return
        }

        setIsProcessing(true)
        try {
            const response = await fetch(
                `${env.apiUrl}/admin/stock-picks/customer-picks/${pickId}/approve`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${tokenManager.getAccessToken()}`,
                    },
                    body: JSON.stringify({
                        approve: true,
                        admin_response: adminResponse,
                    }),
                }
            )

            if (!response.ok) {
                throw new Error('Failed to approve')
            }

            toast({
                title: 'Success',
                description: 'Payment approved successfully',
            })

            await fetchPickDetails()
        } catch (err) {
            console.error('Approval failed:', err)
            toast({
                title: 'Error',
                description: 'Failed to approve payment',
                variant: 'destructive',
            })
        } finally {
            setIsProcessing(false)
        }
    }

    const handleReject = async () => {
        if (!adminResponse.trim()) {
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
                `${env.apiUrl}/admin/stock-picks/customer-picks/${pickId}/reject`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${tokenManager.getAccessToken()}`,
                    },
                    body: JSON.stringify({
                        approve: false,
                        admin_response: adminResponse,
                    }),
                }
            )

            if (!response.ok) {
                throw new Error('Failed to reject')
            }

            toast({
                title: 'Success',
                description: 'Payment rejected',
            })

            await fetchPickDetails()
        } catch (err) {
            console.error('Rejection failed:', err)
            toast({
                title: 'Error',
                description: 'Failed to reject payment',
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

    if (!pick) {
        return (
            <div className="container mx-auto p-6">
                <Card>
                    <CardContent className="p-6">
                        <p className="text-center text-muted-foreground">Payment not found</p>
                        <Button
                            onClick={() => router.push('/dashboard/payments/stock-picks')}
                            className="mt-4 mx-auto block"
                        >
                            Back to Payments
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const statusInfo = getStatusInfo(pick.status)
    const StatusIcon = statusInfo.icon

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push('/dashboard/payments/stock-picks')}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Stock Pick Payment Details</h1>
                        <p className="text-muted-foreground">
                            Payment ID: {pick.id.slice(0, 8)}...
                        </p>
                    </div>
                </div>
                <Badge className={`${statusInfo.bg} ${statusInfo.text} text-sm py-1 px-3`}>
                    <StatusIcon className="h-4 w-4 mr-1" />
                    {pick.status.replace('_', ' ').toUpperCase()}
                </Badge>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Customer & Stock Info */}
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
                                    <p className="font-medium">{pick.customer_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-medium">{pick.customer_email}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stock Pick Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Stock Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {pick.stock_pick ? (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Symbol</p>
                                            <p className="font-medium text-lg">{pick.stock_pick.stock_symbol}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Company</p>
                                            <p className="font-medium">{pick.stock_pick.company || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Service Type</p>
                                            <Badge variant="outline">
                                                {pick.stock_pick.service_type?.replace('_', ' ').toUpperCase()}
                                            </Badge>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Status</p>
                                            <Badge variant="outline" className={
                                                pick.stock_pick.status === 'good' ? 'bg-green-100 text-green-800' :
                                                pick.stock_pick.status === 'bad' ? 'bg-red-100 text-red-800' :
                                                'bg-gray-100 text-gray-800'
                                            }>
                                                {pick.stock_pick.status?.toUpperCase()}
                                            </Badge>
                                        </div>
                                        {pick.stock_pick.availability && (
                                            <div>
                                                <p className="text-sm text-muted-foreground">Availability</p>
                                                <Badge variant="outline">
                                                    {pick.stock_pick.availability.toUpperCase()}
                                                </Badge>
                                            </div>
                                        )}
                                    </div>

                                    {/* Price Information */}
                                    <div className="pt-4 border-t">
                                        <h4 className="font-semibold mb-3">Price Information</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Current Price</p>
                                                <p className="font-medium text-lg">
                                                    {pick.stock_pick.current_price ? formatCurrency(pick.stock_pick.current_price) : 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Target Price</p>
                                                <p className="font-medium text-lg text-green-600">
                                                    {pick.stock_pick.target_price ? formatCurrency(pick.stock_pick.target_price) : 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Selected Price</p>
                                                <p className="font-medium">
                                                    {pick.selected_price ? formatCurrency(pick.selected_price) : 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Sale Price</p>
                                                <p className="font-medium">
                                                    {pick.stock_pick.sale_price ? formatCurrency(pick.stock_pick.sale_price) : 'Free'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Analysis Details */}
                                    <div className="pt-4 border-t">
                                        <h4 className="font-semibold mb-3">Analysis Details</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            {pick.stock_pick.risk_level && (
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Risk Level</p>
                                                    <Badge variant="outline" className={
                                                        pick.stock_pick.risk_level === 'low' ? 'bg-blue-100 text-blue-800' :
                                                        pick.stock_pick.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                    }>
                                                        {pick.stock_pick.risk_level.toUpperCase()}
                                                    </Badge>
                                                </div>
                                            )}
                                            {pick.stock_pick.recommendation && (
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Recommendation</p>
                                                    <Badge variant="outline">
                                                        {pick.stock_pick.recommendation.replace('_', ' ').toUpperCase()}
                                                    </Badge>
                                                </div>
                                            )}
                                            {pick.stock_pick.sector && (
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Sector</p>
                                                    <p className="font-medium">{pick.stock_pick.sector}</p>
                                                </div>
                                            )}
                                            {pick.stock_pick.analyst_name && (
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Analyst</p>
                                                    <p className="font-medium">{pick.stock_pick.analyst_name}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Expected Returns */}
                                    {(pick.stock_pick.expected_return_min_percent !== null || pick.stock_pick.expected_return_max_percent !== null) && (
                                        <div className="pt-4 border-t">
                                            <h4 className="font-semibold mb-3">Expected Returns</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                {pick.stock_pick.expected_return_min_percent !== null && (
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Minimum Return</p>
                                                        <p className="font-medium text-green-600">{pick.stock_pick.expected_return_min_percent}%</p>
                                                    </div>
                                                )}
                                                {pick.stock_pick.expected_return_max_percent !== null && (
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Maximum Return</p>
                                                        <p className="font-medium text-green-600">{pick.stock_pick.expected_return_max_percent}%</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Time Horizon */}
                                    {(pick.stock_pick.time_horizon_min_months !== null || pick.stock_pick.time_horizon_max_months !== null) && (
                                        <div className="pt-4 border-t">
                                            <h4 className="font-semibold mb-3">Time Horizon</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                {pick.stock_pick.time_horizon_min_months !== null && (
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Minimum Period</p>
                                                        <p className="font-medium">{pick.stock_pick.time_horizon_min_months} months</p>
                                                    </div>
                                                )}
                                                {pick.stock_pick.time_horizon_max_months !== null && (
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Maximum Period</p>
                                                        <p className="font-medium">{pick.stock_pick.time_horizon_max_months} months</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Description */}
                                    <div className="pt-4 border-t">
                                        <h4 className="font-semibold mb-2">Description</h4>
                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{pick.stock_pick.description}</p>
                                    </div>

                                    {/* Admin Notes */}
                                    {pick.stock_pick.admin_notes && (
                                        <div className="pt-4 border-t">
                                            <h4 className="font-semibold mb-2">Admin Notes</h4>
                                            <p className="text-sm bg-muted p-3 rounded-md whitespace-pre-wrap">{pick.stock_pick.admin_notes}</p>
                                        </div>
                                    )}

                                    {/* Created Date */}
                                    <div className="pt-4 border-t">
                                        <p className="text-sm text-muted-foreground">Stock Pick Created</p>
                                        <p className="font-medium">{new Date(pick.stock_pick.created_at).toLocaleString()}</p>
                                    </div>
                                </>
                            ) : (
                                <p className="text-muted-foreground">Stock information not available</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Payment Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                Payment Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Payment Amount</p>
                                    <p className="font-medium text-lg">
                                        {pick.payment_amount ? formatCurrency(pick.payment_amount) : 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Reference Number</p>
                                    <p className="font-medium">{pick.payment_reference || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Submitted At</p>
                                    <p className="font-medium">
                                        {pick.payment_submitted_at
                                            ? new Date(pick.payment_submitted_at).toLocaleString()
                                            : 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Created At</p>
                                    <p className="font-medium">
                                        {new Date(pick.created_at).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* Payment Slip */}
                            {pick.payment_slip_url && (
                                <div className="pt-4 border-t">
                                    <p className="text-sm text-muted-foreground mb-2">Payment Slip</p>
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{pick.payment_slip_filename}</p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => window.open(pick.payment_slip_url!, '_blank')}
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            View Slip
                                        </Button>
                                    </div>
                                    <div className="mt-4">
                                        <img
                                            src={pick.payment_slip_url}
                                            alt="Payment slip"
                                            className="w-full max-w-md border rounded-lg"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Customer Notes */}
                            {pick.customer_notes && (
                                <div className="pt-4 border-t">
                                    <p className="text-sm text-muted-foreground mb-2">Customer Notes</p>
                                    <p className="text-sm bg-muted p-3 rounded-md">
                                        {pick.customer_notes}
                                    </p>
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
                                        {new Date(pick.created_at).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            {pick.payment_submitted_at && (
                                <div className="flex items-start gap-3">
                                    <div className="mt-1">
                                        <FileText className="h-4 w-4 text-yellow-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Payment Submitted</p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(pick.payment_submitted_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            )}
                            {pick.approved_at && (
                                <div className="flex items-start gap-3">
                                    <div className="mt-1">
                                        {pick.status === 'approved' ? (
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                        ) : (
                                            <XCircle className="h-4 w-4 text-red-600" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">
                                            {pick.status === 'approved' ? 'Approved' : 'Rejected'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(pick.approved_at).toLocaleString()}
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
                            {pick.status === 'payment_submitted' ? (
                                <>
                                    <Textarea
                                        placeholder="Enter your response or notes..."
                                        value={adminResponse}
                                        onChange={(e) => setAdminResponse(e.target.value)}
                                        rows={6}
                                        className="resize-none"
                                    />
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={handleApprove}
                                            disabled={isProcessing || !adminResponse.trim()}
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
                                            disabled={isProcessing || !adminResponse.trim()}
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
                                    <p className="text-sm">{pick.admin_response || 'No response provided'}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
