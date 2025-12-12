'use client'

import { useState, useEffect, useCallback } from 'react'
import { Users, TrendingUp, CreditCard, Zap, RefreshCw, DollarSign, Package, Activity } from 'lucide-react'
import { StatCard } from '@/components/stat-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { dashboardApi } from '@/lib/api/dashboard'
import type {
  AdminDashboardStats,
  AdminRevenueChartData,
  AdminStockPicksChartData,
  AdminSubscriptionsChartData,
  AdminStockTransactionsChartData,
} from '@/lib/types/dashboard'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function DashboardPage() {
  const currentYear = new Date().getFullYear()
  
  // State for stats
  const [stats, setStats] = useState<AdminDashboardStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  
  // State for charts
  const [investmentChartData, setInvestmentChartData] = useState<AdminRevenueChartData | null>(null)
  const [stockPickChartData, setStockPickChartData] = useState<AdminStockPicksChartData | null>(null)
  const [subscriptionChartData, setSubscriptionChartData] = useState<AdminSubscriptionsChartData | null>(null)
  const [stockTransactionChartData, setStockTransactionChartData] = useState<AdminStockTransactionsChartData | null>(null)
  
  // Year filters for each chart
  const [investmentYear, setInvestmentYear] = useState(currentYear)
  const [stockPickYear, setStockPickYear] = useState(currentYear)
  const [subscriptionYear, setSubscriptionYear] = useState(currentYear)
  const [stockTransactionYear, setStockTransactionYear] = useState(currentYear)
  
  // Loading states
  const [chartsLoading, setChartsLoading] = useState({
    investment: true,
    stockPick: true,
    subscription: true,
    stockTransaction: true,
  })

  // Fetch dashboard stats
  const fetchStats = useCallback(async () => {
    setStatsLoading(true)
    try {
      const response = await dashboardApi.getStats()
      setStats(response.data as AdminDashboardStats)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('Failed to fetch dashboard stats:', errorMessage, error)
    } finally {
      setStatsLoading(false)
    }
  }, [])

  // Fetch investment/revenue chart
  const fetchInvestmentChart = useCallback(async (year: number) => {
    setChartsLoading((prev) => ({ ...prev, investment: true }))
    try {
      const response = await dashboardApi.getRevenueChart(year)
      setInvestmentChartData(response.data as AdminRevenueChartData)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('Failed to fetch investment chart:', errorMessage, error)
    } finally {
      setChartsLoading((prev) => ({ ...prev, investment: false }))
    }
  }, [])

  // Fetch stock picks chart
  const fetchStockPickChart = useCallback(async (year: number) => {
    setChartsLoading((prev) => ({ ...prev, stockPick: true }))
    try {
      const response = await dashboardApi.getStockPicksChart(year)
      setStockPickChartData(response.data as AdminStockPicksChartData)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('Failed to fetch stock pick chart:', errorMessage, error)
    } finally {
      setChartsLoading((prev) => ({ ...prev, stockPick: false }))
    }
  }, [])

  // Fetch subscription chart
  const fetchSubscriptionChart = useCallback(async (year: number) => {
    setChartsLoading((prev) => ({ ...prev, subscription: true }))
    try {
      const response = await dashboardApi.getSubscriptionsChart(year)
      setSubscriptionChartData(response.data as AdminSubscriptionsChartData)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('Failed to fetch subscription chart:', errorMessage, error)
    } finally {
      setChartsLoading((prev) => ({ ...prev, subscription: false }))
    }
  }, [])

  // Fetch stock transactions chart
  const fetchStockTransactionChart = useCallback(async (year: number) => {
    setChartsLoading((prev) => ({ ...prev, stockTransaction: true }))
    try {
      const response = await dashboardApi.getStockTransactionsChart(year)
      setStockTransactionChartData(response.data as AdminStockTransactionsChartData)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('Failed to fetch stock transaction chart:', errorMessage, error)
    } finally {
      setChartsLoading((prev) => ({ ...prev, stockTransaction: false }))
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchStats()
    fetchInvestmentChart(investmentYear)
    fetchStockPickChart(stockPickYear)
    fetchSubscriptionChart(subscriptionYear)
    fetchStockTransactionChart(stockTransactionYear)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Refetch when year changes
  useEffect(() => {
    fetchInvestmentChart(investmentYear)
  }, [investmentYear, fetchInvestmentChart])

  useEffect(() => {
    fetchStockPickChart(stockPickYear)
  }, [stockPickYear, fetchStockPickChart])

  useEffect(() => {
    fetchSubscriptionChart(subscriptionYear)
  }, [subscriptionYear, fetchSubscriptionChart])

  useEffect(() => {
    fetchStockTransactionChart(stockTransactionYear)
  }, [stockTransactionYear, fetchStockTransactionChart])

  // Generate year options
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i)

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: '#94a3b8',
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: 'rgba(148, 163, 184, 0.1)',
        },
        ticks: {
          color: '#94a3b8',
        },
      },
      y: {
        grid: {
          display: true,
          color: 'rgba(148, 163, 184, 0.1)',
        },
        ticks: {
          color: '#94a3b8',
        },
      },
    },
  }

  const investmentHistoryData = {
    labels: investmentChartData?.chartData.map((d) => d.month) || [],
    datasets: [
      {
        label: 'Investment Amount ($)',
        data: investmentChartData?.chartData.map((d) => d.value) || [],
        backgroundColor: 'rgba(134, 239, 172, 0.7)',
        borderColor: 'rgba(134, 239, 172, 1)',
        borderWidth: 2,
      },
    ],
  }

  const stockPickHistoryData = {
    labels: stockPickChartData?.chartData.map((d) => d.month) || [],
    datasets: [
      {
        label: 'Stock Picks Added',
        data: stockPickChartData?.chartData.map((d) => d.value) || [],
        backgroundColor: 'rgba(147, 197, 253, 0.7)',
        borderColor: 'rgba(147, 197, 253, 1)',
        borderWidth: 2,
      },
    ],
  }

  const subscriptionHistoryData = {
    labels: subscriptionChartData?.chartData.map((d) => d.month) || [],
    datasets: [
      {
        label: 'New Subscriptions',
        data: subscriptionChartData?.chartData.map((d) => d.value) || [],
        backgroundColor: 'rgba(196, 181, 253, 0.7)',
        borderColor: 'rgba(196, 181, 253, 1)',
        borderWidth: 2,
      },
    ],
  }

  const stockBuySellHistoryData = {
    labels: stockTransactionChartData?.chartData.map((d) => d.month) || [],
    datasets: [
      {
        label: 'Stock Transactions',
        data: stockTransactionChartData?.chartData.map((d) => d.value) || [],
        backgroundColor: 'rgba(253, 186, 116, 0.7)',
        borderColor: 'rgba(253, 186, 116, 1)',
        borderWidth: 2,
      },
    ],
  }

  return (
    <div className="space-y-8">
      {/* Header with Refresh Button */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            fetchStats()
            fetchInvestmentChart(investmentYear)
            fetchStockPickChart(stockPickYear)
            fetchSubscriptionChart(subscriptionYear)
            fetchStockTransactionChart(stockTransactionYear)
          }}
          disabled={statsLoading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${statsLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stat Cards - Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          icon={<Users className="w-4 h-4" />}
          label="Active Customers"
          value={statsLoading ? '...' : stats?.activeCustomers ?? 0}
          change={`+${stats?.newCustomersThisMonth ?? 0} this month`}
          changeType="positive"
        />
        <StatCard
          icon={<TrendingUp className="w-4 h-4" />}
          label="Total Investments"
          value={statsLoading ? '...' : stats?.displayTotalInvestments ?? '$0'}
          change={`${stats?.pendingInvestmentRequests ?? 0} pending`}
          changeType="positive"
        />
        <StatCard
          icon={<Zap className="w-4 h-4" />}
          label="Total Customers"
          value={statsLoading ? '...' : stats?.totalCustomers ?? 0}
          change={`${stats?.verifiedCustomers ?? 0} verified`}
          changeType="positive"
        />
        <StatCard
          icon={<CreditCard className="w-4 h-4" />}
          label="Total Revenue"
          value={statsLoading ? '...' : stats?.displayTotalRevenue ?? '$0'}
          change={`${stats?.pendingKycRequests ?? 0} pending KYC`}
          changeType="positive"
        />
      </div>

      {/* Stat Cards - Row 2: Approved Totals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard
          icon={<DollarSign className="w-4 h-4" />}
          label="Stock Pick Payments"
          value={statsLoading ? '...' : stats?.displayTotalApprovedStockPickPayments ?? '$0'}
          change="Approved only"
          changeType="positive"
        />
        <StatCard
          icon={<Package className="w-4 h-4" />}
          label="Membership Subscriptions"
          value={statsLoading ? '...' : stats?.displayTotalApprovedMembershipSubscriptions ?? '$0'}
          change="Active only"
          changeType="positive"
        />
        <StatCard
          icon={<Activity className="w-4 h-4" />}
          label="Stock Transactions"
          value={statsLoading ? '...' : stats?.totalApprovedStockTransactions ?? 0}
          change="Total transactions"
          changeType="positive"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Investment History Chart */}
        <Card className="border border-border/50 shadow-md bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              Investment History {investmentChartData?.displayTotal ? `(${investmentChartData.displayTotal})` : ''}
            </CardTitle>
            <Select value={investmentYear.toString()} onValueChange={(value) => setInvestmentYear(Number(value))}>
              <SelectTrigger className="w-[110px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {chartsLoading.investment ? (
                <div className="flex items-center justify-center h-full">
                  <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Bar data={investmentHistoryData} options={chartOptions} />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stock Pick History Chart */}
        <Card className="border border-border/50 shadow-md bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              Stock Pick History {stockPickChartData?.totalStockPicks ? `(${stockPickChartData.totalStockPicks} total)` : ''}
            </CardTitle>
            <Select value={stockPickYear.toString()} onValueChange={(value) => setStockPickYear(Number(value))}>
              <SelectTrigger className="w-[110px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {chartsLoading.stockPick ? (
                <div className="flex items-center justify-center h-full">
                  <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Bar data={stockPickHistoryData} options={chartOptions} />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Subscription History Chart */}
        <Card className="border border-border/50 shadow-md bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              Subscription History {subscriptionChartData?.totalSubscriptions ? `(${subscriptionChartData.totalSubscriptions} total)` : ''}
            </CardTitle>
            <Select value={subscriptionYear.toString()} onValueChange={(value) => setSubscriptionYear(Number(value))}>
              <SelectTrigger className="w-[110px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {chartsLoading.subscription ? (
                <div className="flex items-center justify-center h-full">
                  <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Bar data={subscriptionHistoryData} options={chartOptions} />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stock Buy & Sell History Chart */}
        <Card className="border border-border/50 shadow-md bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              Stock Transactions {stockTransactionChartData?.totalTransactions ? `(${stockTransactionChartData.totalTransactions} total)` : ''}
            </CardTitle>
            <Select value={stockTransactionYear.toString()} onValueChange={(value) => setStockTransactionYear(Number(value))}>
              <SelectTrigger className="w-[110px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {chartsLoading.stockTransaction ? (
                <div className="flex items-center justify-center h-full">
                  <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Bar data={stockBuySellHistoryData} options={chartOptions} />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
