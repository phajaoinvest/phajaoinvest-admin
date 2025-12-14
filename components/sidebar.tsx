'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useUIStore } from '@/lib/ui-store'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/lib/auth-store'
import { usePendingCounts } from '@/hooks'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { BarChart3, Users, UserCog, Package, TrendingUp, Clock as Stock, Zap, CreditCard, LogOut, Settings, FileText, ChevronDown, ChevronRight, Briefcase, ArrowUpDown, LineChart, MapPin, Globe, Building } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/dashboard/customers', label: 'Customers', icon: Users },
  { href: '/dashboard/staff', label: 'Staff & Roles', icon: UserCog },
  { href: '/dashboard/packages', label: 'Packages', icon: Package },
  // { href: '/dashboard/subscriptions', label: 'Subscriptions', icon: FileText },
  // { href: '/dashboard/investments', label: 'Investments', icon: TrendingUp },
  // { href: '/dashboard/stock-accounts', label: 'Stock Accounts', icon: Stock },
  { href: '/dashboard/stock-picks', label: 'Stock Picks', icon: Zap },
  { href: '/dashboard/stocks', label: 'Stocks', icon: LineChart },
  { href: '/dashboard/customer-stocks', label: 'Customer Holdings', icon: Briefcase },
  { href: '/dashboard/stock-transactions', label: 'Stock Transactions', icon: ArrowUpDown },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

const serviceItems = [
  { href: '/dashboard/services/premium-membership', label: 'Premium Membership' },
  { href: '/dashboard/services/international-stock-accounts', label: 'International Stock Accounts' },
  { href: '/dashboard/services/guaranteed-returns', label: 'Guaranteed Returns' },
]

const paymentItems = [
  { href: '/dashboard/payments/subscriptions', label: 'Subscription Payments' },
  { href: '/dashboard/payments/stock-picks', label: 'Stock Pick Payments' },
  { href: '/dashboard/payments/transfers', label: 'Deposits & Withdrawals' },
  { href: '/dashboard/payments/investments', label: 'Investment Payments' },
]

const locationItems = [
  { href: '/dashboard/locations/countries', label: 'Countries', icon: Globe },
  { href: '/dashboard/locations/provinces', label: 'Provinces', icon: MapPin },
  { href: '/dashboard/locations/districts', label: 'Districts', icon: Building },
]

