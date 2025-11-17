'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useDashboardStore } from '@/lib/dashboard-store'
import { ArrowLeft, User, Mail, Phone, Wallet, TrendingUp, DollarSign, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'

export default function StockAccountDetailPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const { stockAccounts, customers, stockTransactions } = useDashboardStore()

  const account = stockAccounts.find((acc) => acc.id === id)
  const customer = account ? customers.find((c) => c.id === account.customerId) : null
  const transactions = stockTransactions.filter((tx) => tx.stockAccountId === id)

  if (!account || !customer) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Stock account not found</p>
          <Button onClick={() => router.push('/dashboard/stock-accounts')} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Stock Accounts
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push('/dashboard/stock-accounts')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Stock Accounts
        </Button>
        <Badge variant={account.status === 'active' ? 'default' : account.status === 'suspended' ? 'secondary' : 'destructive'}>
          {account.status}
        </Badge>
      </div>

      <div>
        <h1 className="text-3xl font-light">Stock Account Details</h1>
        <p className="text-muted-foreground mt-1">Account {account.accountNumber}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border/40">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Balance</p>
                <p className="text-2xl font-light mt-1">${account.balance.toLocaleString()}</p>
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
                <p className="text-sm text-muted-foreground">Cash Balance</p>
                <p className="text-2xl font-light mt-1">${account.cashBalance.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/40">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Invested Amount</p>
                <p className="text-2xl font-light mt-1">${account.investedAmount.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/40">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Stocks</p>
                <p className="text-2xl font-light mt-1">{account.totalStocks}</p>
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
          <h2 className="text-xl font-light mb-4">Customer Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Full Name</p>
                <p className="text-sm font-medium mt-1">
                  {customer.first_name} {customer.last_name}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Mail className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium mt-1">{customer.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Phone className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm font-medium mt-1">{customer.phone_number || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Customer Status</p>
                <Badge className="mt-1" variant={customer.status === 'active' ? 'default' : 'secondary'}>
                  {customer.status}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border/40">
        <CardContent className="p-6">
          <h2 className="text-xl font-light mb-4">Stock Buy & Sell History</h2>
          
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No transactions yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Type</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Stock Symbol</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Company</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Quantity</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Price/Share</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Total Amount</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Fee</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 text-sm">
                        {new Date(tx.transaction_date).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {tx.transaction_type === 'buy' ? (
                            <>
                              <ArrowDownRight className="w-4 h-4 text-green-500" />
                              <span className="text-sm font-medium text-green-500">Buy</span>
                            </>
                          ) : (
                            <>
                              <ArrowUpRight className="w-4 h-4 text-red-500" />
                              <span className="text-sm font-medium text-red-500">Sell</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-sm font-medium">{tx.stock_symbol}</td>
                      <td className="p-4 text-sm text-muted-foreground">{tx.company_name}</td>
                      <td className="p-4 text-sm text-right">{tx.quantity}</td>
                      <td className="p-4 text-sm text-right">${tx.price_per_share.toFixed(2)}</td>
                      <td className="p-4 text-sm text-right font-medium">
                        ${tx.total_amount.toFixed(2)}
                      </td>
                      <td className="p-4 text-sm text-right text-muted-foreground">
                        ${tx.commission_fee.toFixed(2)}
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={
                            tx.status === 'completed'
                              ? 'default'
                              : tx.status === 'pending'
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {tx.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {tx.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
