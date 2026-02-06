'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Search,
    Plus,
    RefreshCw,
    MoreVertical,
    Eye,
    Edit2,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Loader2,
} from 'lucide-react'
import { User, Role, UserStatus } from '@/lib/types'

interface StaffTableProps {
    users: User[]
    roles: Role[]
    isLoading: boolean
    searchTerm: string
    setSearchTerm: (value: string) => void
    filterStatus: 'all' | UserStatus
    setFilterStatus: (value: 'all' | UserStatus) => void
    page: number
    setPage: (value: number) => void
    limit: number
    setLimit: (value: number) => void
    totalPages: number
    totalStaff: number
    onLoadUsers: () => void
    onAddStaff: () => void
    onEditStaff: (user: User) => void
    onViewStaff: (user: User) => void
    onDeleteStaff: (user: User) => void
}

export const StaffTable: React.FC<StaffTableProps> = ({
    users,
    roles,
    isLoading,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    page,
    setPage,
    limit,
    setLimit,
    totalPages,
    totalStaff,
    onLoadUsers,
    onAddStaff,
    onEditStaff,
    onViewStaff,
    onDeleteStaff,
}) => {
    return (
        <Card className="border-0 shadow-sm overflow-hidden">
            <CardHeader className="space-y-4 px-4 sm:px-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-md font-bold text-foreground">Staff Members</CardTitle>
                        <CardDescription className="text-xs">
                            Showing {users.length > 0 ? (page - 1) * limit + 1 : 0}-
                            {Math.min(page * limit, totalStaff)} of {totalStaff} staff members
                        </CardDescription>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                        <div className="relative flex-1 min-w-[200px] sm:flex-none sm:w-64">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search staff..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 text-sm h-9 w-full"
                            />
                        </div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as 'all' | UserStatus)}
                            className="h-9 px-2.5 py-1.5 rounded-md border border-border text-sm bg-background min-w-[120px]"
                        >
                            <option value="all">All Status</option>
                            {Object.values(UserStatus).map((status) => (
                                <option key={status} value={status}>
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </option>
                            ))}
                        </select>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onLoadUsers}
                                disabled={isLoading}
                                className="h-9 w-9 p-0"
                            >
                                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                            </Button>
                            <Button
                                onClick={onAddStaff}
                                className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 text-sm h-9 text-white px-4"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Staff
                            </Button>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border rounded-md bg-gray-100">
                                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Staff ID</th>
                                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Username</th>
                                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Role</th>
                                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                                        No staff members found
                                    </td>
                                </tr>
                            ) : (
                                users.map((member) => (
                                    <tr key={member.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                                        <td className="py-3 px-4 font-medium">{member.number || '-'}</td>
                                        <td className="py-3 px-4">
                                            {member.first_name} {member.last_name}
                                        </td>
                                        <td className="py-3 px-4 text-muted-foreground">{member.username}</td>
                                        <td className="py-3 px-4">
                                            <span className="text-sm">
                                                {roles.find((r) => r.id === member.role_id)?.name || 'No Role'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <Badge
                                                variant={member.status === 'active' ? 'default' : 'secondary'}
                                                className={
                                                    member.status === 'active'
                                                        ? 'bg-green-100 text-green-700 hover:bg-green-100'
                                                        : member.status === 'suspended'
                                                            ? 'bg-red-100 text-red-700 hover:bg-red-100'
                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-100'
                                                }
                                            >
                                                {member.status}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-4">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => onViewStaff(member)}>
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        View
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => onEditStaff(member)}>
                                                        <Edit2 className="h-4 w-4 mr-2" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => onDeleteStaff(member)}
                                                        className="text-red-600"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
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
                        <div className="flex items-center gap-4">
                            <div className="text-sm text-muted-foreground">
                                Page {page} of {totalPages}
                            </div>
                            <select
                                value={limit}
                                onChange={(e) => setLimit(Number(e.target.value))}
                                className="h-8 px-2 rounded-md border border-border text-sm bg-background"
                            >
                                <option value={10}>10 per page</option>
                                <option value={25}>25 per page</option>
                                <option value={50}>50 per page</option>
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page === 1 || isLoading}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(Math.min(totalPages, page + 1))}
                                disabled={page === totalPages || isLoading}
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
