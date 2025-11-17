import { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  icon: ReactNode
  label: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative'
}

export function StatCard({ icon, label, value, change, changeType }: StatCardProps) {
  return (
    <Card className="cursor-pointer border border-border/50 shadow-md hover:shadow-lg hover:border-primary card-hover smooth-transition backdrop-blur-sm bg-white/95 dark:bg-slate-900/50 rounded-md">
      <CardContent className="py-0 px-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
            <p className="text-md font-semibold text-foreground mt-3 tracking-tight">{value}</p>
            {change && (
              <p
                className={`text-xs mt-3 font-semibold flex items-center gap-1.5 ${changeType === 'positive' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                  }`}
              >
                {changeType === 'positive' ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                {change}
              </p>
            )}
          </div>
          <div className="p-2 bg-gradient-to-br from-primary/15 to-primary/5 rounded-md text-primary shadow-sm">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
