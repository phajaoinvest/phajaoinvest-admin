'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useDashboardStore } from '@/lib/dashboard-store'
import { Search, TrendingUp, TrendingDown, Calendar, Download, MoreVertical, Eye, Ban, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function InvestmentsPage() {
  const router = useRouter()
  const investments = useDashboardStore((state) => state.investments)
  const updateInvestmentStatus = useDashboardStore((state) => state.updateInvestmentStatus)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'most_invest' | 'least_invest' | 'none'>('none')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const filteredInvestments = investments
    .filter((inv) => {
      const matchesSearch = 
        inv.customer_first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.customer_last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${inv.customer_first_name} ${inv.customer_last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || inv.status === statusFilter
      
      const matchesDateRange = 
        (!startDate || inv.created_date >= startDate) &&
        (!endDate || inv.created_date <= endDate)
      
      return matchesSearch && matchesStatus && matchesDateRange
    })
    .sort((a, b) => {
      if (sortBy === 'most_invest') return b.total_invested_amount - a.total_invested_amount
      if (sortBy === 'least_invest') return a.total_invested_amount - b.total_invested_amount
      return 0
    })

  // Pagination
  const totalPages = Math.ceil(filteredInvestments.length / itemsPerPage)
  const paginatedInvestments = filteredInvestments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Stats
  const totalInvested = investments.reduce((sum, inv) => sum + inv.total_invested_amount, 0)
  const totalReturn = investments.reduce((sum, inv) => sum + inv.total_return, 0)
  const activeInvestments = investments.filter((inv) => inv.status === 'active').length
  const totalInvestmentCount = investments.reduce((sum, inv) => sum + inv.investment_count, 0)

  const exportToCSV = () => {
    const headers = ['Customer Name', 'Total Invested', 'Total Return', 'Current Value', 'Status', 'Investment Count', 'Created Date']
    const rows = filteredInvestments.map((inv) => [
      `${inv.customer_first_name} ${inv.customer_last_name}`,
      inv.total_invested_amount,
      inv.total_return,
      inv.current_value,
      inv.status,
      inv.investment_count,
      inv.created_date,
    ])
    
    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `investments_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const handleBan = (id: string) => {
    updateInvestmentStatus(id, 'closed')
  }

  const handleViewDetails = (id: string) => {
    router.push(`/dashboard/investments/${id}`)
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border border-border/40 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-light">Total Invested</p>
                <p className="text-2xl font-light text-foreground mt-1">${totalInvested.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border/40 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-light">Total Returns</p>
                <p className="text-2xl font-light text-green-500 mt-1">${totalReturn.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border/40 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-light">Active Accounts</p>
                <p className="text-2xl font-light text-foreground mt-1">{activeInvestments}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border/40 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-light">Total Investments</p>
                <p className="text-2xl font-light text-foreground mt-1">{totalInvestmentCount}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="bg-card border border-border/40 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Investment Accounts</h3>
              <Button onClick={exportToCSV} variant="outline" size="sm" className="h-9">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="relative col-span-2">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by customer name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background border-border h-9"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 h-9 rounded-md border border-border bg-background text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="closed">Closed</option>
              </select>

              <Input
                type="date"
                placeholder="Start Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-background border-border h-9"
              />

              <Input
                type="date"
                placeholder="End Date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-background border-border h-9"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 h-9 rounded-md border border-border bg-background text-sm"
              >
                <option value="none">Sort By</option>
                <option value="most_invest">Most Invested</option>
                <option value="least_invest">Least Invested</option>
              </select>
            </div>
          </div>
        </CardContent>
        
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Customer Name</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Total Invested</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Total Return</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Current Value</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Investments</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Created Date</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedInvestments.map((inv) => (
                  <tr key={inv.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-medium">
                      {inv.customer_first_name} {inv.customer_last_name}
                    </td>
                    <td className="py-3 px-4">${inv.total_invested_amount.toLocaleString()}</td>
                    <td className={`py-3 px-4 font-medium flex items-center gap-1 ${inv.total_return >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {inv.total_return >= 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      ${Math.abs(inv.total_return).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">${inv.current_value.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        {inv.investment_count} active
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant="outline"
                        className={
                          inv.status === 'active'
                            ? 'bg-green-500/10 text-green-500 border-green-500/20'
                            : inv.status === 'pending'
                              ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                              : inv.status === 'completed'
                                ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                : 'bg-gray-500/10 text-gray-500 border-gray-500/20'
                        }
                      >
                        {inv.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{inv.created_date}</td>
                    <td className="py-3 px-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border-border">
                          <DropdownMenuItem onClick={() => handleViewDetails(inv.id)} className="cursor-pointer">
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleBan(inv.id)}
                            className="cursor-pointer text-red-500 focus:text-red-500"
                          >
                            <Ban className="w-4 h-4 mr-2" />
                            Ban Account
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {paginatedInvestments.length === 0 && (
              <div className="text-center py-12 text-muted-foreground text-sm">
                No investment accounts found
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-border">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredInvestments.length)} of{' '}
                {filteredInvestments.length} results
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <div className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
