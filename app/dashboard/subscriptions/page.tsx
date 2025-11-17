'use client'

import { format } from 'date-fns'
import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { useDashboardStore } from '@/lib/dashboard-store'
import { Search, MoreVertical, Eye, CheckCircle, XCircle, Trash2, Download, Calendar, FileText } from 'lucide-react'

export default function SubscriptionsPage() {
  const subscriptions = useDashboardStore((state) => state.subscriptions)
  const updateSubscriptionStatus = useDashboardStore((state) => state.updateSubscriptionStatus)
  const deleteSubscription = useDashboardStore((state) => state.deleteSubscription)

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [packageFilter, setPackageFilter] = useState<string>('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [approveModalOpen, setApproveModalOpen] = useState(false)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  const itemsPerPage = 10

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => {
      const matchesSearch =
        sub.customer_first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.customer_last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.package_name?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === 'all' || sub.status === statusFilter
      const matchesPackage = packageFilter === 'all' || sub.package_type === packageFilter

      const matchesStartDate = !startDate || new Date(sub.subscription_date) >= new Date(startDate)
      const matchesEndDate = !endDate || new Date(sub.subscription_date) <= new Date(endDate)

      return matchesSearch && matchesStatus && matchesPackage && matchesStartDate && matchesEndDate
    })
  }, [subscriptions, searchTerm, statusFilter, packageFilter, startDate, endDate])

  const paginatedSubscriptions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredSubscriptions.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredSubscriptions, currentPage])

  const totalPages = Math.ceil(filteredSubscriptions.length / itemsPerPage)

  const handleApprove = () => {
    if (selectedSubscription) {
      updateSubscriptionStatus(selectedSubscription.id, 'active')
      setApproveModalOpen(false)
      setSelectedSubscription(null)
    }
  }

  const handleReject = () => {
    if (selectedSubscription) {
      updateSubscriptionStatus(selectedSubscription.id, 'cancelled')
      setRejectModalOpen(false)
      setSelectedSubscription(null)
    }
  }

  const handleDelete = () => {
    if (selectedSubscription) {
      deleteSubscription(selectedSubscription.id)
      setDeleteModalOpen(false)
      setSelectedSubscription(null)
    }
  }

  const exportToCSV = () => {
    const headers = ['Customer Name', 'Email', 'Package', 'Subscription Date', 'Expiry Date', 'Status', 'Amount']
    const rows = filteredSubscriptions.map(sub => [
      `${sub.customer_first_name} ${sub.customer_last_name}`,
      sub.customer_email,
      sub.package_name,
      format(new Date(sub.subscription_date), 'MMM dd, yyyy'),
      format(new Date(sub.expired_date), 'MMM dd, yyyy'),
      sub.status,
      `${sub.currency} ${sub.amount.toFixed(2)}`
    ])

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `subscriptions-${format(new Date(), 'yyyy-MM-dd')}.csv`
    link.click()
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: 'bg-green-500/10 text-green-500 border-green-500/20',
      pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      expired: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
      cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
    }
    return variants[status] || variants.active
  }

  const stats = useMemo(() => {
    const total = subscriptions.length
    const active = subscriptions.filter(s => s.status === 'active').length
    const pending = subscriptions.filter(s => s.status === 'pending').length
    const totalRevenue = subscriptions
      .filter(s => s.status === 'active')
      .reduce((sum, s) => sum + s.amount, 0)

    return { total, active, pending, totalRevenue }
  }, [subscriptions])

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-card border-border/40">
          <div className="flex items-center justify-between">
            <div className='space-y-1'>
              <p className="text-sm text-muted-foreground">Total Subscriptions</p>
              <p className="text-lg font-semibold">{stats.total}</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Subscriptions</p>
              <p className="text-lg font-semibold mt-1">{stats.active}</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Approval</p>
              <p className="text-lg font-semibold mt-1">{stats.pending}</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-yellow-500" />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-lg font-semibold mt-1">${stats.totalRevenue.toFixed(2)}</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Download className="w-4 h-4 text-primary" />
            </div>
          </div>
        </Card>
      </div>

      {/* Table Card with Filters */}
      <Card className="bg-card border rounde-sm">
        <div className="p-4 space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by customer or package..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 bg-background border-border/40"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3 rounded-md border border-border/40 bg-background text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={packageFilter}
              onChange={(e) => setPackageFilter(e.target.value)}
              className="h-9 px-3 rounded-md border border-border/40 bg-background text-sm"
            >
              <option value="all">All Packages</option>
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
              <option value="elite">Elite</option>
              <option value="pro">Pro</option>
            </select>

            <Button onClick={exportToCSV} variant="outline" className="h-9">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <Input
              type="date"
              placeholder="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-9 bg-background border-border/40"
            />
            <Input
              type="date"
              placeholder="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-9 bg-background border-border/40"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30 border-y border-border/40">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Customer</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Package</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Subscription Date</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Expiry Date</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Amount</th>
                <th className="text-center p-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {paginatedSubscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-muted/20 transition-colors">
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-foreground">
                        {sub.customer_first_name} {sub.customer_last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">{sub.customer_email}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-foreground">{sub.package_name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{sub.package_type}</p>
                  </td>
                  <td className="p-4 text-sm text-foreground">
                    {format(new Date(sub.subscription_date), 'MMM dd, yyyy')}
                  </td>
                  <td className="p-4 text-sm text-foreground">
                    {format(new Date(sub.expired_date), 'MMM dd, yyyy')}
                  </td>
                  <td className="p-4">
                    <Badge variant="outline" className={`${getStatusBadge(sub.status)} capitalize`}>
                      {sub.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-sm font-medium text-foreground">
                    {sub.currency} ${sub.amount.toFixed(2)}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedSubscription(sub)
                              setViewModalOpen(true)
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {sub.status === 'pending' && (
                            <>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedSubscription(sub)
                                  setApproveModalOpen(true)
                                }}
                                className="text-green-500"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedSubscription(sub)
                                  setRejectModalOpen(true)
                                }}
                                className="text-orange-500"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedSubscription(sub)
                              setDeleteModalOpen(true)
                            }}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-border/40 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredSubscriptions.length)} of {filteredSubscriptions.length} subscriptions
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      {/* View Details Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Subscription Details</DialogTitle>
            <DialogDescription>Complete subscription information</DialogDescription>
          </DialogHeader>
          {selectedSubscription && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Name</p>
                    <p className="font-medium">{selectedSubscription.customer_first_name} {selectedSubscription.customer_last_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedSubscription.customer_email}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Subscription Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Package</p>
                    <p className="font-medium">{selectedSubscription.package_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Type</p>
                    <p className="font-medium capitalize">{selectedSubscription.package_type}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Subscription Date</p>
                    <p className="font-medium">{format(new Date(selectedSubscription.subscription_date), 'MMMM dd, yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Expiry Date</p>
                    <p className="font-medium">{format(new Date(selectedSubscription.expired_date), 'MMMM dd, yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Amount</p>
                    <p className="font-medium">{selectedSubscription.currency} ${selectedSubscription.amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <Badge variant="outline" className={`${getStatusBadge(selectedSubscription.status)} capitalize`}>
                      {selectedSubscription.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Auto Renew</p>
                    <p className="font-medium">{selectedSubscription.auto_renew ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Modal */}
      <Dialog open={approveModalOpen} onOpenChange={setApproveModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-500">
              <CheckCircle className="w-5 h-5" />
              Approve Subscription
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this subscription?
            </DialogDescription>
          </DialogHeader>
          {selectedSubscription && (
            <div className="py-4 space-y-2 text-sm">
              <p><span className="text-muted-foreground">Customer:</span> <span className="font-medium">{selectedSubscription.customer_first_name} {selectedSubscription.customer_last_name}</span></p>
              <p><span className="text-muted-foreground">Package:</span> <span className="font-medium">{selectedSubscription.package_name}</span></p>
              <p><span className="text-muted-foreground">Amount:</span> <span className="font-medium">{selectedSubscription.currency} ${selectedSubscription.amount.toFixed(2)}</span></p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveModalOpen(false)}>Cancel</Button>
            <Button onClick={handleApprove} className="bg-green-500 hover:bg-green-600">
              Approve Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-500">
              <XCircle className="w-5 h-5" />
              Reject Subscription
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this subscription?
            </DialogDescription>
          </DialogHeader>
          {selectedSubscription && (
            <div className="py-4 space-y-2 text-sm">
              <p><span className="text-muted-foreground">Customer:</span> <span className="font-medium">{selectedSubscription.customer_first_name} {selectedSubscription.customer_last_name}</span></p>
              <p><span className="text-muted-foreground">Package:</span> <span className="font-medium">{selectedSubscription.package_name}</span></p>
              <p><span className="text-muted-foreground">Amount:</span> <span className="font-medium">{selectedSubscription.currency} ${selectedSubscription.amount.toFixed(2)}</span></p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectModalOpen(false)}>Cancel</Button>
            <Button onClick={handleReject} className="bg-orange-500 hover:bg-orange-600">
              Reject Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Delete Subscription
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this subscription? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedSubscription && (
            <div className="py-4 space-y-2 text-sm">
              <p><span className="text-muted-foreground">Customer:</span> <span className="font-medium">{selectedSubscription.customer_first_name} {selectedSubscription.customer_last_name}</span></p>
              <p><span className="text-muted-foreground">Package:</span> <span className="font-medium">{selectedSubscription.package_name}</span></p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
            <Button onClick={handleDelete} variant="destructive">
              Delete Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
