'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { useAuthStore } from '@/lib/auth-store'
import { useUIStore } from '@/lib/ui-store'
import { Settings, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NotificationDropdown } from '@/components/notification-dropdown'

const pageMetadata: Record<string, { title: string; description: string }> = {
  '/dashboard': {
    title: 'Dashboard',
    description: 'Overview of your Phajaoinvest platform',
  },
  '/dashboard/customers': {
    title: 'Customer Management',
    description: 'Manage customer accounts and information',
  },
  '/dashboard/staff': {
    title: 'Staff & Role Management',
    description: 'Manage staff members and permissions',
  },
  '/dashboard/packages': {
    title: 'Package Management',
    description: 'Manage membership packages and benefits',
  },
  '/dashboard/subscriptions': {
    title: 'Subscription Management',
    description: 'Manage customer subscriptions and renewals',
  },
  '/dashboard/investments': {
    title: 'Investment Account Management',
    description: 'Track and manage customer investments',
  },
  '/dashboard/stock-accounts': {
    title: 'Stock Account Management',
    description: 'Manage customer stock trading accounts',
  },
  '/dashboard/stock-picks': {
    title: 'Stock Pick Management',
    description: 'Manage available stock picks for customers',
  },
  '/dashboard/payments': {
    title: 'Payment History',
    description: 'View and manage all payment transactions',
  },
  '/dashboard/settings': {
    title: 'Settings',
    description: 'Configure your Phajaoinvest admin platform',
  },
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed)
  const toggleSidebar = useUIStore((state) => state.toggleSidebar)

  const getPageMetadata = () => {
    // Check for exact match first
    if (pageMetadata[pathname]) {
      return pageMetadata[pathname]
    }
    
    // Handle dynamic routes
    if (pathname.startsWith('/dashboard/stock-accounts/')) {
      return {
        title: 'Stock Account Details',
        description: 'View customer stock account information and transactions',
      }
    }
    if (pathname.startsWith('/dashboard/investments/')) {
      return {
        title: 'Investment Account Details',
        description: 'View customer investment history and transactions',
      }
    }
    
    // Default fallback
    return {
      title: 'Dashboard',
      description: 'Phajaoinvest Admin',
    }
  }

  const currentPage = getPageMetadata()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main
        className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border/50 px-4 md:px-8 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={toggleSidebar}
                className="text-sm"
              >
                <Menu className="w-4 h-4" />
              </Button>
              <div>
                <h2 className="text-2xl font-light text-foreground">{currentPage.title}</h2>
                <p className="text-sm text-muted-foreground mt-1">{currentPage.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <NotificationDropdown />
              <Button 
                variant="outline" 
                size="icon" 
                className="text-sm"
                onClick={() => router.push('/dashboard/settings')}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        <div className="p-4 md:p-8 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
