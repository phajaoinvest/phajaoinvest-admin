'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useDashboardStore, StockPick } from '@/lib/dashboard-store'
import { Plus, Search, MoreVertical, Eye, Edit2, Trash2, TrendingUp, DollarSign, Target, X, Calendar } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function StockPicksPage() {
  const stockPicks = useDashboardStore((state) => state.stockPicks)
  const addStockPick = useDashboardStore((state) => state.addStockPick)
  const updateStockPick = useDashboardStore((state) => state.updateStockPick)
  const deleteStockPick = useDashboardStore((state) => state.deleteStockPick)

  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedPick, setSelectedPick] = useState<StockPick | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const [formData, setFormData] = useState({
    stock_symbol: '',
    company: '',
    description: '',
    status: 'pending' as 'pending' | 'approved' | 'rejected',
    availability: 'available' as 'available' | 'sold_out' | 'coming_soon',
    service_type: '',
    current_price: '',
    target_price: '',
    sale_price: '',
    risk_level: 'medium' as 'low' | 'medium' | 'high' | 'very_high' | null,
    expected_return_min: '',
    expected_return_max: '',
    time_horizon_min_months: '',
    time_horizon_max_months: '',
    sector: '',
    analyst_name: '',
    tier_label: '',
    recommendation: 'hold' as 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell' | null,
    admin_notes: '',
    key_points: '',
    expires_at: '',
    is_active: true,
    email_delivery: true,
  })

  const itemsPerPage = 10

  const filteredPicks = stockPicks.filter(
    (pick) =>
      pick.stock_symbol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pick.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pick.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredPicks.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedPicks = filteredPicks.slice(startIndex, startIndex + itemsPerPage)

  const handleOpenModal = (pick?: StockPick) => {
    if (pick) {
      setIsEditing(true)
      setSelectedPick(pick)
      setFormData({
        stock_symbol: pick.stock_symbol,
        company: pick.company || '',
        description: pick.description,
        status: pick.status,
        availability: pick.availability,
        service_type: pick.service_type,
        current_price: pick.current_price?.toString() || '',
        target_price: pick.target_price?.toString() || '',
        sale_price: pick.sale_price?.toString() || '',
        risk_level: pick.risk_level,
        expected_return_min: pick.expected_return_min?.toString() || '',
        expected_return_max: pick.expected_return_max?.toString() || '',
        time_horizon_min_months: pick.time_horizon_min_months?.toString() || '',
        time_horizon_max_months: pick.time_horizon_max_months?.toString() || '',
        sector: pick.sector || '',
        analyst_name: pick.analyst_name || '',
        tier_label: pick.tier_label || '',
        recommendation: pick.recommendation,
        admin_notes: pick.admin_notes || '',
        key_points: pick.key_points?.join('\n') || '',
        expires_at: pick.expires_at ? pick.expires_at.split('T')[0] : '',
        is_active: pick.is_active,
        email_delivery: pick.email_delivery,
      })
    } else {
      setIsEditing(false)
      setSelectedPick(null)
      setFormData({
        stock_symbol: '',
        company: '',
        description: '',
        status: 'pending',
        availability: 'available',
        service_type: '',
        current_price: '',
        target_price: '',
        sale_price: '',
        risk_level: 'medium',
        expected_return_min: '',
        expected_return_max: '',
        time_horizon_min_months: '',
        time_horizon_max_months: '',
        sector: '',
        analyst_name: '',
        tier_label: '',
        recommendation: 'hold',
        admin_notes: '',
        key_points: '',
        expires_at: '',
        is_active: true,
        email_delivery: true,
      })
    }
    setShowModal(true)
  }

  const handleSubmit = () => {
    const pickData = {
      stock_symbol: formData.stock_symbol,
      company: formData.company || null,
      description: formData.description,
      status: formData.status,
      availability: formData.availability,
      service_type: formData.service_type,
      created_by_admin_id: 's1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c',
      current_price: formData.current_price ? parseFloat(formData.current_price) : null,
      target_price: formData.target_price ? parseFloat(formData.target_price) : null,
      sale_price: formData.sale_price ? parseFloat(formData.sale_price) : 0,
      risk_level: formData.risk_level,
      expected_return_min: formData.expected_return_min ? parseFloat(formData.expected_return_min) : null,
      expected_return_max: formData.expected_return_max ? parseFloat(formData.expected_return_max) : null,
      time_horizon_min_months: formData.time_horizon_min_months ? parseInt(formData.time_horizon_min_months) : null,
      time_horizon_max_months: formData.time_horizon_max_months ? parseInt(formData.time_horizon_max_months) : null,
      sector: formData.sector || null,
      analyst_name: formData.analyst_name || null,
      tier_label: formData.tier_label || null,
      recommendation: formData.recommendation,
      admin_notes: formData.admin_notes || null,
      key_points: formData.key_points ? formData.key_points.split('\n').filter(p => p.trim()) : null,
      expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
      is_active: formData.is_active,
      email_delivery: formData.email_delivery,
    }

    if (isEditing && selectedPick) {
      updateStockPick(selectedPick.id, pickData)
    } else {
      addStockPick(pickData as any)
    }
    setShowModal(false)
  }

  const handleDelete = () => {
    if (selectedPick) {
      deleteStockPick(selectedPick.id)
      setShowDeleteModal(false)
      setSelectedPick(null)
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
      case 'approved': return 'bg-green-500/10 text-green-600'
      case 'pending': return 'bg-yellow-500/10 text-yellow-600'
      case 'rejected': return 'bg-red-500/10 text-red-600'
      default: return 'bg-gray-500/10 text-gray-500'
    }
  }

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-500/10 text-green-600'
      case 'sold_out': return 'bg-red-500/10 text-red-600'
      case 'coming_soon': return 'bg-blue-500/10 text-blue-600'
      default: return 'bg-gray-500/10 text-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border/40 rounded-sm">
          <CardContent className="py-0 px-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Picks</p>
                <p className="text-md font-bold mt-1">{stockPicks.length}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/40 rounded-sm">
          <CardContent className="py-0 px-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Available</p>
                <p className="text-md font-bold mt-1 text-green-600">
                  {stockPicks.filter(p => p.availability === 'available').length}
                </p>
              </div>
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Target className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/40 rounded-sm">
          <CardContent className="py-0 px-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Approved</p>
                <p className="text-md font-bold mt-1 text-blue-600">
                  {stockPicks.filter(p => p.status === 'approved').length}
                </p>
              </div>
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/40 rounded-sm">
          <CardContent className="py-0 px-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Avg Sale Price</p>
                <p className="text-md font-bold mt-1">
                  ${(stockPicks.reduce((sum, p) => sum + p.sale_price, 0) / stockPicks.length || 0).toFixed(2)}
                </p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <DollarSign className="w-4 h-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="bg-card border-border/40">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-md">Stock Picks Management</CardTitle>
              <CardDescription className='text-xs'>Manage stocks available for sale to customers</CardDescription>
            </div>
            <div className="mb-4 flex items-start justify-start gap-6">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by symbol, company, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-card border-border/40 h-9"
                />
              </div>
              <Button onClick={() => handleOpenModal()} className="bg-primary hover:bg-primary/90 h-9 text-white">
                <Plus className="w-4 h-4" />
                Add Stock Pick
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">No</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Symbol</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Company</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Availability</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Current</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Target</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Sale Price</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Risk</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPicks.map((pick, index: number) => (
                  <tr key={pick.id} className="border-b border-border/20 hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4">{index + 1}</td>
                    <td className="py-3 px-4 font-bold text-primary">{pick.stock_symbol}</td>
                    <td className="py-3 px-4">{pick.company || '-'}</td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusColor(pick.status)}>
                        {pick.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={getAvailabilityColor(pick.availability)}>
                        {pick.availability.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">${pick.current_price?.toFixed(2) || '-'}</td>
                    <td className="py-3 px-4 text-right">${pick.target_price?.toFixed(2) || '-'}</td>
                    <td className="py-3 px-4 text-right font-medium">${pick.sale_price.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      {pick.risk_level && (
                        <Badge className={getRiskColor(pick.risk_level)}>
                          {pick.risk_level}
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border-border">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedPick(pick)
                              setShowViewModal(true)
                            }}
                            className="cursor-pointer"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleOpenModal(pick)}
                            className="cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedPick(pick)
                              setShowDeleteModal(true)
                            }}
                            className="cursor-pointer text-destructive"
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
            {paginatedPicks.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No stock picks found
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/40">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredPicks.length)} of{' '}
                {filteredPicks.length} results
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="border-border/40"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="border-border/40"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border">
            <CardHeader>
              <CardTitle>{isEditing ? 'Edit Stock Pick' : 'Add New Stock Pick'}</CardTitle>
              <CardDescription>
                {isEditing ? 'Update stock pick details' : 'Fill in the details to add a new stock pick'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Stock Symbol *</label>
                  <Input
                    value={formData.stock_symbol}
                    onChange={(e) => setFormData({ ...formData, stock_symbol: e.target.value.toUpperCase() })}
                    placeholder="e.g., AAPL"
                    className="bg-background border-border/40"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Company Name</label>
                  <Input
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g., Apple Inc."
                    className="bg-background border-border/40"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the stock pick..."
                  className="w-full min-h-[80px] px-3 py-2 text-sm rounded-md border border-border/40 bg-background"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm rounded-md border border-border/40 bg-background"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Availability *</label>
                  <select
                    value={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm rounded-md border border-border/40 bg-background"
                  >
                    <option value="available">Available</option>
                    <option value="sold_out">Sold Out</option>
                    <option value="coming_soon">Coming Soon</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Service Type *</label>
                  <Input
                    value={formData.service_type}
                    onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                    placeholder="e.g., premium, elite"
                    className="bg-background border-border/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Current Price ($)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.current_price}
                    onChange={(e) => setFormData({ ...formData, current_price: e.target.value })}
                    placeholder="0.00"
                    className="bg-background border-border/40"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Target Price ($)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.target_price}
                    onChange={(e) => setFormData({ ...formData, target_price: e.target.value })}
                    placeholder="0.00"
                    className="bg-background border-border/40"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Sale Price ($) *</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.sale_price}
                    onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                    placeholder="0.00"
                    className="bg-background border-border/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Risk Level</label>
                  <select
                    value={formData.risk_level || ''}
                    onChange={(e) => setFormData({ ...formData, risk_level: e.target.value as any || null })}
                    className="w-full px-3 py-2 text-sm rounded-md border border-border/40 bg-background"
                  >
                    <option value="">Select risk level</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="very_high">Very High</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Recommendation</label>
                  <select
                    value={formData.recommendation || ''}
                    onChange={(e) => setFormData({ ...formData, recommendation: e.target.value as any || null })}
                    className="w-full px-3 py-2 text-sm rounded-md border border-border/40 bg-background"
                  >
                    <option value="">Select recommendation</option>
                    <option value="strong_buy">Strong Buy</option>
                    <option value="buy">Buy</option>
                    <option value="hold">Hold</option>
                    <option value="sell">Sell</option>
                    <option value="strong_sell">Strong Sell</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Expected Return Min (%)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.expected_return_min}
                    onChange={(e) => setFormData({ ...formData, expected_return_min: e.target.value })}
                    placeholder="0.00"
                    className="bg-background border-border/40"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Expected Return Max (%)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.expected_return_max}
                    onChange={(e) => setFormData({ ...formData, expected_return_max: e.target.value })}
                    placeholder="0.00"
                    className="bg-background border-border/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Time Horizon Min (months)</label>
                  <Input
                    type="number"
                    value={formData.time_horizon_min_months}
                    onChange={(e) => setFormData({ ...formData, time_horizon_min_months: e.target.value })}
                    placeholder="0"
                    className="bg-background border-border/40"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Time Horizon Max (months)</label>
                  <Input
                    type="number"
                    value={formData.time_horizon_max_months}
                    onChange={(e) => setFormData({ ...formData, time_horizon_max_months: e.target.value })}
                    placeholder="0"
                    className="bg-background border-border/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Sector</label>
                  <Input
                    value={formData.sector}
                    onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                    placeholder="e.g., Technology"
                    className="bg-background border-border/40"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Analyst Name</label>
                  <Input
                    value={formData.analyst_name}
                    onChange={(e) => setFormData({ ...formData, analyst_name: e.target.value })}
                    placeholder="Analyst name"
                    className="bg-background border-border/40"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Tier Label</label>
                  <Input
                    value={formData.tier_label}
                    onChange={(e) => setFormData({ ...formData, tier_label: e.target.value })}
                    placeholder="e.g., gold, platinum"
                    className="bg-background border-border/40"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Key Points (one per line)</label>
                <textarea
                  value={formData.key_points}
                  onChange={(e) => setFormData({ ...formData, key_points: e.target.value })}
                  placeholder="Enter key points, one per line..."
                  className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-border/40 bg-background"
                  rows={4}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Admin Notes</label>
                <textarea
                  value={formData.admin_notes}
                  onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
                  placeholder="Internal notes for admins..."
                  className="w-full min-h-[60px] px-3 py-2 text-sm rounded-md border border-border/40 bg-background"
                  rows={2}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Expires At</label>
                <Input
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  className="bg-background border-border/40"
                />
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Is Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.email_delivery}
                    onChange={(e) => setFormData({ ...formData, email_delivery: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Email Delivery</span>
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90">
                  {isEditing ? 'Update Stock Pick' : 'Add Stock Pick'}
                </Button>
                <Button variant="outline" onClick={() => setShowModal(false)} className="border-border/40">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* View Details Modal */}
      {showViewModal && selectedPick && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-card border-border">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{selectedPick.stock_symbol}</CardTitle>
                  <CardDescription className="text-base mt-1">{selectedPick.company}</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowViewModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                <p className="text-sm">{selectedPick.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Status</h3>
                  <Badge className={getStatusColor(selectedPick.status)}>{selectedPick.status}</Badge>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Availability</h3>
                  <Badge className={getAvailabilityColor(selectedPick.availability)}>
                    {selectedPick.availability.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Current Price</h3>
                  <p className="text-lg font-semibold">${selectedPick.current_price?.toFixed(2) || '-'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Target Price</h3>
                  <p className="text-lg font-semibold">${selectedPick.target_price?.toFixed(2) || '-'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Sale Price</h3>
                  <p className="text-lg font-semibold text-primary">${selectedPick.sale_price.toFixed(2)}</p>
                </div>
              </div>

              {selectedPick.expected_return_min && selectedPick.expected_return_max && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Expected Return</h3>
                  <p className="text-sm">
                    {selectedPick.expected_return_min}% - {selectedPick.expected_return_max}%
                  </p>
                </div>
              )}

              {selectedPick.time_horizon_min_months && selectedPick.time_horizon_max_months && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Time Horizon</h3>
                  <p className="text-sm">
                    {selectedPick.time_horizon_min_months} - {selectedPick.time_horizon_max_months} months
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {selectedPick.risk_level && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Risk Level</h3>
                    <Badge className={getRiskColor(selectedPick.risk_level)}>{selectedPick.risk_level}</Badge>
                  </div>
                )}
                {selectedPick.recommendation && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Recommendation</h3>
                    <Badge className="bg-blue-500/10 text-blue-600">
                      {selectedPick.recommendation.replace('_', ' ')}
                    </Badge>
                  </div>
                )}
              </div>

              {selectedPick.sector && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Sector</h3>
                  <p className="text-sm">{selectedPick.sector}</p>
                </div>
              )}

              {selectedPick.analyst_name && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Analyst</h3>
                  <p className="text-sm">{selectedPick.analyst_name}</p>
                </div>
              )}

              {selectedPick.key_points && selectedPick.key_points.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Key Points</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedPick.key_points.map((point, idx) => (
                      <li key={idx} className="text-sm">{point}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedPick.admin_notes && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Admin Notes</h3>
                  <p className="text-sm text-muted-foreground italic">{selectedPick.admin_notes}</p>
                </div>
              )}

              {selectedPick.expires_at && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Expires At</h3>
                  <p className="text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(selectedPick.expires_at).toLocaleDateString()}
                  </p>
                </div>
              )}

              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Active:</span>
                  <span className={selectedPick.is_active ? 'text-green-600' : 'text-red-600'}>
                    {selectedPick.is_active ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Email Delivery:</span>
                  <span className={selectedPick.email_delivery ? 'text-green-600' : 'text-red-600'}>
                    {selectedPick.email_delivery ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedPick && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-card border-border">
            <CardHeader>
              <CardTitle>Delete Stock Pick</CardTitle>
              <CardDescription>
                Are you sure you want to delete {selectedPick.stock_symbol}? This action cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  onClick={handleDelete}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  Delete
                </Button>
                <Button variant="outline" onClick={() => setShowDeleteModal(false)} className="border-border/40">
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