export function Sidebar() {
  const pathname = usePathname()
  const logout = useAuthStore((state) => state.logout)
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed)
  const user = useAuthStore((state) => state.user)
  const [servicesExpanded, setServicesExpanded] = useState(
    pathname.startsWith('/dashboard/services')
  )
  const [paymentsExpanded, setPaymentsExpanded] = useState(
    pathname.startsWith('/dashboard/payments')
  )
  const [locationsExpanded, setLocationsExpanded] = useState(
    pathname.startsWith('/dashboard/locations')
  )
  
  // Fetch pending counts for badges
  const { counts } = usePendingCounts()

  const handleLogout = async () => {
    await logout()
    window.location.href = '/login'
  }

  const isServiceActive = serviceItems.some((item) => pathname.includes(item.href))
  const isPaymentActive = paymentItems.some((item) => pathname.includes(item.href))
  const isLocationActive = locationItems.some((item) => pathname.includes(item.href))

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 z-40 flex flex-col ${sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
    >
      <div className="p-6 border-b border-sidebar-border flex-shrink-0">
        {sidebarCollapsed ? (
          <div className="w-10 h-10 bg-gradient-to-br from-primary via-primary/80 to-primary/60 rounded-xl flex items-center justify-center shadow-lg mx-auto">
            <BarChart3 className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
        ) : (
          <h1 className="text-xl font-semibold text-sidebar-foreground flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary via-primary/80 to-primary/60 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <BarChart3 className="w-5 h-5 text-sidebar-primary-foreground" />
            </div>
            <span className="tracking-tight uppercase">Phajaoinvest</span>
          </h1>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <TooltipProvider delayDuration={0}>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            const linkContent = (
              <Link
                href={item.href}
                className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-3 rounded-md text-sm font-medium transition-all duration-200 ${isActive
                  ? 'bg-gradient-to-r from-sidebar-primary to-sidebar-primary/80 text-sidebar-primary-foreground shadow-md'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'
                  }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!sidebarCollapsed && item.label}
              </Link>
            )
            
            if (sidebarCollapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    {linkContent}
                  </TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              )
            }
            
            return <div key={item.href}>{linkContent}</div>
          })}

          {/* Services Dropdown */}
          {sidebarCollapsed ? (
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className={`w-full flex items-center justify-center px-3 py-3 rounded-md text-sm font-medium transition-all duration-200 relative ${isServiceActive
                    ? 'bg-gradient-to-r from-sidebar-primary to-sidebar-primary/80 text-sidebar-primary-foreground shadow-md'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'
                    }`}
                >
                  <Briefcase className="w-4 h-4 flex-shrink-0" />
                  {counts && counts.services.total > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                      {counts.services.total > 9 ? '9+' : counts.services.total}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent side="right" align="start" className="w-56 p-2">
                <div className="font-semibold text-sm px-2 py-1.5 text-muted-foreground">Services</div>
                <div className="space-y-1">
                  {serviceItems.map((item, index) => {
                    const isActive = pathname.includes(item.href)
                    let count = 0
                    if (counts) {
                      if (index === 0) count = counts.services.premiumMembership
                      else if (index === 1) count = counts.services.internationalStockAccounts
                      else if (index === 2) count = counts.services.guaranteedReturns
                    }
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center justify-between px-2 py-2 rounded-md text-sm transition-all duration-200 ${isActive
                          ? 'bg-accent text-accent-foreground font-medium'
                          : 'text-foreground hover:bg-accent/50'
                          }`}
                      >
                        <span>{item.label}</span>
                        {count > 0 && (
                          <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full">
                            {count > 99 ? '99+' : count}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <div>
              <button
                onClick={() => setServicesExpanded(!servicesExpanded)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-all duration-200 relative ${isServiceActive
                  ? 'bg-gradient-to-r from-sidebar-primary to-sidebar-primary/80 text-sidebar-primary-foreground shadow-md'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'
                  }`}
              >
                <Briefcase className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-left">Services</span>
                {counts && counts.services.total > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                    {counts.services.total > 99 ? '99+' : counts.services.total}
                  </span>
                )}
                {servicesExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>

              {/* Service Sub-items */}
              {servicesExpanded && (
                <div className="mt-1 ml-4 space-y-1 border-l-2 border-sidebar-border pl-2">
                  {serviceItems.map((item, index) => {
                    const isActive = pathname.includes(item.href)
                    let count = 0
                    if (counts) {
                      if (index === 0) count = counts.services.premiumMembership
                      else if (index === 1) count = counts.services.internationalStockAccounts
                      else if (index === 2) count = counts.services.guaranteedReturns
                    }
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center justify-between px-3 py-2 rounded-md text-sm transition-all duration-200 ${isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent/40 hover:text-sidebar-accent-foreground'
                          }`}
                      >
                        <span>{item.label}</span>
                        {count > 0 && (
                          <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full">
                            {count > 99 ? '99+' : count}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Payments Dropdown */}
          {sidebarCollapsed ? (
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className={`w-full flex items-center justify-center px-3 py-3 rounded-md text-sm font-medium transition-all duration-200 relative ${isPaymentActive
                    ? 'bg-gradient-to-r from-sidebar-primary to-sidebar-primary/80 text-sidebar-primary-foreground shadow-md'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'
                    }`}
                >
                  <CreditCard className="w-4 h-4 flex-shrink-0" />
                  {counts && counts.payments.total > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                      {counts.payments.total > 9 ? '9+' : counts.payments.total}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent side="right" align="start" className="w-56 p-2">
                <div className="font-semibold text-sm px-2 py-1.5 text-muted-foreground">Payments</div>
                <div className="space-y-1">
                  {paymentItems.map((item, index) => {
                    const isActive = pathname.includes(item.href)
                    let count = 0
                    if (counts) {
                      if (index === 0) count = counts.payments.subscriptionPayments
                      else if (index === 1) count = counts.payments.stockPickPayments
                      else if (index === 2) count = counts.payments.deposits
                      else if (index === 3) count = counts.payments.investmentPayments
                    }
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center justify-between px-2 py-2 rounded-md text-sm transition-all duration-200 ${isActive
                          ? 'bg-accent text-accent-foreground font-medium'
                          : 'text-foreground hover:bg-accent/50'
                          }`}
                      >
                        <span>{item.label}</span>
                        {count > 0 && (
                          <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full">
                            {count > 99 ? '99+' : count}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <div>
              <button
                onClick={() => setPaymentsExpanded(!paymentsExpanded)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-all duration-200 relative ${isPaymentActive
                  ? 'bg-gradient-to-r from-sidebar-primary to-sidebar-primary/80 text-sidebar-primary-foreground shadow-md'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'
                  }`}
              >
                <CreditCard className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-left">Payments</span>
                {counts && counts.payments.total > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                    {counts.payments.total > 99 ? '99+' : counts.payments.total}
                  </span>
                )}
                {paymentsExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>

              {/* Payment Sub-items */}
              {paymentsExpanded && (
                <div className="mt-1 ml-4 space-y-1 border-l-2 border-sidebar-border pl-2">
                  {paymentItems.map((item, index) => {
                    const isActive = pathname.includes(item.href)
                    let count = 0
                    if (counts) {
                      if (index === 0) count = counts.payments.subscriptionPayments
                      else if (index === 1) count = counts.payments.stockPickPayments
                      else if (index === 2) count = counts.payments.deposits
                      else if (index === 3) count = counts.payments.investmentPayments
                    }
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center justify-between px-3 py-2 rounded-md text-sm transition-all duration-200 ${isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent/40 hover:text-sidebar-accent-foreground'
                          }`}
                      >
                        <span>{item.label}</span>
                        {count > 0 && (
                          <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full">
                            {count > 99 ? '99+' : count}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Locations Dropdown */}
          {sidebarCollapsed ? (
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className={`w-full flex items-center justify-center px-3 py-3 rounded-md text-sm font-medium transition-all duration-200 ${isLocationActive
                    ? 'bg-gradient-to-r from-sidebar-primary to-sidebar-primary/80 text-sidebar-primary-foreground shadow-md'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'
                    }`}
                >
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                </button>
              </PopoverTrigger>
              <PopoverContent side="right" align="start" className="w-48 p-2">
                <div className="font-semibold text-sm px-2 py-1.5 text-muted-foreground">Locations</div>
                <div className="space-y-1">
                  {locationItems.map((item) => {
                    const isActive = pathname.includes(item.href)
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-all duration-200 ${isActive
                          ? 'bg-accent text-accent-foreground font-medium'
                          : 'text-foreground hover:bg-accent/50'
                          }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Link>
                    )
                  })}
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <div>
              <button
                onClick={() => setLocationsExpanded(!locationsExpanded)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-all duration-200 ${isLocationActive
                  ? 'bg-gradient-to-r from-sidebar-primary to-sidebar-primary/80 text-sidebar-primary-foreground shadow-md'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'
                  }`}
              >
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-left">Locations</span>
                {locationsExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>

              {/* Location Sub-items */}
              {locationsExpanded && (
                <div className="mt-1 ml-4 space-y-1 border-l-2 border-sidebar-border pl-2">
                  {locationItems.map((item) => {
                    const isActive = pathname.includes(item.href)
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all duration-200 ${isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent/40 hover:text-sidebar-accent-foreground'
                          }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </TooltipProvider>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border space-y-3 flex-shrink-0">
        {!sidebarCollapsed && user && (
          <div className="px-4 py-3 bg-gradient-to-r from-primary/8 to-primary/5 rounded-lg text-xs border border-primary/10">
            <p className="font-semibold text-sidebar-foreground">{user.username}</p>
            <p className="text-sidebar-foreground/70 mt-0.5 text-xs">
              {user.role?.name || 'Admin'}
            </p>
          </div>
        )}
        <TooltipProvider delayDuration={0}>
          {sidebarCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full justify-center px-2 text-sm text-destructive hover:text-destructive hover:bg-red-100 border hover:border-red-500"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium">
                Logout
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full justify-start text-sm text-destructive hover:text-destructive hover:bg-red-100 border hover:border-red-500"
            >
              <LogOut className="w-4 h-4" />
              <span className="ml-2">Logout</span>
            </Button>
          )}
        </TooltipProvider>
      </div>
    </aside>
  )
}
