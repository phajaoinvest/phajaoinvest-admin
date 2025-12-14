'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { MapPin, Globe, Loader2, RefreshCw, ChevronRight, Plus, Pencil } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { apiClient } from '@/lib/api'
import type { Country, Province } from '@/lib/types'
import { LocationStatus } from '@/lib/types'

interface ProvinceFormData {
  name: string
  country_id: string
  status: LocationStatus
}

export default function ProvincesPage() {
  const { toast } = useToast()

  // Loading states
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Data
  const [provinces, setProvinces] = useState<Province[]>([])
  const [allCountries, setAllCountries] = useState<Country[]>([])

  // Pagination state
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [totalPages, setTotalPages] = useState(1)

  // Filter
  const [selectedCountry, setSelectedCountry] = useState<string>('all')

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProvince, setEditingProvince] = useState<Province | null>(null)
  const [formData, setFormData] = useState<ProvinceFormData>({
    name: '',
    country_id: '',
    status: LocationStatus.ACTIVE,
  })

  // Prevent double-fetch on mount
  const hasFetched = useRef(false)
  const hasFetchedCountries = useRef(false)

  // Fetch all countries for dropdown
  const fetchAllCountries = useCallback(async () => {
    try {
      const params: Record<string, string | number | boolean | undefined> = {
        page: 1,
        limit: 1000,
      }
      const res = await apiClient.getPaginated<Country>('/countries', params)
      setAllCountries(res.data ?? [])
    } catch (error) {
      // Silently fail for dropdown data
    }
  }, [])

  // Fetch provinces
  const fetchProvinces = useCallback(async (currentPage: number, currentLimit: number, countryId?: string) => {
    try {
      setLoading(true)
      const params: Record<string, string | number | boolean | undefined> = {
        country_id: countryId && countryId !== 'all' ? countryId : undefined,
        page: currentPage,
        limit: currentLimit,
        include_inactive: true,
      }
      const res = await apiClient.getPaginated<Province>('/provinces', params)
      setProvinces(res.data ?? [])
      setTotalPages(res.totalPages || 1)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch provinces',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Initial fetch
  useEffect(() => {
    if (!hasFetchedCountries.current) {
      hasFetchedCountries.current = true
      fetchAllCountries()
    }
    if (!hasFetched.current) {
      hasFetched.current = true
      fetchProvinces(page, limit, selectedCountry)
    }
  }, [fetchAllCountries, fetchProvinces, page, limit, selectedCountry])

  // Handle country filter change
  const handleCountryFilterChange = (value: string) => {
    setSelectedCountry(value)
    setPage(1)
    fetchProvinces(1, limit, value)
  }

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    fetchProvinces(newPage, limit, selectedCountry)
  }

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit)
    setPage(1)
    fetchProvinces(1, newLimit, selectedCountry)
  }

  const handleRefresh = () => {
    fetchProvinces(page, limit, selectedCountry)
  }

  // Open dialog for adding
  const handleAdd = () => {
    setEditingProvince(null)
    setFormData({
      name: '',
      country_id: allCountries.length > 0 ? allCountries[0].id : '',
      status: LocationStatus.ACTIVE,
    })
    setDialogOpen(true)
  }

  // Open dialog for editing
  const handleEdit = (province: Province) => {
    setEditingProvince(province)
    setFormData({
      name: province.name,
      country_id: province.country_id,
      status: province.status,
    })
    setDialogOpen(true)
  }

  // Save (create or update)
  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Province name is required',
        variant: 'destructive',
      })
      return
    }
    if (!formData.country_id) {
      toast({
        title: 'Validation Error',
        description: 'Country is required',
        variant: 'destructive',
      })
      return
    }

    try {
      setSaving(true)
      if (editingProvince) {
        // Update
        await apiClient.request<Province>(`/provinces/${editingProvince.id}`, {
          method: 'PATCH',
          body: JSON.stringify(formData),
        })
        toast({
          title: 'Success',
          description: 'Province updated successfully',
        })
      } else {
        // Create
        await apiClient.request<Province>('/provinces', {
          method: 'POST',
          body: JSON.stringify(formData),
        })
        toast({
          title: 'Success',
          description: 'Province created successfully',
        })
      }
      setDialogOpen(false)
      fetchProvinces(page, limit, selectedCountry)
    } catch (error) {
      toast({
        title: 'Error',
        description: editingProvince ? 'Failed to update province' : 'Failed to create province',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  // Get status badge
  const getStatusBadge = (status: LocationStatus) => {
    return (
      <Badge
        variant={status === LocationStatus.ACTIVE ? 'default' : 'secondary'}
        className={status === LocationStatus.ACTIVE ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
      >
        {status}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Provinces</h1>
          <p className="text-muted-foreground">
            Manage provinces/states in the system
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add Province
          </Button>
        </div>
      </div>

      {/* Provinces Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Provinces List
              </CardTitle>
              <CardDescription>
                All provinces/states available in the system
              </CardDescription>
            </div>
            <Select value={selectedCountry} onValueChange={handleCountryFilterChange}>
              <SelectTrigger className="w-[200px]">
                <Globe className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {allCountries.map((country) => (
                  <SelectItem key={country.id} value={country.id}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {/* Pagination Controls */}
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">
              Page {page} / {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={String(limit)}
                onValueChange={(v) => handleLimitChange(Number(v))}
                disabled={loading}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Limit" />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 50, 100].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} / page
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => handlePageChange(page - 1)}
                disabled={loading || page <= 1}
              >
                Prev
              </Button>
              <Button
                variant="outline"
                onClick={() => handlePageChange(page + 1)}
                disabled={loading || page >= totalPages}
              >
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : provinces.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-muted-foreground">
              <MapPin className="mb-4 h-12 w-12" />
              <p>No provinces found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {provinces.map((province) => (
                  <TableRow key={province.id}>
                    <TableCell className="font-mono text-xs">
                      {province.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell className="font-medium">{province.name}</TableCell>
                    <TableCell>
                      {allCountries.find((c) => c.id === province.country_id)?.name ||
                        province.country_id?.slice(0, 8) + '...'}
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(province.status)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(province.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(province)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingProvince ? 'Edit Province' : 'Add Province'}
            </DialogTitle>
            <DialogDescription>
              {editingProvince
                ? 'Update the province details below.'
                : 'Enter the details for the new province.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter province name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select
                value={formData.country_id}
                onValueChange={(v) => setFormData({ ...formData, country_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {allCountries.map((country) => (
                    <SelectItem key={country.id} value={country.id}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData({ ...formData, status: v as LocationStatus })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={LocationStatus.ACTIVE}>Active</SelectItem>
                  <SelectItem value={LocationStatus.INACTIVE}>Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingProvince ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
