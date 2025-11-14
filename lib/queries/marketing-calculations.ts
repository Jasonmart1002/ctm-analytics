import { Decimal } from '@prisma/client/runtime/library'

interface Call {
  id: string
  callId: string
  datetime?: Date | null
  trackingSource?: string | null
  campaign?: string | null
  medium?: string | null
  keyword?: string | null
  csrConversion?: boolean | null
  csrValue?: Decimal | null
  callStatus?: string | null
}

interface PreviousCall {
  csrConversion?: boolean | null
  csrValue?: Decimal | null
}

interface MarketingMetrics {
  totalCalls: number
  totalConversions: number
  conversionRate: number
  totalValue: number
  avgValuePerCall: number
  trends: {
    callsTrend: number
    conversionsTrend: number
    valueTrend: number
  }
}

interface CampaignPerformance {
  campaign: string
  calls: number
  conversions: number
  conversionRate: number
  totalValue: number
  avgValue: number
}

interface SourcePerformance {
  source: string
  calls: number
  conversions: number
  conversionRate: number
  totalValue: number
  avgValue: number
}

interface MediumPerformance {
  medium: string
  calls: number
  conversions: number
  conversionRate: number
}

interface KeywordPerformance {
  keyword: string
  calls: number
  conversions: number
  conversionRate: number
  totalValue: number
}

interface CampaignTrendData {
  date: string
  calls: number
  conversions: number
  conversionRate: number
}

/**
 * Calculate marketing overview metrics with trends
 */
export function calculateMarketingMetrics(
  currentCalls: Call[],
  previousCalls: PreviousCall[]
): MarketingMetrics {
  const totalCalls = currentCalls.length
  const totalConversions = currentCalls.filter((c) => c.csrConversion).length
  const conversionRate = totalCalls > 0 ? (totalConversions / totalCalls) * 100 : 0

  const totalValue = currentCalls.reduce(
    (sum, c) => sum + (c.csrValue ? Number(c.csrValue) : 0),
    0
  )
  const avgValuePerCall = totalCalls > 0 ? totalValue / totalCalls : 0

  // Calculate previous period metrics for trends
  const prevTotalCalls = previousCalls.length
  const prevConversions = previousCalls.filter((c) => c.csrConversion).length
  const prevValue = previousCalls.reduce(
    (sum, c) => sum + (c.csrValue ? Number(c.csrValue) : 0),
    0
  )

  const callsTrend = prevTotalCalls > 0
    ? ((totalCalls - prevTotalCalls) / prevTotalCalls) * 100
    : 0
  const conversionsTrend = prevConversions > 0
    ? ((totalConversions - prevConversions) / prevConversions) * 100
    : 0
  const valueTrend = prevValue > 0
    ? ((totalValue - prevValue) / prevValue) * 100
    : 0

  return {
    totalCalls,
    totalConversions,
    conversionRate,
    totalValue,
    avgValuePerCall,
    trends: {
      callsTrend,
      conversionsTrend,
      valueTrend,
    },
  }
}

/**
 * Calculate campaign performance metrics
 */
export function calculateCampaignPerformance(
  calls: Call[],
  limit: number = 10
): CampaignPerformance[] {
  const campaignMap = new Map<string, {
    calls: number
    conversions: number
    totalValue: number
  }>()

  calls.forEach((call) => {
    const campaign = call.campaign || '(No campaign)'
    const existing = campaignMap.get(campaign) || {
      calls: 0,
      conversions: 0,
      totalValue: 0,
    }

    campaignMap.set(campaign, {
      calls: existing.calls + 1,
      conversions: existing.conversions + (call.csrConversion ? 1 : 0),
      totalValue: existing.totalValue + (call.csrValue ? Number(call.csrValue) : 0),
    })
  })

  const campaigns: CampaignPerformance[] = Array.from(campaignMap.entries()).map(
    ([campaign, data]) => ({
      campaign,
      calls: data.calls,
      conversions: data.conversions,
      conversionRate: data.calls > 0 ? (data.conversions / data.calls) * 100 : 0,
      totalValue: data.totalValue,
      avgValue: data.calls > 0 ? data.totalValue / data.calls : 0,
    })
  )

  // Sort by total calls (descending) and return top N
  return campaigns.sort((a, b) => b.calls - a.calls).slice(0, limit)
}

/**
 * Calculate source performance metrics
 */
