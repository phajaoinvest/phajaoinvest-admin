'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { subscriptionsApi } from '@/lib/api/subscriptions'
import type { PremiumMembershipDetail } from '@/lib/types'
import { SubscriptionStatus } from '@/lib/types/subscriptions'
import { ArrowLeft, Loader2, Calendar, DollarSign, User, MapPin, CreditCard } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency, formatNumber } from '@/lib/utils'

// Map subscription duration to display text
const getDurationLabel = (months: number | null): string => {
  if (!months) return 'N/A'
  if (months === 3) return '3 Months'
  if (months === 6) return '6 Months'
  if (months === 12) return '12 Months'
  return `${months} Months`
}

// Get display status label and color
const getStatusDisplay = (status: string) => {
  const statusLower = status.toLowerCase()
  switch (statusLower) {
    case SubscriptionStatus.ACTIVE.toLowerCase():
      return { label: 'Active', color: 'bg-green-500/10 text-green-500 border-green-500/20' }
    case SubscriptionStatus.PENDING.toLowerCase():
      return { label: 'Pending', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' }
    case SubscriptionStatus.EXPIRED.toLowerCase():
      return { label: 'Expired', color: 'bg-gray-500/10 text-gray-500 border-gray-500/20' }
    case SubscriptionStatus.CANCELLED.toLowerCase():
      return { label: 'Cancelled', color: 'bg-red-500/10 text-red-500 border-red-500/20' }
    case SubscriptionStatus.SUSPENDED.toLowerCase():
      return { label: 'Suspended', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' }
    default:
      return { label: status, color: 'bg-gray-500/10 text-gray-500 border-gray-500/20' }
  }
}

const formatDateTime = (value?: string | null) => {
  if (!value) return 'N/A'
  try {
    return format(new Date(value), 'MMM dd, yyyy hh:mm a')
  } catch {
    return value
  }
}

export default function PremiumMembershipDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const serviceId = params.serviceId as string

  const [detail, setDetail] = useState<PremiumMembershipDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadDetail = async () => {
      if (!serviceId) return

      setIsLoading(true)
      setError(null)
      try {
        const response = await subscriptionsApi.getDetail(serviceId)
        if (response.is_error) {
          throw new Error(response.message || 'Failed to fetch subscription detail')
        }
        setDetail(response.data)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch subscription detail'
        setError(message)
        toast({
          title: 'Error',
          description: message,
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadDetail()
  }, [serviceId, toast])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading subscription details...</p>
        </div>
      </div>
    )
  }

  if (error || !detail) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <p className="text-destructive text-lg">{error || 'Subscription not found'}</p>
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Button onClick={() => router.back()} variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Subscription Details</h1>
              <p className="text-sm text-muted-foreground">
                {detail.customer.first_name} {detail.customer.last_name} • {detail.customer.email}
              </p>
            </div>
          </div>
        </div>
        <Badge variant="outline" className={`${getStatusDisplay(detail.service.status).color} capitalize text-base px-4 py-2`}>
          {getStatusDisplay(detail.service.status).label}
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="text-lg font-semibold">{getDurationLabel(detail.service.subscription_duration)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Subscription Fee</p>
              <p className="text-lg font-semibold">{formatCurrency(detail.service.subscription_fee || 0)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Balance</p>
              <p className="text-lg font-semibold">{formatCurrency(detail.service.balance)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Customer & Service Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service Information */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Service Information</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Service ID</p>
                <p className="font-mono text-xs break-all">{detail.service.id}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Service Type</p>
                <p className="font-medium capitalize">{detail.service.service_type.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Applied At</p>
                <p className="font-medium">{formatDateTime(detail.service.applied_at)}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Expires At</p>
                <p className="font-medium">
                  {detail.service.subscription_expires_at
                    ? format(new Date(detail.service.subscription_expires_at), 'MMM dd, yyyy')
                    : 'No expiration'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Requires Payment</p>
                <p className="font-medium">{detail.service.requires_payment ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Active</p>
                <Badge variant={detail.service.active ? 'default' : 'secondary'}>
                  {detail.service.active ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Package Information */}
          {detail.package && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Package Information</h2>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Package ID</p>
                  <p className="font-mono text-xs break-all">{detail.package.id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Duration</p>
                  <p className="font-medium">{getDurationLabel(detail.package.duration_months)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Price</p>
                  <p className="font-medium text-lg">{formatCurrency(detail.package.price)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Currency</p>
                  <p className="font-medium uppercase">{detail.package.currency}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Status</p>
                  <Badge variant={detail.package.active ? 'default' : 'secondary'}>
                    {detail.package.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              {detail.package.description && (
                <div className="mt-4">
                  <p className="text-muted-foreground mb-1 text-sm">Description</p>
                  <p className="text-sm">{detail.package.description}</p>
                </div>
              )}
              {detail.package.features && detail.package.features.length > 0 && (
                <div className="mt-4">
                  <p className="text-muted-foreground mb-2 text-sm">Features</p>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    {detail.package.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          )}

          {/* Payment History */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Payment History</h2>
            </div>
            {detail.payments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No payments recorded.</p>
            ) : (
              <div className="space-y-3">
                {detail.payments.map((payment) => (
                  <div key={payment.id} className="rounded-lg border border-border/40 p-4">
                    <div className="flex items-center justify-between gap-4 mb-3">
                      <div>
                        <p className="font-semibold text-lg">{formatCurrency(payment.amount)}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {payment.payment_method?.replace(/_/g, ' ') || 'N/A'} • {payment.payment_type?.replace(/_/g, ' ')}
                        </p>
                      </div>
                      <Badge variant="outline" className={`${getStatusDisplay(payment.status || 'pending').color} capitalize`}>
                        {getStatusDisplay(payment.status || 'pending').label}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                      <div>
                        <p className="uppercase tracking-wide mb-1">Payment ID</p>
                        <p className="font-mono break-all text-[11px]">{payment.id}</p>
                      </div>
                      <div>
                        <p className="uppercase tracking-wide mb-1">Paid At</p>
                        <p>{formatDateTime(payment.paid_at || payment.created_at)}</p>
                      </div>
                      {payment.payment_reference && (
                        <div>
                          <p className="uppercase tracking-wide mb-1">Reference</p>
                          <p>{payment.payment_reference}</p>
                        </div>
                      )}
                      {payment.admin_notes && (
                        <div className="col-span-2">
                          <p className="uppercase tracking-wide mb-1">Admin Notes</p>
                          <p>{payment.admin_notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column - Customer Info */}
        <div className="space-y-6">
          {/* Customer Profile */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Customer Profile</h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-muted-foreground text-xs mb-1">Full Name</p>
                <p className="font-semibold">{detail.customer.first_name} {detail.customer.last_name}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-1">Email</p>
                <p className="text-sm break-all">{detail.customer.email}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-1">Username</p>
                <p className="text-sm">{detail.customer.username}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-1">Phone</p>
                <p className="text-sm">{detail.customer.phone_number || 'N/A'}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-1">Status</p>
                <Badge variant="outline" className="capitalize">
                  {detail.customer.status}
                </Badge>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-1">Verification</p>
                <Badge variant={detail.customer.isVerify ? 'default' : 'secondary'}>
                  {detail.customer.isVerify ? 'Verified' : 'Pending'}
                </Badge>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-1">Member Since</p>
                <p className="text-sm">{format(new Date(detail.customer.created_at), 'MMM dd, yyyy')}</p>
              </div>
            </div>
          </Card>

          {/* Addresses */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Addresses</h2>
            </div>
            {detail.addresses.length === 0 ? (
              <p className="text-sm text-muted-foreground">No addresses on file.</p>
            ) : (
              <div className="space-y-3">
                {detail.addresses.map((address) => (
                  <div key={address.id} className="rounded-lg border border-border/40 p-3">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium text-sm">{address.address_line || 'Address'}</p>
                      {address.is_primary && (
                        <Badge variant="secondary" className="text-xs">Primary</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">
                      {[address.village, address.district_id, address.province_id, address.country_id]
                        .filter(Boolean)
                        .join(', ') || 'No location details'}
                    </p>
                    {address.postal_code && (
                      <p className="text-xs text-muted-foreground">Postal: {address.postal_code}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      Added {formatDateTime(address.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
