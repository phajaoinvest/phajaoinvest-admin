import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Loader2, Save, Check, AlertTriangle, Database, Smartphone } from 'lucide-react'
import type { BackupHistoryItem } from '@/lib/api/settings'

interface SystemSectionProps {
    systemLoading: boolean
    maintenanceMode: boolean
    onMaintenanceToggle: () => Promise<void>
    backupFrequency: string
    onBackupFrequencyChange: (e: React.ChangeEvent<HTMLSelectElement>) => Promise<void>
    backupLoading: boolean
    onTriggerBackup: () => Promise<void>
    backupHistory: BackupHistoryItem[]
}

export function SystemSection({
    systemLoading,
    maintenanceMode,
    onMaintenanceToggle,
    backupFrequency,
    onBackupFrequencyChange,
    backupLoading,
    onTriggerBackup,
    backupHistory,
}: SystemSectionProps) {
    return (
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
                                    value={backupFrequency}
                                    onChange={onBackupFrequencyChange}
                                    className="w-full p-2 rounded-md border border-border bg-background text-sm"
                                >
                                    <option value="daily">Daily at 1:00 AM</option>
                                    <option value="weekly">Weekly on Sunday</option>
                                    <option value="monthly">Monthly on the 1st</option>
                                </select>
                            </div>
                            <Button
                                variant="outline"
                                onClick={onTriggerBackup}
                                disabled={backupLoading}
                                className="gap-2"
                            >
                                {backupLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Backing Up...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Backup Now
                                    </>
                                )}
                            </Button>

                            <div className="pt-6">
                                <h4 className="text-sm font-medium mb-3">Backup History & Status</h4>
                                <div className="border border-border rounded-md bg-background shadow-sm">
                                    <div className="max-h-[450px] overflow-y-auto overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="sticky top-0 z-10">
                                                <tr className="border-b border-border bg-muted/80 backdrop-blur-sm text-left">
                                                    <th className="p-3 font-medium text-muted-foreground w-[180px]">Date/Time</th>
                                                    <th className="p-3 font-medium text-muted-foreground">File Name</th>
                                                    <th className="p-3 font-medium text-muted-foreground w-[100px]">Type</th>
                                                    <th className="p-3 font-medium text-muted-foreground w-[120px]">Storage</th>
                                                    <th className="p-3 font-medium text-muted-foreground w-[100px]">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                                {backupHistory.length > 0 ? (
                                                    backupHistory.map((history) => (
                                                        <tr key={history.id} className="hover:bg-muted/30 transition-colors">
                                                            <td className="p-3 align-top whitespace-nowrap text-muted-foreground">
                                                                {new Date(history.createdAt).toLocaleString()}
                                                            </td>
                                                            <td className="p-3 align-top">
                                                                <div className="font-medium text-primary break-all">{history.fileName}</div>
                                                                {history.errorMessage && (
                                                                    <div className="text-xs text-destructive mt-1 break-words max-w-[400px]">
                                                                        {history.errorMessage}
                                                                    </div>
                                                                )}
                                                                {history.bunnyCDNFilePath && !history.isDeletedFromStorage && (
                                                                    <div className="text-xs text-green-600/70 dark:text-green-400/70 mt-1 truncate">
                                                                        Path: {history.bunnyCDNFilePath}
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="p-3 align-top capitalize">
                                                                {history.type}
                                                            </td>
                                                            <td className="p-3 align-top">
                                                                {history.status === 'success' ? (
                                                                    history.isDeletedFromStorage ? (
                                                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-secondary text-secondary-foreground border border-border">
                                                                            <Database className="w-3 h-3 opacity-70" />
                                                                            Pruned
                                                                        </span>
                                                                    ) : (
                                                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                                                            <Smartphone className="w-3 h-3" />
                                                                            BunnyCDN
                                                                        </span>
                                                                    )
                                                                ) : (
                                                                    <span className="text-xs text-muted-foreground">—</span>
                                                                )}
                                                            </td>
                                                            <td className="p-3 align-top">
                                                                <span className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${history.status === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-destructive/10 text-destructive'
                                                                    }`}>
                                                                    {history.status === 'success' ? <Check className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                                                                    {history.status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                                            No backups recorded yet.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
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
                                onCheckedChange={onMaintenanceToggle}
                            />
                        </div>
                    </div>
                </div>
            )}
        </Card>
    )
}
