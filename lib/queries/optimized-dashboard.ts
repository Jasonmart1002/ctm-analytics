import { prisma } from '@/lib/db'
import type { DateRange } from './dashboard-metrics'

// Type for the complete call data we fetch once
interface CallData {
  id: string
  callId: string
  name: string | null
  phone: string | null
  source: string | null
  callStatus: string | null
  duration: number | null
  csrName: string | null
  csrValue: any
  date: Date | null
  audioWav: string | null
  audioMP3: string | null
  transcription: string | null
  summary: string | null
  email: string | null
  gender: string | null
  talkTime: number | null
  ringTime: number | null
  direction: string | null
  datetime: Date | null
  csrCallScore: number | null
  csrConversion: boolean | null
  agent: string | null
  medium: string | null
  campaign: string | null
  keyword: string | null
  trackingNumber: string | null
  city: string | null
  state: string | null
  postalCode: string | null
  country: string | null
  transcriptionConfidence: number | null
  device: string | null
  browser: string | null
  mobile: boolean | null
  receivingNumber: string | null
}

/**
 * Fetch all dashboard data in one optimized query
 */
export async function fetchAllDashboardData(
  organizationId: string,
  dateRange: DateRange
) {
  const { startDate, endDate } = dateRange

  // Calculate previous period dates for trends
  const periodDuration = endDate.getTime() - startDate.getTime()
  const prevStartDate = new Date(startDate.getTime() - periodDuration)
  const prevEndDate = startDate

  // Fetch current period calls (all fields needed)
  const currentCalls = await prisma.call.findMany({
    where: {
      organizationId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { date: 'desc' },
  })

  // Fetch previous period calls (only fields needed for trends)
  const previousCalls = await prisma.call.findMany({
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

  return {
    currentCalls: currentCalls as CallData[],
    previousCalls,
    dateRange,
  }
}

/**
 * Calculate dashboard metrics from pre-fetched data
 */
export function calculateDashboardMetrics(
  currentCalls: CallData[],
  previousCalls: Array<{ duration: number | null; csrConversion: boolean | null; csrValue: any }>
) {
  // Current period metrics
  const totalCalls = currentCalls.length
  const conversions = currentCalls.filter(c => c.csrConversion).length
  const conversionRate = totalCalls > 0 ? (conversions / totalCalls) * 100 : 0

  const totalDuration = currentCalls.reduce((sum, c) => sum + (c.duration || 0), 0)
  const avgDuration = totalCalls > 0 ? totalDuration / totalCalls : 0

  const totalValue = currentCalls.reduce((sum, c) => {
    const value = c.csrValue ? parseFloat(c.csrValue.toString()) : 0
    return sum + value
  }, 0)

  // Previous period metrics
  const prevTotalCalls = previousCalls.length
  const prevConversions = previousCalls.filter(c => c.csrConversion).length
  const prevConversionRate = prevTotalCalls > 0 ? (prevConversions / prevTotalCalls) * 100 : 0

  const prevTotalDuration = previousCalls.reduce((sum, c) => sum + (c.duration || 0), 0)
  const prevAvgDuration = prevTotalCalls > 0 ? prevTotalDuration / prevTotalCalls : 0

  const prevTotalValue = previousCalls.reduce((sum, c) => {
    const value = c.csrValue ? parseFloat(c.csrValue.toString()) : 0
    return sum + value
  }, 0)

  // Calculate trends
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
 * Calculate extended metrics from pre-fetched data
 */
export function calculateExtendedMetrics(calls: CallData[]) {
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
 * Calculate call volume over time from pre-fetched data
 */
export function calculateCallVolumeOverTime(calls: CallData[]) {
  const grouped = new Map<string, { calls: number; conversions: number }>()

  calls.forEach(call => {
    if (!call.date) return

    const dateKey = call.date.toISOString().split('T')[0] // YYYY-MM-DD
    const existing = grouped.get(dateKey) || { calls: 0, conversions: 0 }
    existing.calls++
    if (call.csrConversion) existing.conversions++
    grouped.set(dateKey, existing)
  })

  return Array.from(grouped.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Calculate calls by source from pre-fetched data
 */
export function calculateCallsBySource(calls: CallData[]) {
  const grouped = new Map<string, { count: number; value: number }>()

  calls.forEach(call => {
    const source = call.source || 'Unknown'
    const existing = grouped.get(source) || { count: 0, value: 0 }
    existing.count++
    const value = call.csrValue ? parseFloat(call.csrValue.toString()) : 0
    existing.value += value
    grouped.set(source, existing)
  })

  return Array.from(grouped.entries())
    .map(([source, data]) => ({ source, ...data }))
    .sort((a, b) => b.count - a.count)
}

/**
 * Calculate campaign metrics from pre-fetched data
 */
export function calculateCampaignMetrics(calls: CallData[]) {
  const grouped = new Map<string, { calls: number; conversions: number }>()

  calls.forEach(call => {
    const campaign = call.campaign || 'Unknown'
    const existing = grouped.get(campaign) || { calls: 0, conversions: 0 }
    existing.calls++
    if (call.csrConversion) existing.conversions++
    grouped.set(campaign, existing)
  })

  return Array.from(grouped.entries())
    .map(([campaign, data]) => ({
      campaign,
      calls: data.calls,
      conversions: data.conversions,
      conversionRate: data.calls > 0 ? (data.conversions / data.calls) * 100 : 0,
    }))
    .sort((a, b) => b.calls - a.calls)
}

/**
 * Calculate top keywords from pre-fetched data
 */
export function calculateTopKeywords(calls: CallData[]) {
  const grouped = new Map<string, { calls: number; conversions: number }>()

  calls.forEach(call => {
    if (!call.keyword) return
    const keyword = call.keyword
    const existing = grouped.get(keyword) || { calls: 0, conversions: 0 }
    existing.calls++
    if (call.csrConversion) existing.conversions++
    grouped.set(keyword, existing)
  })

  return Array.from(grouped.entries())
    .map(([keyword, data]) => ({
      keyword,
      calls: data.calls,
      conversions: data.conversions,
      conversionRate: data.calls > 0 ? (data.conversions / data.calls) * 100 : 0,
    }))
    .sort((a, b) => b.calls - a.calls)
}

/**
 * Calculate source/medium breakdown from pre-fetched data
 */
export function calculateSourceMediumBreakdown(calls: CallData[]) {
  const grouped = new Map<string, { calls: number; conversions: number }>()

  calls.forEach(call => {
    const source = call.source || 'Unknown'
    const medium = call.medium || 'Unknown'
    const key = `${source}|||${medium}`
    const existing = grouped.get(key) || { calls: 0, conversions: 0 }
    existing.calls++
    if (call.csrConversion) existing.conversions++
    grouped.set(key, existing)
  })

  return Array.from(grouped.entries())
    .map(([key, data]) => {
      const [source, medium] = key.split('|||')
      return {
        source,
        medium,
        calls: data.calls,
        conversions: data.conversions,
        conversionRate: data.calls > 0 ? (data.conversions / data.calls) * 100 : 0,
      }
    })
    .sort((a, b) => b.calls - a.calls)
}