export function calculateSourcePerformance(
  calls: Call[],
  limit: number = 10
): SourcePerformance[] {
  const sourceMap = new Map<string, {
    calls: number
    conversions: number
    totalValue: number
  }>()

  calls.forEach((call) => {
    const source = call.trackingSource || '(No source)'
    const existing = sourceMap.get(source) || {
      calls: 0,
      conversions: 0,
      totalValue: 0,
    }

    sourceMap.set(source, {
      calls: existing.calls + 1,
      conversions: existing.conversions + (call.csrConversion ? 1 : 0),
      totalValue: existing.totalValue + (call.csrValue ? Number(call.csrValue) : 0),
    })
  })

  const sources: SourcePerformance[] = Array.from(sourceMap.entries()).map(
    ([source, data]) => ({
      source,
      calls: data.calls,
      conversions: data.conversions,
      conversionRate: data.calls > 0 ? (data.conversions / data.calls) * 100 : 0,
      totalValue: data.totalValue,
      avgValue: data.calls > 0 ? data.totalValue / data.calls : 0,
    })
  )

  // Sort by total calls (descending) and return top N
  return sources.sort((a, b) => b.calls - a.calls).slice(0, limit)
}

/**
 * Calculate medium breakdown
 */
export function calculateMediumBreakdown(calls: Call[]): MediumPerformance[] {
  const mediumMap = new Map<string, {
    calls: number
    conversions: number
  }>()

  calls.forEach((call) => {
    const medium = call.medium || '(Not set)'
    const existing = mediumMap.get(medium) || {
      calls: 0,
      conversions: 0,
    }

    mediumMap.set(medium, {
      calls: existing.calls + 1,
      conversions: existing.conversions + (call.csrConversion ? 1 : 0),
    })
  })

  const media: MediumPerformance[] = Array.from(mediumMap.entries()).map(
    ([medium, data]) => ({
      medium,
      calls: data.calls,
      conversions: data.conversions,
      conversionRate: data.calls > 0 ? (data.conversions / data.calls) * 100 : 0,
    })
  )

  // Sort by total calls (descending)
  return media.sort((a, b) => b.calls - a.calls)
}

/**
 * Calculate keyword performance
 */
export function calculateKeywordPerformance(
  calls: Call[],
  limit: number = 20
): KeywordPerformance[] {
  const keywordMap = new Map<string, {
    calls: number
    conversions: number
    totalValue: number
  }>()

  calls.forEach((call) => {
    // Only include calls that have a keyword
    if (!call.keyword) return

    const keyword = call.keyword
    const existing = keywordMap.get(keyword) || {
      calls: 0,
      conversions: 0,
      totalValue: 0,
    }

    keywordMap.set(keyword, {
      calls: existing.calls + 1,
      conversions: existing.conversions + (call.csrConversion ? 1 : 0),
      totalValue: existing.totalValue + (call.csrValue ? Number(call.csrValue) : 0),
    })
  })

  const keywords: KeywordPerformance[] = Array.from(keywordMap.entries()).map(
    ([keyword, data]) => ({
      keyword,
      calls: data.calls,
      conversions: data.conversions,
      conversionRate: data.calls > 0 ? (data.conversions / data.calls) * 100 : 0,
      totalValue: data.totalValue,
    })
  )

  // Sort by total calls (descending) and return top N
  return keywords.sort((a, b) => b.calls - a.calls).slice(0, limit)
}

/**
 * Calculate campaign trends over time (daily aggregation)
 */
export function calculateCampaignTrends(calls: Call[]): CampaignTrendData[] {
  const dateMap = new Map<string, {
    calls: number
    conversions: number
  }>()

  calls.forEach((call) => {
    if (!call.datetime) return

    // Format date as YYYY-MM-DD
    const date = call.datetime.toISOString().split('T')[0]
    const existing = dateMap.get(date) || {
      calls: 0,
      conversions: 0,
    }

    dateMap.set(date, {
      calls: existing.calls + 1,
      conversions: existing.conversions + (call.csrConversion ? 1 : 0),
    })
  })

  const trends: CampaignTrendData[] = Array.from(dateMap.entries()).map(
    ([date, data]) => ({
      date,
      calls: data.calls,
      conversions: data.conversions,
      conversionRate: data.calls > 0 ? (data.conversions / data.calls) * 100 : 0,
    })
  )

  // Sort by date (ascending)
  return trends.sort((a, b) => a.date.localeCompare(b.date))
}
