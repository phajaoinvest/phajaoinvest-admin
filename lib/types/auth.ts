/**
 * Authentication Types
 */

import { BaseEntity } from './common'

// ============================================================================
// Login
// ============================================================================

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  access_token: string
  refresh_token?: string
  session_id?: string
  user: AuthUser
}

export interface AuthUser {
  id: string
  username: string
  first_name: string
  last_name: string | null
  gender: string
  tel: string | null
  address: string | null
  status: string
  profile: string | null
  role: AuthRole | null
  permissions: string[]
}

export interface AuthRole {
  id: string
  name: string
  description: string | null
  permissions: AuthPermission[]
}

export interface AuthPermission {
  id: string
  name: string
  description: string | null
}

// ============================================================================
// Customer Login
// ============================================================================

export interface CustomerLoginRequest {
  username?: string
  email?: string
  password: string
}

export interface CustomerLoginResponse {
  access_token: string
  refresh_token: string
  session_id: string
  customer: CustomerAuth
}

export interface CustomerAuth {
  id: string
  username: string
  email: string
  first_name: string
  last_name: string | null
  status: string
  isVerify: boolean
}

// ============================================================================
// Register
// ============================================================================

export interface CustomerRegisterRequest {
  username: string
  email: string
  password: string
  first_name: string
  last_name?: string
  address?: string
}

// ============================================================================
// Refresh Token
// ============================================================================

export interface RefreshTokenRequest {
  session_id: string
  refresh_token: string
}

export interface RefreshTokenResponse {
  access_token: string
  refresh_token: string
  session_id: string
}

// ============================================================================
// Password Reset
// ============================================================================

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordOtpRequest {
  email: string
  otp: string
  new_password: string
}

export interface ResetPasswordTokenRequest {
  token: string
  new_password: string
}

// ============================================================================
// Session
// ============================================================================

export interface Session extends BaseEntity {
  user_id?: string
  customer_id?: string
  ip_address: string
  user_agent: string
  is_active: boolean
  last_activity: string
  expires_at: string
}

// ============================================================================
// Profile Management
// ============================================================================

export interface AdminProfile {
  id: string
  username: string
  first_name: string | null
  last_name: string | null
  tel: string | null
  gender: string | null
  address: string | null
  status: string
  profile: string | null
  role: string | null
  role_id: string | null
  created_at: string
  updated_at: string
}

export interface UpdateProfileRequest {
  first_name?: string
  last_name?: string
  tel?: string
}

export interface ChangePasswordRequest {
  current_password: string
  new_password: string
}
