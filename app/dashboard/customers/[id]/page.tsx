'use client'

import { useParams, useRouter } from 'next/navigation'
import { useDashboardStore } from '@/lib/dashboard-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Mail, Phone, User, Calendar, CheckCircle2, XCircle, MapPin } from 'lucide-react'

export default function CustomerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const customerId = params.id as string
  
  const customer = useDashboardStore((state) =>
    state.customers.find((c) => c.id === customerId)
  )

  if (!customer) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground">Customer not found</p>
          <Button
            onClick={() => router.push('/dashboard/customers')}
            className="mt-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Customers
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b border-border/50 bg-secondary/20">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl font-semibold">
                {customer.first_name} {customer.last_name}
              </CardTitle>
              <CardDescription className="text-sm mt-1">
                @{customer.username}
              </CardDescription>
            </div>
            <Badge
              className={`text-sm font-medium ${
                customer.status === 'active'
                  ? 'border-green-300 bg-green-50 text-green-700'
                  : customer.status === 'suspended'
                    ? 'border-orange-300 bg-orange-50 text-orange-700'
                    : 'border-gray-300 bg-gray-50 text-gray-700'
              }`}
            >
              {customer.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Contact Information
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm font-medium text-foreground">{customer.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="text-sm font-medium text-foreground">
                        {customer.phone_number || 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Account Details
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Customer ID</p>
                      <p className="text-sm font-mono text-foreground">{customer.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className={`w-5 h-5 ${customer.isVerify ? 'text-green-600' : 'text-gray-400'}`} />
                    <div>
                      <p className="text-xs text-muted-foreground">Verification Status</p>
                      <p className="text-sm font-medium text-foreground">
                        {customer.isVerify ? 'Verified' : 'Not Verified'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Account Activity
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Created At</p>
                      <p className="text-sm font-medium text-foreground">
                        {new Date(customer.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Last Updated</p>
                      <p className="text-sm font-medium text-foreground">
                        {new Date(customer.updated_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
