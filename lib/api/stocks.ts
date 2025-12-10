/**
 * Stocks API Service
 */

import { apiClient } from './client'
import type {
  PaginationParams,
  Stock,
  CreateStockRequest,
  UpdateStockRequest,
  StockFilters,
  StockCategory,
  StockPick,
  CreateStockPickRequest,
  UpdateStockPickRequest,
  StockPickFilters,
  CustomerStock,
  StockTransaction,
  StockTransactionFilters,
  BuyStockRequest,
  SellStockRequest,
  StockQuote,
  RSIData,
  StockOverview,
  PriceHistory,
  MarketMover,
} from '@/lib/types'

// ============================================================================
// Stocks
// ============================================================================

export const stocksApi = {
  /**
   * Get paginated list of stocks
   */
  async getAll(params?: PaginationParams & StockFilters) {
    return apiClient.getPaginated<Stock>('/stocks', params)
  },

  /**
   * Get stock by ID
   */
  async getById(id: string) {
    return apiClient.get<Stock>(`/stocks/${id}`)
  },

  /**
   * Lookup/create stock by symbol
   */
  async lookupBySymbol(symbol: string) {
    return apiClient.get<Stock>(`/stocks/symbol/${symbol}`)
  },

  /**
   * Get top 7 tech stocks
   */
  async getGood7() {
    return apiClient.get<Stock[]>('/stocks/good-7')
  },

  /**
   * Create new stock
   */
  async create(data: CreateStockRequest) {
    return apiClient.post<Stock>('/stocks', data)
  },

  /**
   * Update stock
   */
  async update(id: string, data: UpdateStockRequest) {
    return apiClient.patch<Stock>(`/stocks/${id}`, data)
  },

  /**
   * Delete stock
   */
  async delete(id: string) {
    return apiClient.delete(`/stocks/${id}`)
  },

  /**
   * Get stock quote
   */
  async getQuote(symbol: string) {
    return apiClient.get<StockQuote>(`/stocks/${symbol}/quote`)
  },

  /**
   * Buy stock (customer)
   */
  async buy(data: BuyStockRequest) {
    return apiClient.post('/stocks/buy', data)
  },

  /**
   * Sell stock (customer)
   */
  async sell(data: SellStockRequest) {
    return apiClient.post('/stocks/sell', data)
  },
}

// ============================================================================
// Stock Categories
// ============================================================================

export const stockCategoriesApi = {
  /**
   * Get paginated list of categories
   */
  async getAll(params?: PaginationParams) {
    return apiClient.getPaginated<StockCategory>('/stock-categories', params)
  },

  /**
   * Get category by ID
   */
  async getById(id: string) {
    return apiClient.get<StockCategory>(`/stock-categories/${id}`)
  },

  /**
   * Create category
   */
  async create(data: { name: string; description?: string }) {
    return apiClient.post<StockCategory>('/stock-categories', data)
  },

  /**
   * Update category
   */
  async update(id: string, data: { name?: string; description?: string; is_active?: boolean }) {
    return apiClient.patch<StockCategory>(`/stock-categories/${id}`, data)
  },

  /**
   * Delete category
   */
  async delete(id: string) {
    return apiClient.delete(`/stock-categories/${id}`)
  },
}

// ============================================================================
// Stock Picks (Admin)
// ============================================================================

export const stockPicksAdminApi = {
  /**
   * Get all stock picks
   */
  async getAll(params?: PaginationParams & StockPickFilters) {
    return apiClient.getPaginated<StockPick>('/admin/stock-picks', params)
  },

  /**
   * Create stock pick
   */
  async create(data: CreateStockPickRequest) {
    return apiClient.post<StockPick>('/admin/stock-picks', data)
  },

  /**
   * Update stock pick
   */
  async update(id: string, data: UpdateStockPickRequest) {
    return apiClient.put<StockPick>(`/admin/stock-picks/${id}`, data)
  },

  /**
   * Delete stock pick
   */
  async delete(id: string) {
    return apiClient.delete(`/admin/stock-picks/${id}`)
  },

  /**
   * Get pending approvals
   */
  async getPendingApprovals(params?: PaginationParams) {
    return apiClient.getPaginated<StockPick>('/admin/stock-picks/customer-picks', params)
  },

  /**
   * Approve stock pick
   */
  async approve(id: string) {
    return apiClient.post(`/admin/stock-picks/${id}/approve`)
  },

  /**
   * Reject stock pick
   */
  async reject(id: string, reason: string) {
    return apiClient.post(`/admin/stock-picks/${id}/reject`, { reason })
  },
}

