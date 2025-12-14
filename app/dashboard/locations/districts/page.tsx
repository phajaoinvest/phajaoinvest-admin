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
import { Building, MapPin, Globe, Loader2, RefreshCw, ChevronRight, Plus, Pencil } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { apiClient } from '@/lib/api'
import type { Country, Province, District } from '@/lib/types'
import { LocationStatus } from '@/lib/types'

interface DistrictFormData {
  name: string
  province_id: string
  postcode: string
  status: LocationStatus
}

export default function DistrictsPage() {
  const { toast } = useToast()

  // Loading states
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Data
  const [districts, setDistricts] = useState<District[]>([])
  const [allCountries, setAllCountries] = useState<Country[]>([])
  const [allProvinces, setAllProvinces] = useState<Province[]>([])
  const [filteredProvinces, setFilteredProvinces] = useState<Province[]>([])

  // Pagination state
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [totalPages, setTotalPages] = useState(1)

  // Filters
  const [selectedCountry, setSelectedCountry] = useState<string>('all')
  const [selectedProvince, setSelectedProvince] = useState<string>('all')

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingDistrict, setEditingDistrict] = useState<District | null>(null)
  const [formData, setFormData] = useState<DistrictFormData>({
    name: '',
    province_id: '',
    postcode: '',
    status: LocationStatus.ACTIVE,
  })
  const [formFilteredProvinces, setFormFilteredProvinces] = useState<Province[]>([])
  const [formSelectedCountry, setFormSelectedCountry] = useState<string>('')

  // Prevent double-fetch on mount
  const hasFetched = useRef(false)
  const hasFetchedCountries = useRef(false)
  const hasFetchedProvinces = useRef(false)

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

  // Fetch all provinces for dropdown
  const fetchAllProvinces = useCallback(async () => {
    try {
      const params: Record<string, string | number | boolean | undefined> = {
        page: 1,
        limit: 1000,
      }
      const res = await apiClient.getPaginated<Province>('/provinces', params)
      setAllProvinces(res.data ?? [])
      setFilteredProvinces(res.data ?? [])
    } catch (error) {
      // Silently fail for dropdown data
    }
  }, [])

  // Fetch districts
  const fetchDistricts = useCallback(async (currentPage: number, currentLimit: number, provinceId?: string) => {
    try {
      setLoading(true)
      const params: Record<string, string | number | boolean | undefined> = {
        province_id: provinceId && provinceId !== 'all' ? provinceId : undefined,
        page: currentPage,
        limit: currentLimit,
        include_inactive: true,
      }
      const res = await apiClient.getPaginated<District>('/districts', params)
      setDistricts(res.data ?? [])
      setTotalPages(res.totalPages || 1)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch districts',
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
    if (!hasFetchedProvinces.current) {
      hasFetchedProvinces.current = true
      fetchAllProvinces()
    }
    if (!hasFetched.current) {
      hasFetched.current = true
      fetchDistricts(page, limit, selectedProvince)
    }
  }, [fetchAllCountries, fetchAllProvinces, fetchDistricts, page, limit, selectedProvince])

  // Handle country filter change - filter provinces dropdown
  const handleCountryFilterChange = (value: string) => {
    setSelectedCountry(value)
    setSelectedProvince('all')
    setPage(1)

    if (value === 'all') {
      setFilteredProvinces(allProvinces)
      fetchDistricts(1, limit, 'all')
    } else {
      const provincesInCountry = allProvinces.filter((p) => p.country_id === value)
      setFilteredProvinces(provincesInCountry)
      fetchDistricts(1, limit, 'all')
    }
  }

  // Handle province filter change
  const handleProvinceFilterChange = (value: string) => {
    setSelectedProvince(value)
    setPage(1)
    fetchDistricts(1, limit, value)
  }

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    fetchDistricts(newPage, limit, selectedProvince)
  }

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit)
    setPage(1)
    fetchDistricts(1, newLimit, selectedProvince)
  }

  const handleRefresh = () => {
    fetchDistricts(page, limit, selectedProvince)
  }

  // Open dialog for adding
  const handleAdd = () => {
    setEditingDistrict(null)
    setFormSelectedCountry(allCountries.length > 0 ? allCountries[0].id : '')
    const provincesInCountry = allCountries.length > 0 
      ? allProvinces.filter((p) => p.country_id === allCountries[0].id)
      : allProvinces
    setFormFilteredProvinces(provincesInCountry)
    setFormData({
      name: '',
      province_id: provincesInCountry.length > 0 ? provincesInCountry[0].id : '',
      postcode: '',
      status: LocationStatus.ACTIVE,
    })
    setDialogOpen(true)
  }

  // Open dialog for editing
  const handleEdit = (district: District) => {
    setEditingDistrict(district)
    const province = allProvinces.find((p) => p.id === district.province_id)
    const countryId = province?.country_id || ''
    setFormSelectedCountry(countryId)
    const provincesInCountry = allProvinces.filter((p) => p.country_id === countryId)
    setFormFilteredProvinces(provincesInCountry)
    setFormData({
      name: district.name,
      province_id: district.province_id,
      postcode: district.postcode?.toString() || '',
      status: district.status,
    })
    setDialogOpen(true)
  }

  // Handle form country change
  const handleFormCountryChange = (countryId: string) => {
    setFormSelectedCountry(countryId)
    const provincesInCountry = allProvinces.filter((p) => p.country_id === countryId)
    setFormFilteredProvinces(provincesInCountry)
    setFormData({
      ...formData,
      province_id: provincesInCountry.length > 0 ? provincesInCountry[0].id : '',
    })
  }

  // Save (create or update)
  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'District name is required',
        variant: 'destructive',
      })
      return
    }
    if (!formData.province_id) {
      toast({
        title: 'Validation Error',
        description: 'Province is required',
        variant: 'destructive',
      })
      return
    }

    try {
      setSaving(true)
      const payload = {
        name: formData.name,
        province_id: formData.province_id,
        postcode: formData.postcode ? parseInt(formData.postcode) : null,
        status: formData.status,
      }

      if (editingDistrict) {
        // Update
        await apiClient.request<District>(`/districts/${editingDistrict.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        })
        toast({
          title: 'Success',
          description: 'District updated successfully',
        })
      } else {
        // Create
        await apiClient.request<District>('/districts', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
        toast({
          title: 'Success',
          description: 'District created successfully',
        })
      }
      setDialogOpen(false)
      fetchDistricts(page, limit, selectedProvince)
    } catch (error) {
      toast({
        title: 'Error',
        description: editingDistrict ? 'Failed to update district' : 'Failed to create district',
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
          <h1 className="text-3xl font-bold tracking-tight">Districts</h1>
          <p className="text-muted-foreground">
            Manage districts in the system
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
            Add District
          </Button>
        </div>
      </div>

      {/* Districts Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Districts List
              </CardTitle>
              <CardDescription>
                All districts available in the system
              </CardDescription>
            </div>
            {/* Filters */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
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
              <Select value={selectedProvince} onValueChange={handleProvinceFilterChange}>
                <SelectTrigger className="w-[200px]">
                  <MapPin className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by province" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Provinces</SelectItem>
                  {filteredProvinces.map((province) => (
                    <SelectItem key={province.id} value={province.id}>
                      {province.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
          ) : districts.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-muted-foreground">
              <Building className="mb-4 h-12 w-12" />
              <p>No districts found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Postcode</TableHead>
                  <TableHead>Province</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {districts.map((district) => {
                  const province = allProvinces.find((p) => p.id === district.province_id)
                  const country = province ? allCountries.find((c) => c.id === province.country_id) : null
                  return (
                    <TableRow key={district.id}>
                      <TableCell className="font-mono text-xs">
                        {district.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell className="font-medium">{district.name}</TableCell>
                      <TableCell>{district.postcode || '-'}</TableCell>
                      <TableCell>
                        {province?.name || district.province_id?.slice(0, 8) + '...'}
                      </TableCell>
                      <TableCell>
                        {country?.name || '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(district.status)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(district.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(district)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
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
              {editingDistrict ? 'Edit District' : 'Add District'}
            </DialogTitle>
            <DialogDescription>
              {editingDistrict
                ? 'Update the district details below.'
                : 'Enter the details for the new district.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter district name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="form-country">Country</Label>
              <Select
                value={formSelectedCountry}
                onValueChange={handleFormCountryChange}
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
              <Label htmlFor="province">Province</Label>
              <Select
                value={formData.province_id}
                onValueChange={(v) => setFormData({ ...formData, province_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select province" />
                </SelectTrigger>
                <SelectContent>
                  {formFilteredProvinces.map((province) => (
                    <SelectItem key={province.id} value={province.id}>
                      {province.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="postcode">Postcode</Label>
              <Input
                id="postcode"
                value={formData.postcode}
                onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                placeholder="Enter postcode (optional)"
                type="number"
              />
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
              {editingDistrict ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
