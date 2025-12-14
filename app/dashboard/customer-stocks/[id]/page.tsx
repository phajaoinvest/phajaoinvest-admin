'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ArrowLeft,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  User,
  BarChart3,
  DollarSign,
  Briefcase,
  Calendar,
  AlertCircle,
  ExternalLink,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { customerStocksApi } from '@/lib/api'
import type { CustomerStock } from '@/lib/types'
import { formatCurrency, formatPercentage, formatNumberWithCommas } from '@/lib/utils'

export default function CustomerStockDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [holding, setHolding] = useState<CustomerStock | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const holdingId = params.id as string

  const fetchHolding = useCallback(async () => {
    try {
      setLoading(true)
      const response = await customerStocksApi.getById(holdingId)
      setHolding(response.data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch holding details',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [holdingId, toast])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const response = await customerStocksApi.getById(holdingId)
      setHolding(response.data)
      toast({
        title: 'Refreshed',
        description: 'Holding data has been refreshed',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to refresh holding data',
        variant: 'destructive',
      })
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (holdingId) {
      fetchHolding()
    }
  }, [holdingId, fetchHolding])

  const getPnLColor = (value: number | null) => {
    if (!value) return 'text-muted-foreground'
    return value >= 0 ? 'text-green-600' : 'text-red-600'
  }

  const getPnLBgColor = (value: number | null) => {
    if (!value) return 'bg-muted'
    return value >= 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (!holding) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-12">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Holding Not Found</h2>
        <p className="text-muted-foreground">The requested customer stock holding could not be found.</p>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    )
  }

  const pnl = (holding.market_value || 0) - (holding.cost_basis || 0)
  const pnlPercent = holding.cost_basis && holding.cost_basis > 0 
    ? (pnl / holding.cost_basis) * 100 
    : 0
  const currentPrice = holding.stock?.last_price || holding.stock?.current_price || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">
                {holding.customer?.first_name} {holding.customer?.last_name || ''}
              </h1>
              <Badge variant="outline" className="text-lg font-bold">
                {holding.stock?.symbol || 'N/A'}
              </Badge>
            </div>
            <p className="text-lg text-muted-foreground">{holding.stock?.name}</p>
            <p className="text-sm text-muted-foreground mt-1">{holding.customer?.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => router.push(`/dashboard/customers/${holding.customer_id}`)}>
            <User className="mr-2 h-4 w-4" />
            View Customer
          </Button>
          <Button variant="outline" onClick={() => router.push(`/dashboard/stocks/${holding.stock_id}`)}>
            <BarChart3 className="mr-2 h-4 w-4" />
            View Stock
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Shares */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Shares Held
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatNumberWithCommas(holding.share || 0)}</div>
            <p className="text-sm text-muted-foreground">
              @ {formatCurrency(holding.avg_price)} avg
            </p>
          </CardContent>
        </Card>

        {/* Market Value */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Market Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(holding.market_value)}</div>
            <p className="text-sm text-muted-foreground">
              Current price: {formatCurrency(currentPrice)}
            </p>
          </CardContent>
        </Card>

        {/* Cost Basis */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cost Basis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(holding.cost_basis)}</div>
            <p className="text-sm text-muted-foreground">
              Total invested
            </p>
          </CardContent>
        </Card>

        {/* P&L */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unrealized P&L
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getPnLColor(pnl)}`}>
              {pnl >= 0 ? '+' : ''}{formatCurrency(pnl)}
            </div>
            <div className={`mt-1 inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium ${getPnLBgColor(pnl)} ${getPnLColor(pnl)}`}>
              {pnl >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {pnl >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Details Cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Position Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Position Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Shares</p>
                <p className="font-medium">{formatNumberWithCommas(holding.share || 0)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Price</p>
                <p className="font-medium">{formatCurrency(holding.avg_price)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Buying Price</p>
                <p className="font-medium">{formatCurrency(holding.buying_price)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Buying Price</p>
                <p className="font-medium">{formatCurrency(holding.total_buying_price)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cost Basis</p>
                <p className="font-medium">{formatCurrency(holding.cost_basis)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Market Value</p>
                <p className="font-medium">{formatCurrency(holding.market_value)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Daily P&L</p>
                <p className={`font-medium ${getPnLColor(holding.daily_pl)}`}>
                  {holding.daily_pl ? (holding.daily_pl >= 0 ? '+' : '') + formatCurrency(holding.daily_pl) : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Change</p>
                <p className="font-medium">{holding.change || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Info */}
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
                <p className="font-medium">
                  {holding.customer?.first_name} {holding.customer?.last_name || ''}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{holding.customer?.email || '-'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">Customer ID</p>
                <p className="font-mono text-sm">{holding.customer_id}</p>
              </div>
            </div>
            <Separator />
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push(`/dashboard/customers/${holding.customer_id}`)}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View Full Customer Profile
            </Button>
          </CardContent>
        </Card>

        {/* Stock Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Stock Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Symbol</p>
                <p className="font-bold text-lg">{holding.stock?.symbol || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{holding.stock?.name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Price</p>
                <p className="font-medium">{formatCurrency(currentPrice)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Exchange</p>
                <p className="font-medium">{holding.stock?.exchange || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sector</p>
                <p className="font-medium">{holding.stock?.sector || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Currency</p>
                <p className="font-medium">{holding.stock?.currency || 'USD'}</p>
              </div>
            </div>
            <Separator />
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push(`/dashboard/stocks/${holding.stock_id}`)}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View Full Stock Details
            </Button>
          </CardContent>
        </Card>

        {/* Timestamps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Timestamps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Created At</p>
                <p className="font-medium">
                  {holding.created_at ? new Date(holding.created_at).toLocaleString() : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Updated At</p>
                <p className="font-medium">
                  {holding.updated_at ? new Date(holding.updated_at).toLocaleString() : '-'}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">Holding ID</p>
                <p className="font-mono text-sm">{holding.id}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* P&L Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Profit & Loss Summary
          </CardTitle>
          <CardDescription>
            Summary of gains and losses for this position
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2 p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Cost Basis (Invested)</p>
              <p className="text-2xl font-bold">{formatCurrency(holding.cost_basis)}</p>
            </div>
            <div className="space-y-2 p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Current Market Value</p>
              <p className="text-2xl font-bold">{formatCurrency(holding.market_value)}</p>
            </div>
            <div className={`space-y-2 p-4 rounded-lg ${getPnLBgColor(pnl)}`}>
              <p className="text-sm text-muted-foreground">Unrealized P&L</p>
              <div className="flex items-center gap-2">
                <p className={`text-2xl font-bold ${getPnLColor(pnl)}`}>
                  {pnl >= 0 ? '+' : ''}{formatCurrency(pnl)}
                </p>
                <Badge variant={pnl >= 0 ? 'default' : 'destructive'}>
                  {pnl >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
