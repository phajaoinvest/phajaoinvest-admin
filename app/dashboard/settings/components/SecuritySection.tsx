import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Key, Smartphone, Loader2, Check, Shield } from 'lucide-react'
import type { TwoFactorStatus } from '@/lib/api/settings'
import { authApi } from '@/lib/api/auth'

interface SecuritySectionProps {
    currentPassword: string
    setCurrentPassword: (val: string) => void
    newPassword: string
    setNewPassword: (val: string) => void
    confirmPassword: string
    setConfirmPassword: (val: string) => void
    passwordSaving: boolean
    onChangePassword: () => Promise<void>
    twoFactorStatus: TwoFactorStatus | null
    twoFactorLoading: boolean
    twoFactorProcessing: boolean
    onSetup2FA: () => Promise<void>
    onDisable2FA: () => void
}

export function SecuritySection({
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    passwordSaving,
    onChangePassword,
    twoFactorStatus,
    twoFactorLoading,
    twoFactorProcessing,
    onSetup2FA,
    onDisable2FA,
}: SecuritySectionProps) {
    return (
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
                            onClick={onChangePassword}
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
                                onClick={onDisable2FA}
                            >
                                Disable 2FA
                            </Button>
                        </div>
                    ) : (
                        <Button
                            variant="outline"
                            onClick={onSetup2FA}
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
    )
}
