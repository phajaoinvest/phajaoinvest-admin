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
import { Globe, Loader2, RefreshCw, ChevronRight, Plus, Pencil } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { apiClient } from '@/lib/api'
import type { Country } from '@/lib/types'
import { LocationStatus } from '@/lib/types'

interface CountryFormData {
  name: string
  status: LocationStatus
}

export default function CountriesPage() {
  const { toast } = useToast()

  // Loading states
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Data
  const [countries, setCountries] = useState<Country[]>([])

  // Pagination state
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [totalPages, setTotalPages] = useState(1)

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCountry, setEditingCountry] = useState<Country | null>(null)
  const [formData, setFormData] = useState<CountryFormData>({
    name: '',
    status: LocationStatus.ACTIVE,
  })

  // Prevent double-fetch on mount
  const hasFetched = useRef(false)

  // Fetch countries
  const fetchCountries = useCallback(async (currentPage: number, currentLimit: number) => {
    try {
      setLoading(true)
      const params: Record<string, string | number | boolean | undefined> = {
        page: currentPage,
        limit: currentLimit,
        include_inactive: true,
      }
      const res = await apiClient.getPaginated<Country>('/countries', params)
      setCountries(res.data ?? [])
      setTotalPages(res.totalPages || 1)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch countries',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Initial fetch
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true
      fetchCountries(page, limit)
    }
  }, [fetchCountries, page, limit])

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    fetchCountries(newPage, limit)
  }

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit)
    setPage(1)
    fetchCountries(1, newLimit)
  }

  const handleRefresh = () => {
    fetchCountries(page, limit)
  }

  // Open dialog for adding
  const handleAdd = () => {
    setEditingCountry(null)
    setFormData({ name: '', status: LocationStatus.ACTIVE })
    setDialogOpen(true)
  }

  // Open dialog for editing
  const handleEdit = (country: Country) => {
    setEditingCountry(country)
    setFormData({ name: country.name, status: country.status })
    setDialogOpen(true)
  }

  // Save (create or update)
  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Country name is required',
        variant: 'destructive',
      })
      return
    }

    try {
      setSaving(true)
      if (editingCountry) {
        // Update
        await apiClient.request<Country>(`/countries/${editingCountry.id}`, {
          method: 'PATCH',
          body: JSON.stringify(formData),
        })
        toast({
          title: 'Success',
          description: 'Country updated successfully',
        })
      } else {
        // Create
        await apiClient.request<Country>('/countries', {
          method: 'POST',
          body: JSON.stringify(formData),
        })
        toast({
          title: 'Success',
          description: 'Country created successfully',
        })
      }
      setDialogOpen(false)
      fetchCountries(page, limit)
    } catch (error) {
      toast({
        title: 'Error',
        description: editingCountry ? 'Failed to update country' : 'Failed to create country',
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
          <h1 className="text-3xl font-bold tracking-tight">Countries</h1>
          <p className="text-muted-foreground">
            Manage countries in the system
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
            Add Country
          </Button>
        </div>
      </div>

      {/* Countries Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Countries List
          </CardTitle>
          <CardDescription>
            All countries available in the system
          </CardDescription>
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
          ) : countries.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-muted-foreground">
              <Globe className="mb-4 h-12 w-12" />
              <p>No countries found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {countries.map((country) => (
                  <TableRow key={country.id}>
                    <TableCell className="font-mono text-xs">
                      {country.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell className="font-medium">{country.name}</TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(country.status)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(country.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(country)}
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
              {editingCountry ? 'Edit Country' : 'Add Country'}
            </DialogTitle>
            <DialogDescription>
              {editingCountry
                ? 'Update the country details below.'
                : 'Enter the details for the new country.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter country name"
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
              {editingCountry ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
