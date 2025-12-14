'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ArrowLeft,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Building2,
  Globe,
  BarChart3,
  DollarSign,
  Activity,
  Clock,
  Info,
  LineChart,
  Layers,
  AlertCircle,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { stocksApi } from '@/lib/api'
import type { Stock } from '@/lib/types'
import {
  formatCurrency,
  formatCompactCurrency,
  formatNumberWithCommas,
  formatPercentage,
  formatCompactNumber,
} from '@/lib/utils'

export default function StockDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [stock, setStock] = useState<Stock | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const stockId = params.id as string

  const fetchStock = useCallback(async () => {
    try {
      setLoading(true)
      const response = await stocksApi.getById(stockId)
      setStock(response.data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch stock details',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [stockId, toast])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const response = await stocksApi.getById(stockId)
      setStock(response.data)
      toast({
        title: 'Refreshed',
        description: 'Stock data has been refreshed',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to refresh stock data',
        variant: 'destructive',
      })
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (stockId) {
      fetchStock()
    }
  }, [stockId, fetchStock])

  const getPriceChangeColor = (value: number | null) => {
    if (!value) return 'text-muted-foreground'
    return value >= 0 ? 'text-green-600' : 'text-red-600'
  }

  const getPriceChangeBgColor = (value: number | null) => {
    if (!value) return 'bg-muted'
    return value >= 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
  }

  const formatMarketCap = (value: number | null) => {
    if (!value) return '-'
    const absValue = Math.abs(value)
    if (absValue >= 1_000_000_000_000) {
      return `$${(value / 1_000_000_000_000).toFixed(2)}T`
    }
    if (absValue >= 1_000_000_000) {
      return `$${(value / 1_000_000_000).toFixed(2)}B`
    }
    if (absValue >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(2)}M`
    }
    return formatCurrency(value)
  }

  const formatVolume = (value: number | null) => {
    if (!value) return '-'
    const absValue = Math.abs(value)
    if (absValue >= 1_000_000_000) {
      return `${(value / 1_000_000_000).toFixed(2)}B`
    }
    if (absValue >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(2)}M`
    }
    if (absValue >= 1_000) {
      return `${(value / 1_000).toFixed(2)}K`
    }
    return formatNumberWithCommas(value)
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

  if (!stock) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-12">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Stock Not Found</h2>
        <p className="text-muted-foreground">The requested stock could not be found.</p>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    )
  }

  const lastPrice = stock.last_price || stock.current_price || 0

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
              <h1 className="text-3xl font-bold">{stock.symbol}</h1>
              <Badge variant={stock.is_active ? 'default' : 'secondary'}>
                {stock.is_active ? 'Active' : 'Inactive'}
              </Badge>
              {stock.market_status && (
                <Badge variant={stock.market_status === 'OPEN' ? 'default' : 'outline'}>
                  {stock.market_status}
                </Badge>
              )}
            </div>
            <p className="text-lg text-muted-foreground">{stock.name}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {stock.exchange && (
                <span className="flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  {stock.exchange}
                </span>
              )}
              {stock.country && (
                <span className="flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  {stock.country}
                </span>
              )}
              {stock.sector && (
                <span className="flex items-center gap-1">
                  <Layers className="h-3 w-3" />
                  {stock.sector}
                </span>
              )}
              {stock.currency && (
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {stock.currency}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Price Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Current Price */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{formatCurrency(lastPrice)}</span>
              <span className={`text-sm font-medium ${getPriceChangeColor(stock.change)}`}>
                {stock.change && stock.change >= 0 ? '+' : ''}
                {formatCurrency(stock.change || 0)}
              </span>
            </div>
            <div className={`mt-2 inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium ${getPriceChangeBgColor(stock.change_percent)} ${getPriceChangeColor(stock.change_percent)}`}>
              {stock.change_percent && stock.change_percent >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {stock.change_percent && stock.change_percent >= 0 ? '+' : ''}
              {formatPercentage(stock.change_percent || 0)}
            </div>
          </CardContent>
        </Card>

        {/* Day Range */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Day Range
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Low</span>
                <span className="font-medium">{formatCurrency(stock.low_price)}</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                {stock.low_price && stock.high_price && lastPrice && (
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: `${((lastPrice - stock.low_price) / (stock.high_price - stock.low_price)) * 100}%`,
                    }}
                  />
                )}
              </div>
              <div className="flex justify-between text-sm">
                <span>High</span>
                <span className="font-medium">{formatCurrency(stock.high_price)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Volume */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatVolume(stock.volume)}</div>
            <p className="text-sm text-muted-foreground">Shares traded today</p>
          </CardContent>
        </Card>

        {/* Market Cap */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Market Cap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatMarketCap(stock.market_cap)}</div>
            {stock.shares_outstanding && (
              <p className="text-sm text-muted-foreground">
                {formatVolume(stock.shares_outstanding)} shares outstanding
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Details Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trading">Trading Info</TabsTrigger>
          <TabsTrigger value="fundamentals">Fundamentals</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Company Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Company Name</p>
                    <p className="font-medium">{stock.company || stock.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Symbol</p>
                    <p className="font-medium">{stock.symbol}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Country</p>
                    <p className="font-medium">{stock.country || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Currency</p>
                    <p className="font-medium">{stock.currency}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Sector</p>
                    <p className="font-medium">{stock.sector || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Industry</p>
                    <p className="font-medium">{stock.industry || '-'}</p>
                  </div>
                </div>
                {stock.description && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground">Description</p>
                      <p className="mt-1 text-sm leading-relaxed">{stock.description}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Price Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Price Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Last Price</p>
                    <p className="font-medium">{formatCurrency(lastPrice)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Previous Close</p>
                    <p className="font-medium">{formatCurrency(stock.previous_close)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Open</p>
                    <p className="font-medium">{formatCurrency(stock.open_price)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Day High</p>
                    <p className="font-medium">{formatCurrency(stock.high_price)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Day Low</p>
                    <p className="font-medium">{formatCurrency(stock.low_price)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Change</p>
                    <p className={`font-medium ${getPriceChangeColor(stock.change)}`}>
                      {stock.change && stock.change >= 0 ? '+' : ''}
                      {formatCurrency(stock.change)} ({stock.change_percent && stock.change_percent >= 0 ? '+' : ''}
                      {formatPercentage(stock.change_percent)})
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category */}
          {(stock.category || stock.stockCategory) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className="text-sm">
                  {(stock.category || stock.stockCategory)?.name}
                </Badge>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Trading Info Tab */}
        <TabsContent value="trading" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Exchange Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Exchange Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Exchange</p>
                    <p className="font-medium">{stock.exchange || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Primary Exchange</p>
                    <p className="font-medium">{stock.primary_exchange || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Security Type</p>
                    <p className="font-medium">{stock.security_type || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Market Status</p>
                    <Badge variant={stock.market_status === 'OPEN' ? 'default' : 'secondary'}>
                      {stock.market_status || 'Unknown'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Market Open</p>
                    <p className="font-medium">{stock.market_open_time || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Market Close</p>
                    <p className="font-medium">{stock.market_close_time || '-'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Book */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Order Book
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Bid Price</p>
                    <p className="font-medium text-green-600">{formatCurrency(stock.bid_price)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ask Price</p>
                    <p className="font-medium text-red-600">{formatCurrency(stock.ask_price)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Bid Size</p>
                    <p className="font-medium">{formatNumberWithCommas(stock.bid_size) || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ask Size</p>
                    <p className="font-medium">{formatNumberWithCommas(stock.ask_size) || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Spread</p>
                    <p className="font-medium">
                      {stock.bid_price && stock.ask_price
                        ? formatCurrency(stock.ask_price - stock.bid_price)
                        : '-'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trading Constraints */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Trading Constraints
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Tradable</p>
                    <Badge variant={stock.is_tradable ? 'default' : 'secondary'}>
                      {stock.is_tradable ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active</p>
                    <Badge variant={stock.is_active ? 'default' : 'secondary'}>
                      {stock.is_active ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Min Tick</p>
                    <p className="font-medium">{stock.min_tick || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Min Order Size</p>
                    <p className="font-medium">{stock.min_size || '-'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Source Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Data Source
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Data Source</p>
                    <p className="font-medium">{stock.data_source || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Data Type</p>
                    <Badge variant="outline">{stock.data_type || 'Unknown'}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Delay</p>
                    <p className="font-medium">{stock.data_delay_minutes || 0} min</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Update</p>
                    <p className="font-medium">
                      {stock.last_price_update
                        ? new Date(stock.last_price_update).toLocaleString()
                        : '-'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Fundamentals Tab */}
        <TabsContent value="fundamentals" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Key Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Key Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Market Cap</p>
                    <p className="font-medium">{formatMarketCap(stock.market_cap)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">P/E Ratio</p>
                    <p className="font-medium">{stock.pe_ratio?.toFixed(2) || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">EPS</p>
                    <p className="font-medium">{stock.eps ? formatCurrency(stock.eps) : '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Dividend Yield</p>
                    <p className="font-medium">
                      {stock.dividend_yield ? formatPercentage(stock.dividend_yield * 100) : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Shares Outstanding</p>
                    <p className="font-medium">{formatVolume(stock.shares_outstanding)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 52-Week Range */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  52-Week Range
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>52W Low</span>
                  <span className="font-medium text-red-600">
                    {formatCurrency(stock.week_52_low)}
                  </span>
                </div>
                <div className="relative h-4 rounded-full bg-gradient-to-r from-red-200 to-green-200 dark:from-red-900/30 dark:to-green-900/30">
                  {stock.week_52_low && stock.week_52_high && lastPrice && (
                    <div
                      className="absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-background shadow-md"
                      style={{
                        left: `${Math.min(
                          100,
                          Math.max(
                            0,
                            ((lastPrice - stock.week_52_low) /
                              (stock.week_52_high - stock.week_52_low)) *
                              100
                          )
                        )}%`,
                      }}
                    />
                  )}
                </div>
                <div className="flex justify-between text-sm">
                  <span>52W High</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(stock.week_52_high)}
                  </span>
                </div>
                <Separator />
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Current Position</p>
                  <p className="text-lg font-bold">{formatCurrency(lastPrice)}</p>
                  {stock.week_52_low && stock.week_52_high && lastPrice && (
                    <p className="text-sm text-muted-foreground">
                      {(
                        ((lastPrice - stock.week_52_low) /
                          (stock.week_52_high - stock.week_52_low)) *
                        100
                      ).toFixed(1)}
                      % from 52W Low
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Technical Tab */}
        <TabsContent value="technical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Timestamps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-sm text-muted-foreground">Last Price Update</p>
                  <p className="font-medium">
                    {stock.last_price_update
                      ? new Date(stock.last_price_update).toLocaleString()
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Trade Time</p>
                  <p className="font-medium">
                    {stock.last_trade_time
                      ? new Date(stock.last_trade_time).toLocaleString()
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created At</p>
                  <p className="font-medium">
                    {stock.created_at ? new Date(stock.created_at).toLocaleString() : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Updated At</p>
                  <p className="font-medium">
                    {stock.updated_at ? new Date(stock.updated_at).toLocaleString() : '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Price Summary</CardTitle>
              <CardDescription>
                Summary of key price levels for technical analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <h4 className="font-medium">Intraday Levels</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Open</span>
                      <span>{formatCurrency(stock.open_price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">High</span>
                      <span className="text-green-600">{formatCurrency(stock.high_price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Low</span>
                      <span className="text-red-600">{formatCurrency(stock.low_price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Close/Last</span>
                      <span className="font-medium">{formatCurrency(lastPrice)}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Reference Prices</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Previous Close</span>
                      <span>{formatCurrency(stock.previous_close)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">52W High</span>
                      <span className="text-green-600">{formatCurrency(stock.week_52_high)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">52W Low</span>
                      <span className="text-red-600">{formatCurrency(stock.week_52_low)}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Bid/Ask</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bid</span>
                      <span className="text-green-600">
                        {formatCurrency(stock.bid_price)} x {stock.bid_size || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ask</span>
                      <span className="text-red-600">
                        {formatCurrency(stock.ask_price)} x {stock.ask_size || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Spread</span>
                      <span>
                        {stock.bid_price && stock.ask_price
                          ? formatCurrency(stock.ask_price - stock.bid_price)
                          : '-'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
