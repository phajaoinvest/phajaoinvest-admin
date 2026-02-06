'use client'

import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, ShieldCheck, X } from 'lucide-react'
import { Role, Permission } from '@/lib/types'

interface PermissionsDialogProps {
    isOpen: boolean
    onClose: () => void
    selectedRole: Role | null
    permissions: Permission[]
    selectedPermissions: string[]
    isLoadingPermissions: boolean
    isAssigningPermissions: boolean
    onTogglePermission: (permissionId: string) => void
    onSave: () => void
    formatPermissionName: (name: string) => string
}

export const PermissionsDialog: React.FC<PermissionsDialogProps> = ({
    isOpen,
    onClose,
    selectedRole,
    permissions,
    selectedPermissions,
    isLoadingPermissions,
    isAssigningPermissions,
    onTogglePermission,
    onSave,
    formatPermissionName,
}) => {
    // Group permissions dynamically by group_name
    const permissionGroups = React.useMemo(() => {
        const groups: Record<string, Permission[]> = {}

        permissions.forEach(permission => {
            const groupName = permission.group_name || 'Other'
            if (!groups[groupName]) {
                groups[groupName] = []
            }
            groups[groupName].push(permission)
        })

        return Object.entries(groups).map(([name, perms]) => ({
            module: name,
            permissions: perms
        }))
    }, [permissions])

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] md:max-w-[800px] lg:max-w-[1000px] max-h-[90vh] overflow-hidden flex flex-col p-0 border-none shadow-2xl">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <ShieldCheck className="w-6 h-6 text-primary" />
                        Manage Permissions for {selectedRole?.name}
                    </DialogTitle>
                    <DialogDescription className="text-sm">
                        Select the permissions you want to assign to this role.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 pt-2">
                    <div className="space-y-8">
                        {isLoadingPermissions ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                            </div>
                        ) : (
                            <>
                                {permissionGroups.map((group) => (
                                    <div key={group.module} className="space-y-4">
                                        <h3 className="font-bold text-base text-foreground border-b pb-2">{group.module}</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-3">
                                            {group.permissions.map((permission) => (
                                                <div key={permission.id} className="flex items-start space-x-3 group py-1">
                                                    <div className="pt-0.5">
                                                        <Checkbox
                                                            id={permission.id}
                                                            checked={selectedPermissions.includes(permission.id)}
                                                            onCheckedChange={() => onTogglePermission(permission.id)}
                                                            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary border-muted-foreground/50 transition-colors"
                                                        />
                                                    </div>
                                                    <label
                                                        htmlFor={permission.id}
                                                        className="text-sm font-medium leading-tight cursor-pointer group-hover:text-primary transition-colors break-words overflow-hidden"
                                                    >
                                                        {formatPermissionName(permission.name)}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </div>

                <DialogFooter className="p-6 border-t bg-secondary/5 flex flex-col sm:flex-row gap-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="h-10 px-6 font-medium order-2 sm:order-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={onSave}
                        disabled={isAssigningPermissions}
                        className="h-10 px-8 font-semibold bg-primary hover:bg-primary/90 text-white shadow-sm order-1 sm:order-2"
                    >
                        {isAssigningPermissions ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            'Save Permissions'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
