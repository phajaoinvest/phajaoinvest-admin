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
    ArrowUpCircle,
    ArrowDownCircle,
    Clock,
    CheckCircle,
    XCircle,
    Download,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'

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

const statusColors: Record<string, { bg: string; text: string; icon: any }> = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
    approved: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
    rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
}

const identifyIcons: Record<string, any> = {
    recharge: ArrowUpCircle,
    withdraw: ArrowDownCircle,
    call_payment: DollarSign,
    video_payment: DollarSign,
    chat_payment: DollarSign,
    invest: DollarSign,
}

export default function TransferDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const transferId = params.id as string

    const [transfer, setTransfer] = useState<TransferHistory | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isProcessing, setIsProcessing] = useState(false)
    const [adminNotes, setAdminNotes] = useState('')

    useEffect(() => {
        if (transferId) {
            fetchTransferDetails()
        }
    }, [transferId])

    const fetchTransferDetails = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(
                `${env.apiUrl}/transfer-history/${transferId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${tokenManager.getAccessToken()}`,
                    },
                }
            )

            if (!response.ok) {
                throw new Error('Failed to fetch transfer details')
            }

            const result = await response.json()
            setTransfer(result.data)
        } catch (err) {
            console.error('Failed to load transfer details:', err)
            toast({
                title: 'Error',
                description: 'Failed to load transfer details',
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleApprove = async () => {
        setIsProcessing(true)
        try {
            const response = await fetch(
                `${env.apiUrl}/admin/transfers/${transferId}/approve`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${tokenManager.getAccessToken()}`,
                    },
                    body: JSON.stringify({ notes: adminNotes }),
                }
            )

            if (!response.ok) {
                throw new Error('Failed to approve transfer')
            }

            toast({
                title: 'Success',
                description: 'Transfer approved successfully',
            })

            await fetchTransferDetails()
        } catch (err) {
            console.error('Approval failed:', err)
            toast({
                title: 'Error',
                description: 'Failed to approve transfer',
                variant: 'destructive',
            })
        } finally {
            setIsProcessing(false)
        }
    }

    const handleReject = async () => {
        setIsProcessing(true)
        try {
            const response = await fetch(
                `${env.apiUrl}/admin/transfers/${transferId}/reject`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${tokenManager.getAccessToken()}`,
                    },
                    body: JSON.stringify({ notes: adminNotes }),
                }
            )

            if (!response.ok) {
                throw new Error('Failed to reject transfer')
            }

            toast({
                title: 'Success',
                description: 'Transfer rejected',
            })

            await fetchTransferDetails()
        } catch (err) {
            console.error('Rejection failed:', err)
            toast({
                title: 'Error',
                description: 'Failed to reject transfer',
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

    if (!transfer) {
        return (
            <div className="container mx-auto p-6">
                <Card>
                    <CardContent className="p-6">
                        <p className="text-center text-muted-foreground">Transfer not found</p>
                        <Button
                            onClick={() => router.push('/dashboard/payments/transfers')}
                            className="mt-4 mx-auto block"
                        >
                            Back to Transfers
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const statusInfo = getStatusInfo(transfer.status)
    const StatusIcon = statusInfo.icon
    const IdentifyIcon = identifyIcons[transfer.identify] || DollarSign

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push('/dashboard/payments/transfers')}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Transfer Details</h1>
                        <p className="text-muted-foreground">
                            Transfer ID: {transfer.id.slice(0, 8)}...
                        </p>
                    </div>
                </div>
                <Badge className={`${statusInfo.bg} ${statusInfo.text} text-sm py-1 px-3`}>
                    <StatusIcon className="h-4 w-4 mr-1" />
                    {transfer.status.toUpperCase()}
                </Badge>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Customer & Transfer Info */}
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
                                    <p className="font-medium">{`${transfer.customer.first_name} ${transfer.customer.last_name}`}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-medium">{transfer.customer.email}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Transfer Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <IdentifyIcon className="h-5 w-5" />
                                Transfer Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Type</p>
                                    <p className="font-medium text-lg">{transfer.identify.replace('_', ' ').toUpperCase()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Amount</p>
                                    <p className="font-medium text-lg">
                                        {formatCurrency(transfer.amount)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Created At</p>
                                    <p className="font-medium">
                                        {new Date(transfer.created_at).toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Updated At</p>
                                    <p className="font-medium">
                                        {new Date(transfer.updated_at).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* Payment Slip */}
                            {transfer.payment_slip && (
                                <div className="pt-4 border-t">
                                    <p className="text-sm text-muted-foreground mb-2">Payment Slip</p>
                                    <div className="flex items-center gap-4 mb-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => window.open(transfer.payment_slip!, '_blank')}
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            View Slip
                                        </Button>
                                    </div>
                                    <div className="mt-4">
                                        <img
                                            src={transfer.payment_slip}
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
                                        {new Date(transfer.created_at).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            {transfer.status === 'approved' && (
                                <div className="flex items-start gap-3">
                                    <div className="mt-1">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Approved</p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(transfer.updated_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            )}
                            {transfer.status === 'rejected' && (
                                <div className="flex items-start gap-3">
                                    <div className="mt-1">
                                        <XCircle className="h-4 w-4 text-red-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Rejected</p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(transfer.updated_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Admin Actions */}
                    {transfer.status === 'pending' && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Admin Actions
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Textarea
                                    placeholder="Enter notes (optional)..."
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    rows={4}
                                    className="resize-none"
                                />
                                <div className="flex gap-2">
                                    <Button
                                        onClick={handleApprove}
                                        disabled={isProcessing}
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
                                        disabled={isProcessing}
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
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
