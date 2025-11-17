'use client'

import { Bell, Settings, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/lib/ui-store'
import { Breadcrumb } from '@/components/breadcrumb'
import { usePathname } from 'next/navigation'

interface DashboardHeaderProps {
  title: string
  description?: string
}

export function DashboardHeader({ title, description }: DashboardHeaderProps) {
  const toggleSidebar = useUIStore((state) => state.toggleSidebar)
  const pathname = usePathname()

  return (
    <div className="space-y-4">
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
            <h2 className="text-2xl font-light text-foreground">{title}</h2>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="text-sm">
            <Bell className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="text-sm">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <Breadcrumb />
    </div>
  )
}
