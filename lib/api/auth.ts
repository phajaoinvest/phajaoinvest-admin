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
  AdminProfile,
  UpdateProfileRequest,
  ChangePasswordRequest,
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
  TWO_FACTOR_VERIFY: '/auth/2fa/verify',
} as const

// 2FA response types
export interface TwoFactorRequiredResponse {
  requires_2fa: boolean
  temp_token: string
  message: string
}

export const authApi = {
  /**
   * Admin/Staff login
   */
  async login(data: LoginRequest): Promise<LoginResponse | TwoFactorRequiredResponse> {
    const response = await apiClient.post<LoginResponse | TwoFactorRequiredResponse>(AUTH_ENDPOINTS.LOGIN, data)
    
    // Check if 2FA is required
    if ('requires_2fa' in response.data && response.data.requires_2fa) {
      return response.data as TwoFactorRequiredResponse
    }
    
    const loginResponse = response.data as LoginResponse
    if (loginResponse.access_token) {
      tokenManager.setTokens(
        loginResponse.access_token,
        loginResponse.refresh_token,
        loginResponse.session_id
      )
    }
    
    return loginResponse
  },

  /**
   * Complete 2FA login
   */
  async verify2FALogin(tempToken: string, code?: string, backupCode?: string): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(AUTH_ENDPOINTS.TWO_FACTOR_VERIFY, {
      temp_token: tempToken,
      code,
      backup_code: backupCode,
    })
    
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
   * Returns:
   * - { valid: true, user, networkError: false } - token is valid
   * - { valid: false, networkError: false } - backend explicitly says invalid
   * - { valid: false, networkError: true } - couldn't reach backend
   */
  async verifyToken(): Promise<{ valid: boolean; user?: AuthUser; networkError?: boolean }> {
    try {
      const response = await apiClient.get<{ valid: boolean; user?: AuthUser; is_error?: boolean }>(
        '/auth/verify-token'
      )
      
      // Check if backend explicitly returned is_error: true or valid: false
      if (response.data.is_error === true || response.data.valid === false) {
        return { valid: false, networkError: false }
      }
      
      return { valid: response.data.valid ?? true, user: response.data.user, networkError: false }
    } catch (error: any) {
      // Check if this is a response from backend with is_error or 401 status
      if (error?.response) {
        const status = error.response.status
        const data = error.response.data
        
        // Backend responded with 401 or is_error: true - this is explicit invalid
        if (status === 401 || data?.is_error === true) {
          return { valid: false, networkError: false }
        }
      }
      
      // Network error or backend not reachable - don't treat as invalid
      console.warn('Token verification failed due to network error:', error?.message || error)
      return { valid: false, networkError: true }
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

  // ============ Profile Management ============

  /**
   * Get current admin/user profile
   */
  async getProfile(): Promise<AdminProfile> {
    const response = await apiClient.get<AdminProfile>('/auth/profile')
    return response.data
  },

  /**
   * Update current admin/user profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<AdminProfile> {
    const response = await apiClient.patch<AdminProfile>('/auth/profile', data)
    return response.data
  },

  /**
   * Change current admin/user password
   */
  async changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/change-password', data)
    return response.data
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
