/**
 * API Services Index
 * Re-export all API services for easy importing
 */

// Core
export { apiClient, tokenManager, authEvents, checkTokenValidity, type ApiResponse, type PaginatedResponse, type ApiError } from './client'

// Auth
export { authApi, passwordApi } from './auth'

// Users & Permissions
export { usersApi, rolesApi, permissionsApi } from './users'

// Customers
export { customersApi, customerServicesApi, premiumMembershipApi, customerPaymentsApi } from './customers'

// Stocks
export {
  stocksApi,
  stockCategoriesApi,
  customerStocksApi,
  stockTransactionsApi,
  technicalIndicatorsApi,
} from './stocks'

// Stock Picks (Admin)
export {
  stockPicksAdminApi,
  type StockPick,
  type CustomerStockPick,
  type CreateStockPickDto,
  type UpdateStockPickDto,
  type StockPickFilterDto,
  type AdminApprovePickDto,
  StockPickStatus,
  StockPickAvailability,
  StockPickRiskLevel,
  StockPickRecommendation,
  CustomerServiceType,
  CustomerPickStatus,
} from './stock-picks'

// Investments
export { investmentsApi, investmentsAdminApi, interestRatesApi } from './investments'

// Wallets
export { walletsApi, walletsAdminApi, transferHistoryApi, transferHistoryAdminApi } from './wallets'

// Subscriptions
export { packagesApi, subscriptionsApi, paymentsApi } from './subscriptions'

// Dashboard & Others
export { dashboardApi, auditLogsApi, locationApi, investTypesApi, boundsApi } from './dashboard'

// Service Admin (Approvals)
export { servicesAdminApi, type PendingServiceApplication, type ServiceStats, type AllServicesStats } from './services'

// Notifications
export { notificationsApi } from './notifications'
