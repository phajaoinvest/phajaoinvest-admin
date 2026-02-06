'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Search,
    Plus,
    MoreVertical,
    Edit2,
    Trash2,
    KeyRound,
    ChevronLeft,
    ChevronRight,
    Loader2,
} from 'lucide-react'
import { Role } from '@/lib/types'

interface RoleTableProps {
    roles: Role[]
    isLoading: boolean
    searchTerm: string
    setSearchTerm: (value: string) => void
    page: number
    setPage: (value: number) => void
    totalPages: number
    totalRoles: number
    onAddRole: () => void
    onEditRole: (role: Role) => void
    onDeleteRole: (role: Role) => void
    onManagePermissions: (role: Role) => void
}

export const RoleTable: React.FC<RoleTableProps> = ({
    roles,
    isLoading,
    searchTerm,
    setSearchTerm,
    page,
    setPage,
    totalPages,
    totalRoles,
    onAddRole,
    onEditRole,
    onDeleteRole,
    onManagePermissions,
}) => {
    return (
        <Card className="border-0 shadow-sm overflow-hidden">
            <CardHeader className="space-y-4 px-4 sm:px-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-md font-bold text-foreground">Roles & Permissions</CardTitle>
                        <CardDescription className="text-xs">
                            Showing {roles.length} of {totalRoles} roles
                        </CardDescription>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                        <div className="relative flex-1 min-w-[200px] sm:flex-none sm:w-64">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search roles..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 text-sm h-9 w-full"
                            />
                        </div>
                        <Button
                            onClick={onAddRole}
                            className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 text-sm h-9 text-white px-4"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Role
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border rounded-md bg-gray-100">
                                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Role Name</th>
                                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Description</th>
                                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Permissions</th>
                                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="py-12 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                                    </td>
                                </tr>
                            ) : roles.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-8 text-center text-muted-foreground">
                                        No roles found
                                    </td>
                                </tr>
                            ) : (
                                roles.map((role) => (
                                    <tr key={role.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                                        <td className="py-3 px-4 font-medium">{role.name}</td>
                                        <td className="py-3 px-4 text-muted-foreground text-xs">
                                            {role.description || 'No description'}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="text-xs text-muted-foreground">
                                                {role.rolePermissions?.length || 0} permissions
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => onManagePermissions(role)}
                                                    className="text-xs h-8"
                                                >
                                                    <KeyRound className="h-3 w-3 mr-1" />
                                                    Permissions
                                                </Button>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => onEditRole(role)}>
                                                            <Edit2 className="h-4 w-4 mr-2" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => onDeleteRole(role)}
                                                            className="text-red-600"
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                        <div className="text-sm text-muted-foreground">
                            Page {page} of {totalPages}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(Math.min(totalPages, page + 1))}
                                disabled={page === totalPages}
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
