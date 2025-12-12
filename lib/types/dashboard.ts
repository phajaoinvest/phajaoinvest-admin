/**
 * Dashboard Types
 */

// ============================================================================
// Admin Dashboard Stats (from API)
// ============================================================================

export interface AdminDashboardStats {
  totalCustomers: number
  newCustomersThisMonth: number
  verifiedCustomers: number
  activeCustomers: number
  totalStaff: number
  totalInvestments: number
  displayTotalInvestments: string
  pendingInvestmentRequests: number
  pendingReturnRequests: number
  pendingTopupRequests: number
  totalWalletBalance: number
  displayTotalWalletBalance: string
  pendingKycRequests: number
  totalRevenue: number
  displayTotalRevenue: string
  totalApprovedStockPickPayments: number
  displayTotalApprovedStockPickPayments: string
  totalApprovedMembershipSubscriptions: number
  displayTotalApprovedMembershipSubscriptions: string
  totalApprovedStockTransactions: number
}

// ============================================================================
// Chart Data from API
// ============================================================================

export interface AdminChartDataPoint {
  month: string
  monthFull: string
  value: number
  displayValue: string
}

export interface AdminRevenueChartData {
  chartData: AdminChartDataPoint[]
  total: number
  displayTotal: string
  year: number
}

export interface AdminCustomerGrowthChartData {
  chartData: AdminChartDataPoint[]
  totalCustomers: number
  growthPercent: number
  displayGrowthPercent: string
  year: number
}

export interface AdminStockPicksChartData {
  chartData: AdminChartDataPoint[]
  totalStockPicks: number
  year: number
}

export interface AdminSubscriptionsChartData {
  chartData: AdminChartDataPoint[]
  totalSubscriptions: number
  year: number
}

export interface AdminStockTransactionsChartData {
  chartData: AdminChartDataPoint[]
  totalTransactions: number
  year: number
}

// ============================================================================
// Recent Activity from API
// ============================================================================

export interface AdminRecentActivity {
  id: string
  type:
    | 'customer_registration'
    | 'investment_request'
    | 'return_request'
    | 'topup_request'
    | 'kyc_submission'
    | 'stock_purchase'
  title: string
  description: string
  entityId: string
  entityType: string
  timestamp: string
  customerName: string | null
  amount: number | null
  displayAmount: string | null
}

// ============================================================================
// Legacy Dashboard Types (keep for backwards compatibility)
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
