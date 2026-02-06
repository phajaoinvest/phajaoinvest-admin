'use client'

import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Loader2, X } from 'lucide-react'
import { User, Role, UserStatus, Gender } from '@/lib/types'

interface StaffDialogsProps {
    // Staff Modal
    showStaffModal: boolean
    setShowStaffModal: (show: boolean) => void
    isEditingStaff: boolean
    staffFormData: any
    setStaffFormData: (data: any) => void
    isCreating: boolean
    isUpdating: boolean
    handleSaveStaff: () => void
    roles: Role[]

    // View Modal
    showViewModal: boolean
    setShowViewModal: (show: boolean) => void
    selectedStaff: User | null

    // Delete Modal
    showDeleteModal: boolean
    setShowDeleteModal: (show: boolean) => void
    setSelectedStaff: (staff: User | null) => void
    handleDeleteStaff: () => void
    isDeleting: boolean
}

export const StaffDialogs: React.FC<StaffDialogsProps> = ({
    showStaffModal,
    setShowStaffModal,
    isEditingStaff,
    staffFormData,
    setStaffFormData,
    isCreating,
    isUpdating,
    handleSaveStaff,
    roles,
    showViewModal,
    setShowViewModal,
    selectedStaff,
    showDeleteModal,
    setShowDeleteModal,
    setSelectedStaff,
    handleDeleteStaff,
    isDeleting,
}) => {
    return (
        <>
            {/* Staff Create/Edit Modal */}
            {showStaffModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>{isEditingStaff ? 'Edit Staff' : 'Add New Staff'}</CardTitle>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowStaffModal(false)}
                                className="h-6 w-6 p-0"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {!isEditingStaff && (
                                <>
                                    <div>
                                        <label className="text-sm font-medium">Username *</label>
                                        <Input
                                            value={staffFormData.username}
                                            onChange={(e) =>
                                                setStaffFormData({ ...staffFormData, username: e.target.value })
                                            }
                                            placeholder="Enter username"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Password *</label>
                                        <Input
                                            type="password"
                                            value={staffFormData.password}
                                            onChange={(e) =>
                                                setStaffFormData({ ...staffFormData, password: e.target.value })
                                            }
                                            placeholder="Enter password"
                                            className="mt-1"
                                        />
                                    </div>
                                </>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">First Name *</label>
                                    <Input
                                        value={staffFormData.first_name}
                                        onChange={(e) =>
                                            setStaffFormData({ ...staffFormData, first_name: e.target.value })
                                        }
                                        placeholder="Enter first name"
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Last Name</label>
                                    <Input
                                        value={staffFormData.last_name}
                                        onChange={(e) =>
                                            setStaffFormData({ ...staffFormData, last_name: e.target.value })
                                        }
                                        placeholder="Enter last name"
                                        className="mt-1"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Staff ID</label>
                                    <Input
                                        value={staffFormData.number}
                                        onChange={(e) =>
                                            setStaffFormData({ ...staffFormData, number: e.target.value })
                                        }
                                        placeholder="Enter staff ID"
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Gender</label>
                                    <select
                                        value={staffFormData.gender}
                                        onChange={(e) =>
                                            setStaffFormData({
                                                ...staffFormData,
                                                gender: e.target.value as Gender,
                                            })
                                        }
                                        className="mt-1 h-9 px-2.5 py-1.5 rounded-md border border-border text-sm w-full"
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Phone</label>
                                    <Input
                                        value={staffFormData.tel}
                                        onChange={(e) =>
                                            setStaffFormData({ ...staffFormData, tel: e.target.value })
                                        }
                                        placeholder="Enter phone number"
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Role</label>
                                    <select
                                        value={staffFormData.role_id}
                                        onChange={(e) =>
                                            setStaffFormData({ ...staffFormData, role_id: e.target.value })
                                        }
                                        className="mt-1 h-9 px-2.5 py-1.5 rounded-md border border-border text-sm w-full"
                                    >
                                        <option value="">Select a role</option>
                                        {roles.map((role) => (
                                            <option key={role.id} value={role.id}>
                                                {role.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Address</label>
                                <Input
                                    value={staffFormData.address}
                                    onChange={(e) =>
                                        setStaffFormData({ ...staffFormData, address: e.target.value })
                                    }
                                    placeholder="Enter address"
                                    className="mt-1"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Status</label>
                                    <select
                                        value={staffFormData.status}
                                        onChange={(e) =>
                                            setStaffFormData({
                                                ...staffFormData,
                                                status: e.target.value as UserStatus,
                                            })
                                        }
                                        className="mt-1 h-9 px-2.5 py-1.5 rounded-md border border-border text-sm w-full"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="suspended">Suspended</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="outline" onClick={() => setShowStaffModal(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSaveStaff}
                                    disabled={isCreating || isUpdating}
                                    className="bg-primary hover:bg-primary/90 text-white"
                                >
                                    {isCreating || isUpdating ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : null}
                                    {isEditingStaff ? 'Update' : 'Create'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Staff View Modal */}
            {showViewModal && selectedStaff && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-2xl">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Staff Details</CardTitle>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowViewModal(false)}
                                className="h-6 w-6 p-0"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-muted-foreground font-medium">Staff ID</label>
                                    <p className="text-sm font-medium">{selectedStaff.number || '-'}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-muted-foreground font-medium">Status</label>
                                    <Badge className="mt-1 capitalize">{selectedStaff.status}</Badge>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-muted-foreground font-medium">First Name</label>
                                    <p className="text-sm font-medium">{selectedStaff.first_name}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-muted-foreground font-medium">Last Name</label>
                                    <p className="text-sm font-medium">{selectedStaff.last_name || '-'}</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground font-medium">Username</label>
                                <p className="text-sm font-medium">{selectedStaff.username}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-muted-foreground font-medium">Gender</label>
                                    <p className="text-sm font-medium capitalize">{selectedStaff.gender || '-'}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-muted-foreground font-medium">Phone</label>
                                    <p className="text-sm font-medium">{selectedStaff.tel || '-'}</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground font-medium">Address</label>
                                <p className="text-sm font-medium">{selectedStaff.address || '-'}</p>
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground font-medium">Role</label>
                                <p className="text-sm font-medium">
                                    {roles.find((r) => r.id === selectedStaff.role_id)?.name || 'No Role Assigned'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Staff Delete Modal */}
            {showDeleteModal && selectedStaff && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle className="text-red-600">Delete Staff Member</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Are you sure you want to delete{' '}
                                <span className="font-semibold">{selectedStaff.first_name}</span>? This action cannot be
                                undone.
                            </p>
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowDeleteModal(false)
                                        setSelectedStaff(null)
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleDeleteStaff}
                                    disabled={isDeleting}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                    {isDeleting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
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
