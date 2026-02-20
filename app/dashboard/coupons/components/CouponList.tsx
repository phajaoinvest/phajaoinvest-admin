import { Button } from '@/components/ui/button'
import { CardContent } from '@/components/ui/card'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Eye, Edit2, Trash2, MoreVertical, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import type { Coupon } from '@/lib/types'
import { CouponDiscountType } from '@/lib/types'

const getStatusBadgeClass = (active: boolean) => {
    return active
        ? 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400'
        : 'bg-gray-100 text-gray-700 dark:bg-gray-950/50 dark:text-gray-400'
}

interface CouponListProps {
    coupons: Coupon[]
    isLoading: boolean
    openDropdownId: string | null
    toggleDropdown: (id: string) => void
    onViewDetails: (coupon: Coupon) => void
    onEdit: (coupon: Coupon) => void
    onDelete: (coupon: Coupon) => void
    page: number
    limit: number
    totalPages: number
    total: number
    setPage: (page: number) => void
}

export function CouponList({
    coupons,
    isLoading,
    openDropdownId,
    toggleDropdown,
    onViewDetails,
    onEdit,
    onDelete,
    page,
    limit,
    totalPages,
    total,
    setPage,
}: CouponListProps) {
    if (isLoading && coupons.length === 0) {
        return (
            <CardContent className="p-0">
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
            </CardContent>
        )
    }

    if (coupons.length === 0) {
        return (
            <CardContent className="p-0">
                <div className="text-center py-20">
                    <p className="text-muted-foreground text-sm font-light">No coupons found.</p>
                </div>
            </CardContent>
        )
    }

    return (
        <CardContent className="p-0">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="border-b border-border bg-muted/30">
                        <tr>
                            <th className="text-left p-4 text-sm font-light text-muted-foreground w-10">#</th>
                            <th className="text-left p-4 text-sm font-light text-muted-foreground">Code</th>
                            <th className="text-left p-4 text-sm font-light text-muted-foreground">Discount</th>
                            <th className="text-left p-4 text-sm font-light text-muted-foreground">Gifts Package</th>
                            <th className="text-left p-4 text-sm font-light text-muted-foreground">Usage</th>
                            <th className="text-left p-4 text-sm font-light text-muted-foreground">Validity</th>
                            <th className="text-left p-4 text-sm font-light text-muted-foreground">Status</th>
                            <th className="text-right p-4 text-sm font-light text-muted-foreground">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {coupons.map((coupon, index) => (
                            <tr key={coupon.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                                <td className="p-4 text-sm font-light text-muted-foreground">
                                    {((page - 1) * limit) + index + 1}
                                </td>
                                <td className="p-4">
                                    <div className="font-bold text-sm bg-secondary/50 inline-block px-2 py-1 rounded">
                                        {coupon.code}
                                    </div>
                                </td>
                                <td className="p-4 text-sm font-light">
                                    {coupon.discount_type === CouponDiscountType.PERCENTAGE
                                        ? `${coupon.discount_value}%`
                                        : `$${coupon.discount_value}`}
                                </td>
                                <td className="p-4 text-sm font-light text-muted-foreground">
                                    {coupon.subscription_package?.description ? (
                                        <span className="truncate max-w-[150px] inline-block" title={coupon.subscription_package.description}>
                                            {coupon.subscription_package.description} ({coupon.subscription_package.duration_months}mo)
                                        </span>
                                    ) : coupon.subscription_package_id ? (
                                        'Linked Package'
                                    ) : (
                                        '-'
                                    )}
                                </td>
                                <td className="p-4 text-sm font-light text-muted-foreground">
                                    {coupon.usage_count} / {coupon.usage_limit || '∞'}
                                </td>
                                <td className="p-4">
                                    <div className="text-xs text-muted-foreground space-y-1">
                                        <div><span className="font-medium">From:</span> {coupon.valid_from ? format(new Date(coupon.valid_from), 'MMM d, yy') : 'Anytime'}</div>
                                        <div><span className="font-medium">To:</span> {coupon.valid_until ? format(new Date(coupon.valid_until), 'MMM d, yy') : 'Never'}</div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium ${getStatusBadgeClass(coupon.active)}`}>
                                        {coupon.active ? 'Active' : 'Inactive'}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex justify-end">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-32">
                                                <DropdownMenuItem onClick={() => onViewDetails(coupon)}>
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onEdit(coupon)}>
                                                    <Edit2 className="w-4 h-4 mr-2" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                                    onClick={() => onDelete(coupon)}
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between p-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                    Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} coupons
                </p>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1 || isLoading}
                        className="text-sm font-light"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Previous
                    </Button>
                    <span className="text-sm text-muted-foreground px-3">
                        Page {page} of {totalPages || 1}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page + 1)}
                        disabled={page >= totalPages || isLoading}
                        className="text-sm font-light"
                    >
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>
            </div>
        </CardContent>
    )
}
