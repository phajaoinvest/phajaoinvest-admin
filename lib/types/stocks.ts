/**
 * Stock Types
 */

import { BaseEntity, StockPickStatus, StockPickAvailability, ServiceType } from './common'

// ============================================================================
// Stock Entity
// ============================================================================

export interface Stock extends BaseEntity {
  symbol: string
  name: string
  description: string | null
  sector: string | null
  industry: string | null
  exchange: string | null
  country: string | null
  currency: string
  current_price: number | null
  market_cap: number | null
  pe_ratio: number | null
  dividend_yield: number | null
  is_active: boolean
  category_id: string | null
  category?: StockCategory | null
}

// ============================================================================
// Stock Category
// ============================================================================

export interface StockCategory extends BaseEntity {
  name: string
  description: string | null
  is_active: boolean
}

// ============================================================================
// Stock Pick
// ============================================================================

export interface StockPick extends BaseEntity {
  stock_symbol: string
  description: string
  status: StockPickStatus
  availability: StockPickAvailability
  service_type: ServiceType
  recommended_price: number | null
  target_price: number | null
  stop_loss: number | null
  risk_level: string | null
  analysis: string | null
  created_by: string | null
  approved_by: string | null
  approved_at: string | null
  rejected_by: string | null
  rejected_at: string | null
  rejection_reason: string | null
  stock?: Stock | null
}

// ============================================================================
// Customer Stock Pick Selection
// ============================================================================

export interface CustomerStockPickSelection extends BaseEntity {
  customer_id: string
  stock_pick_id: string
  selected_price: number | null
  payment_slip: string | null
  status: StockPickStatus
  approved_by: string | null
  approved_at: string | null
  rejected_by: string | null
  rejected_at: string | null
  rejection_reason: string | null
  stock_pick?: StockPick
}

// ============================================================================
// Customer Stock Holdings
// ============================================================================

export interface CustomerStock extends BaseEntity {
  customer_id: string
  stock_id: string
  quantity: number
  average_buy_price: number
  total_invested: number
  current_value: number
  unrealized_pnl: number
  unrealized_pnl_percentage: number
  stock?: Stock
}

// ============================================================================
// Stock Transaction
// ============================================================================

export interface StockTransaction extends BaseEntity {
  customer_id: string
  stock_id: string
  type: 'buy' | 'sell'
  quantity: number
  price: number
  total_amount: number
  fees: number
  status: string
  stock?: Stock
  customer?: {
    id: string
    first_name: string
    last_name: string | null
  }
}

// ============================================================================
// DTOs
// ============================================================================

export interface CreateStockRequest {
  symbol: string
  name: string
  description?: string
  sector?: string
  industry?: string
  exchange?: string
  country?: string
  currency?: string
  category_id?: string
}

export interface UpdateStockRequest {
  name?: string
  description?: string
  sector?: string
  industry?: string
  is_active?: boolean
  category_id?: string
}

export interface CreateStockPickRequest {
  stock_symbol: string
  description: string
  service_type: ServiceType
  recommended_price?: number
  target_price?: number
  stop_loss?: number
  risk_level?: string
  analysis?: string
}

export interface UpdateStockPickRequest {
  description?: string
  availability?: StockPickAvailability
  recommended_price?: number
  target_price?: number
  stop_loss?: number
  risk_level?: string
  analysis?: string
}

export interface BuyStockRequest {
  stock_id: string
  quantity: number
  buy_price: number
}

export interface SellStockRequest {
  stock_id: string
  quantity: number
  sell_price: number
}

// ============================================================================
// Stock Quote (from external API)
// ============================================================================

export interface StockQuote {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
  peRatio: number | null
  high: number
  low: number
  open: number
  previousClose: number
  timestamp: string
}

// ============================================================================
// Technical Indicators
// ============================================================================

export interface RSIData {
  symbol: string
  rsi: number
  timestamp: string
}

export interface StockOverview {
  symbol: string
  name: string
  description: string
  sector: string
  industry: string
  marketCap: number
  peRatio: number
  dividendYield: number
  fiftyTwoWeekHigh: number
  fiftyTwoWeekLow: number
}

export interface PriceHistory {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface MarketMover {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
}

// ============================================================================
// Filters
// ============================================================================

export interface StockFilters {
  symbol?: string
  sector?: string
  industry?: string
  exchange?: string
  country?: string
  category_id?: string
  is_active?: boolean
  search?: string
}

export interface StockPickFilters {
  status?: StockPickStatus
  availability?: StockPickAvailability
  service_type?: ServiceType
  search?: string
}

export interface StockTransactionFilters {
  customer_id?: string
  stock_id?: string
  type?: 'buy' | 'sell'
  status?: string
  startDate?: string
  endDate?: string
}
