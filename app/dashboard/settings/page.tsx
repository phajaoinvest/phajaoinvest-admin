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
import { settingsApi, type NotificationSettings, type TwoFactorStatus, type TwoFactorSetup, type BackupHistoryItem } from '@/lib/api/settings'
import type { AdminProfile } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'

// Import New Components
import { ProfileSection } from './components/ProfileSection'
import { SecuritySection } from './components/SecuritySection'
import { NotificationSection } from './components/NotificationSection'
import { SystemSection } from './components/SystemSection'
import { EmailSection } from './components/EmailSection'
import { SettingsDialogs } from './components/SettingsDialogs'

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
  const [backupLoading, setBackupLoading] = useState(false)
  const [backupFrequency, setBackupFrequency] = useState('daily')
  const [backupHistory, setBackupHistory] = useState<BackupHistoryItem[]>([])

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

      const freqSetting = await settingsApi.getSystemSetting('backup_frequency')
      if (freqSetting) setBackupFrequency(freqSetting.value)

      const history = await settingsApi.getBackupHistory()
      setBackupHistory(history)
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

  const handleBackupFrequencyChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setBackupFrequency(value)

    try {
      await settingsApi.updateSystemSetting('backup_frequency', value)
      toast({
        title: 'Success',
        description: `Automated backup frequency updated to ${value}.`,
      })
    } catch (error) {
      console.error('Failed to update backup frequency:', error)
      toast({
        title: 'Error',
        description: 'Failed to update backup frequency',
        variant: 'destructive',
      })
    }
  }

  const handleBackup = async () => {
    try {
      setBackupLoading(true)
      toast({
        title: 'Starting Backup',
        description: 'Generating database backup. This might take a moment...',
      })
      const result: any = await settingsApi.triggerBackup()

      if (result.data?.downloadUrl) {
        // Securely download the file using the authenticated client's token
        const token = localStorage.getItem('phajaoinvest_access_token') || ''
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'}${result.data.downloadUrl.replace('/api/v1', '')}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        )

        if (!response.ok) throw new Error('Download failed')

        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = result.data.fileName
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        a.remove()

        toast({
          title: 'Success',
          description: `Backup ${result.data.fileName} downloaded successfully!`,
        })
      } else {
        toast({
          title: 'Success',
          description: 'Backup generated successfully',
        })
      }

      const updatedHistory = await settingsApi.getBackupHistory()
      setBackupHistory(updatedHistory)
    } catch (error) {
      console.error('Backup failed:', error)
      toast({
        title: 'Error',
        description: 'Failed to generate database backup',
        variant: 'destructive',
      })
    } finally {
      setBackupLoading(false)
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
          <ProfileSection
            profile={profile}
            profileLoading={profileLoading}
            profileSaving={profileSaving}
            firstName={firstName}
            lastName={lastName}
            tel={tel}
            setFirstName={setFirstName}
            setLastName={setLastName}
            setTel={setTel}
            onSave={handleSaveProfile}
          />
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <SecuritySection
            currentPassword={currentPassword}
            setCurrentPassword={setCurrentPassword}
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            passwordSaving={passwordSaving}
            onChangePassword={handleChangePassword}
            twoFactorStatus={twoFactorStatus}
            twoFactorLoading={twoFactorLoading}
            twoFactorProcessing={twoFactorProcessing}
            onSetup2FA={handleSetup2FA}
            onDisable2FA={() => setShowDisable2FADialog(true)}
          />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <NotificationSection
            notificationSettings={notificationSettings}
            notificationLoading={notificationLoading}
            notificationSaving={notificationSaving}
            onToggle={handleNotificationChange}
          />
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <SystemSection
            systemLoading={systemLoading}
            maintenanceMode={maintenanceMode}
            onMaintenanceToggle={handleMaintenanceModeToggle}
            backupFrequency={backupFrequency}
            onBackupFrequencyChange={handleBackupFrequencyChange}
            backupLoading={backupLoading}
            onTriggerBackup={handleBackup}
            backupHistory={backupHistory}
          />
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <EmailSection />
        </TabsContent>
      </Tabs>

      <SettingsDialogs
        showSetup2FADialog={showSetup2FADialog}
        setShowSetup2FADialog={setShowSetup2FADialog}
        twoFactorSetup={twoFactorSetup}
        setTwoFactorSetup={setTwoFactorSetup}
        verificationCode={verificationCode}
        setVerificationCode={setVerificationCode}
        twoFactorProcessing={twoFactorProcessing}
        handleCopySecret={handleCopySecret}
        copiedSecret={copiedSecret}
        handleEnable2FA={handleEnable2FA}
        showBackupCodesDialog={showBackupCodesDialog}
        setShowBackupCodesDialog={setShowBackupCodesDialog}
        backupCodes={backupCodes}
        setBackupCodes={setBackupCodes}
        handleCopyBackupCodes={handleCopyBackupCodes}
        showDisable2FADialog={showDisable2FADialog}
        setShowDisable2FADialog={setShowDisable2FADialog}
        disablePassword={disablePassword}
        setDisablePassword={setDisablePassword}
        disableCode={disableCode}
        setDisableCode={setDisableCode}
        handleDisable2FA={handleDisable2FA}
      />
    </div>
  )
}

