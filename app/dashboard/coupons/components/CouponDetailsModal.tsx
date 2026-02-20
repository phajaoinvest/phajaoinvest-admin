import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { X, Calendar, Tag } from 'lucide-react'
import { format } from 'date-fns'
import type { Coupon } from '@/lib/types'
import { CouponDiscountType } from '@/lib/types'

interface CouponDetailsModalProps {
    coupon: Coupon | null
    onClose: () => void
}

export function CouponDetailsModal({ coupon, onClose }: CouponDetailsModalProps) {
    if (!coupon) return null

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full border-2 border-primary/20 shadow-xl bg-gradient-to-br from-background to-secondary/10">
                <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Tag className="w-6 h-6 text-primary" />
                            <div>
                                <h3 className="text-xl font-bold text-foreground leading-tight">{coupon.code}</h3>
                                <p className="text-xs text-muted-foreground">{coupon.description || 'No description'}</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-primary/5 rounded-lg p-4 border border-primary/10 flex justify-between items-center">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Discount</p>
                                <p className="text-2xl font-bold text-primary">
                                    {coupon.discount_type === CouponDiscountType.PERCENTAGE
                                        ? `${coupon.discount_value}%`
                                        : `$${coupon.discount_value}`}
                                </p>
                            </div>
                            {coupon.subscription_package && (
                                <div className="text-right">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Granted Package</p>
                                    <p className="text-xl font-bold text-primary truncate max-w-[150px] block" title={coupon.subscription_package?.description || ''}>
                                        {coupon.subscription_package?.duration_months} Months
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> Valid From
                                </p>
                                <p className="text-sm">{coupon.valid_from ? format(new Date(coupon.valid_from), 'MMM d, yyyy') : 'Anytime'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> Valid Until
                                </p>
                                <p className="text-sm">{coupon.valid_until ? format(new Date(coupon.valid_until), 'MMM d, yyyy') : 'Never'}</p>
                            </div>
                        </div>

                        <div className="space-y-2 pt-4 border-t border-border">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Usage Statistics</p>
                            <div className="flex justify-between items-center p-2 bg-secondary/30 rounded">
                                <span className="text-sm">Usage Count</span>
                                <span className="text-sm font-bold text-primary">{coupon.usage_count}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-secondary/30 rounded">
                                <span className="text-sm">Usage Limit</span>
                                <span className="text-sm font-bold">{coupon.usage_limit || 'Unlimited'}</span>
                            </div>
                        </div>

                        <Button
                            className="w-full bg-primary hover:bg-primary/90 text-sm font-light mt-4"
                            onClick={onClose}
                        >
                            Close
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
