/**
 * API Client Configuration
 * Centralized HTTP client with interceptors for authentication and error handling
 */

import { env } from '@/lib/config/env'

// ============================================================================
// Types
// ============================================================================

export interface ApiResponse<T> {
  is_error: boolean
  code: string
  message: string
  data: T
  status_code: number
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiError {
  is_error: true
  code: string
  message: string
  error: Record<string, unknown> | null
  status_code: number
}

export interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
}

// ============================================================================
// Token Management
// ============================================================================

const TOKEN_KEY = 'phajaoinvest_access_token'
const REFRESH_TOKEN_KEY = 'phajaoinvest_refresh_token'
const SESSION_ID_KEY = 'phajaoinvest_session_id'

// Auth event listeners for logout notifications
type AuthEventListener = () => void
const authEventListeners: AuthEventListener[] = []

export const authEvents = {
  onLogout: (callback: AuthEventListener): (() => void) => {
    authEventListeners.push(callback)
    // Return unsubscribe function
    return () => {
      const index = authEventListeners.indexOf(callback)
      if (index > -1) {
        authEventListeners.splice(index, 1)
      }
    }
  },
  triggerLogout: (): void => {
    authEventListeners.forEach((callback) => callback())
  },
}

export const tokenManager = {
  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(TOKEN_KEY)
  },

  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  },

  getSessionId: (): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(SESSION_ID_KEY)
  },

  setTokens: (accessToken: string, refreshToken?: string, sessionId?: string): void => {
    if (typeof window === 'undefined') return
    localStorage.setItem(TOKEN_KEY, accessToken)
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    if (sessionId) localStorage.setItem(SESSION_ID_KEY, sessionId)
  },

  clearTokens: (): void => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(SESSION_ID_KEY)
    authEvents.triggerLogout()
  },

  isAuthenticated: (): boolean => {
    return !!tokenManager.getAccessToken()
  },
}

// ============================================================================
// API Client Class
// ============================================================================

class ApiClient {
  private baseUrl: string
  private isRefreshing = false
  private refreshSubscribers: ((token: string) => void)[] = []

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
    const url = new URL(`${this.baseUrl}${endpoint}`)
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }
    
    return url.toString()
  }

  /**
   * Get default headers including auth token
   */
  private getHeaders(customHeaders?: HeadersInit): Headers {
    const headers = new Headers({
      'Content-Type': 'application/json',
      ...customHeaders,
    })

    const token = tokenManager.getAccessToken()
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }

    return headers
  }

  /**
   * Handle token refresh
   */
  private async refreshToken(): Promise<string | null> {
    const refreshToken = tokenManager.getRefreshToken()
    const sessionId = tokenManager.getSessionId()

    if (!refreshToken || !sessionId) {
      return null
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refresh_token: refreshToken,
          session_id: sessionId,
        }),
      })

      if (!response.ok) {
        throw new Error('Token refresh failed')
      }

      const data = await response.json()
      const newAccessToken = data.data?.access_token

      if (newAccessToken) {
        tokenManager.setTokens(
          newAccessToken,
          data.data?.refresh_token || refreshToken,
          data.data?.session_id || sessionId
        )
        return newAccessToken
      }

      return null
    } catch (error) {
      tokenManager.clearTokens()
      return null
    }
  }

  /**
   * Subscribe to token refresh
   */
  private subscribeTokenRefresh(callback: (token: string) => void): void {
    this.refreshSubscribers.push(callback)
  }

  /**
   * Notify all subscribers of new token
   */
  private onTokenRefreshed(token: string): void {
    this.refreshSubscribers.forEach((callback) => callback(token))
    this.refreshSubscribers = []
  }

  /**
   * Core request method with retry logic
   */
  async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const { params, headers: customHeaders, ...fetchConfig } = config
    const url = this.buildUrl(endpoint, params)
    const headers = this.getHeaders(customHeaders)

    try {
      let response = await fetch(url, {
        ...fetchConfig,
        headers,
      })

      // Handle 401 - try to refresh token
      if (response.status === 401 && !endpoint.includes('/auth/')) {
        if (!this.isRefreshing) {
          this.isRefreshing = true
          const newToken = await this.refreshToken()
          this.isRefreshing = false

          if (newToken) {
            this.onTokenRefreshed(newToken)
            headers.set('Authorization', `Bearer ${newToken}`)
            response = await fetch(url, { ...fetchConfig, headers })
          } else {
            // Redirect to login if refresh fails
            if (typeof window !== 'undefined') {
              window.location.href = '/login'
            }
            throw new Error('Session expired. Please login again.')
          }
        } else {
          // Wait for token refresh
          return new Promise((resolve, reject) => {
            this.subscribeTokenRefresh(async (token) => {
              headers.set('Authorization', `Bearer ${token}`)
              try {
                const retryResponse = await fetch(url, { ...fetchConfig, headers })
                const data = await retryResponse.json()
                resolve(data)
              } catch (err) {
                reject(err)
              }
            })
          })
        }
      }

      const data = await response.json()

      if (!response.ok || data.is_error) {
        const error: ApiError = {
          is_error: true,
          code: data.code || 'UNKNOWN_ERROR',
          message: data.message || 'An error occurred',
          error: data.error || null,
          status_code: response.status,
        }
        throw error
      }

      return data
    } catch (error) {
      if ((error as ApiError).is_error) {
        throw error
      }
      
      // Network or other errors
      const apiError: ApiError = {
        is_error: true,
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Network error occurred',
        error: null,
        status_code: 0,
      }
      throw apiError
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<ApiResponse<T>> {
    return this.request<ApiResponse<T>>(endpoint, { method: 'GET', params })
  }

  /**
   * GET request with pagination
   */
  async getPaginated<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined>
  ): Promise<PaginatedResponse<T>> {
    return this.request<PaginatedResponse<T>>(endpoint, { method: 'GET', params })
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<ApiResponse<T>>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<ApiResponse<T>>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<ApiResponse<T>>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<ApiResponse<T>>(endpoint, { method: 'DELETE' })
  }

  /**
   * Upload file with FormData
   */
  async upload<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    const token = tokenManager.getAccessToken()
    const headers: HeadersInit = {}
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    })

    const data = await response.json()

    if (!response.ok || data.is_error) {
      const error: ApiError = {
        is_error: true,
        code: data.code || 'UPLOAD_ERROR',
        message: data.message || 'Upload failed',
        error: data.error || null,
        status_code: response.status,
      }
      throw error
    }

    return data
  }
}

// ============================================================================
// Export singleton instance
// ============================================================================

export const apiClient = new ApiClient(env.apiUrl)

// ============================================================================
// Export utility to check token validity
// ============================================================================

export const checkTokenValidity = async (): Promise<boolean> => {
  try {
    const response = await apiClient.get<{ valid: boolean }>('/auth/verify-token')
    return response.data.valid
  } catch (error) {
    return false
  }
}
