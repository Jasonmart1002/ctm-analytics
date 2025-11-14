import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { InfoTooltip } from '@/components/ui/info-tooltip'
import { cn } from '@/lib/utils'

interface KPICardProps {
  title: string
  value: string | number
  trend?: number
  icon?: React.ReactNode
  description?: string
  tooltip?: string
}

export function KPICard({ title, value, trend, icon, description, tooltip }: KPICardProps) {
  const isPositive = trend && trend > 0
  const isNegative = trend && trend < 0
  const isNeutral = trend === 0

  return (
    <Card className="hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 ease-out overflow-hidden border-border/50">
      <div className="absolute top-0 right-0 w-24 h-24 -mr-12 -mt-12 opacity-5">
        {icon && <div className="text-foreground scale-150">{icon}</div>}
      </div>

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          {icon && (
            <div className="p-2 rounded-lg bg-primary/5 text-primary">
              {icon}
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <CardTitle className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
              {title}
            </CardTitle>
            {tooltip && <InfoTooltip content={tooltip} />}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-baseline justify-between">
          <div className="text-4xl font-bold number-display tracking-tight">
            {value}
          </div>
        </div>

        {description && (
          <p className="text-xs text-muted-foreground mt-2">{description}</p>
        )}

        {trend !== undefined && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <div className="flex items-center gap-1.5">
              {isPositive && (
                <>
                  <TrendingUp className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    +{trend.toFixed(1)}%
                  </span>
                </>
              )}
              {isNegative && (
                <>
                  <TrendingDown className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">
                    {trend.toFixed(1)}%
                  </span>
                </>
              )}
              {isNeutral && (
                <>
                  <Minus className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    0%
                  </span>
                </>
              )}
              <span className="text-xs text-muted-foreground ml-1">
                vs previous period
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
