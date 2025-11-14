import { prisma } from '@/lib/db'

export interface DashboardMetrics {
  totalCalls: number
  conversionRate: number
  avgDuration: number // in seconds
  totalValue: number
  trends: {
    callsTrend: number // percentage change
    conversionTrend: number
    durationTrend: number
    valueTrend: number
  }
}

export interface ExtendedMetrics {
  // Call Volume Metrics
  answeredCalls: number
  missedCalls: number
  answerRate: number // percentage

  // Time Metrics
  avgTalkTime: number // seconds
  avgRingTime: number // seconds
  totalTalkTime: number // hours

  // Conversion Metrics
  totalConversions: number
  avgDealValue: number

  // Quality Metrics
  avgCallScore: number
  transcriptionConfidence: number

  // Revenue Metrics
  revenuePerCall: number
}

export interface DateRange {
  startDate: Date
  endDate: Date
}

/**
 * Get dashboard metrics for a specific organization and date range
 */
export async function getDashboardMetrics(
  organizationId: string,
  dateRange?: DateRange
): Promise<DashboardMetrics> {
  // Default to last 30 days if no range provided
  const endDate = dateRange?.endDate || new Date()
  const startDate = dateRange?.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  // Get current period metrics
  const currentPeriodCalls = await prisma.call.findMany({
    where: {
      organizationId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      duration: true,
      csrConversion: true,
      csrValue: true,
    },
  })

  // Calculate previous period for trends (same duration, before start date)
  const periodDuration = endDate.getTime() - startDate.getTime()
  const prevStartDate = new Date(startDate.getTime() - periodDuration)
  const prevEndDate = startDate

  const previousPeriodCalls = await prisma.call.findMany({
    where: {
      organizationId,
      date: {
        gte: prevStartDate,
        lt: prevEndDate,
      },
    },
    select: {
      duration: true,
      csrConversion: true,
      csrValue: true,
    },
  })

  // Calculate current metrics
  const totalCalls = currentPeriodCalls.length
  const conversions = currentPeriodCalls.filter(c => c.csrConversion).length
  const conversionRate = totalCalls > 0 ? (conversions / totalCalls) * 100 : 0

  const totalDuration = currentPeriodCalls.reduce((sum, c) => sum + (c.duration || 0), 0)
  const avgDuration = totalCalls > 0 ? totalDuration / totalCalls : 0

  const totalValue = currentPeriodCalls.reduce((sum, c) => {
    const value = c.csrValue ? parseFloat(c.csrValue.toString()) : 0
    return sum + value
  }, 0)

  // Calculate previous metrics for trends
  const prevTotalCalls = previousPeriodCalls.length
  const prevConversions = previousPeriodCalls.filter(c => c.csrConversion).length
  const prevConversionRate = prevTotalCalls > 0 ? (prevConversions / prevTotalCalls) * 100 : 0

  const prevTotalDuration = previousPeriodCalls.reduce((sum, c) => sum + (c.duration || 0), 0)
  const prevAvgDuration = prevTotalCalls > 0 ? prevTotalDuration / prevTotalCalls : 0

  const prevTotalValue = previousPeriodCalls.reduce((sum, c) => {
    const value = c.csrValue ? parseFloat(c.csrValue.toString()) : 0
    return sum + value
  }, 0)

  // Calculate percentage changes
  const calculateTrend = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }

  return {
    totalCalls,
    conversionRate,
    avgDuration,
    totalValue,
    trends: {
      callsTrend: calculateTrend(totalCalls, prevTotalCalls),
      conversionTrend: calculateTrend(conversionRate, prevConversionRate),
      durationTrend: calculateTrend(avgDuration, prevAvgDuration),
      valueTrend: calculateTrend(totalValue, prevTotalValue),
    },
  }
}

/**
 * Get extended metrics for additional KPIs
 */
