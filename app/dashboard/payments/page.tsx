'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDashboardStore, Payment } from '@/lib/dashboard-store'
import { Search, Download, CreditCard, TrendingUp, Package, Zap, MoreVertical, Eye, Check, X, AlertTriangle } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function PaymentsPage() {
  const { payments, customers, updatePaymentStatus } = useDashboardStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'membership' | 'investment' | 'stock' | 'stock_pick'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending' | 'failed'>('all')
  
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<'approve' | 'reject' | null>(null)
  const [paymentToProcess, setPaymentToProcess] = useState<Payment | null>(null)
  const itemsPerPage = 10

  const filteredPayments = payments.filter((p) => {
    const customer = customers.find((c) => c.id === p.customerId)
    const matchesSearch =
      customer?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || p.type === filterType
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus
    return matchesSearch && matchesType && matchesStatus
  })

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage)
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Calculate stats
  const stats = {
    membership: payments.filter((p) => p.type === 'membership').reduce((sum, p) => sum + p.amount, 0),
    investment: payments.filter((p) => p.type === 'investment').reduce((sum, p) => sum + p.amount, 0),
    stock: payments.filter((p) => p.type === 'stock').reduce((sum, p) => sum + p.amount, 0),
    stock_pick: payments.filter((p) => p.type === 'stock_pick').reduce((sum, p) => sum + p.amount, 0),
    total: payments.reduce((sum, p) => sum + p.amount, 0),
  }

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment)
    setViewModalOpen(true)
  }

  const handleApprove = (payment: Payment) => {
    setPaymentToProcess(payment)
    setConfirmAction('approve')
    setConfirmModalOpen(true)
  }

  const handleReject = (payment: Payment) => {
    setPaymentToProcess(payment)
    setConfirmAction('reject')
    setConfirmModalOpen(true)
  }

  const confirmProcessPayment = () => {
    if (!paymentToProcess || !confirmAction) return
    
    if (confirmAction === 'approve') {
      updatePaymentStatus(paymentToProcess.id, 'completed')
    } else {
      updatePaymentStatus(paymentToProcess.id, 'failed')
    }
    
    setConfirmModalOpen(false)
    setPaymentToProcess(null)
    setConfirmAction(null)
    setViewModalOpen(false)
  }

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'membership':
        return <Package className="w-4 h-4" />
      case 'investment':
        return <TrendingUp className="w-4 h-4" />
      case 'stock':
        return <Zap className="w-4 h-4" />
      case 'stock_pick':
        return <CreditCard className="w-4 h-4" />
      default:
        return <CreditCard className="w-4 h-4" />
    }
  }

  const getPaymentColor = (type: string) => {
    switch (type) {
      case 'membership':
        return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/50'
      case 'investment':
        return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/50'
      case 'stock':
        return 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950/50'
      case 'stock_pick':
        return 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950/50'
      default:
        return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-950/50'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400'
      case 'failed':
        return 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-950/50 dark:text-gray-400'
    }
  }

  const exportToCSV = () => {
    const csvHeaders = ['Date', 'Customer Name', 'Customer Email', 'Type', 'Amount', 'Status']
    const csvRows = filteredPayments.map((payment) => {
      const customer = customers.find((c) => c.id === payment.customerId)
      return [
        payment.date,
        `${customer?.first_name || ''} ${customer?.last_name || ''}`.trim(),
        customer?.email || '',
        payment.type.replace('_', ' '),
        payment.amount.toString(),
        payment.status,
      ]
    })

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `payments_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Payment Type Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="border-0 shadow-sm bg-card">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-xs text-muted-foreground font-medium mb-2">TOTAL REVENUE</p>
              <p className="text-2xl font-light text-foreground">${stats.total.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-blue-50 dark:bg-blue-950/30">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-2">MEMBERSHIP</p>
              <p className="text-2xl font-light text-blue-900 dark:text-blue-300">${stats.membership.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-green-50 dark:bg-green-950/30">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-2">INVESTMENT</p>
              <p className="text-2xl font-light text-green-900 dark:text-green-300">${stats.investment.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-purple-50 dark:bg-purple-950/30">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-2">STOCK</p>
              <p className="text-2xl font-light text-purple-900 dark:text-purple-300">${stats.stock.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-orange-50 dark:bg-orange-950/30">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-xs text-orange-600 dark:text-orange-400 font-medium mb-2">STOCK PICK</p>
              <p className="text-2xl font-light text-orange-900 dark:text-orange-300">${stats.stock_pick.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card className="border-0 shadow-sm overflow-hidden bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-light">Payment Transactions</CardTitle>
              <CardDescription className="text-sm">Total: {filteredPayments.length} transactions</CardDescription>
            </div>
            <Button variant="outline" className="text-sm h-9" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            <div className="relative col-span-2">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm h-9"
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 h-9 rounded-md border border-border text-sm bg-background"
            >
              <option value="all">All Types</option>
              <option value="membership">Membership</option>
              <option value="investment">Investment</option>
              <option value="stock">Stock</option>
              <option value="stock_pick">Stock Pick</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 h-9 rounded-md border border-border text-sm bg-background col-span-2 md:col-span-1"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Type</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPayments.map((payment) => {
                  const customer = customers.find((c) => c.id === payment.customerId)
                  return (
                    <tr key={payment.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-muted-foreground">{payment.date}</td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{customer?.first_name} {customer?.last_name}</p>
                          <p className="text-xs text-muted-foreground">{customer?.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium ${getPaymentColor(payment.type)}`}>
                          {getPaymentIcon(payment.type)}
                          {payment.type.replace('_', ' ')}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-medium">${payment.amount.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(payment)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {payment.status === 'pending' && (
                              <>
                                <DropdownMenuItem onClick={() => handleApprove(payment)}>
                                  <Check className="w-4 h-4 mr-2 text-green-600" />
                                  <span className="text-green-600">Approve</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleReject(payment)}>
                                  <X className="w-4 h-4 mr-2 text-red-600" />
                                  <span className="text-red-600">Reject</span>
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {paginatedPayments.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">No payments found</div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredPayments.length)} of {filteredPayments.length} payments
              </p>
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
        </CardContent>
      </Card>

      {/* View Details Modal */}
      {viewModalOpen && selectedPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setViewModalOpen(false)}>
          <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-semibold">Payment Details</h2>
            </div>
            <div className="p-6 space-y-6">
              {/* Customer Information */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Customer Information</h3>
                <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                  {(() => {
                    const customer = customers.find((c) => c.id === selectedPayment.customerId)
                    return (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Name:</span>
                          <span className="text-sm font-medium">{customer?.first_name} {customer?.last_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Email:</span>
                          <span className="text-sm font-medium">{customer?.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Phone:</span>
                          <span className="text-sm font-medium">{customer?.phone_number || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Status:</span>
                          <span className={`text-sm font-medium capitalize ${
                            customer?.status === 'active' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {customer?.status}
                          </span>
                        </div>
                      </>
                    )
                  })()}
                </div>
              </div>

              {/* Payment Information */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Payment Information</h3>
                <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Payment ID:</span>
                    <span className="text-sm font-medium font-mono">{selectedPayment.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Date:</span>
                    <span className="text-sm font-medium">{selectedPayment.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Type:</span>
                    <span className={`text-sm font-medium capitalize px-2 py-0.5 rounded ${getPaymentColor(selectedPayment.type)}`}>
                      {selectedPayment.type.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Amount:</span>
                    <span className="text-lg font-semibold text-primary">${selectedPayment.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <span className={`text-sm font-medium capitalize px-2 py-0.5 rounded ${getStatusColor(selectedPayment.status)}`}>
                      {selectedPayment.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-border flex justify-end gap-2">
              {selectedPayment.status === 'pending' && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => handleReject(selectedPayment)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleApprove(selectedPayment)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                </>
              )}
              <Button variant="outline" onClick={() => setViewModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Approve/Reject Actions */}
      {confirmModalOpen && paymentToProcess && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4" onClick={() => setConfirmModalOpen(false)}>
          <div className="bg-background rounded-lg shadow-lg max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full ${confirmAction === 'approve' ? 'bg-green-100 dark:bg-green-950/50' : 'bg-red-100 dark:bg-red-950/50'}`}>
                  {confirmAction === 'approve' ? (
                    <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">
                    {confirmAction === 'approve' ? 'Approve Payment' : 'Reject Payment'}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {confirmAction === 'approve' 
                      ? 'Are you sure you want to approve this payment? This action will mark the payment as completed.'
                      : 'Are you sure you want to reject this payment? This action will mark the payment as failed.'
                    }
                  </p>
                  <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-medium">${paymentToProcess.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium capitalize">{paymentToProcess.type.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Date:</span>
                      <span className="font-medium">{paymentToProcess.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-border flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={confirmProcessPayment}
                className={confirmAction === 'approve' 
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
                }
              >
                {confirmAction === 'approve' ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Confirm Approval
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4 mr-2" />
                    Confirm Rejection
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
