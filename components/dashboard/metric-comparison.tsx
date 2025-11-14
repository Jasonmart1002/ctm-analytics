import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MetricComparisonProps {
  title: string
  current: {
    label: string
    value: string | number
  }
  previous: {
    label: string
    value: string | number
  }
  change: number
  format?: 'number' | 'currency' | 'percent'
}

export function MetricComparison({ title, current, previous, change, format = 'number' }: MetricComparisonProps) {
  const isPositive = change > 0
  const isNegative = change < 0
  const isNeutral = change === 0

  const formatValue = (value: string | number) => {
    if (typeof value === 'string') return value

    switch (format) {
      case 'currency':
        return `$${value.toLocaleString()}`
      case 'percent':
        return `${value}%`
      default:
        return value.toLocaleString()
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Period */}
        <div>
          <p className="text-xs text-muted-foreground mb-1">{current.label}</p>
          <p className="text-2xl font-bold">{formatValue(current.value)}</p>
        </div>

        {/* Change Indicator */}
        <div className="flex items-center gap-2 pt-2 border-t border-border/50">
          {isPositive && (
            <>
              <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                +{change.toFixed(1)}%
              </span>
            </>
          )}
          {isNegative && (
            <>
              <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span className="text-sm font-medium text-red-600 dark:text-red-400">
                {change.toFixed(1)}%
              </span>
            </>
          )}
          {isNeutral && (
            <>
              <Minus className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                0%
              </span>
            </>
          )}
          <span className="text-xs text-muted-foreground">vs {previous.label}</span>
        </div>

        {/* Previous Period */}
        <div>
          <p className="text-xs text-muted-foreground mb-1">{previous.label}</p>
          <p className="text-lg font-semibold text-muted-foreground">
            {formatValue(previous.value)}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
