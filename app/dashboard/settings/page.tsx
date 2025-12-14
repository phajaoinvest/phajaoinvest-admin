'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { User, Bell, Shield, Database, Mail, Key, Save, Loader2, Smartphone, Copy, Check, AlertTriangle } from 'lucide-react'
import { useAuthStore } from '@/lib/auth-store'
import { authApi } from '@/lib/api/auth'
import { settingsApi, type NotificationSettings, type TwoFactorStatus, type TwoFactorSetup } from '@/lib/api/settings'
import type { AdminProfile } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user)
  const { toast } = useToast()
  
  // Profile state
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileSaving, setProfileSaving] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [tel, setTel] = useState('')

  // Password change state
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null)
  const [notificationLoading, setNotificationLoading] = useState(true)
  const [notificationSaving, setNotificationSaving] = useState(false)

  // System settings state
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [systemLoading, setSystemLoading] = useState(true)

  // 2FA state
  const [twoFactorStatus, setTwoFactorStatus] = useState<TwoFactorStatus | null>(null)
  const [twoFactorLoading, setTwoFactorLoading] = useState(true)
  const [twoFactorSetup, setTwoFactorSetup] = useState<TwoFactorSetup | null>(null)
  const [showSetup2FADialog, setShowSetup2FADialog] = useState(false)
  const [showDisable2FADialog, setShowDisable2FADialog] = useState(false)
  const [showBackupCodesDialog, setShowBackupCodesDialog] = useState(false)
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [verificationCode, setVerificationCode] = useState('')
  const [disablePassword, setDisablePassword] = useState('')
  const [disableCode, setDisableCode] = useState('')
  const [twoFactorProcessing, setTwoFactorProcessing] = useState(false)
  const [copiedSecret, setCopiedSecret] = useState(false)

  // Load profile on mount
  useEffect(() => {
    loadProfile()
    loadNotificationSettings()
    loadSystemSettings()
    load2FAStatus()
  }, [])

  const loadProfile = async () => {
    try {
      setProfileLoading(true)
      const data = await authApi.getProfile()
      setProfile(data)
      setFirstName(data.first_name || '')
      setLastName(data.last_name || '')
      setTel(data.tel || '')
    } catch (error) {
      console.error('Failed to load profile:', error)
      toast({
        title: 'Error',
        description: 'Failed to load profile',
        variant: 'destructive',
      })
    } finally {
      setProfileLoading(false)
    }
  }

  const loadNotificationSettings = async () => {
    try {
      setNotificationLoading(true)
      const data = await settingsApi.getNotificationSettings()
      setNotificationSettings(data)
    } catch (error) {
      console.error('Failed to load notification settings:', error)
      // Set defaults if not found
      setNotificationSettings({
        notify_new_customers: true,
        notify_payments: true,
        notify_investments: true,
        notify_stock_activity: true,
        notify_system_alerts: true,
        notify_email: false,
      })
    } finally {
      setNotificationLoading(false)
    }
  }

  const loadSystemSettings = async () => {
    try {
      setSystemLoading(true)
      const enabled = await settingsApi.getMaintenanceMode()
      setMaintenanceMode(enabled)
    } catch (error) {
      console.error('Failed to load system settings:', error)
    } finally {
      setSystemLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      setProfileSaving(true)
      const updatedProfile = await authApi.updateProfile({
        first_name: firstName,
        last_name: lastName,
        tel: tel,
      })
      setProfile(updatedProfile)
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      })
    } catch (error) {
      console.error('Failed to save profile:', error)
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      })
    } finally {
      setProfileSaving(false)
    }
  }

  const handleChangePassword = async () => {
    // Validate passwords
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'New passwords do not match',
        variant: 'destructive',
      })
      return
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Error',
        description: 'New password must be at least 6 characters',
        variant: 'destructive',
      })
      return
    }

    try {
      setPasswordSaving(true)
      await authApi.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      })
      // Clear password fields
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      toast({
        title: 'Success',
        description: 'Password changed successfully',
      })
    } catch (error: any) {
      console.error('Failed to change password:', error)
      const message = error?.response?.data?.message || 'Failed to change password'
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      })
    } finally {
      setPasswordSaving(false)
    }
  }

  const handleNotificationChange = async (key: keyof NotificationSettings, value: boolean) => {
    if (!notificationSettings) return

    const updated = { ...notificationSettings, [key]: value }
    setNotificationSettings(updated)

    try {
      setNotificationSaving(true)
      await settingsApi.updateNotificationSettings({ [key]: value })
      toast({
        title: 'Success',
        description: 'Notification preference updated',
      })
    } catch (error) {
      console.error('Failed to update notification settings:', error)
      // Revert on error
      setNotificationSettings(notificationSettings)
      toast({
        title: 'Error',
        description: 'Failed to update notification preference',
        variant: 'destructive',
      })
    } finally {
      setNotificationSaving(false)
    }
  }

  const handleMaintenanceModeToggle = async () => {
    try {
      const newValue = !maintenanceMode
      await settingsApi.setMaintenanceMode(newValue)
      setMaintenanceMode(newValue)
      toast({
        title: 'Success',
        description: `Maintenance mode ${newValue ? 'enabled' : 'disabled'}`,
      })
    } catch (error) {
      console.error('Failed to toggle maintenance mode:', error)
      toast({
        title: 'Error',
        description: 'Failed to toggle maintenance mode',
        variant: 'destructive',
      })
    }
  }

  // ============ 2FA Handlers ============

  const load2FAStatus = async () => {
    try {
      setTwoFactorLoading(true)
      const status = await settingsApi.get2FAStatus()
      setTwoFactorStatus(status)
    } catch (error) {
      console.error('Failed to load 2FA status:', error)
      setTwoFactorStatus({ enabled: false, backup_codes_remaining: 0 })
    } finally {
      setTwoFactorLoading(false)
    }
  }

  const handleSetup2FA = async () => {
    try {
      setTwoFactorProcessing(true)
      const setup = await settingsApi.setup2FA()
      setTwoFactorSetup(setup)
      setShowSetup2FADialog(true)
    } catch (error: any) {
      console.error('Failed to setup 2FA:', error)
      const message = error?.response?.data?.message || 'Failed to setup 2FA'
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      })
    } finally {
      setTwoFactorProcessing(false)
    }
  }

  const handleEnable2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: 'Error',
        description: 'Please enter a valid 6-digit code',
        variant: 'destructive',
      })
      return
    }

    try {
      setTwoFactorProcessing(true)
      const result = await settingsApi.enable2FA(verificationCode)
      setBackupCodes(result.backup_codes)
      setShowSetup2FADialog(false)
      setShowBackupCodesDialog(true)
      setVerificationCode('')
      setTwoFactorSetup(null)
      await load2FAStatus()
      toast({
        title: 'Success',
        description: '2FA has been enabled successfully',
      })
    } catch (error: any) {
      console.error('Failed to enable 2FA:', error)
      const message = error?.response?.data?.message || 'Failed to enable 2FA'
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      })
    } finally {
      setTwoFactorProcessing(false)
    }
  }

  const handleDisable2FA = async () => {
    if (!disablePassword) {
      toast({
        title: 'Error',
        description: 'Please enter your password',
        variant: 'destructive',
      })
      return
    }

    if (!disableCode || disableCode.length !== 6) {
      toast({
        title: 'Error',
        description: 'Please enter a valid 6-digit code',
        variant: 'destructive',
      })
      return
    }

    try {
      setTwoFactorProcessing(true)
      await settingsApi.disable2FA(disablePassword, disableCode)
      setShowDisable2FADialog(false)
      setDisablePassword('')
      setDisableCode('')
      await load2FAStatus()
      toast({
        title: 'Success',
        description: '2FA has been disabled',
      })
    } catch (error: any) {
      console.error('Failed to disable 2FA:', error)
      const message = error?.response?.data?.message || 'Failed to disable 2FA'
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      })
    } finally {
      setTwoFactorProcessing(false)
    }
  }

  const handleCopySecret = () => {
    if (twoFactorSetup?.manualEntryKey) {
      navigator.clipboard.writeText(twoFactorSetup.manualEntryKey.replace(/\s/g, ''))
      setCopiedSecret(true)
      setTimeout(() => setCopiedSecret(false), 2000)
    }
  }

  const handleCopyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'))
    toast({
      title: 'Copied',
      description: 'Backup codes copied to clipboard',
    })
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="profile" className="gap-2">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="gap-2">
            <Database className="w-4 h-4" />
            <span className="hidden sm:inline">System</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-2">
            <Mail className="w-4 h-4" />
            <span className="hidden sm:inline">Email</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card className="p-6 bg-card border-border/40">
            <h3 className="text-lg font-medium mb-4">Profile Settings</h3>
            {profileLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username" 
                    value={profile?.username || ''} 
                    disabled 
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">Username cannot be changed</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    value={tel}
                    onChange={(e) => setTel(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input 
                    id="role" 
                    value={profile?.role || 'N/A'} 
                    disabled 
                    className="bg-muted"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Account Created</Label>
                    <Input 
                      value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'} 
                      disabled 
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Updated</Label>
                    <Input 
                      value={profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'N/A'} 
                      disabled 
                      className="bg-muted"
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleSaveProfile} 
                  className="gap-2"
                  disabled={profileSaving}
                >
                  {profileSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {profileSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="p-6 bg-card border-border/40">
            <h3 className="text-lg font-medium mb-4">Security Settings</h3>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  Change Password
                </h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input 
                      id="currentPassword" 
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input 
                      id="newPassword" 
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (min 6 characters)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input 
                      id="confirmPassword" 
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </div>
                  <Button 
                    onClick={handleChangePassword}
                    disabled={passwordSaving || !currentPassword || !newPassword || !confirmPassword}
                    className="gap-2"
                  >
                    {passwordSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Key className="w-4 h-4" />
                    )}
                    {passwordSaving ? 'Changing...' : 'Change Password'}
                  </Button>
                </div>
              </div>
              <div className="pt-4 border-t border-border/40">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  Two-Factor Authentication
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Add an extra layer of security to your account using an authenticator app
                </p>
                {twoFactorLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Loading...</span>
                  </div>
                ) : twoFactorStatus?.enabled ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 p-3 rounded-lg border border-green-500/30 bg-green-500/10">
                      <Check className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="text-sm font-medium text-green-600 dark:text-green-400">2FA is enabled</p>
                        <p className="text-xs text-muted-foreground">
                          {twoFactorStatus.backup_codes_remaining} backup codes remaining
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={() => setShowDisable2FADialog(true)}
                    >
                      Disable 2FA
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={handleSetup2FA}
                    disabled={twoFactorProcessing}
                    className="gap-2"
                  >
                    {twoFactorProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Shield className="w-4 h-4" />
                    )}
                    Enable 2FA
                  </Button>
                )}
              </div>
              <div className="pt-4 border-t border-border/40">
                <h4 className="text-sm font-medium mb-3">Active Sessions</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Manage your active sessions across devices
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-background/50">
                    <div>
                      <p className="text-sm font-medium">Current Session</p>
                      <p className="text-xs text-muted-foreground">Active now</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => authApi.logout()}>Logout</Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="p-6 bg-card border-border/40">
            <h3 className="text-lg font-medium mb-4">Notification Preferences</h3>
            {notificationLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">New Customer Registrations</p>
                    <p className="text-xs text-muted-foreground">Get notified when new customers register</p>
                  </div>
                  <Switch
                    checked={notificationSettings?.notify_new_customers ?? true}
                    onCheckedChange={(checked) => handleNotificationChange('notify_new_customers', checked)}
                    disabled={notificationSaving}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Payment Notifications</p>
                    <p className="text-xs text-muted-foreground">Receive alerts for new payments</p>
                  </div>
                  <Switch
                    checked={notificationSettings?.notify_payments ?? true}
                    onCheckedChange={(checked) => handleNotificationChange('notify_payments', checked)}
                    disabled={notificationSaving}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Investment Requests</p>
                    <p className="text-xs text-muted-foreground">Alert when customers request investments</p>
                  </div>
                  <Switch
                    checked={notificationSettings?.notify_investments ?? true}
                    onCheckedChange={(checked) => handleNotificationChange('notify_investments', checked)}
                    disabled={notificationSaving}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Stock Account Activity</p>
                    <p className="text-xs text-muted-foreground">Monitor stock account transactions</p>
                  </div>
                  <Switch
                    checked={notificationSettings?.notify_stock_activity ?? true}
                    onCheckedChange={(checked) => handleNotificationChange('notify_stock_activity', checked)}
                    disabled={notificationSaving}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">System Alerts</p>
                    <p className="text-xs text-muted-foreground">Important system notifications</p>
                  </div>
                  <Switch
                    checked={notificationSettings?.notify_system_alerts ?? true}
                    onCheckedChange={(checked) => handleNotificationChange('notify_system_alerts', checked)}
                    disabled={notificationSaving}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Email Notifications</p>
                    <p className="text-xs text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={notificationSettings?.notify_email ?? false}
                    onCheckedChange={(checked) => handleNotificationChange('notify_email', checked)}
                    disabled={notificationSaving}
                  />
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card className="p-6 bg-card border-border/40">
            <h3 className="text-lg font-medium mb-4">System Configuration</h3>
            {systemLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-3">Database Settings</h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="dbBackup">Auto Backup Frequency</Label>
                      <select
                        id="dbBackup"
                        className="w-full p-2 rounded-md border border-border bg-background text-sm"
                      >
                        <option>Daily</option>
                        <option>Weekly</option>
                        <option>Monthly</option>
                      </select>
                    </div>
                    <Button variant="outline">Backup Now</Button>
                  </div>
                </div>
                <div className="pt-4 border-t border-border/40">
                  <h4 className="text-sm font-medium mb-3">API Configuration</h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="apiKey">API Key</Label>
                      <div className="flex gap-2">
                        <Input id="apiKey" value="pk_live_xxxxxxxxxxxx" disabled />
                        <Button variant="outline">Regenerate</Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apiLimit">Rate Limit (requests/minute)</Label>
                      <Input id="apiLimit" type="number" defaultValue="100" />
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-border/40">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium mb-1">Maintenance Mode</h4>
                      <p className="text-sm text-muted-foreground">
                        Enable maintenance mode to prevent customer access during updates
                      </p>
                    </div>
                    <Switch
                      checked={maintenanceMode}
                      onCheckedChange={handleMaintenanceModeToggle}
                    />
                  </div>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <Card className="p-6 bg-card border-border/40">
            <h3 className="text-lg font-medium mb-4">Email Configuration</h3>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium mb-3">SMTP Settings</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtpHost">SMTP Host</Label>
                    <Input id="smtpHost" placeholder="smtp.gmail.com" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtpPort">Port</Label>
                      <Input id="smtpPort" defaultValue="587" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpSecurity">Security</Label>
                      <select
                        id="smtpSecurity"
                        className="w-full p-2 rounded-md border border-border bg-background text-sm"
                      >
                        <option>TLS</option>
                        <option>SSL</option>
                        <option>None</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpUser">Username</Label>
                    <Input id="smtpUser" type="email" placeholder="your-email@gmail.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPass">Password</Label>
                    <Input id="smtpPass" type="password" />
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-border/40">
                <h4 className="text-sm font-medium mb-3">Email Templates</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Customize email templates for automated messages
                </p>
                <Button variant="outline">Manage Templates</Button>
              </div>
              <div className="pt-4 border-t border-border/40">
                <h4 className="text-sm font-medium mb-3">Test Email</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Send a test email to verify your configuration
                </p>
                <div className="flex gap-2">
                  <Input placeholder="test@example.com" disabled />
                  <Button variant="outline" disabled>Send Test</Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground pt-4">
                Note: Email settings are managed through environment variables on the server.
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 2FA Setup Dialog */}
      <Dialog open={showSetup2FADialog} onOpenChange={setShowSetup2FADialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan the QR code with your authenticator app (like Google Authenticator, Authy, or 1Password).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {twoFactorSetup?.qrCode && (
              <div className="flex justify-center">
                <img
                  src={twoFactorSetup.qrCode}
                  alt="2FA QR Code"
                  className="w-48 h-48 rounded-lg border"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                Can&apos;t scan? Enter this code manually:
              </Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 rounded bg-muted text-sm font-mono">
                  {twoFactorSetup?.manualEntryKey}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopySecret}
                >
                  {copiedSecret ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="verificationCode">Verification Code</Label>
              <Input
                id="verificationCode"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit code"
                maxLength={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowSetup2FADialog(false)
                setVerificationCode('')
                setTwoFactorSetup(null)
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEnable2FA}
              disabled={twoFactorProcessing || verificationCode.length !== 6}
            >
              {twoFactorProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Enable 2FA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Backup Codes Dialog */}
      <Dialog open={showBackupCodesDialog} onOpenChange={setShowBackupCodesDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Save Your Backup Codes
            </DialogTitle>
            <DialogDescription>
              These codes can be used to access your account if you lose your authenticator device.
              Each code can only be used once. Store them securely.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 p-4 rounded-lg bg-muted">
              {backupCodes.map((code, index) => (
                <code key={index} className="text-sm font-mono text-center py-1">
                  {code}
                </code>
              ))}
            </div>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleCopyBackupCodes}
            >
              <Copy className="w-4 h-4" />
              Copy All Codes
            </Button>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setShowBackupCodesDialog(false)
                setBackupCodes([])
              }}
            >
              I&apos;ve Saved My Codes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disable 2FA Dialog */}
      <Dialog open={showDisable2FADialog} onOpenChange={setShowDisable2FADialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Enter your password and current 2FA code to disable two-factor authentication.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="disablePassword">Password</Label>
              <Input
                id="disablePassword"
                type="password"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="disableCode">2FA Code</Label>
              <Input
                id="disableCode"
                value={disableCode}
                onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit code"
                maxLength={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDisable2FADialog(false)
                setDisablePassword('')
                setDisableCode('')
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDisable2FA}
              disabled={twoFactorProcessing || !disablePassword || disableCode.length !== 6}
            >
              {twoFactorProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Disable 2FA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
