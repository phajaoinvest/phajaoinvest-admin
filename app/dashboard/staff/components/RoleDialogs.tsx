'use client'

import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, X } from 'lucide-react'
import { Role } from '@/lib/types'

interface RoleDialogsProps {
    // Role Modal
    showRoleModal: boolean
    setShowRoleModal: (show: boolean) => void
    isEditingRole: boolean
    roleFormData: { name: string; description: string }
    setRoleFormData: (data: { name: string; description: string }) => void
    isCreatingRole: boolean
    isUpdatingRole: boolean
    handleSaveRole: () => void

    // Delete Modal
    showDeleteRoleModal: boolean
    setShowDeleteRoleModal: (show: boolean) => void
    selectedRole: Role | null
    setSelectedRole: (role: Role | null) => void
    handleDeleteRole: () => void
    isDeletingRole: boolean
}

export const RoleDialogs: React.FC<RoleDialogsProps> = ({
    showRoleModal,
    setShowRoleModal,
    isEditingRole,
    roleFormData,
    setRoleFormData,
    isCreatingRole,
    isUpdatingRole,
    handleSaveRole,
    showDeleteRoleModal,
    setShowDeleteRoleModal,
    selectedRole,
    setSelectedRole,
    handleDeleteRole,
    isDeletingRole,
}) => {
    return (
        <>
            {/* Role Create/Edit Modal */}
            {showRoleModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>{isEditingRole ? 'Edit Role' : 'Add New Role'}</CardTitle>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowRoleModal(false)}
                                className="h-6 w-6 p-0"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Role Name *</label>
                                <Input
                                    value={roleFormData.name}
                                    onChange={(e) =>
                                        setRoleFormData({ ...roleFormData, name: e.target.value })
                                    }
                                    placeholder="Enter role name"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Description</label>
                                <textarea
                                    value={roleFormData.description}
                                    onChange={(e) =>
                                        setRoleFormData({ ...roleFormData, description: e.target.value })
                                    }
                                    placeholder="Enter role description"
                                    className="mt-1 w-full px-3 py-2 border border-border rounded-md text-sm"
                                    rows={3}
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowRoleModal(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSaveRole}
                                    disabled={isCreatingRole || isUpdatingRole || !roleFormData.name}
                                    className="bg-primary hover:bg-primary/90 text-white"
                                >
                                    {isCreatingRole || isUpdatingRole ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : null}
                                    {isEditingRole ? 'Update' : 'Create'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Role Delete Modal */}
            {showDeleteRoleModal && selectedRole && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle className="text-red-600">Delete Role</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Are you sure you want to delete the role{' '}
                                <span className="font-semibold">{selectedRole.name}</span>? This action cannot be
                                undone.
                            </p>
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowDeleteRoleModal(false)
                                        setSelectedRole(null)
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleDeleteRole}
                                    disabled={isDeletingRole}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                    {isDeletingRole && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                    Delete
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </>
    )
}
