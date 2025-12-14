'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Search,
  Eye,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  DollarSign,
  BarChart3,
  Calendar,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { usePagination } from '@/hooks'
import { stockTransactionsApi } from '@/lib/api'
import type { StockTransaction } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'

export default function StockTransactionsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [transactions, setTransactions] = useState<StockTransaction[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const { page, limit, setPage, setLimit, updateFromMeta } = usePagination({ initialLimit: 10 })
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'buy' | 'sell'>('all')
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<StockTransaction | null>(null)

  // Stats
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalBuyOrders: 0,
    totalSellOrders: 0,
    totalVolume: 0,
  })

  // Fetch transactions
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true)
      const params: Record<string, unknown> = {
        page,
        limit,
      }
      if (filterType !== 'all') {
        params.type = filterType
      }
      if (searchTerm) {
        params.search = searchTerm
      }

      const response = await stockTransactionsApi.getAll(params as Parameters<typeof stockTransactionsApi.getAll>[0])
      setTransactions(response.data)
      setTotal(response.total)
      setTotalPages(response.totalPages || Math.ceil(response.total / limit))
      updateFromMeta({
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages,
      })

      // Calculate basic stats from current data
      const buyOrders = response.data.filter((t) => t.type === 'buy')
      const sellOrders = response.data.filter((t) => t.type === 'sell')
      setStats({
        totalTransactions: response.total,
        totalBuyOrders: buyOrders.length,
        totalSellOrders: sellOrders.length,
        totalVolume: response.data.reduce((sum, t) => sum + (t.total_amount || 0), 0),
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch transactions',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [page, limit, filterType, searchTerm, toast, updateFromMeta])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  // View transaction details
  const handleViewTransaction = async (transaction: StockTransaction) => {
    try {
      const response = await stockTransactionsApi.getById(transaction.id)
      setSelectedTransaction(response.data)
      setShowViewModal(true)
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to fetch transaction details',
        variant: 'destructive',
      })
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock Transactions</h1>
          <p className="text-muted-foreground">
            View all stock buy/sell transactions
          </p>
        </div>
        <Button onClick={fetchTransactions} variant="outline" disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransactions.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Buy Orders</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.totalBuyOrders.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sell Orders</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.totalSellOrders.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalVolume)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by customer or stock..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={filterType}
              onValueChange={(value) => setFilterType(value as 'all' | 'buy' | 'sell')}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="buy">Buy</SelectItem>
                <SelectItem value="sell">Sell</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={limit.toString()}
              onValueChange={(value) => setLimit(parseInt(value))}
            >
              <SelectTrigger className="w-full md:w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 / page</SelectItem>
                <SelectItem value="25">25 / page</SelectItem>
                <SelectItem value="50">50 / page</SelectItem>
                <SelectItem value="100">100 / page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>
            Showing {transactions.length} of {total} transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-muted-foreground">
              <ArrowUpDown className="mb-4 h-12 w-12" />
              <p>No transactions found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(transaction.created_at)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={transaction.type === 'buy' ? 'default' : 'destructive'}
                          className={
                            transaction.type === 'buy'
                              ? 'bg-green-100 text-green-800 hover:bg-green-100'
                              : 'bg-red-100 text-red-800 hover:bg-red-100'
                          }
                        >
                          {transaction.type === 'buy' ? (
                            <TrendingUp className="mr-1 h-3 w-3" />
                          ) : (
                            <TrendingDown className="mr-1 h-3 w-3" />
                          )}
                          {transaction.type?.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {transaction.customer
                          ? `${transaction.customer.first_name} ${transaction.customer.last_name || ''}`
                          : transaction.customer_id?.slice(0, 8) + '...'}
                      </TableCell>
                      <TableCell>
                        {transaction.stock?.symbol || transaction.stock_id?.slice(0, 8) + '...'}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {transaction.quantity?.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(transaction.price)}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(transaction.total_amount)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewTransaction(transaction)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* View Transaction Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              View complete transaction information
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Transaction ID</p>
                  <p className="font-mono text-sm">{selectedTransaction.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <Badge
                    variant={selectedTransaction.type === 'buy' ? 'default' : 'destructive'}
                    className={
                      selectedTransaction.type === 'buy'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }
                  >
                    {selectedTransaction.type?.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium">
                    {selectedTransaction.customer
                      ? `${selectedTransaction.customer.first_name} ${selectedTransaction.customer.last_name || ''}`
                      : selectedTransaction.customer_id}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Stock</p>
                  <p className="font-medium">
                    {selectedTransaction.stock?.symbol || selectedTransaction.stock_id}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quantity</p>
                  <p className="font-medium">{selectedTransaction.quantity?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="font-medium">{formatCurrency(selectedTransaction.price)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-xl font-bold">{formatCurrency(selectedTransaction.total_amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fees</p>
                  <p className="font-medium">{formatCurrency(selectedTransaction.fees)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant="outline">{selectedTransaction.status}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{formatDate(selectedTransaction.created_at)}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
