'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { usePaymentsStore } from '@/lib/stores'
import { useDebounce, usePagination } from '@/hooks'
import { ServiceType } from '@/lib/types'
import type { SubscriptionPackage, CreatePackageRequest, UpdatePackageRequest, PaginationParams, PackageFilters } from '@/lib/types'
import { Plus, Edit2, Trash2, X, Eye, Search, MoreVertical, ChevronLeft, ChevronRight, RefreshCw, Loader2 } from 'lucide-react'

// Service type labels for display
const SERVICE_TYPE_LABELS: Record<string, string> = {
  [ServiceType.PREMIUM_MEMBERSHIP]: 'Premium Membership',
  [ServiceType.PREMIUM_STOCK_PICKS]: 'Premium Stock Picks',
  [ServiceType.INTERNATIONAL_STOCK_ACCOUNT]: 'International Stock Account',
  [ServiceType.GUARANTEED_RETURNS]: 'Guaranteed Returns',
}

export default function PackagesPage() {
  // Store state
  const {
    packages,
    packagesPagination: storePagination,
    isLoadingPackages: isLoading,
    isProcessing,
    error,
    fetchPackages,
    createPackage,
    updatePackage,
    deletePackage,
    clearError,
  } = usePaymentsStore()

  // Local state for filters
  const [searchQuery, setSearchQuery] = useState('')
  const [filterServiceType, setFilterServiceType] = useState<string>('all')
  const [filterActive, setFilterActive] = useState<string>('all')
  const debouncedSearch = useDebounce(searchQuery, 300)

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [viewingPackage, setViewingPackage] = useState<SubscriptionPackage | null>(null)
  const [deletingPackage, setDeletingPackage] = useState<SubscriptionPackage | null>(null)
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    service_type: '',
    price: '',
    currency: 'USD',
    duration_months: '',
    description: '',
    features: '',
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

  // Load packages function
  const loadPackages = useCallback((currentPage: number) => {
    const params: PaginationParams & PackageFilters = {
      page: currentPage,
      limit,
    }
    if (debouncedSearch) {
      params.q = debouncedSearch
    }
    if (filterServiceType !== 'all') {
      params.service_type = filterServiceType as ServiceType
    }
    if (filterActive !== 'all') {
      params.active = filterActive === 'true'
    }
    fetchPackages(params)
  }, [limit, debouncedSearch, filterServiceType, filterActive, fetchPackages])

  // Initial load only - runs once on mount
  useEffect(() => {
    loadPackages(1)
    setIsInitialLoad(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Refetch when filters change (but not on initial load)
  useEffect(() => {
    if (!isInitialLoad) {
      setPage(1)
      loadPackages(1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, filterServiceType, filterActive])

  // Refetch when page/limit changes (but not on initial load)
  useEffect(() => {
    if (!isInitialLoad) {
      loadPackages(page)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit])

  // Update pagination from store
  useEffect(() => {
    updateFromMeta(storePagination)
  }, [storePagination, updateFromMeta])

  // Helper to safely get price as number
  const getPrice = (pkg: SubscriptionPackage): number => {
    return typeof pkg.price === 'string' ? parseFloat(pkg.price) : pkg.price
  }

  // Helper to safely get features array
  const getFeatures = (pkg: SubscriptionPackage): string[] => {
    return pkg.features || []
  }

  const handleCreate = async () => {
    if (formData.service_type && formData.price && formData.duration_months) {
      try {
        const data: CreatePackageRequest = {
          service_type: formData.service_type,
          price: parseFloat(formData.price),
          currency: formData.currency,
          duration_months: parseInt(formData.duration_months),
          description: formData.description || undefined,
          features: formData.features ? formData.features.split(',').map((f) => f.trim()).filter(f => f) : undefined,
          active: formData.active,
        }
        await createPackage(data)
        closeModal()
        loadPackages(page)
      } catch {
        // Error handled by store
      }
    }
  }

  const handleUpdate = async (id: string) => {
    if (formData.service_type && formData.price && formData.duration_months) {
      try {
        const data: UpdatePackageRequest = {
          service_type: formData.service_type,
          price: parseFloat(formData.price),
          currency: formData.currency,
          duration_months: parseInt(formData.duration_months),
          description: formData.description || undefined,
          features: formData.features ? formData.features.split(',').map((f) => f.trim()).filter(f => f) : undefined,
          active: formData.active,
        }
        await updatePackage(id, data)
        closeModal()
        loadPackages(page)
      } catch {
        // Error handled by store
      }
    }
  }

  const openCreateModal = () => {
    setFormData({
      service_type: '',
      price: '',
      currency: 'USD',
      duration_months: '',
      description: '',
      features: '',
      active: true
    })
    setEditingId(null)
    setIsModalOpen(true)
  }

  const openEditModal = (pkg: SubscriptionPackage) => {
    setEditingId(pkg.id)
    setFormData({
      service_type: pkg.service_type,
      price: String(getPrice(pkg)),
      currency: pkg.currency,
      duration_months: String(pkg.duration_months),
      description: pkg.description || '',
      features: getFeatures(pkg).join(', '),
      active: pkg.active,
    })
    setIsModalOpen(true)
    setOpenDropdownId(null)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
    setFormData({
      service_type: '',
      price: '',
      currency: 'USD',
      duration_months: '',
      description: '',
      features: '',
      active: true
    })
  }

  const handleDeleteConfirm = async () => {
    if (deletingPackage) {
      try {
        await deletePackage(deletingPackage.id)
        setDeletingPackage(null)
        loadPackages(page)
      } catch {
        // Error handled by store
      }
    }
  }

  const toggleDropdown = (id: string) => {
    setOpenDropdownId(openDropdownId === id ? null : id)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenDropdownId(null)
    if (openDropdownId) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [openDropdownId])

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
            <div className="flex flex-1 gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search packages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 text-sm h-9"
                />
              </div>
              <select
                value={filterServiceType}
                onChange={(e) => setFilterServiceType(e.target.value)}
                className="px-3 py-2 text-sm border border-border rounded-md bg-background h-9"
              >
                <option value="all">All Types</option>
                {Object.entries(SERVICE_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <select
                value={filterActive}
                onChange={(e) => setFilterActive(e.target.value)}
                className="px-3 py-2 text-sm border border-border rounded-md bg-background h-9"
              >
                <option value="all">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => loadPackages(page)}
                disabled={isLoading}
              >
                <RefreshCw className={isLoading ? 'w-4 h-4 animate-spin' : 'w-4 h-4'} />
              </Button>
              <Button
                onClick={openCreateModal}
                disabled={isProcessing}
                className="text-white bg-primary hover:bg-primary/90 text-sm font-normal h-9 flex-1 sm:flex-none"
              >
                <Plus className="w-4 h-4" />
                Create New
              </Button>
            </div>
          </div>
        </div>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : packages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <p className="text-sm">No packages found</p>
              {(searchQuery || filterServiceType !== 'all' || filterActive !== 'all') && (
                <Button
                  variant="link"
                  className="text-sm mt-2"
                  onClick={() => {
                    setSearchQuery('')
                    setFilterServiceType('all')
                    setFilterActive('all')
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border bg-secondary/30">
                    <tr>
                      <th className="text-left p-4 text-sm font-light text-muted-foreground">Package ID</th>
                      <th className="text-left p-4 text-sm font-light text-muted-foreground">Service Type</th>
                      <th className="text-left p-4 text-sm font-light text-muted-foreground">Description</th>
                      <th className="text-left p-4 text-sm font-light text-muted-foreground">Price</th>
                      <th className="text-left p-4 text-sm font-light text-muted-foreground">Duration</th>
                      <th className="text-left p-4 text-sm font-light text-muted-foreground">Features</th>
                      <th className="text-left p-4 text-sm font-light text-muted-foreground">Status</th>
                      <th className="text-right p-4 text-sm font-light text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {packages.map((pkg) => (
                      <tr key={pkg.id} className="border-b border-border hover:bg-secondary/20">
                        <td className="p-4 text-sm font-light text-foreground">
                          <span className="font-mono text-xs">{pkg.id.slice(0, 8)}...</span>
                        </td>
                        <td className="p-4 text-sm font-light text-foreground">
                          {SERVICE_TYPE_LABELS[pkg.service_type] || pkg.service_type}
                        </td>
                        <td className="p-4 text-sm font-light text-muted-foreground max-w-xs truncate">
                          {pkg.description || '-'}
                        </td>
                        <td className="p-4 text-sm font-light text-primary">
                          {pkg.currency} ${getPrice(pkg).toFixed(2)}
                        </td>
                        <td className="p-4 text-sm font-light text-muted-foreground">
                          {pkg.duration_months} {pkg.duration_months === 1 ? 'month' : 'months'}
                        </td>
                        <td className="p-4 text-sm font-light text-muted-foreground">
                          {getFeatures(pkg).length} features
                        </td>
                        <td className="p-4">
                          <span className={'text-xs font-light px-2.5 py-1 rounded-full ' + getStatusBadgeClass(pkg.active)}>
                            {pkg.active ? 'active' : 'inactive'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end relative">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleDropdown(pkg.id)
                              }}
                              className="text-xs font-light h-8 w-8 p-0"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>

                            {openDropdownId === pkg.id && (
                              <div 
                                className="absolute right-0 top-10 z-50 bg-background border border-border rounded-md shadow-lg py-1 min-w-[140px]"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={() => {
                                    setViewingPackage(pkg)
                                    setOpenDropdownId(null)
                                  }}
                                  className="w-full px-4 py-2 text-sm text-left hover:bg-secondary/50 flex items-center gap-2"
                                >
                                  <Eye className="w-4 h-4" />
                                  View
                                </button>
                                <button
                                  onClick={() => openEditModal(pkg)}
                                  className="w-full px-4 py-2 text-sm text-left hover:bg-secondary/50 flex items-center gap-2"
                                >
                                  <Edit2 className="w-4 h-4" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => {
                                    setDeletingPackage(pkg)
                                    setOpenDropdownId(null)
                                  }}
                                  className="w-full px-4 py-2 text-sm text-left hover:bg-destructive/10 text-destructive flex items-center gap-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </button>
                              </div>
                            )}
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
                  Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, storePagination.total)} of {storePagination.total} packages
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
            </>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full border-0 shadow-xl max-h-[90vh] overflow-y-auto">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-light text-foreground">
                  {editingId ? 'Edit Package' : 'Create New Package'}
                </h3>
                <Button variant="ghost" size="sm" onClick={closeModal}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-light text-muted-foreground">Service Type *</label>
                    <select
                      value={formData.service_type}
                      onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background"
                    >
                      <option value="">Select service type</option>
                      {Object.entries(SERVICE_TYPE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-light text-muted-foreground">Duration (months) *</label>
                    <Input
                      placeholder="3"
                      type="number"
                      min="1"
                      max="120"
                      value={formData.duration_months}
                      onChange={(e) => setFormData({ ...formData, duration_months: e.target.value })}
                      className="text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-light text-muted-foreground">Price *</label>
                    <Input
                      placeholder="299.99"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-light text-muted-foreground">Currency</label>
                    <Input
                      placeholder="USD"
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="text-sm"
                      maxLength={8}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-light text-muted-foreground">Description</label>
                  <textarea
                    placeholder="Enter package description..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background min-h-[80px]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-light text-muted-foreground">Features (comma separated)</label>
                  <textarea
                    placeholder="Advanced stock analysis tools, Unlimited stock picks, Portfolio tracking"
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background min-h-[80px]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-light text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="w-4 h-4"
                    />
                    Active Package
                  </label>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <Button
                  onClick={() => (editingId ? handleUpdate(editingId) : handleCreate())}
                  disabled={isProcessing || !formData.service_type || !formData.price || !formData.duration_months}
                  className="bg-primary hover:bg-primary/90 text-sm font-light flex-1"
                >
                  {isProcessing && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  {editingId ? 'Update Package' : 'Create Package'}
                </Button>
                <Button
                  variant="outline"
                  onClick={closeModal}
                  disabled={isProcessing}
                  className="text-sm font-light"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* View Modal */}
      {viewingPackage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full border-2 border-primary/20 shadow-xl bg-gradient-to-br from-background to-secondary/10">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-light text-foreground">
                  {SERVICE_TYPE_LABELS[viewingPackage.service_type] || viewingPackage.service_type}
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setViewingPackage(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-3xl font-light text-primary">
                    ${getPrice(viewingPackage).toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {viewingPackage.duration_months} {viewingPackage.duration_months === 1 ? 'Month' : 'Months'}
                  </p>
                </div>

                {viewingPackage.description && (
                  <p className="text-sm font-light text-muted-foreground">
                    {viewingPackage.description}
                  </p>
                )}

                {getFeatures(viewingPackage).length > 0 && (
                  <div className="space-y-2">
                    {getFeatures(viewingPackage).map((feature, i) => (
                      <div key={i} className="text-sm font-light text-foreground flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-4 border-t border-border space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-light">Package ID:</span>
                    <span className="text-foreground font-light font-mono text-xs">{viewingPackage.id.slice(0, 8)}...</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-light">Currency:</span>
                    <span className="text-foreground font-light">{viewingPackage.currency}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-light">Status:</span>
                    <span className={'text-xs px-2.5 py-1 rounded-full ' + getStatusBadgeClass(viewingPackage.active)}>
                      {viewingPackage.active ? 'active' : 'inactive'}
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-sm font-light mt-4"
                  onClick={() => setViewingPackage(null)}
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingPackage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-destructive" />
                </div>
                <Button variant="ghost" size="sm" onClick={() => setDeletingPackage(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <h3 className="text-xl font-light text-foreground mb-2">Delete Package</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Are you sure you want to delete the{' '}
                <span className="font-medium text-foreground">
                  {SERVICE_TYPE_LABELS[deletingPackage.service_type] || deletingPackage.service_type}
                </span>
                {' '}package? This action cannot be undone.
              </p>

              <div className="flex gap-2">
                <Button
                  onClick={handleDeleteConfirm}
                  disabled={isProcessing}
                  className="bg-destructive hover:bg-destructive/90 text-white text-sm font-light flex-1"
                >
                  {isProcessing && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Delete Package
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setDeletingPackage(null)}
                  disabled={isProcessing}
                  className="text-sm font-light"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
