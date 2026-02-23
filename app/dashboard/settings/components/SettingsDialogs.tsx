import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Loader2, Copy, Check, AlertTriangle } from 'lucide-react'
import type { TwoFactorSetup } from '@/lib/api/settings'

interface SettingsDialogsProps {
    showSetup2FADialog: boolean
    setShowSetup2FADialog: (val: boolean) => void
    twoFactorSetup: TwoFactorSetup | null
    setTwoFactorSetup: (val: TwoFactorSetup | null) => void
    verificationCode: string
    setVerificationCode: (val: string) => void
    twoFactorProcessing: boolean
    handleCopySecret: () => void
    copiedSecret: boolean
    handleEnable2FA: () => Promise<void>

    showBackupCodesDialog: boolean
    setShowBackupCodesDialog: (val: boolean) => void
    backupCodes: string[]
    setBackupCodes: (val: string[]) => void
    handleCopyBackupCodes: () => void

    showDisable2FADialog: boolean
    setShowDisable2FADialog: (val: boolean) => void
    disablePassword: string
    setDisablePassword: (val: string) => void
    disableCode: string
    setDisableCode: (val: string) => void
    handleDisable2FA: () => Promise<void>
}

export function SettingsDialogs({
    showSetup2FADialog,
    setShowSetup2FADialog,
    twoFactorSetup,
    setTwoFactorSetup,
    verificationCode,
    setVerificationCode,
    twoFactorProcessing,
    handleCopySecret,
    copiedSecret,
    handleEnable2FA,

    showBackupCodesDialog,
    setShowBackupCodesDialog,
    backupCodes,
    setBackupCodes,
    handleCopyBackupCodes,

    showDisable2FADialog,
    setShowDisable2FADialog,
    disablePassword,
    setDisablePassword,
    disableCode,
    setDisableCode,
    handleDisable2FA,
}: SettingsDialogsProps) {
    return (
        <>
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
                            {twoFactorProcessing && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
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
                            {twoFactorProcessing && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                            Disable 2FA
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
