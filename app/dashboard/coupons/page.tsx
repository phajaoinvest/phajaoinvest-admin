'use client'

import { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useCouponsStore, usePaymentsStore } from '@/lib/stores'
import { useDebounce, usePagination } from '@/hooks'
import { CouponDiscountType } from '@/lib/types'
import type { Coupon, CouponGroup, CreateCouponRequest, UpdateCouponRequest, PaginationParams } from '@/lib/types'
import { Plus, X, Search, RefreshCw } from 'lucide-react'

// Components
import { CouponFormModal } from './components/CouponFormModal'
import { CouponDetailsModal } from './components/CouponDetailsModal'
import { CouponDeleteModal } from './components/CouponDeleteModal'
import { CouponList } from './components/CouponList'

export default function CouponsPage() {
    // Store state
    const {
        coupons,
        pagination: storePagination,
        isLoading,
        isProcessing,
        error,
        fetchCoupons,
        createCoupon,
        updateCoupon,
        deleteCoupon,
        clearError,
        getCouponGroup,
    } = useCouponsStore()

    const { packages, fetchPackages } = usePaymentsStore()

    // Local state for filters
    const [searchQuery, setSearchQuery] = useState('')
    const debouncedSearch = useDebounce(searchQuery, 300)

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [viewingCoupon, setViewingCoupon] = useState<CouponGroup | null>(null)
    const [deletingCoupon, setDeletingCoupon] = useState<CouponGroup | null>(null)
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)

    // Form state
    const [formData, setFormData] = useState({
        code: '',
        is_bulk: false,
        generate_count: '10',
        code_prefix: '',
        description: '',
        discount_type: CouponDiscountType.PERCENTAGE,
        discount_value: '',
        max_discount_amount: '',
        min_purchase_amount: '',
        valid_from: '',
        valid_until: '',
        usage_limit: '',
        subscription_package_id: '',
        active: true,
    })

    // Pagination
    const {
        page,
        limit,
        totalPages,
        setPage,
        updateFromMeta,
    } = usePagination({ initialLimit: 10 })

    // Track initial load
    const [isInitialLoad, setIsInitialLoad] = useState(true)

    // Load coupons function
    const loadCoupons = useCallback((currentPage: number) => {
        const params: PaginationParams = {
            page: currentPage,
            limit,
        }
        if (debouncedSearch) {
            params.search = debouncedSearch
        }
        fetchCoupons(params)
    }, [limit, debouncedSearch, fetchCoupons])

    useEffect(() => {
        loadCoupons(1)
        fetchPackages({ limit: 100 }) // Load packages for dropdown
        setIsInitialLoad(false)
    }, [])

    // Refetch when filters change
    useEffect(() => {
        if (!isInitialLoad) {
            setPage(1)
            loadCoupons(1)
        }
    }, [debouncedSearch])

    // Refetch when page/limit changes
    useEffect(() => {
        if (!isInitialLoad) {
            loadCoupons(page)
        }
    }, [page, limit])

    // Update pagination from store
    useEffect(() => {
        updateFromMeta(storePagination)
    }, [storePagination, updateFromMeta])

    const handleCreate = async () => {
        try {
            const data: CreateCouponRequest = {
                code: formData.is_bulk ? undefined : formData.code,
                generate_count: formData.is_bulk ? parseInt(formData.generate_count) : undefined,
                code_prefix: formData.is_bulk ? formData.code_prefix : undefined,
                description: formData.description || undefined,
                discount_type: formData.discount_type,
                discount_value: parseFloat(formData.discount_value),
                max_discount_amount: formData.max_discount_amount ? parseFloat(formData.max_discount_amount) : undefined,
                min_purchase_amount: formData.min_purchase_amount ? parseFloat(formData.min_purchase_amount) : undefined,
                valid_from: formData.valid_from || undefined,
                valid_until: formData.valid_until || undefined,
                usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : undefined,
                subscription_package_id: formData.subscription_package_id || undefined,
                active: formData.active,
            }
            await createCoupon(data)
            closeModal()
            loadCoupons(page)
        } catch {
            // Error handled by store
        }
    }

    const handleUpdate = async (id: string) => {
        try {
            const data: UpdateCouponRequest = {
                code: formData.code,
                description: formData.description || undefined,
                discount_type: formData.discount_type,
                discount_value: parseFloat(formData.discount_value),
                max_discount_amount: formData.max_discount_amount ? parseFloat(formData.max_discount_amount) : undefined,
                min_purchase_amount: formData.min_purchase_amount ? parseFloat(formData.min_purchase_amount) : undefined,
                valid_from: formData.valid_from || undefined,
                valid_until: formData.valid_until || undefined,
                usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : undefined,
                subscription_package_id: formData.subscription_package_id || undefined,
                active: formData.active,
            }
            await updateCoupon(id, data)
            closeModal()
            loadCoupons(page)
        } catch {
            // Error handled by store
        }
    }

    const openCreateModal = () => {
        setFormData({
            code: '',
            is_bulk: false,
            generate_count: '10',
            code_prefix: '',
            description: '',
            discount_type: CouponDiscountType.PERCENTAGE,
            discount_value: '',
            max_discount_amount: '',
            min_purchase_amount: '',
            valid_from: '',
            valid_until: '',
            usage_limit: '',
            subscription_package_id: '',
            active: true,
        })
        setEditingId(null)
        setIsModalOpen(true)
    }

    const openEditModal = (group: CouponGroup) => {
        setEditingId(group.id)
        const sampleCoupon = group.coupons?.[0] || {} as any
        setFormData({
            code: sampleCoupon.code || '',
            is_bulk: group.is_bulk,
            generate_count: String(group.total_coupons),
            code_prefix: '',
            description: sampleCoupon.description || '',
            discount_type: sampleCoupon.discount_type || CouponDiscountType.PERCENTAGE,
            discount_value: String(sampleCoupon.discount_value || ''),
            max_discount_amount: sampleCoupon.max_discount_amount ? String(sampleCoupon.max_discount_amount) : '',
            min_purchase_amount: sampleCoupon.min_purchase_amount ? String(sampleCoupon.min_purchase_amount) : '',
            valid_from: sampleCoupon.valid_from ? sampleCoupon.valid_from.split('T')[0] : '',
            valid_until: sampleCoupon.valid_until ? sampleCoupon.valid_until.split('T')[0] : '',
            usage_limit: sampleCoupon.usage_limit ? String(sampleCoupon.usage_limit) : '',
            subscription_package_id: sampleCoupon.subscription_package_id || '',
            active: sampleCoupon.active !== undefined ? sampleCoupon.active : true,
        })
        setIsModalOpen(true)
        setOpenDropdownId(null)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setEditingId(null)
    }

    const handleViewDetails = async (group: CouponGroup) => {
        try {
            const fullGroup = await getCouponGroup(group.id)
            setViewingCoupon(fullGroup)
        } catch (err) {
            console.error('Failed to load group details', err)
        }
    }

    const handleDeleteConfirm = async () => {
        if (deletingCoupon) {
            try {
                await deleteCoupon(deletingCoupon.id)
                setDeletingCoupon(null)
                loadCoupons(page)
            } catch {
                // Error handled by store
            }
        }
    }

    const toggleDropdown = (id: string) => {
        setOpenDropdownId(openDropdownId === id ? null : id)
    }

    const generateRandomCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        let result = ''
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        setFormData(prev => ({ ...prev, code: result }))
    }

    const getStatusBadgeClass = (active: boolean) => {
        return active
            ? 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400'
            : 'bg-gray-100 text-gray-700 dark:bg-gray-950/50 dark:text-gray-400'
    }

    return (
        <div className="space-y-6">
            {/* Error display */}
            {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4 flex items-center justify-between">
                    <p className="text-sm text-destructive">{error}</p>
                    <Button variant="ghost" size="sm" onClick={clearError}>
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            )}

            <Card className="border-0 shadow-sm rounded-sm">
                <div className="p-4 border-b border-border">
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                        <div className="relative flex-1 w-full sm:max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                placeholder="Search coupons..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 text-sm h-9"
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => loadCoupons(page)}
                                disabled={isLoading}
                            >
                                <RefreshCw className={isLoading ? 'w-4 h-4 animate-spin' : 'w-4 h-4'} />
                            </Button>
                            <Button
                                onClick={openCreateModal}
                                disabled={isProcessing}
                                className="text-white bg-primary hover:bg-primary/90 text-sm font-normal h-9 flex-1 sm:flex-none"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create Coupon
                            </Button>
                        </div>
                    </div>
                </div>
                <CouponList
                    coupons={coupons}
                    isLoading={isLoading}
                    openDropdownId={openDropdownId}
                    toggleDropdown={toggleDropdown}
                    onViewDetails={handleViewDetails}
                    onEdit={openEditModal}
                    onDelete={setDeletingCoupon}
                    page={page}
                    limit={limit}
                    totalPages={totalPages}
                    setPage={setPage}
                    total={storePagination.total}
                />
            </Card>

            <CouponFormModal
                isOpen={isModalOpen}
                editingId={editingId}
                formData={formData}
                setFormData={setFormData as any}
                isProcessing={isProcessing}
                packages={packages}
                onSave={() => (editingId ? handleUpdate(editingId) : handleCreate())}
                onClose={closeModal}
            />

            <CouponDetailsModal
                couponGroup={viewingCoupon}
                onClose={() => setViewingCoupon(null)}
            />

            <CouponDeleteModal
                couponGroup={deletingCoupon}
                isProcessing={isProcessing}
                onConfirm={handleDeleteConfirm}
                onClose={() => setDeletingCoupon(null)}
            />
        </div>
    )
}
