'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useUIStore } from '@/lib/ui-store'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/lib/auth-store'
import { Button } from '@/components/ui/button'
import { BarChart3, Users, UserCog, Package, TrendingUp, Clock as Stock, Zap, CreditCard, LogOut, Settings, FileText, ChevronDown, ChevronRight, Briefcase } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/dashboard/customers', label: 'Customers', icon: Users },
  { href: '/dashboard/staff', label: 'Staff & Roles', icon: UserCog },
  { href: '/dashboard/packages', label: 'Packages', icon: Package },
  { href: '/dashboard/subscriptions', label: 'Subscriptions', icon: FileText },
  { href: '/dashboard/investments', label: 'Investments', icon: TrendingUp },
  { href: '/dashboard/stock-accounts', label: 'Stock Accounts', icon: Stock },
  { href: '/dashboard/stock-picks', label: 'Stock Picks', icon: Zap },
  { href: '/dashboard/payments', label: 'Payments', icon: CreditCard },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

const serviceItems = [
  { href: '/dashboard/services/premium-membership', label: 'Premium Membership' },
  { href: '/dashboard/services/international-stock-accounts', label: 'International Stock Accounts' },
  { href: '/dashboard/services/guaranteed-returns', label: 'Guaranteed Returns' },
]

export function Sidebar() {
  const pathname = usePathname()
  const logout = useAuthStore((state) => state.logout)
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed)
  const user = useAuthStore((state) => state.user)
  const [servicesExpanded, setServicesExpanded] = useState(
    pathname.startsWith('/dashboard/services')
  )

  const handleLogout = async () => {
    await logout()
    window.location.href = '/login'
  }

  const isServiceActive = serviceItems.some((item) => pathname === item.href)

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
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-3 rounded-md text-sm font-medium transition-all duration-200 ${isActive
                ? 'bg-gradient-to-r from-sidebar-primary to-sidebar-primary/80 text-sidebar-primary-foreground shadow-md'
                : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'
                }`}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!sidebarCollapsed && item.label}
            </Link>
          )
        })}

        {/* Services Dropdown */}
        <div>
          <button
            onClick={() => setServicesExpanded(!servicesExpanded)}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-3 rounded-md text-sm font-medium transition-all duration-200 ${isServiceActive
              ? 'bg-gradient-to-r from-sidebar-primary to-sidebar-primary/80 text-sidebar-primary-foreground shadow-md'
              : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'
              }`}
            title={sidebarCollapsed ? 'Services' : undefined}
          >
            <Briefcase className="w-4 h-4 flex-shrink-0" />
            {!sidebarCollapsed && (
              <>
                <span className="flex-1 text-left">Services</span>
                {servicesExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </>
            )}
          </button>

          {/* Service Sub-items */}
          {servicesExpanded && !sidebarCollapsed && (
            <div className="mt-1 ml-4 space-y-1 border-l-2 border-sidebar-border pl-2">
              {serviceItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block px-3 py-2 rounded-md text-sm transition-all duration-200 ${isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/40 hover:text-sidebar-accent-foreground'
                      }`}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </div>
          )}
        </div>
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
        <Button
          onClick={handleLogout}
          variant="outline"
          className={`w-full ${sidebarCollapsed ? 'justify-center px-2' : 'justify-start'} text-sm text-destructive hover:text-destructive hover:bg-red-100 border hover:border-red-500`}
          title={sidebarCollapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-4 h-4" />
          {!sidebarCollapsed && <span className="ml-2">Logout</span>}
        </Button>
      </div>
    </aside>
  )
}
