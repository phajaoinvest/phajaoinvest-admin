'use client'

import { useState } from 'react'
import { Breadcrumb } from '@/components/breadcrumb'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDashboardStore, Package } from '@/lib/dashboard-store'
import { Plus, Edit2, Trash2, X, Eye, Search, PackageIcon, DollarSign, TrendingUp, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react'

export default function PackagesPage() {
  const packages = useDashboardStore((state) => state.packages)
  const addPackage = useDashboardStore((state) => state.addPackage)
  const updatePackage = useDashboardStore((state) => state.updatePackage)
  const deletePackage = useDashboardStore((state) => state.deletePackage)

  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [viewingPackage, setViewingPackage] = useState<Package | null>(null)
  const [deletingPackage, setDeletingPackage] = useState<Package | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)
  const itemsPerPage = 10
  
  const [formData, setFormData] = useState({
    service_type: '',
    price: '',
    currency: 'USD',
    duration_months: '',
    description: '',
    features: '',
    active: true,
  })

  const filteredPackages = packages.filter((pkg) =>
    pkg.service_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pkg.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(filteredPackages.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedPackages = filteredPackages.slice(startIndex, endIndex)

  const handleCreate = () => {
    if (formData.service_type && formData.price && formData.duration_months && formData.description) {
      addPackage({
        service_type: formData.service_type,
        price: parseFloat(formData.price),
        currency: formData.currency,
        duration_months: parseInt(formData.duration_months),
        description: formData.description,
        features: formData.features.split(',').map((f) => f.trim()).filter(f => f),
        active: formData.active,
      })
      closeModal()
    }
  }

  const handleUpdate = (id: string) => {
    if (formData.service_type && formData.price && formData.duration_months && formData.description) {
      updatePackage(id, {
        service_type: formData.service_type,
        price: parseFloat(formData.price),
        currency: formData.currency,
        duration_months: parseInt(formData.duration_months),
        description: formData.description,
        features: formData.features.split(',').map((f) => f.trim()).filter(f => f),
        active: formData.active,
      })
      closeModal()
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

  const openEditModal = (pkg: Package) => {
    setEditingId(pkg.id)
    setFormData({
      service_type: pkg.service_type,
      price: String(pkg.price),
      currency: pkg.currency,
      duration_months: String(pkg.duration_months),
      description: pkg.description,
      features: pkg.features.join(', '),
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

  const handleDeleteConfirm = () => {
    if (deletingPackage) {
      deletePackage(deletingPackage.id)
      setDeletingPackage(null)
    }
  }

  const toggleDropdown = (id: string) => {
    setOpenDropdownId(openDropdownId === id ? null : id)
  }

  return (
    <div className="space-y-6">
      <Breadcrumb />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-background to-secondary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-light text-muted-foreground">Total Packages</p>
                <p className="text-2xl font-light text-foreground mt-1">{packages.length}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <PackageIcon className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-background to-secondary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-light text-muted-foreground">Active Packages</p>
                <p className="text-2xl font-light text-foreground mt-1">
                  {packages.filter((p) => p.active).length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-background to-secondary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-light text-muted-foreground">Average Price</p>
                <p className="text-2xl font-light text-foreground mt-1">
                  ${packages.length > 0 ? (packages.reduce((sum, p) => sum + p.price, 0) / packages.length).toFixed(2) : '0.00'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <div className="p-4 border-b border-border">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search packages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-sm h-9"
              />
            </div>
            <Button
              onClick={openCreateModal}
              className="bg-primary hover:bg-primary/90 text-sm font-light h-9 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Package
            </Button>
          </div>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-secondary/30">
                <tr>
                  <th className="text-left p-4 text-sm font-light text-muted-foreground">
                    Package ID
                  </th>
                  <th className="text-left p-4 text-sm font-light text-muted-foreground">Service Type</th>
                  <th className="text-left p-4 text-sm font-light text-muted-foreground">Description</th>
                  <th className="text-left p-4 text-sm font-light text-muted-foreground">Price</th>
                  <th className="text-left p-4 text-sm font-light text-muted-foreground">
                    Duration
                  </th>
                  <th className="text-left p-4 text-sm font-light text-muted-foreground">
                    Features
                  </th>
                  <th className="text-left p-4 text-sm font-light text-muted-foreground">Status</th>
                  <th className="text-right p-4 text-sm font-light text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedPackages.map((pkg) => (
                  <tr key={pkg.id} className="border-b border-border hover:bg-secondary/20">
                    <td className="p-4 text-sm font-light text-foreground">{pkg.id}</td>
                    <td className="p-4 text-sm font-light text-foreground capitalize">{pkg.service_type}</td>
                    <td className="p-4 text-sm font-light text-muted-foreground max-w-xs truncate">
                      {pkg.description}
                    </td>
                    <td className="p-4 text-sm font-light text-primary">
                      {pkg.currency} ${pkg.price.toFixed(2)}
                    </td>
                    <td className="p-4 text-sm font-light text-muted-foreground">
                      {pkg.duration_months} {pkg.duration_months === 1 ? 'month' : 'months'}
                    </td>
                    <td className="p-4 text-sm font-light text-muted-foreground">
                      {pkg.features.length} features
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-xs font-light px-2.5 py-1 rounded-full ${
                          pkg.active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {pkg.active ? 'active' : 'inactive'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleDropdown(pkg.id)}
                          className="text-xs font-light h-8 w-8 p-0"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                        
                        {openDropdownId === pkg.id && (
                          <div className="absolute right-0 top-10 z-50 bg-background border border-border rounded-md shadow-lg py-1 min-w-[140px]">
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

          {filteredPackages.length > 0 && (
            <div className="flex items-center justify-between p-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredPackages.length)} of {filteredPackages.length} packages
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="text-sm font-light"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground px-3">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="text-sm font-light"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
                      <option value="basic">Basic</option>
                      <option value="premium">Premium</option>
                      <option value="elite">Elite</option>
                      <option value="pro">Pro</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-light text-muted-foreground">Duration (months) *</label>
                    <Input
                      placeholder="3"
                      type="number"
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
                  <label className="text-sm font-light text-muted-foreground">
                    Description *
                  </label>
                  <textarea
                    placeholder="Enter package description..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background min-h-[80px]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-light text-muted-foreground">
                    Features (comma separated)
                  </label>
                  <textarea
                    placeholder="advancedstockanalysistools, Unlimitedstockpicks, Portfoliotracking"
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
                  className="bg-primary hover:bg-primary/90 text-sm font-light flex-1"
                >
                  {editingId ? 'Update Package' : 'Create Package'}
                </Button>
                <Button
                  variant="outline"
                  onClick={closeModal}
                  className="text-sm font-light"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {viewingPackage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full border-2 border-primary/20 shadow-xl bg-gradient-to-br from-background to-secondary/10">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-light text-foreground capitalize">
                  {viewingPackage.service_type} membership
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setViewingPackage(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-3xl font-light text-primary">
                    ${viewingPackage.price.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {viewingPackage.duration_months} {viewingPackage.duration_months === 1 ? 'Month' : 'Months'}
                  </p>
                </div>

                <p className="text-sm font-light text-muted-foreground">
                  {viewingPackage.description}
                </p>

                <div className="space-y-2">
                  {viewingPackage.features.map((feature, i) => (
                    <div key={i} className="text-sm font-light text-foreground flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2"></span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-border space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-light">Package ID:</span>
                    <span className="text-foreground font-light">{viewingPackage.id}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-light">Currency:</span>
                    <span className="text-foreground font-light">{viewingPackage.currency}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-light">Status:</span>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full ${
                        viewingPackage.active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {viewingPackage.active ? 'active' : 'inactive'}
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-sm font-light mt-4"
                  onClick={() => setViewingPackage(null)}
                >
                  Select Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
                <span className="font-medium text-foreground capitalize">
                  {deletingPackage.service_type} membership
                </span>
                {' '}package? This action cannot be undone and will affect all customers subscribed to this package.
              </p>

              <div className="flex gap-2">
                <Button
                  onClick={handleDeleteConfirm}
                  className="bg-destructive hover:bg-destructive/90 text-white text-sm font-light flex-1"
                >
                  Delete Package
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setDeletingPackage(null)}
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
