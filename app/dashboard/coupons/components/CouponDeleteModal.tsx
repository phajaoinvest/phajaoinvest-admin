import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Trash2, X, Loader2 } from 'lucide-react'
import type { CouponGroup } from '@/lib/types'

interface CouponDeleteModalProps {
    couponGroup: CouponGroup | null
    isProcessing: boolean
    onConfirm: () => void
    onClose: () => void
}

export function CouponDeleteModal({
    couponGroup,
    isProcessing,
    onConfirm,
    onClose,
}: CouponDeleteModalProps) {
    if (!couponGroup) return null

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full border-0 shadow-xl">
                <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                            <Trash2 className="w-6 h-6 text-destructive" />
                        </div>
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    <h3 className="text-xl font-light text-foreground mb-2">Delete {couponGroup.is_bulk ? 'Batch' : 'Coupon'}</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                        Are you sure you want to delete {couponGroup.is_bulk ? 'all coupons in batch' : 'coupon'} <span className="font-bold text-foreground">{couponGroup.name}</span>?
                        This will prevent any future usage of {couponGroup.is_bulk ? 'these codes' : 'this code'}. This action cannot be undone.
                    </p>

                    <div className="flex gap-2">
                        <Button
                            onClick={onConfirm}
                            disabled={isProcessing}
                            className="bg-destructive hover:bg-destructive/90 text-white text-sm font-light flex-1"
                        >
                            {isProcessing && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                            Delete Coupon
                        </Button>
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={isProcessing}
                            className="text-sm font-light flex-1"
                        >
                            Cancel
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
