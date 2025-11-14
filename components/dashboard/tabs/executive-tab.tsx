'use client'

import * as React from 'react'
import { Decimal } from '@prisma/client/runtime/library'
import { format, parseISO } from 'date-fns'
import { KPICard } from '../kpi-card'
import { ComboChart } from '../combo-chart'
import { DonutChart } from '../donut-chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { InfoTooltip } from '@/components/ui/info-tooltip'
import {
  DollarSign,
  TrendingUp,
  Target,
  Users,
  Phone,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

interface Call {
  id: string
  callId: string
  datetime?: Date | null
  trackingSource?: string | null
  campaign?: string | null
  csrConversion?: boolean | null
  csrValue?: Decimal | null
  callStatus?: string | null
}

interface ExecutiveMetrics {
  totalRevenue: number
  totalCalls: number
  totalConversions: number
  conversionRate: number
  avgRevenuePerCall: number
  avgRevenuePerConversion: number
  growthRate: number
  trends: {
    revenueTrend: number
    callsTrend: number
    conversionsTrend: number
    avgRevenueTrend: number
  }
}

interface RevenueBySource {
  source: string
  revenue: number
  calls: number
  conversions: number
  roi: number
}

interface MonthlyTrend {
  date: string
  revenue: number
  calls: number
  conversions: number
  conversionRate: number
}

interface PerformanceSummary {
  metric: string
  current: number | string
  previous: number | string
  change: number
  trend: 'up' | 'down' | 'neutral'
}

interface ExecutiveTabProps {
  calls: Call[]
  metrics: ExecutiveMetrics
  revenueBySource: RevenueBySource[]
  monthlyTrends: MonthlyTrend[]
  performanceSummary: PerformanceSummary[]
  topRevenueChannels: { channel: string; revenue: number; percentage: number }[]
}

export function ExecutiveTab({
  calls,
  metrics,
  revenueBySource,
  monthlyTrends,
  performanceSummary,
  topRevenueChannels,
}: ExecutiveTabProps) {
  const formatDateLabel = React.useCallback((value: string | number) => {
    if (typeof value !== 'string') return String(value)
    try {
      return format(parseISO(value), 'MMM dd')
    } catch {
      return value
    }
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatCompactCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`
    }
    return formatCurrency(value)
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    if (trend === 'up') return <ArrowUpRight className="h-4 w-4 text-green-600" />
    if (trend === 'down') return <ArrowDownRight className="h-4 w-4 text-red-600" />
    return null
  }

  const getTrendColor = (change: number, isRevenueMetric: boolean = true) => {
    // For revenue metrics, positive is good
    // For cost metrics, negative would be good
    if (isRevenueMetric) {
      if (change > 5) return 'text-green-600'
      if (change < -5) return 'text-red-600'
    }
    return 'text-muted-foreground'
  }

  return (
    <div className="p-6 space-y-6">
      {/* Row 1: Executive KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <KPICard
          title="Total Revenue"
          value={formatCompactCurrency(metrics.totalRevenue)}
          trend={metrics.trends.revenueTrend}
          icon={<DollarSign className="h-4 w-4" />}
          description={`${metrics.trends.revenueTrend > 0 ? '+' : ''}${metrics.trends.revenueTrend.toFixed(1)}% vs last period`}
          tooltip="Total revenue generated from all converted calls in the selected date range"
        />
        <KPICard
          title="Call Volume"
          value={metrics.totalCalls.toLocaleString()}
          trend={metrics.trends.callsTrend}
          icon={<Phone className="h-4 w-4" />}
          description={`${metrics.totalConversions.toLocaleString()} conversions (${metrics.conversionRate.toFixed(1)}%)`}
          tooltip="Total number of calls received and conversion rate"
        />
        <KPICard
          title="Avg Revenue per Call"
          value={formatCurrency(metrics.avgRevenuePerCall)}
          trend={metrics.trends.avgRevenueTrend}
          icon={<Target className="h-4 w-4" />}
          description={`${formatCurrency(metrics.avgRevenuePerConversion)} per conversion`}
          tooltip="Average revenue generated per call and per successful conversion"
        />
        <KPICard
          title="Growth Rate"
          value={`${metrics.growthRate > 0 ? '+' : ''}${metrics.growthRate.toFixed(1)}%`}
          trend={metrics.growthRate}
          icon={<TrendingUp className="h-4 w-4" />}
          description={`Period-over-period growth`}
          tooltip="Overall business growth compared to previous period"
        />
      </div>

      {/* Row 2: Monthly Trends */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Revenue & Performance Trends</CardTitle>
            <InfoTooltip content="Track revenue, call volume, and conversion trends over time" />
          </div>
        </CardHeader>
        <CardContent>
          <ComboChart
            data={monthlyTrends}
            xAxisKey="date"
            bars={[
              { key: 'revenue', name: 'Revenue ($)', color: '#10b981' },
            ]}
            lines={[
              { key: 'calls', name: 'Calls', color: '#3b82f6' },
              { key: 'conversionRate', name: 'Conversion Rate %', color: '#8b5cf6' },
            ]}
            height={320}
            xTickFormatter={formatDateLabel}
            tooltipLabelFormatter={formatDateLabel}
          />
        </CardContent>
      </Card>

      {/* Row 3: Revenue Breakdown & Performance Summary */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Revenue by Source */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Revenue by Channel</CardTitle>
              <InfoTooltip content="Revenue contribution by marketing channel or source" />
            </div>
          </CardHeader>
          <CardContent>
            {topRevenueChannels.length === 0 ? (
              <div className="flex items-center justify-center h-[280px] text-muted-foreground">
                No revenue data available
              </div>
            ) : (
              <DonutChart
                data={topRevenueChannels.map((ch) => ({
                  name: ch.channel,
                  value: ch.revenue,
                }))}
                height={280}
              />
            )}
          </CardContent>
        </Card>

        {/* Performance Summary */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Key Metrics Summary</CardTitle>
              <InfoTooltip content="Period-over-period comparison of key performance indicators" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {performanceSummary.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No performance data available
                </div>
              ) : (
                performanceSummary.map((item) => (
                  <div
                    key={item.metric}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">{item.metric}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-lg font-semibold">{item.current}</span>
                        <span className="text-xs text-muted-foreground">
                          vs {item.previous}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(item.trend)}
                      <span className={`font-medium text-sm ${getTrendColor(item.change)}`}>
                        {item.change > 0 ? '+' : ''}{item.change.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Top Revenue Sources Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Top Revenue-Generating Sources</CardTitle>
            <InfoTooltip content="Marketing sources ranked by total revenue generated" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Calls</TableHead>
                <TableHead className="text-right">Conversions</TableHead>
                <TableHead className="text-right">Conv. Rate</TableHead>
                <TableHead className="text-right">Avg Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {revenueBySource.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No revenue source data available
                  </TableCell>
                </TableRow>
              ) : (
                revenueBySource.map((source) => {
                  const convRate = source.calls > 0 ? (source.conversions / source.calls) * 100 : 0
                  const avgRev = source.conversions > 0 ? source.revenue / source.conversions : 0
                  return (
                    <TableRow key={source.source}>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {source.source || '(No source)'}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-green-600">
                        {formatCurrency(source.revenue)}
                      </TableCell>
                      <TableCell className="text-right">
                        {source.calls.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {source.conversions.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={convRate >= 50 ? 'default' : 'secondary'}>
                          {convRate.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatCurrency(avgRev)}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Executive Insights */}
      <Card className="bg-muted/30 border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Executive Summary</CardTitle>
            <InfoTooltip content="Key insights and highlights from the current period" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
              <p>
                <span className="font-medium">Revenue Performance:</span> Generated{' '}
                {formatCurrency(metrics.totalRevenue)} from {metrics.totalCalls.toLocaleString()}{' '}
                calls with a {metrics.conversionRate.toFixed(1)}% conversion rate
                {metrics.trends.revenueTrend !== 0 && (
                  <span className={getTrendColor(metrics.trends.revenueTrend)}>
                    {' '}({metrics.trends.revenueTrend > 0 ? '+' : ''}{metrics.trends.revenueTrend.toFixed(1)}% vs previous period)
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
              <p>
                <span className="font-medium">Conversion Efficiency:</span> Each call generated{' '}
                {formatCurrency(metrics.avgRevenuePerCall)} on average, with successful conversions averaging{' '}
                {formatCurrency(metrics.avgRevenuePerConversion)}
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
              <p>
                <span className="font-medium">Growth Trajectory:</span> Overall business growth of{' '}
                {metrics.growthRate > 0 ? '+' : ''}{metrics.growthRate.toFixed(1)}% compared to the previous period
                {metrics.growthRate > 10 && ' - strong growth momentum'}
                {metrics.growthRate < -10 && ' - attention needed'}
              </p>
            </div>
            {revenueBySource.length > 0 && (
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                <p>
                  <span className="font-medium">Top Channel:</span>{' '}
                  {revenueBySource[0].source} generated the most revenue at{' '}
                  {formatCurrency(revenueBySource[0].revenue)} from{' '}
                  {revenueBySource[0].conversions.toLocaleString()} conversions
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
