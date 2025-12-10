/**
 * Authentication API Service
 */

import { apiClient, tokenManager } from './client'
import type {
  LoginRequest,
  LoginResponse,
  CustomerLoginRequest,
  CustomerLoginResponse,
  CustomerRegisterRequest,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ForgotPasswordRequest,
  ResetPasswordOtpRequest,
  ResetPasswordTokenRequest,
  AuthUser,
} from '@/lib/types'

const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  CUSTOMER_LOGIN: '/auth/customer/login',
  CUSTOMER_REGISTER: '/auth/customer/register',
  REFRESH_TOKEN: '/auth/refresh-token',
  SESSIONS: '/auth/sessions',
  REVOKE_SESSION: '/auth/sessions/revoke',
  REVOKE_OTHER_SESSIONS: '/auth/sessions/revoke-others',
  REVOKE_ALL_SESSIONS: '/auth/sessions/revoke-all',
} as const

export const authApi = {
  /**
   * Admin/Staff login
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(AUTH_ENDPOINTS.LOGIN, data)
    
    if (response.data.access_token) {
      tokenManager.setTokens(
        response.data.access_token,
        response.data.refresh_token,
        response.data.session_id
      )
    }
    
    return response.data
  },

  /**
   * Customer login
   */
  async customerLogin(data: CustomerLoginRequest): Promise<CustomerLoginResponse> {
    const response = await apiClient.post<CustomerLoginResponse>(
      AUTH_ENDPOINTS.CUSTOMER_LOGIN,
      data
    )
    
    if (response.data.access_token) {
      tokenManager.setTokens(
        response.data.access_token,
        response.data.refresh_token,
        response.data.session_id
      )
    }
    
    return response.data
  },

  /**
   * Customer registration
   */
  async register(data: CustomerRegisterRequest): Promise<void> {
    await apiClient.post(AUTH_ENDPOINTS.CUSTOMER_REGISTER, data)
  },

  /**
   * Refresh access token
   */
  async refreshToken(data: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    const response = await apiClient.post<RefreshTokenResponse>(
      AUTH_ENDPOINTS.REFRESH_TOKEN,
      data
    )
    
    if (response.data.access_token) {
      tokenManager.setTokens(
        response.data.access_token,
        response.data.refresh_token,
        response.data.session_id
      )
    }
    
    return response.data
  },

  /**
   * Verify token validity (for admin/user)
   */
  async verifyToken(): Promise<{ valid: boolean; user?: AuthUser }> {
    try {
      const response = await apiClient.get<{ valid: boolean; user?: AuthUser }>(
        '/auth/verify-token'
      )
      return response.data
    } catch (error) {
      return { valid: false }
    }
  },

  /**
   * Logout - call backend and clear tokens
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout', {})
    } catch (error) {
      // Ignore errors, still clear tokens locally
      console.error('Logout error:', error)
    } finally {
      tokenManager.clearTokens()
    }
  },

  /**
   * Clear tokens without calling backend
   */
  clearTokens(): void {
    tokenManager.clearTokens()
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return tokenManager.isAuthenticated()
  },

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return tokenManager.getAccessToken()
  },

  /**
   * Get active sessions
   */
  async getSessions() {
    return apiClient.get(AUTH_ENDPOINTS.SESSIONS)
  },

  /**
   * Revoke a specific session
   */
  async revokeSession(sessionId: string) {
    return apiClient.post(AUTH_ENDPOINTS.REVOKE_SESSION, { session_id: sessionId })
  },

  /**
   * Revoke all other sessions
   */
  async revokeOtherSessions() {
    return apiClient.post(AUTH_ENDPOINTS.REVOKE_OTHER_SESSIONS)
  },

  /**
   * Revoke all sessions
   */
  async revokeAllSessions() {
    return apiClient.post(AUTH_ENDPOINTS.REVOKE_ALL_SESSIONS)
  },
}

// Password reset endpoints are under customers
export const passwordApi = {
  /**
   * Request password reset
   */
  async forgotPassword(data: ForgotPasswordRequest) {
    return apiClient.post('/customers/forgot-password', data)
  },

  /**
   * Reset password with OTP
   */
  async resetPasswordWithOtp(data: ResetPasswordOtpRequest) {
    return apiClient.post('/customers/reset-password/otp', data)
  },

  /**
   * Reset password with token
   */
  async resetPasswordWithToken(data: ResetPasswordTokenRequest) {
    return apiClient.post('/customers/reset-password', data)
  },
}
