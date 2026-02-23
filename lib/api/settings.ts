/**
 * Settings API Service
 */

import { apiClient } from "./client";

// ============================================================================
// Types
// ============================================================================

export interface NotificationSettings {
  notify_new_customers: boolean;
  notify_payments: boolean;
  notify_investments: boolean;
  notify_stock_activity: boolean;
  notify_system_alerts: boolean;
  notify_email: boolean;
}

export interface UpdateNotificationSettings {
  notify_new_customers?: boolean;
  notify_payments?: boolean;
  notify_investments?: boolean;
  notify_stock_activity?: boolean;
  notify_system_alerts?: boolean;
  notify_email?: boolean;
}

export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  type: "string" | "number" | "boolean" | "json";
  category: string | null;
  description: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSystemSetting {
  key: string;
  value: string;
  type?: "string" | "number" | "boolean" | "json";
  category?: string;
  description?: string;
  is_public?: boolean;
}

export interface BackupHistoryItem {
  id: string;
  fileName: string;
  status: string;
  type: string;
  errorMessage: string | null;
  fileSizeBytes: number | null;
  downloadUrl: string | null;
  bunnyCDNFilePath: string | null;
  isDeletedFromStorage: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Settings API
// ============================================================================

export const settingsApi = {
  // ============ Notification Settings ============

  /**
   * Get current user notification settings
   */
  async getNotificationSettings(): Promise<NotificationSettings> {
    const response = await apiClient.get<NotificationSettings>(
      "/settings/notifications"
    );
    return response.data;
  },

  /**
   * Update current user notification settings
   */
  async updateNotificationSettings(
    data: UpdateNotificationSettings
  ): Promise<NotificationSettings> {
    const response = await apiClient.patch<NotificationSettings>(
      "/settings/notifications",
      data
    );
    return response.data;
  },

  // ============ System Settings ============

  /**
   * Get all system settings
   */
  async getSystemSettings(category?: string): Promise<SystemSetting[]> {
    const params = category ? { category } : undefined;
    const response = await apiClient.get<SystemSetting[]>("/settings/system", params);
    return response.data;
  },

  /**
   * Get a specific system setting
   */
  async getSystemSetting(key: string): Promise<SystemSetting | null> {
    const response = await apiClient.get<SystemSetting | null>(
      `/settings/system/${key}`
    );
    return response.data;
  },

  /**
   * Create a new system setting
   */
  async createSystemSetting(data: CreateSystemSetting): Promise<SystemSetting> {
    const response = await apiClient.post<SystemSetting>(
      "/settings/system",
      data
    );
    return response.data;
  },

  /**
   * Update a system setting value
   */
  async updateSystemSetting(
    key: string,
    value: string
  ): Promise<SystemSetting> {
    const response = await apiClient.patch<SystemSetting>(
      `/settings/system/${key}`,
      { value }
    );
    return response.data;
  },

  /**
   * Delete a system setting
   */
  async deleteSystemSetting(key: string): Promise<void> {
    await apiClient.delete(`/settings/system/${key}`);
  },

  // ============ Quick Actions ============

  /**
   * Check if maintenance mode is enabled
   */
  async getMaintenanceMode(): Promise<boolean> {
    const response = await apiClient.get<{ maintenance_mode: boolean }>(
      "/settings/maintenance-mode"
    );
    return response.data.maintenance_mode;
  },

  /**
   * Toggle maintenance mode
   */
  async setMaintenanceMode(enabled: boolean): Promise<boolean> {
    const response = await apiClient.post<{ maintenance_mode: boolean }>(
      "/settings/maintenance-mode",
      { enabled }
    );
    return response.data.maintenance_mode;
  },

  /**
   * Initialize default system settings
   */
  async initializeDefaults(): Promise<void> {
    await apiClient.post("/settings/initialize");
  },

  /**
   * Trigger manual database backup
   */
  async triggerBackup(): Promise<{ downloadUrl: string; fileName: string }> {
    const response = await apiClient.post<{ downloadUrl: string; fileName: string }>(
      "/settings/database/backup"
    );
    return response.data;
  },

  /**
   * Get database backup history
   */
  async getBackupHistory(): Promise<BackupHistoryItem[]> {
    const response = await apiClient.get<BackupHistoryItem[]>(
      "/settings/database/backup/history"
    );
    return response.data;
  },

  // ============ Two-Factor Authentication ============

  /**
   * Get 2FA status for current user
   */
  async get2FAStatus(): Promise<TwoFactorStatus> {
    const response = await apiClient.get<TwoFactorStatus>("/auth/2fa/status");
    return response.data;
  },

  /**
   * Set up 2FA - returns QR code and secret
   */
  async setup2FA(): Promise<TwoFactorSetup> {
    const response = await apiClient.post<TwoFactorSetup>("/auth/2fa/setup");
    return response.data;
  },

  /**
   * Verify and enable 2FA
   */
  async enable2FA(code: string): Promise<TwoFactorEnable> {
    const response = await apiClient.post<TwoFactorEnable>("/auth/2fa/enable", {
      code,
    });
    return response.data;
  },

  /**
   * Disable 2FA
   */
  async disable2FA(
    password: string,
    code?: string,
    backupCode?: string
  ): Promise<{ disabled: boolean; message: string }> {
    const response = await apiClient.post<{
      disabled: boolean;
      message: string;
    }>("/auth/2fa/disable", {
      password,
      code,
      backup_code: backupCode,
    });
    return response.data;
  },

  /**
   * Regenerate backup codes
   */
  async regenerateBackupCodes(
    code: string
  ): Promise<{ backup_codes: string[]; message: string }> {
    const response = await apiClient.post<{
      backup_codes: string[];
      message: string;
    }>("/auth/2fa/regenerate-backup-codes", { code });
    return response.data;
  },
};

// ============================================================================
// 2FA Types
// ============================================================================

export interface TwoFactorStatus {
  enabled: boolean;
  backup_codes_remaining: number;
}

export interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  manualEntryKey: string;
}

export interface TwoFactorEnable {
  enabled: boolean;
  backup_codes: string[];
  message: string;
}
