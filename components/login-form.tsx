'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores'

// components:
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, BarChart3, Loader, User, Shield, ArrowLeft } from 'lucide-react'

export function LoginForm() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [useBackupCode, setUseBackupCode] = useState(false)

  const { login, complete2FALogin, clear2FA, isLoading, error, clearError, requires2FA } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    try {
      const result = await login({ username, password })
      if (!result.requires2FA) {
        router.push('/dashboard')
      }
      // If 2FA is required, the UI will show the 2FA input
    } catch {
      // Error is already handled in the store
    }
  }

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    try {
      if (useBackupCode) {
        await complete2FALogin(undefined, twoFactorCode)
      } else {
        await complete2FALogin(twoFactorCode, undefined)
      }
      router.push('/dashboard')
    } catch {
      // Error is already handled in the store
    }
  }

  const handleBack = () => {
    clear2FA()
    setTwoFactorCode('')
    setUseBackupCode(false)
  }

  // 2FA verification form
  if (requires2FA) {
    return (
      <div className="w-full max-w-xl space-y-6">
        <Card className="border border-border/40 shadow-lg backdrop-blur-sm bg-white/98 dark:bg-slate-900/80">
          <CardHeader className="space-y-2">
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <div className="w-10 h-10 bg-gradient-to-br from-primary via-primary/80 to-primary/60 rounded-sm flex items-center justify-center shadow-lg">
                  <Shield className="w-5 h-5 text-primary-foreground" />
                </div>
              </div>
              <CardTitle className="text-xl font-semibold">Two-Factor Authentication</CardTitle>
              <CardDescription className="text-sm">
                {useBackupCode 
                  ? 'Enter one of your backup codes' 
                  : 'Enter the 6-digit code from your authenticator app'}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handle2FASubmit} className="space-y-4">
              <div className="space-y-2.5">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary" />
                  {useBackupCode ? 'Backup Code' : 'Verification Code'} <span className='text-rose-500'>*</span>
                </label>
                <Input
                  type="text"
                  placeholder={useBackupCode ? 'Enter backup code' : 'Enter 6-digit code'}
                  value={twoFactorCode}
                  onChange={(e) => {
                    const value = useBackupCode 
                      ? e.target.value.toUpperCase()
                      : e.target.value.replace(/\D/g, '').slice(0, 6)
                    setTwoFactorCode(value)
                  }}
                  className="text-sm bg-white dark:bg-slate-800 border-border/60 focus:border-primary/50 text-center text-lg tracking-widest font-mono"
                  maxLength={useBackupCode ? 8 : 6}
                  required
                  autoFocus
                />
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20 flex gap-2">
                  <span className="text-base">⚠️</span>
                  {error}
                </div>
              )}

              <div className="w-full flex flex-col gap-2 mt-2">
                <Button
                  type="submit"
                  disabled={isLoading || (!useBackupCode && twoFactorCode.length !== 6) || (useBackupCode && twoFactorCode.length < 6)}
                  className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-white text-sm font-semibold shadow-md hover:shadow-lg smooth-transition"
                >
                  {isLoading ? <Loader className="animate-spin" size={14} /> : <Shield size={14} />}
                  {isLoading ? 'Verifying...' : 'Verify'}
                </Button>
                
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setUseBackupCode(!useBackupCode)
                    setTwoFactorCode('')
                  }}
                  className="text-xs"
                >
                  {useBackupCode ? 'Use authenticator code instead' : 'Use a backup code instead'}
                </Button>
              </div>
            </form>

            <div className="mt-4 pt-4 border-t border-border/50">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="w-full gap-2"
              >
                <ArrowLeft size={14} />
                Back to login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-xl space-y-6">
      <Card className="border border-border/40 shadow-lg backdrop-blur-sm bg-white/98 dark:bg-slate-900/80">
        <CardHeader className="space-y-2">
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="w-10 h-10 bg-gradient-to-br from-primary via-primary/80 to-primary/60 rounded-sm flex items-center justify-center shadow-lg">
                <BarChart3 className="w-5 h-5 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-xl font-semibold">Phajaoinvest Admin</CardTitle>
            <CardDescription className="text-sm">Professional Investment Management Dashboard</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2.5">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                Username <span className='text-rose-500'>*</span>
              </label>
              <Input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="text-sm bg-white dark:bg-slate-800 border-border/60 focus:border-primary/50"
                required
              />
            </div>

            <div className="space-y-2.5">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                Password <span className='text-rose-500'>*</span>
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-sm bg-white dark:bg-slate-800 border-border/60 focus:border-primary/50"
                required
              />
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20 flex gap-2">
                <span className="text-base">⚠️</span>
                {error}
              </div>
            )}

            <div className="w-full flex justify-start mt-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-white text-sm font-semibold shadow-md hover:shadow-lg smooth-transition"
              >
                {isLoading ? <Loader className="animate-spin" size={14} /> : <User size={14} />}
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-border/50">
            <p className="text-xs text-muted-foreground text-center">
              Contact administrator if you need access
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
