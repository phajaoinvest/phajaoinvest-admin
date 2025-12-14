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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Search,
  Eye,
  MoreVertical,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Briefcase,
  Users,
  DollarSign,
  BarChart3,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { usePagination } from '@/hooks'
import { customerStocksApi, customersApi, stocksApi } from '@/lib/api'
import type { CustomerStock, Customer, Stock } from '@/lib/types'
import { formatCurrency, formatCompactCurrency } from '@/lib/utils'

export default function CustomerStocksPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [customerStocks, setCustomerStocks] = useState<CustomerStock[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [stocks, setStocks] = useState<Stock[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const { page, limit, setPage, setLimit, updateFromMeta } = usePagination({ initialLimit: 10 })
  const [filterCustomer, setFilterCustomer] = useState<string>('all')
  const [filterStock, setFilterStock] = useState<string>('all')

  // Stats
  const [stats, setStats] = useState({
    totalHoldings: 0,
    totalMarketValue: 0,
    totalCostBasis: 0,
    totalPnL: 0,
  })

  // Fetch customer stocks
  const fetchCustomerStocks = useCallback(async () => {
    try {
      setLoading(true)
      const params: Record<string, unknown> = {
        page,
        limit,
      }
      if (filterCustomer !== 'all') {
        params.customer_id = filterCustomer
      }
      if (filterStock !== 'all') {
        params.stock_id = filterStock
      }

      const response = await customerStocksApi.getAll(params as Parameters<typeof customerStocksApi.getAll>[0])
      setCustomerStocks(response.data)
      setTotal(response.total)
      setTotalPages(response.totalPages || Math.ceil(response.total / limit))
      updateFromMeta({
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages,
      })

      // Calculate stats
      let totalMarketValue = 0
      let totalCostBasis = 0
      response.data.forEach((cs) => {
        totalMarketValue += cs.market_value || 0
        totalCostBasis += cs.cost_basis || 0
      })
      setStats({
        totalHoldings: response.total,
        totalMarketValue,
        totalCostBasis,
        totalPnL: totalMarketValue - totalCostBasis,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch customer stocks',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [page, limit, filterCustomer, filterStock, toast, updateFromMeta])

  // Fetch customers for filter
  const fetchCustomers = useCallback(async () => {
    try {
      const response = await customersApi.getAll({ limit: 100 })
      setCustomers(response.data)
    } catch (error) {
      console.error('Failed to fetch customers:', error)
    }
  }, [])

  // Fetch stocks for filter
  const fetchStocks = useCallback(async () => {
    try {
      const response = await stocksApi.getAll({ limit: 100 })
      setStocks(response.data)
    } catch (error) {
      console.error('Failed to fetch stocks:', error)
    }
  }, [])

  useEffect(() => {
    fetchCustomerStocks()
  }, [fetchCustomerStocks])

  useEffect(() => {
    fetchCustomers()
    fetchStocks()
  }, [fetchCustomers, fetchStocks])

  const getPnLColor = (value: number | null) => {
    if (!value) return 'text-muted-foreground'
    return value >= 0 ? 'text-green-600' : 'text-red-600'
  }

  const formatPnL = (marketValue: number | null, costBasis: number | null) => {
    if (!marketValue || !costBasis) return { value: '-', percent: '-', isPositive: true }
    const pnl = marketValue - costBasis
    const percent = costBasis > 0 ? (pnl / costBasis) * 100 : 0
    return {
      value: formatCurrency(pnl),
      percent: `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`,
      isPositive: pnl >= 0,
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Stock Holdings</h1>
          <p className="text-muted-foreground">
            View and manage customer stock portfolios
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchCustomerStocks} variant="outline" disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Holdings</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHoldings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Active positions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Market Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCompactCurrency(stats.totalMarketValue)}</div>
            <p className="text-xs text-muted-foreground">Current valuation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost Basis</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCompactCurrency(stats.totalCostBasis)}</div>
            <p className="text-xs text-muted-foreground">Total invested</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
            {stats.totalPnL >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPnLColor(stats.totalPnL)}`}>
              {stats.totalPnL >= 0 ? '+' : ''}{formatCompactCurrency(stats.totalPnL)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalCostBasis > 0
                ? `${((stats.totalPnL / stats.totalCostBasis) * 100).toFixed(2)}% return`
                : 'Unrealized gain/loss'}
            </p>
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
            <Select value={filterCustomer} onValueChange={(value) => { setFilterCustomer(value); setPage(1) }}>
              <SelectTrigger className="w-full md:w-[250px]">
                <SelectValue placeholder="Filter by customer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.first_name} {customer.last_name || ''} ({customer.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStock} onValueChange={(value) => { setFilterStock(value); setPage(1) }}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stocks</SelectItem>
                {stocks.map((stock) => (
                  <SelectItem key={stock.id} value={stock.id}>
                    {stock.symbol} - {stock.name}
                  </SelectItem>
                ))}
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

      {/* Customer Stocks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Holdings</CardTitle>
          <CardDescription>
            Showing {customerStocks.length} of {total} holdings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : customerStocks.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-muted-foreground">
              <Briefcase className="mb-4 h-12 w-12" />
              <p>No customer stock holdings found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead className="text-right">Shares</TableHead>
                    <TableHead className="text-right">Avg Price</TableHead>
                    <TableHead className="text-right">Cost Basis</TableHead>
                    <TableHead className="text-right">Market Value</TableHead>
                    <TableHead className="text-right">P&L</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerStocks.map((holding) => {
                    const pnl = formatPnL(holding.market_value, holding.cost_basis)
                    return (
                      <TableRow key={holding.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {holding.customer?.first_name} {holding.customer?.last_name || ''}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {holding.customer?.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-bold">
                              {holding.stock?.symbol || 'N/A'}
                            </Badge>
                            <span className="text-sm text-muted-foreground truncate max-w-[150px]">
                              {holding.stock?.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {holding.share?.toLocaleString() || 0}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(holding.avg_price)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(holding.cost_basis)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(holding.market_value)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className={getPnLColor(holding.market_value && holding.cost_basis ? holding.market_value - holding.cost_basis : null)}>
                            <div className="font-medium">{pnl.value}</div>
                            <div className="text-sm">{pnl.percent}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => router.push(`/dashboard/customer-stocks/${holding.id}`)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => router.push(`/dashboard/customers/${holding.customer_id}`)}>
                                <Users className="mr-2 h-4 w-4" />
                                View Customer
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => router.push(`/dashboard/stocks/${holding.stock_id}`)}>
                                <BarChart3 className="mr-2 h-4 w-4" />
                                View Stock
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
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
    </div>
  )
}
