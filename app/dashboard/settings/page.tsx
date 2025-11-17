'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { User, Bell, Shield, Palette, Database, Mail, Key, Save } from 'lucide-react'
import { useAuthStore } from '@/lib/auth-store'

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
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
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue={user?.name?.split(' ')[0] || 'Admin'} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue={user?.name?.split(' ')[1] || 'User'} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue={user?.email || 'admin@phajaoinvest.com'} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input id="role" defaultValue={user?.role || 'Super Admin'} disabled />
              </div>
              <Button onClick={handleSave} className="gap-2">
                <Save className="w-4 h-4" />
                {saved ? 'Saved!' : 'Save Changes'}
              </Button>
            </div>
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
                    <Input id="currentPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-border/40">
                <h4 className="text-sm font-medium mb-3">Two-Factor Authentication</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Add an extra layer of security to your account
                </p>
                <Button variant="outline">Enable 2FA</Button>
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
                      <p className="text-xs text-muted-foreground">Chrome on macOS - Active now</p>
                    </div>
                    <Button variant="outline" size="sm">Logout</Button>
                  </div>
                </div>
              </div>
              <Button onClick={handleSave} className="gap-2">
                <Save className="w-4 h-4" />
                Save Security Settings
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="p-6 bg-card border-border/40">
            <h3 className="text-lg font-medium mb-4">Notification Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">New Customer Registrations</p>
                  <p className="text-xs text-muted-foreground">Get notified when new customers register</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Payment Notifications</p>
                  <p className="text-xs text-muted-foreground">Receive alerts for new payments</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Investment Requests</p>
                  <p className="text-xs text-muted-foreground">Alert when customers request investments</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Stock Account Activity</p>
                  <p className="text-xs text-muted-foreground">Monitor stock account transactions</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">System Alerts</p>
                  <p className="text-xs text-muted-foreground">Important system notifications</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Email Notifications</p>
                  <p className="text-xs text-muted-foreground">Receive notifications via email</p>
                </div>
                <input type="checkbox" className="w-4 h-4" />
              </div>
              <Button onClick={handleSave} className="gap-2 mt-4">
                <Save className="w-4 h-4" />
                Save Preferences
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card className="p-6 bg-card border-border/40">
            <h3 className="text-lg font-medium mb-4">System Configuration</h3>
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
                <h4 className="text-sm font-medium mb-3">Maintenance Mode</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Enable maintenance mode to prevent customer access during updates
                </p>
                <Button variant="outline">Enable Maintenance Mode</Button>
              </div>
              <Button onClick={handleSave} className="gap-2">
                <Save className="w-4 h-4" />
                Save System Settings
              </Button>
            </div>
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
                  <Input placeholder="test@example.com" />
                  <Button variant="outline">Send Test</Button>
                </div>
              </div>
              <Button onClick={handleSave} className="gap-2">
                <Save className="w-4 h-4" />
                Save Email Settings
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
