'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  MoreVertical,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Building2,
  Globe,
  BarChart3,
  DollarSign,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { usePagination } from '@/hooks'
import { stocksApi, stockCategoriesApi } from '@/lib/api'
import type { Stock, StockCategory, CreateStockRequest, UpdateStockRequest } from '@/lib/types'
import { formatCurrency, formatCompactCurrency } from '@/lib/utils'

export default function StocksPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [stocks, setStocks] = useState<Stock[]>([])
  const [categories, setCategories] = useState<StockCategory[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const { page, limit, setPage, setLimit, updateFromMeta } = usePagination({ initialLimit: 10 })
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')

  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form data
  const [formData, setFormData] = useState<CreateStockRequest>({
    symbol: '',
    name: '',
    description: '',
    sector: '',
    industry: '',
    exchange: '',
    country: '',
    currency: 'USD',
    category_id: '',
  })

  // Fetch stocks
  const fetchStocks = useCallback(async () => {
    try {
      setLoading(true)
      const params: Record<string, unknown> = {
        page,
        limit,
      }
      if (searchTerm) {
        params.search = searchTerm
      }
      if (filterCategory !== 'all') {
        params.category_id = filterCategory
      }

      const response = await stocksApi.getAll(params as Parameters<typeof stocksApi.getAll>[0])
      setStocks(response.data)
      setTotal(response.total)
      setTotalPages(response.totalPages || Math.ceil(response.total / limit))
      updateFromMeta({
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch stocks',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [page, limit, searchTerm, filterCategory, toast, updateFromMeta])

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await stockCategoriesApi.getAll({ limit: 100 })
      setCategories(response.data)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }, [])

  useEffect(() => {
    fetchStocks()
    fetchCategories()
  }, [fetchStocks, fetchCategories])

  // Open create modal
  const handleOpenCreate = () => {
    setFormData({
      symbol: '',
      name: '',
      description: '',
      sector: '',
      industry: '',
      exchange: '',
      country: '',
      currency: 'USD',
      category_id: '',
    })
    setIsEditing(false)
    setShowModal(true)
  }

  // Open edit modal
  const handleOpenEdit = (stock: Stock) => {
    setFormData({
      symbol: stock.symbol,
      name: stock.name,
      description: stock.description || '',
      sector: stock.sector || '',
      industry: stock.industry || '',
      exchange: stock.exchange || '',
      country: stock.country || '',
      currency: stock.currency || 'USD',
      category_id: stock.category_id || '',
    })
    setSelectedStock(stock)
    setIsEditing(true)
    setShowModal(true)
  }

  // View stock details
  const handleViewStock = async (stock: Stock) => {
    try {
      const response = await stocksApi.getById(stock.id)
      setSelectedStock(response.data)
      setShowViewModal(true)
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to fetch stock details',
        variant: 'destructive',
      })
    }
  }

  // Submit form
  const handleSubmit = async () => {
    if (!formData.symbol || !formData.name) {
      toast({
        title: 'Validation Error',
        description: 'Symbol and name are required',
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)
    try {
      if (isEditing && selectedStock) {
        const updateData: UpdateStockRequest = {
          name: formData.name,
          description: formData.description,
          sector: formData.sector,
          industry: formData.industry,
          category_id: formData.category_id,
        }
        await stocksApi.update(selectedStock.id, updateData)
        toast({
          title: 'Success',
          description: 'Stock updated successfully',
        })
      } else {
        await stocksApi.create(formData)
        toast({
          title: 'Success',
          description: 'Stock created successfully',
        })
      }
      setShowModal(false)
      fetchStocks()
    } catch (error) {
      toast({
        title: 'Error',
        description: isEditing ? 'Failed to update stock' : 'Failed to create stock',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Delete stock
  const handleDelete = async () => {
    if (!selectedStock) return

    setSubmitting(true)
    try {
      await stocksApi.delete(selectedStock.id)
      toast({
        title: 'Success',
        description: 'Stock deleted successfully',
      })
      setShowDeleteModal(false)
      fetchStocks()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete stock',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Format price change
  const formatPriceChange = (price: number | null, change: number | null) => {
    if (!price) return '-'
    const changePercent = change ? ((change / price) * 100).toFixed(2) : '0.00'
    const isPositive = change && change > 0
    return (
      <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
        {isPositive ? '+' : ''}{changePercent}%
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stocks Management</h1>
          <p className="text-muted-foreground">
            Manage stock listings and information
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchStocks} variant="outline" disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Stock
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stocks</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stocks.filter((s) => s.is_active).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exchanges</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(stocks.map((s) => s.exchange).filter(Boolean)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by symbol or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={limit.toString()}
              onValueChange={(value) => setLimit(parseInt(value))}
            >
              <SelectTrigger className="w-full md:w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 / page</SelectItem>
                <SelectItem value="25">25 / page</SelectItem>
                <SelectItem value="50">50 / page</SelectItem>
                <SelectItem value="100">100 / page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stocks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Stocks</CardTitle>
          <CardDescription>
            Showing {stocks.length} of {total} stocks
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : stocks.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-muted-foreground">
              <BarChart3 className="mb-4 h-12 w-12" />
              <p>No stocks found</p>
              <Button variant="link" onClick={handleOpenCreate}>
                Add your first stock
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Exchange</TableHead>
                    <TableHead>Sector</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Market Cap</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stocks.map((stock) => (
                    <TableRow key={stock.id}>
                      <TableCell className="font-bold">{stock.symbol}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{stock.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{stock.exchange || 'N/A'}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {stock.sector || '-'}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {(stock.last_price || stock.current_price) ? formatCurrency(stock.last_price || stock.current_price) : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {stock.market_cap ? formatCompactCurrency(stock.market_cap) : '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={stock.is_active ? 'default' : 'secondary'}
                          className={stock.is_active ? 'bg-green-100 text-green-800' : ''}
                        >
                          {stock.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/stocks/${stock.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenEdit(stock)}>
                              <Edit2 className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                setSelectedStock(stock)
                                setShowDeleteModal(true)
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Stock' : 'Add New Stock'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update stock information' : 'Create a new stock entry'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="symbol">Symbol *</Label>
                <Input
                  id="symbol"
                  value={formData.symbol}
                  onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                  placeholder="e.g., AAPL"
                  disabled={isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Apple Inc."
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="exchange">Exchange</Label>
                <Input
                  id="exchange"
                  value={formData.exchange}
                  onChange={(e) => setFormData({ ...formData, exchange: e.target.value })}
                  placeholder="e.g., NASDAQ"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="e.g., USA"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sector">Sector</Label>
                <Input
                  id="sector"
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                  placeholder="e.g., Technology"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  placeholder="e.g., Consumer Electronics"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData({ ...formData, currency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="THB">THB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the stock..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>{isEditing ? 'Update Stock' : 'Create Stock'}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Stock Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Stock Details</DialogTitle>
            <DialogDescription>View complete stock information</DialogDescription>
          </DialogHeader>
          {selectedStock && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10 text-2xl font-bold text-primary">
                  {selectedStock.symbol?.slice(0, 2)}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedStock.symbol}</h3>
                  <p className="text-muted-foreground">{selectedStock.name}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Exchange</p>
                  <p className="font-medium">{selectedStock.exchange || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Country</p>
                  <p className="font-medium">{selectedStock.country || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sector</p>
                  <p className="font-medium">{selectedStock.sector || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Industry</p>
                  <p className="font-medium">{selectedStock.industry || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Price</p>
                  <p className="text-xl font-bold">
                    {selectedStock.current_price ? formatCurrency(selectedStock.current_price) : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Market Cap</p>
                  <p className="font-medium">
                    {selectedStock.market_cap ? formatCompactCurrency(selectedStock.market_cap) : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">P/E Ratio</p>
                  <p className="font-medium">{selectedStock.pe_ratio || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Dividend Yield</p>
                  <p className="font-medium">
                    {selectedStock.dividend_yield ? `${selectedStock.dividend_yield}%` : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={selectedStock.is_active ? 'default' : 'secondary'}>
                    {selectedStock.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Currency</p>
                  <p className="font-medium">{selectedStock.currency}</p>
                </div>
              </div>
              {selectedStock.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="mt-1 text-sm">{selectedStock.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Stock</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedStock?.symbol}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
