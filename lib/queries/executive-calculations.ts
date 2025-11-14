import { Decimal } from '@prisma/client/runtime/library'

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

interface PreviousCall {
  csrConversion?: boolean | null
  csrValue?: Decimal | null
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

interface TopRevenueChannel {
  channel: string
  revenue: number
  percentage: number
}

/**
 * Calculate executive overview metrics with comprehensive trends
 */
export function calculateExecutiveMetrics(
  currentCalls: Call[],
  previousCalls: PreviousCall[]
): ExecutiveMetrics {
  // Current period metrics
  const totalCalls = currentCalls.length
  const totalConversions = currentCalls.filter((c) => c.csrConversion).length
  const totalRevenue = currentCalls.reduce(
    (sum, c) => sum + (c.csrValue ? Number(c.csrValue) : 0),
    0
  )

  const conversionRate = totalCalls > 0 ? (totalConversions / totalCalls) * 100 : 0
  const avgRevenuePerCall = totalCalls > 0 ? totalRevenue / totalCalls : 0
  const avgRevenuePerConversion = totalConversions > 0 ? totalRevenue / totalConversions : 0

  // Previous period metrics
  const prevTotalCalls = previousCalls.length
  const prevConversions = previousCalls.filter((c) => c.csrConversion).length
  const prevRevenue = previousCalls.reduce(
    (sum, c) => sum + (c.csrValue ? Number(c.csrValue) : 0),
    0
  )
  const prevAvgRevenuePerCall = prevTotalCalls > 0 ? prevRevenue / prevTotalCalls : 0

  // Calculate trends
  const revenueTrend = prevRevenue > 0
    ? ((totalRevenue - prevRevenue) / prevRevenue) * 100
    : 0

  const callsTrend = prevTotalCalls > 0
    ? ((totalCalls - prevTotalCalls) / prevTotalCalls) * 100
    : 0

  const conversionsTrend = prevConversions > 0
    ? ((totalConversions - prevConversions) / prevConversions) * 100
    : 0

  const avgRevenueTrend = prevAvgRevenuePerCall > 0
    ? ((avgRevenuePerCall - prevAvgRevenuePerCall) / prevAvgRevenuePerCall) * 100
    : 0

  // Calculate overall growth rate (weighted average of key metrics)
  const growthRate = (revenueTrend * 0.5 + callsTrend * 0.25 + conversionsTrend * 0.25)

  return {
    totalRevenue,
    totalCalls,
    totalConversions,
    conversionRate,
    avgRevenuePerCall,
    avgRevenuePerConversion,
    growthRate,
    trends: {
      revenueTrend,
      callsTrend,
      conversionsTrend,
      avgRevenueTrend,
    },
  }
}

/**
 * Calculate revenue breakdown by source
 */
export function calculateRevenueBySource(
  calls: Call[],
  limit: number = 10
): RevenueBySource[] {
  const sourceMap = new Map<string, {
    revenue: number
    calls: number
    conversions: number
  }>()

  calls.forEach((call) => {
    const source = call.trackingSource || '(No source)'
    const existing = sourceMap.get(source) || {
      revenue: 0,
      calls: 0,
      conversions: 0,
    }

    sourceMap.set(source, {
      revenue: existing.revenue + (call.csrValue ? Number(call.csrValue) : 0),
      calls: existing.calls + 1,
      conversions: existing.conversions + (call.csrConversion ? 1 : 0),
    })
  })

  const sources: RevenueBySource[] = Array.from(sourceMap.entries()).map(
    ([source, data]) => ({
      source,
      revenue: data.revenue,
      calls: data.calls,
      conversions: data.conversions,
      roi: data.calls > 0 ? (data.revenue / data.calls) * 100 : 0,
    })
  )

  // Sort by revenue (descending) and return top N
  return sources.sort((a, b) => b.revenue - a.revenue).slice(0, limit)
}

/**
 * Calculate monthly trends (or daily if period is short)
 */
export function calculateMonthlyTrends(calls: Call[]): MonthlyTrend[] {
  const dateMap = new Map<string, {
    revenue: number
    calls: number
    conversions: number
  }>()

  calls.forEach((call) => {
    if (!call.datetime) return

    // Format date as YYYY-MM-DD
    const date = call.datetime.toISOString().split('T')[0]
    const existing = dateMap.get(date) || {
      revenue: 0,
      calls: 0,
      conversions: 0,
    }

    dateMap.set(date, {
      revenue: existing.revenue + (call.csrValue ? Number(call.csrValue) : 0),
      calls: existing.calls + 1,
      conversions: existing.conversions + (call.csrConversion ? 1 : 0),
    })
  })

  const trends: MonthlyTrend[] = Array.from(dateMap.entries()).map(
    ([date, data]) => ({
      date,
      revenue: data.revenue,
      calls: data.calls,
      conversions: data.conversions,
      conversionRate: data.calls > 0 ? (data.conversions / data.calls) * 100 : 0,
    })
  )

  // Sort by date (ascending)
  return trends.sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Calculate performance summary for key metrics
 */
export function calculatePerformanceSummary(
  currentCalls: Call[],
  previousCalls: PreviousCall[]
): PerformanceSummary[] {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Current metrics
  const currRevenue = currentCalls.reduce(
    (sum, c) => sum + (c.csrValue ? Number(c.csrValue) : 0),
    0
  )
  const currCalls = currentCalls.length
  const currConversions = currentCalls.filter((c) => c.csrConversion).length
  const currConvRate = currCalls > 0 ? (currConversions / currCalls) * 100 : 0
  const currAvgRevenue = currCalls > 0 ? currRevenue / currCalls : 0

  // Previous metrics
  const prevRevenue = previousCalls.reduce(
    (sum, c) => sum + (c.csrValue ? Number(c.csrValue) : 0),
    0
  )
  const prevCalls = previousCalls.length
  const prevConversions = previousCalls.filter((c) => c.csrConversion).length
  const prevConvRate = prevCalls > 0 ? (prevConversions / prevCalls) * 100 : 0
  const prevAvgRevenue = prevCalls > 0 ? prevRevenue / prevCalls : 0

  // Calculate changes
  const revChange = prevRevenue > 0 ? ((currRevenue - prevRevenue) / prevRevenue) * 100 : 0
  const callsChange = prevCalls > 0 ? ((currCalls - prevCalls) / prevCalls) * 100 : 0
  const convChange = prevConversions > 0 ? ((currConversions - prevConversions) / prevConversions) * 100 : 0
  const convRateChange = prevConvRate > 0 ? ((currConvRate - prevConvRate) / prevConvRate) * 100 : 0
  const avgRevChange = prevAvgRevenue > 0 ? ((currAvgRevenue - prevAvgRevenue) / prevAvgRevenue) * 100 : 0

  const getTrend = (change: number): 'up' | 'down' | 'neutral' => {
    if (change > 1) return 'up'
    if (change < -1) return 'down'
    return 'neutral'
  }

  return [
    {
      metric: 'Total Revenue',
      current: formatCurrency(currRevenue),
      previous: formatCurrency(prevRevenue),
      change: revChange,
      trend: getTrend(revChange),
    },
    {
      metric: 'Call Volume',
      current: currCalls.toLocaleString(),
      previous: prevCalls.toLocaleString(),
      change: callsChange,
      trend: getTrend(callsChange),
    },
    {
      metric: 'Conversions',
      current: currConversions.toLocaleString(),
      previous: prevConversions.toLocaleString(),
      change: convChange,
      trend: getTrend(convChange),
    },
    {
      metric: 'Conversion Rate',
      current: `${currConvRate.toFixed(1)}%`,
      previous: `${prevConvRate.toFixed(1)}%`,
      change: convRateChange,
      trend: getTrend(convRateChange),
    },
    {
      metric: 'Avg Revenue/Call',
      current: formatCurrency(currAvgRevenue),
      previous: formatCurrency(prevAvgRevenue),
      change: avgRevChange,
      trend: getTrend(avgRevChange),
    },
  ]
}

/**
 * Calculate top revenue channels for donut chart
 */
export function calculateTopRevenueChannels(
  calls: Call[],
  limit: number = 6
): TopRevenueChannel[] {
  const channelMap = new Map<string, number>()

  calls.forEach((call) => {
    const channel = call.trackingSource || call.campaign || '(No channel)'
    const existing = channelMap.get(channel) || 0
    channelMap.set(channel, existing + (call.csrValue ? Number(call.csrValue) : 0))
  })

  const totalRevenue = Array.from(channelMap.values()).reduce((sum, val) => sum + val, 0)

  const channels: TopRevenueChannel[] = Array.from(channelMap.entries()).map(
    ([channel, revenue]) => ({
      channel,
      revenue,
      percentage: totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0,
    })
  )

  // Sort by revenue (descending)
  const sorted = channels.sort((a, b) => b.revenue - a.revenue)

  // Return top N, and group the rest as "Other" if there are more
  if (sorted.length <= limit) {
    return sorted
  }

  const top = sorted.slice(0, limit - 1)
  const othersRevenue = sorted.slice(limit - 1).reduce((sum, ch) => sum + ch.revenue, 0)

  return [
    ...top,
    {
      channel: 'Other',
      revenue: othersRevenue,
      percentage: totalRevenue > 0 ? (othersRevenue / totalRevenue) * 100 : 0,
    },
  ]
}
