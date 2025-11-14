import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  icon?: LucideIcon
  trend?: {
    value: number
    label?: string
  }
  variant?: 'default' | 'success' | 'warning' | 'danger'
  className?: string
}

export function StatCard({ label, value, icon: Icon, trend, variant = 'default', className }: StatCardProps) {
  const variantStyles = {
    default: 'border-border',
    success: 'border-green-500/20 bg-green-500/5',
    warning: 'border-amber-500/20 bg-amber-500/5',
    danger: 'border-red-500/20 bg-red-500/5',
  }

  const trendColor = trend && trend.value > 0
    ? 'text-green-600 dark:text-green-400'
    : trend && trend.value < 0
    ? 'text-red-600 dark:text-red-400'
    : 'text-muted-foreground'

  return (
    <Card className={cn('border', variantStyles[variant], className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {label}
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold tracking-tight">{value}</p>
              {trend && (
                <span className={cn('text-xs font-medium', trendColor)}>
                  {trend.value > 0 ? '+' : ''}{trend.value}%
                  {trend.label && ` ${trend.label}`}
                </span>
              )}
            </div>
          </div>
          {Icon && (
            <div className="p-2.5 rounded-lg bg-primary/5">
              <Icon className="w-5 h-5 text-primary" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
