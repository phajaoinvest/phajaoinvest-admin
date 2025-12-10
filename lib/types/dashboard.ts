/**
 * Dashboard Types
 */

// ============================================================================
// Dashboard Stats
// ============================================================================

export interface DashboardStats {
  totalCustomers: number
  activeCustomers: number
  totalInvestments: number
  activeInvestments: number
  totalRevenue: number
  pendingPayments: number
  totalStockPicks: number
  approvedStockPicks: number
}

// ============================================================================
// Chart Data
// ============================================================================

export interface ChartDataPoint {
  label: string
  value: number
}

export interface TimeSeriesDataPoint {
  date: string
  value: number
}

export interface MultiSeriesDataPoint {
  date: string
  [key: string]: string | number
}

// ============================================================================
// Investment Performance
// ============================================================================

export interface InvestmentPerformance {
  period: string
  invested: number
  returns: number
  profit: number
  profitPercentage: number
}

// ============================================================================
// Market Performance
// ============================================================================

export interface MarketPerformance {
  index: string
  value: number
  change: number
  changePercent: number
}

// ============================================================================
// Recent Activity
// ============================================================================

export interface RecentActivity {
  id: string
  type: 'investment' | 'withdrawal' | 'stock_trade' | 'subscription' | 'payment'
  description: string
  amount: number
  customer: {
    id: string
    name: string
  }
  timestamp: string
}

// ============================================================================
// Summary Cards
// ============================================================================

export interface SummaryCard {
  title: string
  value: number | string
  change?: number
  changeType?: 'increase' | 'decrease' | 'neutral'
  icon?: string
  color?: string
}
