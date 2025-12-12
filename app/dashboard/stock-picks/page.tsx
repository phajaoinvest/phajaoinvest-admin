'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus, Search, MoreVertical, Eye, Edit2, Trash2, TrendingUp, DollarSign, Target, Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { usePagination } from '@/hooks'
import {
  stockPicksAdminApi,
  type StockPick,
  type CreateStockPickDto,
  type UpdateStockPickDto,
  StockPickStatus,
  StockPickAvailability,
  StockPickRiskLevel,
  StockPickRecommendation,
  CustomerServiceType,
} from '@/lib/api'
import { formatCompactCurrency, formatCurrency } from '@/lib/utils'

export default function StockPicksPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [stockPicks, setStockPicks] = useState<StockPick[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const { page, limit, setPage, setLimit, updateFromMeta } = usePagination({ initialLimit: 10 })
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedPick, setSelectedPick] = useState<StockPick | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState<Partial<CreateStockPickDto>>({
    stock_symbol: '',
    company: '',
    description: '',
    status: StockPickStatus.PENDING,
    availability: StockPickAvailability.AVAILABLE,
    service_type: CustomerServiceType.PREMIUM_STOCK_PICKS,
    current_price: 0,
    target_price: 0,
    sale_price: 0,
    risk_level: StockPickRiskLevel.MEDIUM,
    expected_return_min_percent: 0,
    expected_return_max_percent: 0,
    time_horizon_min_months: 1,
    time_horizon_max_months: 12,
    sector: '',
    analyst_name: '',
    tier_label: '',
    recommendation: StockPickRecommendation.HOLD,
    admin_notes: '',
    key_points: [],
    expires_at: '',
    email_delivery: true,
    is_active: true,
  })

  // Fetch stock picks
  const fetchStockPicks = async () => {
    try {
      setLoading(true)
      const response = await stockPicksAdminApi.getAllStockPicks({
        page: page,
        limit: limit,
      })
      setStockPicks(response.data)
      setTotal(response.total)
      setTotalPages(response.totalPages || Math.ceil(response.total / limit))
      updateFromMeta({
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages || Math.ceil(response.total / limit),
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to fetch stock picks',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStockPicks()
  }, [page, limit])

  const filteredPicks = stockPicks.filter(
    (pick) =>
      pick.stock_symbol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pick.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pick.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpenModal = (pick?: StockPick) => {
    if (pick) {
      setIsEditing(true)
      setSelectedPick(pick)
      setFormData({
        stock_symbol: pick.stock_symbol,
        company: pick.company || '',
        description: pick.description,
        status: pick.status,
        availability: pick.availability || 'available',
        service_type: pick.service_type,
        current_price: pick.current_price || 0,
        target_price: pick.target_price || 0,
        sale_price: pick.sale_price,
        risk_level: pick.risk_level || StockPickRiskLevel.MEDIUM,
        expected_return_min_percent: pick.expected_return_min_percent || 0,
        expected_return_max_percent: pick.expected_return_max_percent || 0,
        time_horizon_min_months: pick.time_horizon_min_months || 1,
        time_horizon_max_months: pick.time_horizon_max_months || 12,
        sector: pick.sector || '',
        analyst_name: pick.analyst_name || '',
        tier_label: pick.tier_label || '',
        recommendation: pick.recommendation || StockPickRecommendation.HOLD,
        admin_notes: pick.admin_notes || '',
        key_points: pick.key_points || [],
        expires_at: pick.expires_at ? pick.expires_at.split('T')[0] : '',
        email_delivery: pick.email_delivery,
        is_active: pick.is_active,
      })
    } else {
      setIsEditing(false)
      setSelectedPick(null)
      setFormData({
        stock_symbol: '',
        company: '',
        description: '',
        status: StockPickStatus.PENDING,
        availability: StockPickAvailability.AVAILABLE,
        service_type: CustomerServiceType.PREMIUM_STOCK_PICKS,
        current_price: 0,
        target_price: 0,
        sale_price: 0,
        risk_level: StockPickRiskLevel.MEDIUM,
        expected_return_min_percent: 0,
        expected_return_max_percent: 0,
        time_horizon_min_months: 1,
        time_horizon_max_months: 12,
        sector: '',
        analyst_name: '',
        tier_label: '',
        recommendation: StockPickRecommendation.HOLD,
        admin_notes: '',
        key_points: [],
        expires_at: '',
        email_delivery: true,
        is_active: true,
      })
    }
    setShowModal(true)
  }

  const handleSubmit = async () => {
    if (!formData.stock_symbol || !formData.description || !formData.sale_price) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    try {
      setSubmitting(true)

      const submitData: any = {
        stock_symbol: formData.stock_symbol,
        description: formData.description,
        status: formData.status!,
        service_type: formData.service_type!,
        sale_price: Number(formData.sale_price),
      }

      // Add optional fields
      if (formData.company) submitData.company = formData.company
      if (formData.current_price) submitData.current_price = Number(formData.current_price)
      if (formData.target_price) submitData.target_price = Number(formData.target_price)
      if (formData.risk_level) submitData.risk_level = formData.risk_level
      if (formData.recommendation) submitData.recommendation = formData.recommendation
      if (formData.expected_return_min_percent) submitData.expected_return_min_percent = Number(formData.expected_return_min_percent)
      if (formData.expected_return_max_percent) submitData.expected_return_max_percent = Number(formData.expected_return_max_percent)
      if (formData.time_horizon_min_months) submitData.time_horizon_min_months = Number(formData.time_horizon_min_months)
      if (formData.time_horizon_max_months) submitData.time_horizon_max_months = Number(formData.time_horizon_max_months)
      if (formData.sector) submitData.sector = formData.sector
      if (formData.analyst_name) submitData.analyst_name = formData.analyst_name
      if (formData.tier_label) submitData.tier_label = formData.tier_label
      if (formData.admin_notes) submitData.admin_notes = formData.admin_notes
      if (formData.key_points && formData.key_points.length > 0) submitData.key_points = formData.key_points
      if (formData.expires_at) submitData.expires_at = new Date(formData.expires_at).toISOString()
      if (formData.availability) submitData.availability = formData.availability
      submitData.email_delivery = formData.email_delivery
      submitData.is_active = formData.is_active

      if (isEditing && selectedPick) {
        await stockPicksAdminApi.updateStockPick(selectedPick.id, submitData)
        toast({
          title: 'Success',
          description: 'Stock pick updated successfully',
        })
      } else {
        await stockPicksAdminApi.createStockPick(submitData as CreateStockPickDto)
        toast({
          title: 'Success',
          description: 'Stock pick created successfully',
        })
      }

      setShowModal(false)
      fetchStockPicks()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to save stock pick',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedPick) return

    try {
      setSubmitting(true)
      await stockPicksAdminApi.deleteStockPick(selectedPick.id)
      toast({
        title: 'Success',
        description: 'Stock pick deleted successfully',
      })
      setShowDeleteModal(false)
      setSelectedPick(null)
      fetchStockPicks()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to delete stock pick',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getRiskColor = (risk: string | null) => {
    if (!risk) return 'bg-gray-500/10 text-gray-500'
    switch (risk) {
      case 'low': return 'bg-green-500/10 text-green-600'
      case 'medium': return 'bg-yellow-500/10 text-yellow-600'
      case 'high': return 'bg-orange-500/10 text-orange-600'
      case 'very_high': return 'bg-red-500/10 text-red-600'
      default: return 'bg-gray-500/10 text-gray-500'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'good':
      case 'very_good':
      case 'excellent':
        return 'bg-green-500/10 text-green-600'
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-600'
      case 'rejected':
        return 'bg-red-500/10 text-red-600'
      default:
        return 'bg-gray-500/10 text-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border/40 rounded-sm">
          <CardContent className="py-6 px-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Picks</p>
                <p className="text-2xl font-bold">{total}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/40 rounded-sm">
          <CardContent className="py-6 px-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Available</p>
                <p className="text-2xl font-bold text-green-600">
                  {stockPicks.filter(p => p.is_active).length}
                </p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg">
                <Target className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/40 rounded-sm">
          <CardContent className="py-6 px-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">This Page</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stockPicks.length}
                </p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/40 rounded-sm">
          <CardContent className="py-6 px-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Avg Sale Price</p>
                <p className="text-2xl font-bold">
                  ${(stockPicks.reduce((sum, p) => sum + p.sale_price, 0) / stockPicks.length || 0).toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="bg-card border-border/40">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="text-lg">Stock Picks Management</CardTitle>
              <CardDescription className="text-sm">Manage stocks available for sale to customers</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by symbol, company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-card border-border/40 w-64"
                />
              </div>
              <Button onClick={() => handleOpenModal()} className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Stock Pick
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredPicks.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No stock picks found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/40">
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Symbol</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Company</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Risk</th>
                      <th className="text-right p-4 text-sm font-medium text-muted-foreground">Current</th>
                      <th className="text-right p-4 text-sm font-medium text-muted-foreground">Target</th>
                      <th className="text-right p-4 text-sm font-medium text-muted-foreground">Sale Price</th>
                      <th className="text-center p-4 text-sm font-medium text-muted-foreground">Active</th>
                      <th className="text-center p-4 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPicks.map((pick) => (
                      <tr key={pick.id} className="border-b border-border/40 hover:bg-muted/30">
                        <td className="p-4">
                          <div className="font-semibold">{pick.stock_symbol}</div>
                          <div className="text-xs text-muted-foreground">{pick.sector}</div>
                        </td>
                        <td className="p-4">
                          <div className="max-w-xs truncate">{pick.company || '-'}</div>
                        </td>
                        <td className="p-4">
                          <Badge className={`${getStatusColor(pick.status)} border-0`}>
                            {pick.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge className={`${getRiskColor(pick.risk_level)} border-0`}>
                            {pick.risk_level || 'N/A'}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">{formatCurrency(pick.current_price)}</td>
                        <td className="p-4 text-right">{formatCurrency(pick.target_price)}</td>
                        <td className="p-4 text-right font-semibold">{formatCurrency(pick.sale_price)}</td>
                        <td className="p-4 text-center">
                          {pick.is_active ? (
                            <Badge className="bg-green-500/10 text-green-600 border-0">Active</Badge>
                          ) : (
                            <Badge className="bg-gray-500/10 text-gray-500 border-0">Inactive</Badge>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setSelectedPick(pick); setShowViewModal(true) }}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleOpenModal(pick)}>
                                <Edit2 className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => { setSelectedPick(pick); setShowDeleteModal(true) }}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-muted-foreground">
                    Showing {filteredPicks.length > 0 ? ((page - 1) * limit) + 1 : 0}-
                    {Math.min(page * limit, total)} of {total} entries
                  </div>
                  <div className="flex items-center gap-4">
                    <select
                      value={limit}
                      onChange={(e) => setLimit(Number(e.target.value))}
                      className="h-8 px-2 rounded-md border border-border text-sm bg-background"
                    >
                      <option value={10}>10 per page</option>
                      <option value={25}>25 per page</option>
                      <option value={50}>50 per page</option>
                      <option value={100}>100 per page</option>
                    </select>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1 || loading}
                        className="h-8"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Previous
                      </Button>
                      <span className="flex items-center px-3 text-sm">
                        Page {page} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages || loading}
                        className="h-8"
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Stock Pick' : 'Create New Stock Pick'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update the stock pick information' : 'Add a new stock pick for customers'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="stock_symbol">Stock Symbol *</Label>
              <Input
                id="stock_symbol"
                value={formData.stock_symbol}
                onChange={(e) => setFormData({ ...formData, stock_symbol: e.target.value.toUpperCase() })}
                placeholder="AAPL"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Apple Inc."
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the stock pick..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="service_type">Service Type *</Label>
              <Select
                value={formData.service_type}
                onValueChange={(value) => setFormData({ ...formData, service_type: value as CustomerServiceType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CustomerServiceType.PREMIUM_STOCK_PICKS}>Premium Stock Picks</SelectItem>
                  <SelectItem value={CustomerServiceType.INTERNATIONAL_STOCK_ACCOUNT}>International Stock Account</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as StockPickStatus })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={StockPickStatus.GOOD}>Good</SelectItem>
                  <SelectItem value={StockPickStatus.VERY_GOOD}>Very Good</SelectItem>
                  <SelectItem value={StockPickStatus.EXCELLENT}>Excellent</SelectItem>
                  <SelectItem value={StockPickStatus.PENDING}>Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="availability">Availability</Label>
              <Select
                value={formData.availability}
                onValueChange={(value) => setFormData({ ...formData, availability: value as StockPickAvailability })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={StockPickAvailability.AVAILABLE}>Available</SelectItem>
                  <SelectItem value={StockPickAvailability.SOLD_OUT}>Sold Out</SelectItem>
                  <SelectItem value={StockPickAvailability.COMING_SOON}>Coming Soon</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="risk_level">Risk Level</Label>
              <Select
                value={formData.risk_level}
                onValueChange={(value) => setFormData({ ...formData, risk_level: value as StockPickRiskLevel })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={StockPickRiskLevel.LOW}>Low</SelectItem>
                  <SelectItem value={StockPickRiskLevel.MEDIUM}>Medium</SelectItem>
                  <SelectItem value={StockPickRiskLevel.HIGH}>High</SelectItem>
                  <SelectItem value={StockPickRiskLevel.VERY_HIGH}>Very High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_price">Current Price</Label>
              <Input
                id="current_price"
                type="number"
                step="0.01"
                value={formData.current_price}
                onChange={(e) => setFormData({ ...formData, current_price: parseFloat(e.target.value) || 0 })}
                placeholder="145.50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_price">Target Price</Label>
              <Input
                id="target_price"
                type="number"
                step="0.01"
                value={formData.target_price}
                onChange={(e) => setFormData({ ...formData, target_price: parseFloat(e.target.value) || 0 })}
                placeholder="165.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sale_price">Sale Price *</Label>
              <Input
                id="sale_price"
                type="number"
                step="0.01"
                value={formData.sale_price}
                onChange={(e) => setFormData({ ...formData, sale_price: parseFloat(e.target.value) || 0 })}
                placeholder="99.99"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sector">Sector</Label>
              <Input
                id="sector"
                value={formData.sector}
                onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                placeholder="Technology"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="analyst_name">Analyst Name</Label>
              <Input
                id="analyst_name"
                value={formData.analyst_name}
                onChange={(e) => setFormData({ ...formData, analyst_name: e.target.value })}
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recommendation">Recommendation</Label>
              <Select
                value={formData.recommendation}
                onValueChange={(value) => setFormData({ ...formData, recommendation: value as StockPickRecommendation })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={StockPickRecommendation.STRONG_BUY}>Strong Buy</SelectItem>
                  <SelectItem value={StockPickRecommendation.BUY}>Buy</SelectItem>
                  <SelectItem value={StockPickRecommendation.HOLD}>Hold</SelectItem>
                  <SelectItem value={StockPickRecommendation.SELL}>Sell</SelectItem>
                  <SelectItem value={StockPickRecommendation.STRONG_SELL}>Strong Sell</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expected_return_min">Min Expected Return (%)</Label>
              <Input
                id="expected_return_min"
                type="number"
                step="0.01"
                value={formData.expected_return_min_percent}
                onChange={(e) => setFormData({ ...formData, expected_return_min_percent: parseFloat(e.target.value) || 0 })}
                placeholder="15.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expected_return_max">Max Expected Return (%)</Label>
              <Input
                id="expected_return_max"
                type="number"
                step="0.01"
                value={formData.expected_return_max_percent}
                onChange={(e) => setFormData({ ...formData, expected_return_max_percent: parseFloat(e.target.value) || 0 })}
                placeholder="35.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time_horizon_min">Min Time Horizon (months)</Label>
              <Input
                id="time_horizon_min"
                type="number"
                value={formData.time_horizon_min_months}
                onChange={(e) => setFormData({ ...formData, time_horizon_min_months: parseInt(e.target.value) || 1 })}
                placeholder="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time_horizon_max">Max Time Horizon (months)</Label>
              <Input
                id="time_horizon_max"
                type="number"
                value={formData.time_horizon_max_months}
                onChange={(e) => setFormData({ ...formData, time_horizon_max_months: parseInt(e.target.value) || 12 })}
                placeholder="12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tier_label">Tier Label</Label>
              <Select
                value={formData.tier_label}
                onValueChange={(value) => setFormData({ ...formData, tier_label: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="budget">Budget</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="elite">Elite</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expires_at">Expires At</Label>
              <Input
                id="expires_at"
                type="date"
                value={formData.expires_at}
                onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
              />
            </div>

            <div className="space-y-2 flex items-center gap-2">
              <input
                id="email_delivery"
                type="checkbox"
                checked={formData.email_delivery}
                onChange={(e) => setFormData({ ...formData, email_delivery: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="email_delivery" className="cursor-pointer">Email Delivery Enabled</Label>
            </div>

            <div className="space-y-2 flex items-center gap-2">
              <input
                id="is_active"
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="is_active" className="cursor-pointer">Active</Label>
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="admin_notes">Admin Notes (Internal)</Label>
              <Textarea
                id="admin_notes"
                value={formData.admin_notes}
                onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
                placeholder="Internal notes for admin reference..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditing ? 'Update' : 'Create'} Stock Pick
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete stock pick <strong>{selectedPick?.stock_symbol}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Stock Pick Details</DialogTitle>
          </DialogHeader>
          {selectedPick && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3 border-b pb-2">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-xs">Stock Symbol</Label>
                    <p className="font-bold text-xl">{selectedPick.stock_symbol}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Company Name</Label>
                    <p className="font-semibold">{selectedPick.company || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Service Type</Label>
                    <Badge variant="outline" className="mt-1">
                      {selectedPick.service_type?.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Sector</Label>
                    <p className="font-semibold">{selectedPick.sector || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Status Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3 border-b pb-2">Status & Availability</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-xs">Status</Label>
                    <div className="mt-1">
                      <Badge className={`${getStatusColor(selectedPick.status)}`}>
                        {selectedPick.status?.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Availability</Label>
                    <div className="mt-1">
                      <Badge variant="outline">
                        {selectedPick.availability?.replace('_', ' ').toUpperCase() || 'N/A'}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Active Status</Label>
                    <div className="mt-1">
                      {selectedPick.is_active ? (
                        <Badge className="bg-green-500/10 text-green-600">Active</Badge>
                      ) : (
                        <Badge className="bg-gray-500/10 text-gray-500">Inactive</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3 border-b pb-2">Price Information</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-xs">Current Price</Label>
                    <p className="font-semibold text-lg">${formatCompactCurrency(selectedPick.current_price) || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Target Price</Label>
                    <p className="font-semibold text-lg text-green-600">${formatCompactCurrency(selectedPick.target_price) || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Sale Price</Label>
                    <p className="font-bold text-xl text-primary">${formatCompactCurrency(selectedPick.sale_price)}</p>
                  </div>
                </div>
              </div>

              {/* Analysis Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3 border-b pb-2">Analysis & Recommendation</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-xs">Risk Level</Label>
                    <div className="mt-1">
                      <Badge className={`${getRiskColor(selectedPick.risk_level)}`}>
                        {selectedPick.risk_level?.toUpperCase() || 'N/A'}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Recommendation</Label>
                    <div className="mt-1">
                      <Badge variant="outline">
                        {selectedPick.recommendation?.replace('_', ' ').toUpperCase() || 'N/A'}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Tier Label</Label>
                    <div className="mt-1">
                      <Badge variant="outline">
                        {selectedPick.tier_label?.toUpperCase() || 'N/A'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expected Returns */}
              {(selectedPick.expected_return_min_percent !== null || selectedPick.expected_return_max_percent !== null) && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 border-b pb-2">Expected Returns</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground text-xs">Minimum Expected Return</Label>
                      <p className="font-semibold text-green-600">
                        {selectedPick.expected_return_min_percent !== null ? `${selectedPick.expected_return_min_percent}%` : '-'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Maximum Expected Return</Label>
                      <p className="font-semibold text-green-600">
                        {selectedPick.expected_return_max_percent !== null ? `${selectedPick.expected_return_max_percent}%` : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Time Horizon */}
              {(selectedPick.time_horizon_min_months !== null || selectedPick.time_horizon_max_months !== null) && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 border-b pb-2">Investment Horizon</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground text-xs">Minimum Period</Label>
                      <p className="font-semibold">
                        {selectedPick.time_horizon_min_months !== null ? `${selectedPick.time_horizon_min_months} months` : '-'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Maximum Period</Label>
                      <p className="font-semibold">
                        {selectedPick.time_horizon_max_months !== null ? `${selectedPick.time_horizon_max_months} months` : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Analyst Information */}
              {selectedPick.analyst_name && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 border-b pb-2">Analyst Information</h3>
                  <div>
                    <Label className="text-muted-foreground text-xs">Analyst Name</Label>
                    <p className="font-semibold">{selectedPick.analyst_name}</p>
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold mb-3 border-b pb-2">Description</h3>
                <p className="text-sm whitespace-pre-wrap bg-muted/30 p-3 rounded-md">{selectedPick.description}</p>
              </div>

              {/* Key Points */}
              {selectedPick.key_points && selectedPick.key_points.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 border-b pb-2">Key Investment Points</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedPick.key_points.map((point, index) => (
                      <li key={index} className="text-sm">{point}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Admin Notes */}
              {selectedPick.admin_notes && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 border-b pb-2">Admin Notes (Internal)</h3>
                  <p className="text-sm bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md whitespace-pre-wrap border border-yellow-200 dark:border-yellow-800">
                    {selectedPick.admin_notes}
                  </p>
                </div>
              )}

              {/* Delivery & Expiration */}
              <div>
                <h3 className="text-lg font-semibold mb-3 border-b pb-2">Delivery & Expiration</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-xs">Email Delivery</Label>
                    <div className="mt-1">
                      {selectedPick.email_delivery ? (
                        <Badge className="bg-green-500/10 text-green-600">Enabled</Badge>
                      ) : (
                        <Badge className="bg-gray-500/10 text-gray-500">Disabled</Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Expires At</Label>
                    <p className="font-semibold">
                      {selectedPick.expires_at ? new Date(selectedPick.expires_at).toLocaleDateString() : 'No expiration'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div>
                <h3 className="text-lg font-semibold mb-3 border-b pb-2">System Information</h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <Label className="text-muted-foreground text-xs">Created At</Label>
                    <p className="font-mono">{new Date(selectedPick.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Last Updated</Label>
                    <p className="font-mono">{new Date(selectedPick.updated_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowViewModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
