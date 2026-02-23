import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function EmailSection() {
    return (
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
    )
}
