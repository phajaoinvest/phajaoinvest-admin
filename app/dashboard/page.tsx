'use client'

import { useState } from 'react'
import { Users, TrendingUp, CreditCard, Zap } from 'lucide-react'
import { StatCard } from '@/components/stat-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useDashboardStore } from '@/lib/dashboard-store'
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

type ChartFilter = 'week' | 'month' | 'year'

export default function DashboardPage() {
  const { customers, investments, stockPicks, payments, subscriptions } = useDashboardStore()

  const [investmentFilter, setInvestmentFilter] = useState<ChartFilter>('year')
  const [stockPickFilter, setStockPickFilter] = useState<ChartFilter>('year')
  const [subscriptionFilter, setSubscriptionFilter] = useState<ChartFilter>('year')
  const [stockBuySellFilter, setStockBuySellFilter] = useState<ChartFilter>('year')

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0)
  const activeCustomers = customers.filter((c) => c.status === 'active').length
  const activeInvestments = investments.filter((i) => i.status === 'active').length
  const totalInvestment = investments.reduce((sum, i) => sum + i.amount, 0)

  const getLabels = (filter: ChartFilter): string[] => {
    switch (filter) {
      case 'week':
        return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      case 'month':
        return ['Week 1', 'Week 2', 'Week 3', 'Week 4']
      case 'year':
        return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    }
  }

  const getDataLength = (filter: ChartFilter): number => {
    switch (filter) {
      case 'week':
        return 7
      case 'month':
        return 4
      case 'year':
        return 12
    }
  }

  const generateRandomData = (length: number, min: number, max: number): number[] => {
    return Array.from({ length }, () => Math.floor(Math.random() * (max - min + 1)) + min)
  }

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
    labels: getLabels(investmentFilter),
    datasets: [
      {
        label: 'Investment Amount ($K)',
        data: generateRandomData(getDataLength(investmentFilter), 40, 75),
        backgroundColor: 'rgba(134, 239, 172, 0.7)', // Softer green
        borderColor: 'rgba(134, 239, 172, 1)',
        borderWidth: 2,
      },
    ],
  }

  const stockPickHistoryData = {
    labels: getLabels(stockPickFilter),
    datasets: [
      {
        label: 'Stock Picks Added',
        data: generateRandomData(getDataLength(stockPickFilter), 10, 30),
        backgroundColor: 'rgba(147, 197, 253, 0.7)', // Softer blue
        borderColor: 'rgba(147, 197, 253, 1)',
        borderWidth: 2,
      },
    ],
  }

  const subscriptionHistoryData = {
    labels: getLabels(subscriptionFilter),
    datasets: [
      {
        label: 'New Subscriptions',
        data: generateRandomData(getDataLength(subscriptionFilter), 25, 50),
        backgroundColor: 'rgba(196, 181, 253, 0.7)', // Softer purple
        borderColor: 'rgba(196, 181, 253, 1)',
        borderWidth: 2,
      },
    ],
  }

  const stockBuySellHistoryData = {
    labels: getLabels(stockBuySellFilter),
    datasets: [
      {
        label: 'Stock Transactions',
        data: generateRandomData(getDataLength(stockBuySellFilter), 35, 85),
        backgroundColor: 'rgba(253, 186, 116, 0.7)', // Softer orange
        borderColor: 'rgba(253, 186, 116, 1)',
        borderWidth: 2,
      },
    ],
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          icon={<Users className="w-4 h-4" />}
          label="Active Customers"
          value={activeCustomers}
          change="+12% this month"
          changeType="positive"
        />
        <StatCard
          icon={<TrendingUp className="w-4 h-4" />}
          label="Total Investments"
          value={`$${(totalInvestment / 1000).toFixed(1)}K`}
          change="+23% this month"
          changeType="positive"
        />
        <StatCard
          icon={<Zap className="w-4 h-4" />}
          label="Stock Picks"
          value={stockPicks.length}
          change="2 new this week"
          changeType="positive"
        />
        <StatCard
          icon={<CreditCard className="w-4 h-4" />}
          label="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          change="+18% this month"
          changeType="positive"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-border/50 shadow-md bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Investment History</CardTitle>
            <Select value={investmentFilter} onValueChange={(value) => setInvestmentFilter(value as ChartFilter)}>
              <SelectTrigger className="w-[110px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="year">Year</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Bar data={investmentHistoryData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Stock Pick History Chart */}
        <Card className="border border-border/50 shadow-md bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Stock Pick History</CardTitle>
            <Select value={stockPickFilter} onValueChange={(value) => setStockPickFilter(value as ChartFilter)}>
              <SelectTrigger className="w-[110px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="year">Year</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Bar data={stockPickHistoryData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Subscription History Chart */}
        <Card className="border border-border/50 shadow-md bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Subscription History</CardTitle>
            <Select value={subscriptionFilter} onValueChange={(value) => setSubscriptionFilter(value as ChartFilter)}>
              <SelectTrigger className="w-[110px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="year">Year</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Bar data={subscriptionHistoryData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Stock Buy & Sell History Chart */}
        <Card className="border border-border/50 shadow-md bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Stock Buy & Sell History</CardTitle>
            <Select value={stockBuySellFilter} onValueChange={(value) => setStockBuySellFilter(value as ChartFilter)}>
              <SelectTrigger className="w-[110px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="year">Year</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Bar data={stockBuySellHistoryData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