// ============================================================================
// Stock Picks (Customer)
// ============================================================================

export const stockPicksCustomerApi = {
  /**
   * Get available stock picks
   */
  async getAvailable() {
    return apiClient.get<StockPick[]>('/stock-picks/available')
  },

  /**
   * Get my selections
   */
  async getMySelections() {
    return apiClient.get('/stock-picks/my-selections')
  },

  /**
   * Get selection details
   */
  async getSelectionById(id: string) {
    return apiClient.get(`/stock-picks/my-selections/${id}`)
  },

  /**
   * Submit payment slip
   */
  async submitPaymentSlip(selectionId: string, paymentSlip: string) {
    return apiClient.post(`/stock-picks/my-selections/${selectionId}/payment-slip`, {
      payment_slip: paymentSlip,
    })
  },

  /**
   * Get stats summary
   */
  async getStatsSummary() {
    return apiClient.get('/stock-picks/stats')
  },
}

// ============================================================================
// Customer Stocks
// ============================================================================

export const customerStocksApi = {
  /**
   * Get my stock holdings
   */
  async getMyHoldings() {
    return apiClient.get<CustomerStock[]>('/customer-stocks/my-holdings')
  },

  /**
   * Get holding by ID
   */
  async getById(id: string) {
    return apiClient.get<CustomerStock>(`/customer-stocks/${id}`)
  },

  /**
   * Get portfolio summary
   */
  async getPortfolioSummary() {
    return apiClient.get('/customer-stocks/portfolio-summary')
  },
}

// ============================================================================
// Stock Transactions
// ============================================================================

export const stockTransactionsApi = {
  /**
   * Get paginated transactions
   */
  async getAll(params?: PaginationParams & StockTransactionFilters) {
    return apiClient.getPaginated<StockTransaction>('/stock-transactions', params)
  },

  /**
   * Get transaction by ID
   */
  async getById(id: string) {
    return apiClient.get<StockTransaction>(`/stock-transactions/${id}`)
  },
}

// ============================================================================
// Technical Indicators
// ============================================================================

export const technicalIndicatorsApi = {
  /**
   * Get RSI for symbol
   */
  async getRSI(symbol: string) {
    return apiClient.get<RSIData>(`/technical-indicators/rsi/${symbol}`)
  },

  /**
   * Get stock overview
   */
  async getOverview(symbol: string) {
    return apiClient.get<StockOverview>(`/technical-indicators/overview/${symbol}`)
  },

  /**
   * Get price history
   */
  async getPriceHistory(symbol: string, period?: string) {
    return apiClient.get<PriceHistory[]>(`/technical-indicators/price-history/${symbol}`, { period })
  },

  /**
   * Get performance metrics
   */
  async getPerformance(symbol: string) {
    return apiClient.get(`/technical-indicators/performance/${symbol}`)
  },

  /**
   * Get quarterly revenue
   */
  async getQuarterlyRevenue(symbol: string) {
    return apiClient.get(`/technical-indicators/quarterly-revenue/${symbol}`)
  },

  /**
   * Get company news
   */
  async getNews(symbol: string) {
    return apiClient.get(`/technical-indicators/news/${symbol}`)
  },

  /**
   * Get SEC filings
   */
  async getFilings(symbol: string) {
    return apiClient.get(`/technical-indicators/filings/${symbol}`)
  },

  /**
   * Get RSI extremes for all US stocks
   */
  async getRSIExtremes() {
    return apiClient.get('/technical-indicators/rsi/all-us-stocks')
  },

  /**
   * Get US market movers
   */
  async getMarketMovers() {
    return apiClient.get<{ gainers: MarketMover[]; losers: MarketMover[] }>(
      '/technical-indicators/market-movers/us'
    )
  },

  /**
   * Get losers near support
   */
  async getLosersNearSupport() {
    return apiClient.get('/technical-indicators/losers-near-support')
  },

  /**
   * Health check
   */
  async healthCheck() {
    return apiClient.get('/technical-indicators/health-check')
  },
}
