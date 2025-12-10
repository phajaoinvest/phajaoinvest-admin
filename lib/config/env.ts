/**
 * Environment configuration
 * Centralized access to environment variables with type safety
 */

const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export const env = {
  // API - includes /api/v1 prefix for backend compatibility
  apiUrl: `${baseApiUrl}/api/v1`,
  baseApiUrl, // Raw URL without prefix (for special cases like uploads)
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'Phajaoinvest Admin',
  
  // Feature flags
  enableMockData: process.env.NEXT_PUBLIC_ENABLE_MOCK_DATA === 'true',
  
  // Runtime
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
} as const

export type Env = typeof env
