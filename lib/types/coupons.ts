/**
 * Coupon Related Types
 */

import { ServiceType } from './common';

export enum CouponDiscountType {
    PERCENTAGE = 'percentage',
    FIXED = 'fixed',
}

export interface Coupon {
    id: string;
    code: string;
    description: string | null;
    discount_type: CouponDiscountType;
    discount_value: number;
    max_discount_amount: number | null;
    min_purchase_amount: number | null;
    valid_from: string | null;
    valid_until: string | null;
    usage_limit: number | null;
    usage_count: number;
    subscription_package_id: string | null;
    subscription_package?: any; // Add proper type if needed or keep as any for now
    active: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreateCouponRequest {
    code: string;
    description?: string;
    discount_type: CouponDiscountType;
    discount_value: number;
    max_discount_amount?: number;
    min_purchase_amount?: number;
    valid_from?: string;
    valid_until?: string;
    usage_limit?: number;
    subscription_package_id?: string;
    active?: boolean;
}

export interface UpdateCouponRequest extends Partial<CreateCouponRequest> { }

export interface CouponUsage {
    id: string;
    coupon_id: string;
    customer_id: string;
    reference_id: string | null;
    discount_applied: number;
    used_at: string;
    coupon?: Coupon;
}
