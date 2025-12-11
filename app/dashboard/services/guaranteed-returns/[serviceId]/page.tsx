'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { servicesAdminApi, customersApi } from '@/lib/api'
import {
    ArrowLeft,
    Loader2,
    Calendar,
    User,
    MapPin,
    FileText,
    Eye,
    CheckCircle,
    XCircle,
    Shield,
    DollarSign,
    CreditCard,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency } from '@/lib/utils'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

const getKycStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
        case 'approved':
            return <Badge className="bg-green-600">Approved</Badge>
        case 'pending':
            return <Badge className="bg-yellow-600">Pending Review</Badge>
        case 'rejected':
            return <Badge className="bg-red-600">Rejected</Badge>
        default:
            return <Badge className="bg-gray-600">{status}</Badge>
    }
}

const getPaymentStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
        case 'succeeded':
            return <Badge className="bg-green-600">Paid</Badge>
        case 'pending':
            return <Badge className="bg-yellow-600">Pending</Badge>
        case 'payment_slip_submitted':
            return <Badge className="bg-blue-600">Slip Submitted</Badge>
        case 'failed':
        case 'canceled':
            return <Badge className="bg-red-600">Failed</Badge>
        default:
            return <Badge className="bg-gray-600">{status}</Badge>
    }
}

const formatDateTime = (value?: string | null) => {
    if (!value) return 'N/A'
    try {
        return format(new Date(value), 'MMM dd, yyyy hh:mm a')
    } catch {
        return value
    }
}

