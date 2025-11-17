'use client'

import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useDashboardStore } from '@/lib/dashboard-store'
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, BarChart3, Calendar, User, Mail, Phone } from 'lucide-react'

export default function InvestmentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const investments = useDashboardStore((state) => state.investments)
  const investmentTransactions = useDashboardStore((state) => state.investmentTransactions)
  const customers = useDashboardStore((state) => state.customers)

  const investment = investments.find((inv) => inv.id === id)
  const transactions = investmentTransactions.filter((tx) => tx.investmentAccountId === id)
  const customer = customers.find((c) => c.id === investment?.customerId)

  if (!investment || !customer) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Investment account not found</p>
          <Button onClick={() => router.push('/dashboard/investments')} className="mt-4">
            Back to Investments
          </Button>
        </div>
      </div>
    )
  }

  const returnPercentage = (investment.total_return / investment.total_invested_amount) * 100

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/investments')}>
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div>
          <h1 className="text-md font-bold text-foreground">Investment Account Details</h1>
          <p className="text-xs text-muted-foreground mt-1">
            {customer.first_name} {customer.last_name} - {investment.id}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border border-border/40">
          <CardContent className="py-0 px-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-light">Total Balance</p>
                <p className="text-md font-bold text-foreground mt-1">
                  ${investment.current_value.toLocaleString()}
                </p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border/40">
          <CardContent className="py-0 px-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-light">Invested Amount</p>
                <p className="text-md font-bold text-foreground mt-1">
                  ${investment.total_invested_amount.toLocaleString()}
                </p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border/40">
          <CardContent className="py-0 px-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-light">Total Return</p>
                <p className={`text-md font-bold mt-1 ${investment.total_return >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  ${Math.abs(investment.total_return).toLocaleString()}
                </p>
                <p className={`text-xs mt-1 ${investment.total_return >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {returnPercentage.toFixed(2)}%
                </p>
              </div>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${investment.total_return >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                {investment.total_return >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border/40">
          <CardContent className="py-0 px-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-light">Active Investments</p>
                <p className="text-md font-bold text-foreground mt-1">{investment.investment_count}</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Investment History */}
      <Card className="bg-card border border-border/40">
        <CardHeader>
          <CardTitle className="text-md font-semibold">Investment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Investment Type</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Return</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Return %</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Start Date</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">End Date</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Notes</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-medium">{tx.investment_type}</td>
                    <td className="py-3 px-4">${tx.amount.toLocaleString()}</td>
                    <td className={`py-3 px-4 font-medium ${tx.return_amount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      ${Math.abs(tx.return_amount).toLocaleString()}
                    </td>
                    <td className={`py-3 px-4 ${tx.return_percentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {tx.return_percentage.toFixed(2)}%
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{tx.start_date}</td>
                    <td className="py-3 px-4 text-muted-foreground">{tx.end_date || 'Ongoing'}</td>
                    <td className="py-3 px-4">
                      <Badge
                        variant="outline"
                        className={
                          tx.status === 'active'
                            ? 'bg-green-500/10 text-green-500 border-green-500/20'
                            : tx.status === 'pending'
                              ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                              : tx.status === 'completed'
                                ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                : 'bg-gray-500/10 text-gray-500 border-gray-500/20'
                        }
                      >
                        {tx.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{tx.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {transactions.length === 0 && (
              <div className="text-center py-12 text-muted-foreground text-sm">
                No investment history found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
