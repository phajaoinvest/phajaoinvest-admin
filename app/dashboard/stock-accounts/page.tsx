'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDashboardStore } from '@/lib/dashboard-store'
import { Search, MoreVertical, Eye, Ban, Download, TrendingUp, TrendingDown, Wallet, Users, DollarSign } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'

type SortType = 'most' | 'least' | 'newest' | 'oldest'

export default function StockAccountsPage() {
  const { stockAccounts, customers, updateStockAccountStatus } = useDashboardStore()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [sortType, setSortType] = useState<SortType>('most')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null)
  const [banConfirmOpen, setBanConfirmOpen] = useState(false)
  const itemsPerPage = 10

  const filteredAndSortedAccounts = useMemo(() => {
    let filtered = stockAccounts.filter((acc) => {
      const customer = customers.find((c) => c.id === acc.customerId)
      const matchesSearch = 
        customer?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        acc.accountNumber.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesDateRange = (!startDate || acc.createdDate >= startDate) &&
                              (!endDate || acc.createdDate <= endDate)
      
      return matchesSearch && matchesDateRange
    })

    // Sort by stock purchases
    if (sortType === 'most') {
      filtered.sort((a, b) => b.totalStocks - a.totalStocks)
    } else if (sortType === 'least') {
      filtered.sort((a, b) => a.totalStocks - b.totalStocks)
    } else if (sortType === 'newest') {
      filtered.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
    } else if (sortType === 'oldest') {
      filtered.sort((a, b) => new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime())
    }

    return filtered
  }, [stockAccounts, customers, searchTerm, startDate, endDate, sortType])

  const totalPages = Math.ceil(filteredAndSortedAccounts.length / itemsPerPage)
  const paginatedAccounts = filteredAndSortedAccounts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const stats = useMemo(() => {
    const activeAccounts = stockAccounts.filter((a) => a.status === 'active').length
    const totalBalance = stockAccounts.reduce((sum, acc) => sum + acc.balance, 0)
    const totalInvested = stockAccounts.reduce((sum, acc) => sum + acc.investedAmount, 0)
    const totalStocks = stockAccounts.reduce((sum, acc) => sum + acc.totalStocks, 0)
    
    return { activeAccounts, totalBalance, totalInvested, totalStocks }
  }, [stockAccounts])

  const handleBanAccount = (accountId: string) => {
    updateStockAccountStatus(accountId, 'banned')
    setBanConfirmOpen(false)
    setSelectedAccount(null)
  }

  const exportToCSV = () => {
    const headers = ['Account Number', 'Customer Name', 'Balance', 'Cash Balance', 'Invested', 'Total Stocks', 'Status', 'Created Date']
    const rows = filteredAndSortedAccounts.map((acc) => {
      const customer = customers.find((c) => c.id === acc.customerId)
      const customerName = `${customer?.first_name || ''} ${customer?.last_name || ''}`.trim()
      return [
        acc.accountNumber,
        customerName,
        acc.balance,
        acc.cashBalance,
        acc.investedAmount,
        acc.totalStocks,
        acc.status,
        acc.createdDate,
      ]
    })

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `stock-accounts-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const selectedAccountData = selectedAccount
    ? stockAccounts.find((acc) => acc.id === selectedAccount)
    : null
  const selectedCustomer = selectedAccountData
    ? customers.find((c) => c.id === selectedAccountData.customerId)
    : null

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border/40">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Accounts</p>
                <p className="text-2xl font-light mt-1">{stats.activeAccounts}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/40">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Balance</p>
                <p className="text-2xl font-light mt-1">${stats.totalBalance.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/40">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Invested</p>
                <p className="text-2xl font-light mt-1">${stats.totalInvested.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/40">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Stocks</p>
                <p className="text-2xl font-light mt-1">{stats.totalStocks}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border/40">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Stock Accounts</h3>
              <Button variant="outline" size="sm" onClick={exportToCSV} className="h-9">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="relative col-span-2">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by customer or account..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-9"
                />
              </div>
              
              <Input
                type="date"
                placeholder="Start Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-9"
              />
              <Input
                type="date"
                placeholder="End Date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-9"
              />
            </div>
            
            <div>
              <select
                value={sortType}
                onChange={(e) => setSortType(e.target.value as SortType)}
                className="px-3 h-9 rounded-md border border-border bg-background text-sm"
              >
                <option value="most">Most Stocks</option>
                <option value="least">Least Stocks</option>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          </div>
        </CardContent>
        
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Account Number</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Customer</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Total Stocks</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Invested</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Cash Balance</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Total Balance</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Created</th>
                  <th className="text-center p-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedAccounts.map((account) => {
                  const customer = customers.find((c) => c.id === account.customerId)
                  const customerName = `${customer?.first_name || ''} ${customer?.last_name || ''}`.trim()
                  
                  return (
                    <tr key={account.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 text-sm font-medium">{account.accountNumber}</td>
                      <td className="p-4">
                        <div>
                          <p className="text-sm font-medium">{customerName}</p>
                          <p className="text-xs text-muted-foreground">{customer?.email}</p>
                        </div>
                      </td>
                      <td className="p-4 text-sm">{account.totalStocks} stocks</td>
                      <td className="p-4 text-sm">${account.investedAmount.toLocaleString()}</td>
                      <td className="p-4 text-sm">${account.cashBalance.toLocaleString()}</td>
                      <td className="p-4 text-sm font-medium">${account.balance.toLocaleString()}</td>
                      <td className="p-4">
                        <Badge
                          variant={
                            account.status === 'active'
                              ? 'default'
                              : account.status === 'suspended'
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {account.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {new Date(account.createdDate).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => router.push(`/dashboard/stock-accounts/${account.id}`)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {account.status !== 'banned' && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedAccount(account.id)
                                    setBanConfirmOpen(true)
                                  }}
                                  className="text-destructive"
                                >
                                  <Ban className="w-4 h-4 mr-2" />
                                  Ban Account
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {paginatedAccounts.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-muted-foreground text-sm">No stock accounts found</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredAndSortedAccounts.length)} of{' '}
                {filteredAndSortedAccounts.length} accounts
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={banConfirmOpen} onOpenChange={setBanConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban Stock Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to ban this stock account? The customer will not be able to trade.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setBanConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedAccount && handleBanAccount(selectedAccount)}
            >
              <Ban className="w-4 h-4 mr-2" />
              Ban Account
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
