import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tag, Wand2, X, Loader2 } from 'lucide-react'
import { CouponDiscountType } from '@/lib/types'
import type { SubscriptionPackage } from '@/lib/types'

interface CouponFormData {
    code: string
    description: string
    discount_type: CouponDiscountType
    discount_value: string
    max_discount_amount: string
    min_purchase_amount: string
    valid_from: string
    valid_until: string
    usage_limit: string
    subscription_package_id: string
    active: boolean
}

interface CouponFormModalProps {
    isOpen: boolean
    editingId: string | null
    formData: CouponFormData
    setFormData: (data: CouponFormData | ((prev: CouponFormData) => CouponFormData)) => void
    isProcessing: boolean
    packages: SubscriptionPackage[]
    onSave: () => void
    onClose: () => void
}

export function CouponFormModal({
    isOpen,
    editingId,
    formData,
    setFormData,
    isProcessing,
    packages,
    onSave,
    onClose,
}: CouponFormModalProps) {
    if (!isOpen) return null

    const generateRandomCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        let result = ''
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        setFormData((prev: CouponFormData) => ({ ...prev, code: result }))
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="max-w-3xl w-full border-0 shadow-xl max-h-[90vh] overflow-y-auto">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Tag className="w-5 h-5 text-primary" />
                            <h3 className="text-xl font-light text-foreground">
                                {editingId ? 'Edit Coupon' : 'Create New Coupon'}
                            </h3>
                        </div>
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-light text-muted-foreground">Coupon Code *</label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="e.g. SUMMER2024"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        className="text-sm font-bold uppercase flex-1"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={generateRandomCode}
                                        title="Generate Random Code"
                                        className="shrink-0"
                                    >
                                        <Wand2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-light text-muted-foreground">Discount Type *</label>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant={formData.discount_type === CouponDiscountType.PERCENTAGE ? 'default' : 'outline'}
                                        onClick={() => setFormData({ ...formData, discount_type: CouponDiscountType.PERCENTAGE })}
                                        className="flex-1 text-xs h-9"
                                    >
                                        Percentage (%)
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={formData.discount_type === CouponDiscountType.FIXED ? 'default' : 'outline'}
                                        onClick={() => setFormData({ ...formData, discount_type: CouponDiscountType.FIXED })}
                                        className="flex-1 text-xs h-9"
                                    >
                                        Fixed Amount ($)
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-light text-muted-foreground">
                                    Discount Value ({formData.discount_type === CouponDiscountType.PERCENTAGE ? '%' : '$'}) *
                                </label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    value={formData.discount_value}
                                    onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-light text-muted-foreground">Grant Subscription Package</label>
                                <select
                                    value={formData.subscription_package_id}
                                    onChange={(e) => setFormData({ ...formData, subscription_package_id: e.target.value })}
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="">Do not grant package</option>
                                    {packages.map((pkg) => (
                                        <option key={pkg.id} value={pkg.id}>
                                            {pkg.description || `${pkg.duration_months} months`} - ${pkg.price}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-[10px] text-muted-foreground">Specifies what subscription package this coupon grants for free</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-light text-muted-foreground">Max Discount Amount ($)</label>
                                <Input
                                    type="number"
                                    placeholder="Unlimited"
                                    value={formData.max_discount_amount}
                                    onChange={(e) => setFormData({ ...formData, max_discount_amount: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-light text-muted-foreground">Min Purchase Amount ($)</label>
                                <Input
                                    type="number"
                                    placeholder="No minimum"
                                    value={formData.min_purchase_amount}
                                    onChange={(e) => setFormData({ ...formData, min_purchase_amount: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-light text-muted-foreground">Valid From</label>
                                <Input
                                    type="date"
                                    value={formData.valid_from}
                                    onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-light text-muted-foreground">Valid Until</label>
                                <Input
                                    type="date"
                                    value={formData.valid_until}
                                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-light text-muted-foreground">Usage Limit (per coupon)</label>
                                <Input
                                    type="number"
                                    placeholder="Unlimited"
                                    value={formData.usage_limit}
                                    onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                                />
                            </div>
                            <div className="flex items-end pb-2">
                                <label className="flex items-center gap-2 text-sm font-light text-muted-foreground cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.active}
                                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                        className="w-4 h-4 text-primary"
                                    />
                                    Active and Redeemable
                                </label>
                            </div>
                        </div>

                        <div className="space-y-2 pb-4">
                            <label className="text-sm font-light text-muted-foreground">Description</label>
                            <textarea
                                placeholder="Enter coupon description..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background min-h-[60px]"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 mt-8">
                        <Button
                            onClick={onSave}
                            disabled={isProcessing || !formData.code || !formData.discount_value}
                            className="bg-primary hover:bg-primary/90 text-sm font-light flex-1"
                        >
                            {isProcessing && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                            {editingId ? 'Update Coupon' : 'Create Coupon'}
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
