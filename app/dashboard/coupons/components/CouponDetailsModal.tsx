import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { X, Calendar, Tag, Shield } from 'lucide-react'
import { format } from 'date-fns'
import type { CouponGroup } from '@/lib/types'
import { CouponDiscountType } from '@/lib/types'

interface CouponDetailsModalProps {
    couponGroup: CouponGroup | null
    onClose: () => void
}

export function CouponDetailsModal({ couponGroup, onClose }: CouponDetailsModalProps) {
    if (!couponGroup) return null

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="max-w-4xl w-full border-2 border-primary/20 shadow-xl bg-gradient-to-br from-background to-secondary/10 flex flex-col max-h-[90vh]">
                <CardContent className="p-6 flex-1 flex flex-col min-h-0">
                    <div className="flex items-start justify-between mb-6 shrink-0">
                        <div className="flex items-center gap-2">
                            <Tag className="w-6 h-6 text-primary" />
                            <div>
                                <h3 className="text-xl font-bold text-foreground leading-tight">Batch: {couponGroup.name}</h3>
                                <p className="text-xs text-muted-foreground">{couponGroup.is_bulk ? `Generated ${couponGroup.total_coupons} items` : 'Single Coupon'}</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="overflow-y-auto pr-2 space-y-4 flex-1">
                        {couponGroup.coupons?.map((coupon, index) => (
                            <div key={coupon.id} className="bg-background rounded-lg border border-border p-4 shadow-sm hover:border-primary/50 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-primary/10 text-primary px-3 py-1 rounded-md font-mono font-bold font-[16px] tracking-wider">
                                            {coupon.code}
                                        </div>
                                        {coupon.active ? (
                                            <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-medium">Active</span>
                                        ) : (
                                            <span className="bg-gray-100 text-gray-700 text-[10px] px-2 py-0.5 rounded-full font-medium">Inactive</span>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Discount</p>
                                        <p className="text-lg font-bold text-primary">
                                            {coupon.discount_type === CouponDiscountType.PERCENTAGE
                                                ? `${coupon.discount_value}%`
                                                : `$${coupon.discount_value}`}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    {coupon.subscription_package && (
                                        <div className="bg-secondary/20 p-2 rounded">
                                            <p className="text-[10px] text-muted-foreground flex items-center gap-1 mb-1"><Shield className="w-3 h-3" /> Package</p>
                                            <p className="font-medium truncate" title={coupon.subscription_package?.description || ''}>
                                                {coupon.subscription_package?.duration_months} Months
                                            </p>
                                        </div>
                                    )}

                                    <div className="bg-secondary/20 p-2 rounded">
                                        <p className="text-[10px] text-muted-foreground mb-1">Usage</p>
                                        <p className="font-medium">
                                            <span className="text-primary">{coupon.usage_count}</span>
                                            <span className="text-muted-foreground"> / {coupon.usage_limit || '∞'}</span>
                                        </p>
                                    </div>

                                    <div className="bg-secondary/20 p-2 rounded">
                                        <p className="text-[10px] text-muted-foreground flex items-center gap-1 mb-1"><Calendar className="w-3 h-3" /> Valid From</p>
                                        <p className="font-medium">{coupon.valid_from ? format(new Date(coupon.valid_from), 'MMM d, yyyy') : 'Anytime'}</p>
                                    </div>

                                    <div className="bg-secondary/20 p-2 rounded">
                                        <p className="text-[10px] text-muted-foreground flex items-center gap-1 mb-1"><Calendar className="w-3 h-3" /> Valid Until</p>
                                        <p className="font-medium">{coupon.valid_until ? format(new Date(coupon.valid_until), 'MMM d, yyyy') : 'Never'}</p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {(!couponGroup.coupons || couponGroup.coupons.length === 0) && (
                            <p className="text-center text-muted-foreground text-sm py-10">No specific coupon codes loaded for this batch.</p>
                        )}
                    </div>

                    <div className="shrink-0 pt-4 mt-2">
                        <Button
                            className="w-full bg-primary hover:bg-primary/90 text-sm font-light"
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
