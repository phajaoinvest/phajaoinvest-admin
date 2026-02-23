import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Loader2 } from 'lucide-react'
import type { NotificationSettings } from '@/lib/api/settings'

interface NotificationSectionProps {
    notificationSettings: NotificationSettings | null
    notificationLoading: boolean
    notificationSaving: boolean
    onToggle: (key: keyof NotificationSettings, value: boolean) => Promise<void>
}

export function NotificationSection({
    notificationSettings,
    notificationLoading,
    notificationSaving,
    onToggle,
}: NotificationSectionProps) {
    return (
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
                            onCheckedChange={(checked) => onToggle('notify_new_customers', checked)}
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
                            onCheckedChange={(checked) => onToggle('notify_payments', checked)}
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
                            onCheckedChange={(checked) => onToggle('notify_investments', checked)}
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
                            onCheckedChange={(checked) => onToggle('notify_stock_activity', checked)}
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
                            onCheckedChange={(checked) => onToggle('notify_system_alerts', checked)}
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
                            onCheckedChange={(checked) => onToggle('notify_email', checked)}
                            disabled={notificationSaving}
                        />
                    </div>
                </div>
            )}
        </Card>
    )
}