export default function GuaranteedReturnsDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { toast } = useToast()
    const serviceId = params.serviceId as string

    const [detail, setDetail] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isActionLoading, setIsActionLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Modal states
    const [approveModalOpen, setApproveModalOpen] = useState(false)
    const [rejectModalOpen, setRejectModalOpen] = useState(false)
    const [rejectionReason, setRejectionReason] = useState('')

    useEffect(() => {
        const loadDetail = async () => {
            if (!serviceId) return

            setIsLoading(true)
            setError(null)
            try {
                // Fetch service detail
                const serviceResponse = await servicesAdminApi.getServiceDetail(serviceId)
                if (serviceResponse.is_error) {
                    throw new Error(serviceResponse.message || 'Failed to fetch service detail')
                }

                // Fetch detailed customer data
                const customerResponse = await customersApi.getDetailed(
                    serviceResponse.data.customer_id,
                    'guaranteed_returns'
                )
                if (customerResponse.is_error) {
                    throw new Error(customerResponse.message || 'Failed to fetch customer details')
                }

                setDetail({
                    service: serviceResponse.data,
                    customer: customerResponse.data,
                })
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Failed to fetch details'
                setError(message)
                toast({
                    title: 'Error',
                    description: message,
                    variant: 'destructive',
                })
            } finally {
                setIsLoading(false)
            }
        }

        loadDetail()
    }, [serviceId, toast])

    const handleApprove = async () => {
        setIsActionLoading(true)
        try {
            const response = await servicesAdminApi.approveService(serviceId)

            if (response.is_error) {
                throw new Error(response.message || 'Failed to approve application')
            }

            toast({
                title: 'Success',
                description: 'Guaranteed returns application approved successfully',
            })

            setApproveModalOpen(false)
            router.push('/dashboard/services/guaranteed-returns')
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to approve application'
            toast({
                title: 'Error',
                description: errorMessage,
                variant: 'destructive',
            })
        } finally {
            setIsActionLoading(false)
        }
    }

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            toast({
                title: 'Error',
                description: 'Please provide a rejection reason',
                variant: 'destructive',
            })
            return
        }

        setIsActionLoading(true)
        try {
            const response = await servicesAdminApi.rejectService(serviceId, rejectionReason)

            if (response.is_error) {
                throw new Error(response.message || 'Failed to reject application')
            }

            toast({
                title: 'Success',
                description: 'Application rejected successfully',
            })

            setRejectModalOpen(false)
            router.push('/dashboard/services/guaranteed-returns')
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to reject application'
            toast({
                title: 'Error',
                description: errorMessage,
                variant: 'destructive',
            })
        } finally {
            setIsActionLoading(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground">Loading application details...</p>
                </div>
            </div>
        )
    }

    if (error || !detail) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-4">
                    <p className="text-destructive text-lg">{error || 'Application not found'}</p>
                    <Button onClick={() => router.back()} variant="outline">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Go Back
                    </Button>
                </div>
            </div>
        )
    }

    const isPending = detail.service.kyc_info?.kyc_status?.toLowerCase() === 'pending'

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <Button onClick={() => router.back()} variant="ghost" size="icon" className="h-8 w-8">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Guaranteed Returns Application</h1>
                            <p className="text-sm text-muted-foreground">
                                {detail.customer.first_name} {detail.customer.last_name} • {detail.customer.email}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {detail.service.kyc_info && getKycStatusBadge(detail.service.kyc_info.kyc_status)}
                    {isPending && (
                        <>
                            <Button variant="destructive" onClick={() => setRejectModalOpen(true)}>
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject
                            </Button>
                            <Button onClick={() => setApproveModalOpen(true)}>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Applied At</p>
                            <p className="text-lg font-semibold">
                                {format(new Date(detail.service.applied_at), 'MMM dd, yyyy')}
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Invested Amount</p>
                            <p className="text-lg font-semibold">
                                {formatCurrency(detail.service.invested_amount || 0)}
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Current Balance</p>
                            <p className="text-lg font-semibold">{formatCurrency(detail.service.balance || 0)}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">KYC Level</p>
                            <p className="text-lg font-semibold">
                                {detail.service.kyc_info?.kyc_level || 'N/A'}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Service, Payment & KYC Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Service Information */}
                    <Card className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Calendar className="w-5 h-5 text-primary" />
                            <h2 className="text-lg font-semibold">Service Information</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground mb-1">Service ID</p>
                                <p className="font-mono text-xs break-all">{detail.service.service_id}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground mb-1">Service Type</p>
                                <p className="font-medium">Guaranteed Returns</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground mb-1">Applied At</p>
                                <p className="font-medium">{formatDateTime(detail.service.applied_at)}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground mb-1">Invested Amount</p>
                                <p className="font-medium text-lg">
                                    {formatCurrency(detail.service.invested_amount || 0)}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground mb-1">Current Balance</p>
                                <p className="font-medium text-lg">
                                    {formatCurrency(detail.service.balance || 0)}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground mb-1">Active</p>
                                <Badge variant={detail.service.active ? 'default' : 'secondary'}>
                                    {detail.service.active ? 'Yes' : 'No'}
                                </Badge>
                            </div>
                        </div>
                    </Card>

                    {/* Payment Information */}
                    {detail.service.payment_info && (
                        <Card className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <CreditCard className="w-5 h-5 text-primary" />
                                <h2 className="text-lg font-semibold">Payment Information</h2>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground mb-1">Payment ID</p>
                                    <p className="font-mono text-xs break-all">{detail.service.payment_info.payment_id}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground mb-1">Amount</p>
                                    <p className="font-medium text-lg">
                                        {formatCurrency(detail.service.payment_info.amount)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground mb-1">Status</p>
                                    {getPaymentStatusBadge(detail.service.payment_info.status)}
                                </div>
                                {detail.service.payment_info.paid_at && (
                                    <div>
                                        <p className="text-muted-foreground mb-1">Paid At</p>
                                        <p className="font-medium">{formatDateTime(detail.service.payment_info.paid_at)}</p>
                                    </div>
                                )}
                                {detail.service.payment_info.payment_slip_url && (
                                    <div className="col-span-2">
                                        <p className="text-muted-foreground mb-2">Payment Slip</p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => window.open(detail.service.payment_info.payment_slip_url, '_blank')}
                                        >
                                            <Eye className="w-4 h-4 mr-2" />
                                            View Payment Slip
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </Card>
                    )}

                    {/* KYC Information */}
                    {detail.customer.kyc_records && detail.customer.kyc_records.length > 0 && (
                        <Card className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Shield className="w-5 h-5 text-primary" />
                                <h2 className="text-lg font-semibold">KYC Information</h2>
                            </div>
                            {detail.customer.kyc_records.map((kyc: any) => (
                                <div key={kyc.id} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-muted-foreground mb-1">Level</p>
                                            <p className="font-medium">{kyc.kyc_level}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground mb-1">Status</p>
                                            {getKycStatusBadge(kyc.status)}
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground mb-1">Date of Birth</p>
                                            <p className="font-medium">
                                                {kyc.dob ? format(new Date(kyc.dob), 'PP') : '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground mb-1">Nationality</p>
                                            <p className="font-medium">{kyc.nationality || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground mb-1">Occupation</p>
                                            <p className="font-medium">{kyc.occupation || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground mb-1">Employment Status</p>
                                            <p className="font-medium">{kyc.employment_status || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground mb-1">Annual Income</p>
                                            <p className="font-medium">{kyc.annual_income || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground mb-1">Source of Funds</p>
                                            <p className="font-medium">{kyc.source_of_funds || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground mb-1">Investment Experience</p>
                                            <p className="font-medium">
                                                {kyc.investment_experience ? `${kyc.investment_experience} years` : '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground mb-1">Risk Tolerance</p>
                                            <p className="font-medium">{kyc.risk_tolerance || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground mb-1">PEP Status</p>
                                            <Badge variant={kyc.pep_flag ? 'destructive' : 'secondary'}>
                                                {kyc.pep_flag ? 'Yes' : 'No'}
                                            </Badge>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground mb-1">Submitted</p>
                                            <p className="font-medium">
                                                {kyc.submitted_at ? format(new Date(kyc.submitted_at), 'PPP') : '-'}
                                            </p>
                                        </div>
                                        {kyc.reviewed_at && (
                                            <div className="col-span-2">
                                                <p className="text-muted-foreground mb-1">Reviewed</p>
                                                <p className="font-medium">{format(new Date(kyc.reviewed_at), 'PPP')}</p>
                                            </div>
                                        )}
                                        {kyc.rejection_reason && (
                                            <div className="col-span-2">
                                                <p className="text-muted-foreground text-red-600 mb-1">Rejection Reason</p>
                                                <p className="font-medium text-red-600">{kyc.rejection_reason}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </Card>
                    )}

                    {/* Uploaded Documents */}
                    {detail.customer.documents && detail.customer.documents.length > 0 && (
                        <Card className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <FileText className="w-5 h-5 text-primary" />
                                <h2 className="text-lg font-semibold">
                                    Uploaded Documents ({detail.customer.documents.length})
                                </h2>
                            </div>
                            <div className="space-y-2">
                                {detail.customer.documents.map((doc: any) => (
                                    <div
                                        key={doc.id}
                                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30"
                                    >
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-5 h-5 text-primary" />
                                            <div>
                                                <div className="font-medium text-sm">
                                                    {doc.doc_type.replace(/_/g, ' ').toUpperCase()}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {format(new Date(doc.created_at), 'PPP')}
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => window.open(doc.storage_ref, '_blank')}
                                        >
                                            <Eye className="w-4 h-4 mr-1" />
                                            View
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>

                {/* Right Column - Customer Info */}
                <div className="space-y-6">
                    {/* Customer Profile */}
                    <Card className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <User className="w-5 h-5 text-primary" />
                            <h2 className="text-lg font-semibold">Customer Profile</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-muted-foreground text-xs mb-1">Full Name</p>
                                <p className="font-semibold">
                                    {detail.customer.first_name} {detail.customer.last_name}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-xs mb-1">Email</p>
                                <p className="text-sm break-all">{detail.customer.email}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-xs mb-1">Username</p>
                                <p className="text-sm">{detail.customer.username}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-xs mb-1">Phone</p>
                                <p className="text-sm">{detail.customer.phone_number || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-xs mb-1">Status</p>
                                <Badge variant="outline" className="capitalize">
                                    {detail.customer.status}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-xs mb-1">Email Verification</p>
                                <Badge variant={detail.customer.isVerify ? 'default' : 'secondary'}>
                                    {detail.customer.isVerify ? 'Verified' : 'Pending'}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-xs mb-1">Member Since</p>
                                <p className="text-sm">{format(new Date(detail.customer.created_at), 'MMM dd, yyyy')}</p>
                            </div>
                        </div>
                    </Card>

                    {/* Addresses */}
                    <Card className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <MapPin className="w-5 h-5 text-primary" />
                            <h2 className="text-lg font-semibold">Addresses</h2>
                        </div>
                        {!detail.customer.addresses || detail.customer.addresses.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No addresses on file.</p>
                        ) : (
                            <div className="space-y-3">
                                {detail.customer.addresses.map((address: any) => (
                                    <div key={address.id} className="rounded-lg border border-border/40 p-3">
                                        <div className="flex items-start justify-between mb-2">
                                            <p className="font-medium text-sm">{address.address_line || 'Address'}</p>
                                            {address.is_primary && (
                                                <Badge variant="secondary" className="text-xs">
                                                    Primary
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="text-xs text-muted-foreground space-y-1">
                                            {address.village && <p>Village: {address.village}</p>}
                                            {address.postal_code && <p>Postal: {address.postal_code}</p>}
                                            <p className="mt-2">Added {formatDateTime(address.created_at)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            {/* Approve Modal */}
            <Dialog open={approveModalOpen} onOpenChange={setApproveModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Approve Application</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to approve this guaranteed returns application?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setApproveModalOpen(false)}
                            disabled={isActionLoading}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleApprove} disabled={isActionLoading}>
                            {isActionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Approve
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Modal */}
            <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Application</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting this application.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="rejectionReason">Rejection Reason</Label>
                            <Textarea
                                id="rejectionReason"
                                placeholder="Enter reason for rejection..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setRejectModalOpen(false)}
                            disabled={isActionLoading}
                        >
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleReject} disabled={isActionLoading}>
                            {isActionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Reject
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
