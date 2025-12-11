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
import { formatCurrency } from '@/lib/utils'

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
      })
    } else {
      setIsEditing(false)
      setSelectedPick(null)
      setFormData({
        stock_symbol: '',
        company: '',
        description: '',
        status: StockPickStatus.PENDING,
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
      submitData.email_delivery = formData.email_delivery

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
                        <td className="p-4 text-right">${formatCurrency(pick.current_price)}</td>
                        <td className="p-4 text-right">${formatCurrency(pick.target_price)}</td>
                        <td className="p-4 text-right font-semibold">${formatCurrency(pick.sale_price)}</td>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Stock Pick Details</DialogTitle>
          </DialogHeader>
          {selectedPick && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Symbol</Label>
                  <p className="font-semibold text-lg">{selectedPick.stock_symbol}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Company</Label>
                  <p className="font-semibold">{selectedPick.company || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge className={`${getStatusColor(selectedPick.status)} mt-1`}>
                    {selectedPick.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Risk Level</Label>
                  <Badge className={`${getRiskColor(selectedPick.risk_level)} mt-1`}>
                    {selectedPick.risk_level || 'N/A'}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Current Price</Label>
                  <p className="font-semibold">${selectedPick.current_price?.toFixed(2) || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Target Price</Label>
                  <p className="font-semibold">${selectedPick.target_price?.toFixed(2) || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Sale Price</Label>
                  <p className="font-semibold text-lg text-primary">${selectedPick.sale_price.toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Sector</Label>
                  <p className="font-semibold">{selectedPick.sector || '-'}</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p className="mt-1">{selectedPick.description}</p>
              </div>
              {selectedPick.admin_notes && (
                <div>
                  <Label className="text-muted-foreground">Admin Notes</Label>
                  <p className="mt-1 text-sm">{selectedPick.admin_notes}</p>
                </div>
              )}
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
