'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { env } from '@/lib/config/env'
import { tokenManager } from '@/lib/api/client'
import {
    ArrowLeft,
    Loader2,
    Calendar,
    DollarSign,
    FileText,
    User,
    Mail,
    CreditCard,
    Package,
    Clock,
    CheckCircle,
    XCircle,
    Download,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'

interface Payment {
    id: string
    customer_id: string
    payment_intent_id: string
    payment_type: string
    payment_method: string
    status: string
    amount: number
    currency: string
    description: string | null
    paid_at: Date | null
    created_at: Date
    updated_at: Date
    payment_slip_url: string | null
    payment_slip_filename: string | null
    customer: {
        id: string
        first_name: string
        last_name: string
        email: string
    }
    subscription_package?: {
        id: string
        name: string
        description: string
        price: number
        duration_days: number
    }
    service?: {
        id: string
        service_type: string
    }
}

const statusColors: Record<string, { bg: string; text: string; icon: any }> = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
    payment_slip_submitted: { bg: 'bg-blue-100', text: 'text-blue-800', icon: FileText },
    processing: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Clock },
    succeeded: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
    failed: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
    canceled: { bg: 'bg-gray-100', text: 'text-gray-800', icon: XCircle },
}

export default function SubscriptionPaymentDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const paymentId = params.id as string

    const [payment, setPayment] = useState<Payment | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (paymentId) {
            fetchPaymentDetails()
        }
    }, [paymentId])

    const fetchPaymentDetails = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(
                `${env.apiUrl}/payments/${paymentId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${tokenManager.getAccessToken()}`,
                    },
                }
            )

            if (!response.ok) {
                throw new Error('Failed to fetch payment details')
            }

            const result = await response.json()
            setPayment(result.data)
        } catch (err) {
            console.error('Failed to load payment details:', err)
            toast({
                title: 'Error',
                description: 'Failed to load payment details',
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false)
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

    if (!payment) {
        return (
            <div className="container mx-auto p-6">
                <Card>
                    <CardContent className="p-6">
                        <p className="text-center text-muted-foreground">Payment not found</p>
                        <Button
                            onClick={() => router.push('/dashboard/payments/subscriptions')}
                            className="mt-4 mx-auto block"
                        >
                            Back to Payments
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const statusInfo = getStatusInfo(payment.status)
    const StatusIcon = statusInfo.icon

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push('/dashboard/payments/subscriptions')}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Subscription Payment Details</h1>
                        <p className="text-muted-foreground">
                            Payment ID: {payment.payment_intent_id}
                        </p>
                    </div>
                </div>
                <Badge className={`${statusInfo.bg} ${statusInfo.text} text-sm py-1 px-3`}>
                    <StatusIcon className="h-4 w-4 mr-1" />
                    {payment.status.replace('_', ' ').toUpperCase()}
                </Badge>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Customer & Package Info */}
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
                                    <p className="font-medium">{`${payment.customer.first_name} ${payment.customer.last_name}`}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-medium">{payment.customer.email}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Package Information */}
                    {payment.subscription_package && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    Subscription Package
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Package Name</p>
                                        <p className="font-medium text-lg">{payment.subscription_package.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Price</p>
                                        <p className="font-medium">{formatCurrency(payment.subscription_package.price)}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-sm text-muted-foreground">Description</p>
                                        <p className="font-medium">{payment.subscription_package.description}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Duration</p>
                                        <p className="font-medium">{payment.subscription_package.duration_days} days</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

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
                                    <p className="text-sm text-muted-foreground">Amount</p>
                                    <p className="font-medium text-lg">
                                        {formatCurrency(payment.amount)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Payment Method</p>
                                    <p className="font-medium">{payment.payment_method.replace('_', ' ').toUpperCase()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Payment Type</p>
                                    <p className="font-medium">{payment.payment_type.toUpperCase()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Currency</p>
                                    <p className="font-medium">{payment.currency}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Created At</p>
                                    <p className="font-medium">
                                        {new Date(payment.created_at).toLocaleString()}
                                    </p>
                                </div>
                                {payment.paid_at && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Paid At</p>
                                        <p className="font-medium">
                                            {new Date(payment.paid_at).toLocaleString()}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {payment.description && (
                                <div className="pt-4 border-t">
                                    <p className="text-sm text-muted-foreground mb-2">Description</p>
                                    <p className="text-sm bg-muted p-3 rounded-md">
                                        {payment.description}
                                    </p>
                                </div>
                            )}

                            {/* Payment Slip */}
                            {payment.payment_slip_url && (
                                <div className="pt-4 border-t">
                                    <p className="text-sm text-muted-foreground mb-2">Payment Slip</p>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{payment.payment_slip_filename}</p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => window.open(payment.payment_slip_url!, '_blank')}
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            View Slip
                                        </Button>
                                    </div>
                                    <div className="mt-4">
                                        <img
                                            src={payment.payment_slip_url}
                                            alt="Payment slip"
                                            className="w-full max-w-md border rounded-lg"
                                        />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Timeline */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Payment Timeline
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
                                        {new Date(payment.created_at).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            {payment.status === 'payment_slip_submitted' && (
                                <div className="flex items-start gap-3">
                                    <div className="mt-1">
                                        <FileText className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Payment Slip Submitted</p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(payment.updated_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            )}
                            {payment.paid_at && (
                                <div className="flex items-start gap-3">
                                    <div className="mt-1">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Payment Completed</p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(payment.paid_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