export async function getExtendedMetrics(
  organizationId: string,
  dateRange?: DateRange
): Promise<ExtendedMetrics> {
  const endDate = dateRange?.endDate || new Date()
  const startDate = dateRange?.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const calls = await prisma.call.findMany({
    where: {
      organizationId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      callStatus: true,
      talkTime: true,
      ringTime: true,
      csrConversion: true,
      csrValue: true,
      csrCallScore: true,
      transcriptionConfidence: true,
    },
  })

  const totalCalls = calls.length

  // Call Volume Metrics
  const answeredCalls = calls.filter(c => c.callStatus === 'Answered').length
  const missedCalls = calls.filter(c => c.callStatus === 'Missed').length
  const answerRate = totalCalls > 0 ? (answeredCalls / totalCalls) * 100 : 0

  // Time Metrics
  const totalTalkTimeSeconds = calls.reduce((sum, c) => sum + (c.talkTime || 0), 0)
  const avgTalkTime = totalCalls > 0 ? totalTalkTimeSeconds / totalCalls : 0
  const totalTalkTime = totalTalkTimeSeconds / 3600 // Convert to hours

  const totalRingTime = calls.reduce((sum, c) => sum + (c.ringTime || 0), 0)
  const avgRingTime = totalCalls > 0 ? totalRingTime / totalCalls : 0

  // Conversion Metrics
  const totalConversions = calls.filter(c => c.csrConversion).length
  const totalValue = calls.reduce((sum, c) => {
    const value = c.csrValue ? parseFloat(c.csrValue.toString()) : 0
    return sum + value
  }, 0)
  const avgDealValue = totalConversions > 0 ? totalValue / totalConversions : 0

  // Quality Metrics
  const callScores = calls.filter(c => c.csrCallScore !== null && c.csrCallScore !== undefined)
  const totalCallScore = callScores.reduce((sum, c) => sum + (c.csrCallScore || 0), 0)
  const avgCallScore = callScores.length > 0 ? totalCallScore / callScores.length : 0

  const transcriptions = calls.filter(c => c.transcriptionConfidence !== null && c.transcriptionConfidence !== undefined)
  const totalConfidence = transcriptions.reduce((sum, c) => sum + (c.transcriptionConfidence || 0), 0)
  const transcriptionConfidence = transcriptions.length > 0 ? totalConfidence / transcriptions.length : 0

  // Revenue Metrics
  const revenuePerCall = totalCalls > 0 ? totalValue / totalCalls : 0

  return {
    answeredCalls,
    missedCalls,
    answerRate,
    avgTalkTime,
    avgRingTime,
    totalTalkTime,
    totalConversions,
    avgDealValue,
    avgCallScore,
    transcriptionConfidence,
    revenuePerCall,
  }
}

/**
 * Format duration in seconds to MM:SS or HH:MM:SS
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

/**
 * Get call volume over time for charts
 */
export async function getCallVolumeOverTime(
  organizationId: string,
  dateRange?: DateRange,
  groupBy: 'day' | 'week' | 'month' = 'day'
): Promise<Array<{ date: string; calls: number; conversions: number }>> {
  const endDate = dateRange?.endDate || new Date()
  const startDate = dateRange?.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const calls = await prisma.call.findMany({
    where: {
      organizationId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      date: true,
      csrConversion: true,
    },
    orderBy: {
      date: 'asc',
    },
  })

  // Group by date
  const grouped = new Map<string, { calls: number; conversions: number }>()

  calls.forEach(call => {
    if (!call.date) return

    const dateKey = call.date.toISOString().split('T')[0] // YYYY-MM-DD
    const existing = grouped.get(dateKey) || { calls: 0, conversions: 0 }
    existing.calls++
    if (call.csrConversion) existing.conversions++
    grouped.set(dateKey, existing)
  })

  // Convert to array and sort
  return Array.from(grouped.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Get calls by source for pie charts
 */
export async function getCallsBySource(
  organizationId: string,
  dateRange?: DateRange
): Promise<Array<{ source: string; count: number; value: number }>> {
  const endDate = dateRange?.endDate || new Date()
  const startDate = dateRange?.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const calls = await prisma.call.groupBy({
    by: ['source'],
    where: {
      organizationId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    _count: {
      id: true,
    },
    _sum: {
      csrValue: true,
    },
  })

  return calls
    .map(group => ({
      source: group.source || 'Unknown',
      count: group._count.id,
      value: group._sum.csrValue ? parseFloat(group._sum.csrValue.toString()) : 0,
    }))
    .sort((a, b) => b.count - a.count)
}
