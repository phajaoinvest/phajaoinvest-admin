'use client'

import { format } from 'date-fns'
import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatNumber } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { servicesAdminApi } from '@/lib/api'
import type { PendingServiceApplication } from '@/lib/api'
import {
  Search,
  MoreVertical,
  Eye,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  FileText,
  Download,
  ExternalLink,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

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

const getDurationLabel = (months: number | null): string => {
  if (!months) return 'N/A'
  if (months === 3) return '3 Months'
  if (months === 6) return '6 Months'
  if (months === 12) return '12 Months'
  return `${months} Months`
}

export default function PremiumMembershipPage() {
  const { toast } = useToast()

  const [applications, setApplications] = useState<PendingServiceApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const itemsPerPage = 10

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const [selectedApplication, setSelectedApplication] = useState<PendingServiceApplication | null>(null)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [approveModalOpen, setApproveModalOpen] = useState(false)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [approvePaymentModalOpen, setApprovePaymentModalOpen] = useState(false)
  const [rejectPaymentModalOpen, setRejectPaymentModalOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [adminNotes, setAdminNotes] = useState('')

  const fetchApplications = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await servicesAdminApi.getPendingPremiumMemberships({
        page: currentPage,
        limit: itemsPerPage,
        payment_status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined,
      })

      if (response.is_error) {
        throw new Error(response.message || 'Failed to fetch applications')
      }

      setApplications(response.data || [])
      setTotalItems(response.total || 0)
      setTotalPages(response.totalPages || 1)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load applications'
      setError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, statusFilter, searchTerm, toast])

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  const handleApproveService = async (application: PendingServiceApplication) => {
    setIsActionLoading(true)
    try {
      const response = await servicesAdminApi.approveService(application.service_id)

      if (response.is_error) {
        throw new Error(response.message || 'Failed to approve application')
      }

      toast({
        title: 'Success',
        description: 'Premium membership approved successfully',
      })

      setApproveModalOpen(false)
      setSelectedApplication(null)
      await fetchApplications()
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

  const handleRejectService = async (application: PendingServiceApplication) => {
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
      const response = await servicesAdminApi.rejectService(
        application.service_id,
        rejectionReason
      )

      if (response.is_error) {
        throw new Error(response.message || 'Failed to reject application')
      }

      toast({
        title: 'Success',
        description: 'Premium membership rejected successfully',
      })

      setRejectModalOpen(false)
      setSelectedApplication(null)
      setRejectionReason('')
      await fetchApplications()
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

  const handleApprovePayment = async (application: PendingServiceApplication) => {
    if (!application.payment_info) return

    setIsActionLoading(true)
    try {
      const response = await servicesAdminApi.approvePayment(
        application.payment_info.payment_id,
        adminNotes
      )

      if (response.is_error) {
        throw new Error(response.message || 'Failed to approve payment')
      }

      toast({
        title: 'Success',
        description: 'Payment approved successfully',
      })

      setApprovePaymentModalOpen(false)
      setSelectedApplication(null)
      setAdminNotes('')
      await fetchApplications()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to approve payment'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleRejectPayment = async (application: PendingServiceApplication) => {
    if (!application.payment_info) return

    setIsActionLoading(true)
    try {
      const response = await servicesAdminApi.rejectPayment(
        application.payment_info.payment_id,
        adminNotes
      )

      if (response.is_error) {
        throw new Error(response.message || 'Failed to reject payment')
      }

      toast({
        title: 'Success',
        description: 'Payment rejected successfully',
      })

      setRejectPaymentModalOpen(false)
      setSelectedApplication(null)
      setAdminNotes('')
      await fetchApplications()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reject payment'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsActionLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Premium Membership Applications</h1>
          <p className="text-muted-foreground">
            Review and approve premium membership applications
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchApplications}
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card className="p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
          >
            <option value="all">All Payment Status</option>
            <option value="pending">Pending</option>
            <option value="payment_slip_submitted">Slip Submitted</option>
            <option value="succeeded">Paid</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Total Applications</div>
          <div className="text-3xl font-bold">{totalItems}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Payment Pending</div>
          <div className="text-3xl font-bold">
            {applications.filter((a) => a.payment_info?.status === 'pending').length}
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Slip Submitted</div>
          <div className="text-3xl font-bold">
            {applications.filter((a) => a.payment_info?.status === 'payment_slip_submitted').length}
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Paid</div>
          <div className="text-3xl font-bold">
            {applications.filter((a) => a.payment_info?.status === 'succeeded').length}
          </div>
        </Card>
      </div>

      <Card>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <XCircle className="w-12 h-12 text-destructive mb-4" />
              <p className="text-lg font-semibold">Error loading applications</p>
              <p className="text-muted-foreground">{error}</p>
              <Button onClick={fetchApplications} className="mt-4">
                Try Again
              </Button>
            </div>
          ) : applications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-lg font-semibold">No applications found</p>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'There are no pending applications at this time'}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr className="text-left text-sm text-muted-foreground">
                  <th className="p-4">Customer</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Applied Date</th>
                  <th className="p-4">Payment Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {applications.map((app) => (
                  <tr key={app.payment_info?.payment_id} className="hover:bg-muted/30">
                    <td className="p-4">
                      <div>
                        <div className="font-medium">
                          {app.customer_info.first_name} {app.customer_info.last_name}
                        </div>
                        <div className="text-sm text-muted-foreground">{app.customer_info.email}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline">{getDurationLabel(app.subscription_duration || null)}</Badge>
                    </td>
                    <td className="p-4">
                      <div className="font-medium">
                        {formatCurrency(app.payment_info?.amount)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        {format(new Date(app.applied_at), 'MMM dd, yyyy')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(app.applied_at), 'HH:mm')}
                      </div>
                    </td>
                    <td className="p-4">
                      {app.payment_info ? getPaymentStatusBadge(app.payment_info.status) : '-'}
                    </td>
                    <td className="p-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedApplication(app)
                              setViewModalOpen(true)
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {app.payment_info?.payment_slip_url && (
                            <DropdownMenuItem
                              onClick={() => window.open(app.payment_info!.payment_slip_url, '_blank')}
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              View Payment Slip
                            </DropdownMenuItem>
                          )}
                          {app.payment_info?.status === 'payment_slip_submitted' && (
                            <>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedApplication(app)
                                  setApprovePaymentModalOpen(true)
                                }}
                                className="text-green-600"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve Payment
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedApplication(app)
                                  setRejectPaymentModalOpen(true)
                                }}
                                className="text-red-600"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject Payment
                              </DropdownMenuItem>
                            </>
                          )}
                          {app.payment_info?.status === 'succeeded' && (
                            <>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedApplication(app)
                                  setApproveModalOpen(true)
                                }}
                                className="text-green-600"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve Service
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedApplication(app)
                                  setRejectModalOpen(true)
                                }}
                                className="text-red-600"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject Service
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
          )}
        </div>

        {!isLoading && applications.length > 0 && (
          <div className="flex items-center justify-between p-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* View Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <div>
                      {selectedApplication.customer_info.first_name}{' '}
                      {selectedApplication.customer_info.last_name}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <div>{selectedApplication.customer_info.email}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Username:</span>
                    <div>{selectedApplication.customer_info.username}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Applied:</span>
                    <div>{format(new Date(selectedApplication.applied_at), 'PPP')}</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Subscription Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Duration:</span>
                    <div>{getDurationLabel(selectedApplication.subscription_duration || null)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Fee:</span>
                    <div>{formatCurrency(selectedApplication.subscription_fee)}</div>
                  </div>
                </div>
              </div>

              {selectedApplication.payment_info && (
                <div>
                  <h3 className="font-semibold mb-2">Payment Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Amount:</span>
                      <div>${Number(selectedApplication.payment_info.amount).toFixed(2)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <div>{getPaymentStatusBadge(selectedApplication.payment_info.status)}</div>
                    </div>
                    {selectedApplication.payment_info.payment_slip_url && (
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Payment Slip:</span>
                        <div>
                          <Button
                            variant="link"
                            className="p-0 h-auto"
                            onClick={() => window.open(selectedApplication.payment_info!.payment_slip_url, '_blank')}
                          >
                            View Payment Slip
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Service Modal */}
      <Dialog open={approveModalOpen} onOpenChange={setApproveModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Premium Membership</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this premium membership application?
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
            <Button
              onClick={() => selectedApplication && handleApproveService(selectedApplication)}
              disabled={isActionLoading}
            >
              {isActionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Service Modal */}
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
            <Button
              variant="destructive"
              onClick={() => selectedApplication && handleRejectService(selectedApplication)}
              disabled={isActionLoading}
            >
              {isActionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Payment Modal */}
      <Dialog open={approvePaymentModalOpen} onOpenChange={setApprovePaymentModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Payment</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this payment?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="adminNotes">Admin Notes (Optional)</Label>
              <Textarea
                id="adminNotes"
                placeholder="Enter any notes..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setApprovePaymentModalOpen(false)}
              disabled={isActionLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={() => selectedApplication && handleApprovePayment(selectedApplication)}
              disabled={isActionLoading}
            >
              {isActionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Approve Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Payment Modal */}
      <Dialog open={rejectPaymentModalOpen} onOpenChange={setRejectPaymentModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Payment</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this payment.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="paymentRejectionNotes">Rejection Notes</Label>
              <Textarea
                id="paymentRejectionNotes"
                placeholder="Enter reason for rejection..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectPaymentModalOpen(false)}
              disabled={isActionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedApplication && handleRejectPayment(selectedApplication)}
              disabled={isActionLoading}
            >
              {isActionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Reject Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
