import { prisma } from '@/lib/db'
import { DateRange } from '@/lib/types'
import {
  startOfMonth,
  startOfYear,
  endOfMonth,
  endOfYear,
  subMonths,
  subYears
} from 'date-fns'

export interface ExecutiveMetrics {
  // Revenue Metrics
  totalRevenue: number
  revenueGrowth: number
  avgDealSize: number
  dealSizeGrowth: number

  // Call Volume Metrics
  totalCalls: number
  callGrowth: number
  answeredCalls: number
  answerRate: number
  answerRateChange: number

  // Conversion Metrics
  totalConversions: number
  conversionRate: number
  conversionRateChange: number

  // Agent Metrics
  activeAgents: number
  topPerformer: {
    name: string
    revenue: number
    conversions: number
  } | null

  // Efficiency Metrics
  avgCallDuration: number
  revenuePerCall: number
  revenuePerAgent: number

  // Time Period
  period: string
}

export async function getExecutiveMetrics(
  organizationId: string,
  dateRange?: DateRange
): Promise<ExecutiveMetrics> {
  const now = new Date()

  // Default to current month if no date range provided
  const startDate = dateRange?.from || startOfMonth(now)
  const endDate = dateRange?.to || endOfMonth(now)

  // Calculate previous period for comparisons
  const periodLength = endDate.getTime() - startDate.getTime()
  const previousStartDate = new Date(startDate.getTime() - periodLength)
  const previousEndDate = new Date(endDate.getTime() - periodLength)

  // Fetch current period data
  const currentCalls = await prisma.call.findMany({
    where: {
      organizationId,
      date: { gte: startDate, lte: endDate },
    },
  })

  // Fetch previous period data for comparisons
  const previousCalls = await prisma.call.findMany({
    where: {
      organizationId,
      date: { gte: previousStartDate, lte: previousEndDate },
    },
  })

  // Current Period Calculations
  const totalRevenue = currentCalls.reduce((sum, call) => sum + Number(call.csrValue || 0), 0)
  const totalCalls = currentCalls.length
  const answeredCalls = currentCalls.filter(call => call.callStatus === 'answered').length
  const conversions = currentCalls.filter(call => call.csrConversion).length
  const conversionRate = totalCalls > 0 ? (conversions / totalCalls) * 100 : 0
  const answerRate = totalCalls > 0 ? (answeredCalls / totalCalls) * 100 : 0
  const avgDealSize = conversions > 0 ? totalRevenue / conversions : 0

  // Calculate average call duration in seconds
  const totalDuration = currentCalls.reduce((sum, call) => sum + (call.duration || 0), 0)
  const avgCallDuration = totalCalls > 0 ? totalDuration / totalCalls : 0

  // Revenue per call and efficiency metrics
  const revenuePerCall = totalCalls > 0 ? totalRevenue / totalCalls : 0

  // Get unique active agents
  const uniqueAgents = new Set(
    currentCalls
      .filter(call => call.agent)
      .map(call => call.agent!)
  )
  const activeAgents = uniqueAgents.size

  const revenuePerAgent = activeAgents > 0 ? totalRevenue / activeAgents : 0

  // Find top performer
  const agentPerformance = currentCalls.reduce((acc, call) => {
    const agentName = call.agent || call.csrName || 'Unknown'
    if (!acc[agentName]) {
      acc[agentName] = {
        revenue: 0,
        conversions: 0,
      }
    }
    acc[agentName].revenue += Number(call.csrValue || 0)
    acc[agentName].conversions += call.csrConversion ? 1 : 0
    return acc
  }, {} as Record<string, { revenue: number; conversions: number }>)

  const topPerformer = Object.entries(agentPerformance)
    .sort(([, a], [, b]) => b.revenue - a.revenue)[0]

  const topPerformerData = topPerformer
    ? {
        name: topPerformer[0],
        revenue: topPerformer[1].revenue,
        conversions: topPerformer[1].conversions,
      }
    : null

  // Previous Period Calculations for Growth
  const previousRevenue = previousCalls.reduce((sum, call) => sum + Number(call.csrValue || 0), 0)
  const previousCallCount = previousCalls.length
  const previousConversions = previousCalls.filter(call => call.csrConversion).length
  const previousConversionRate = previousCallCount > 0
    ? (previousConversions / previousCallCount) * 100
    : 0
  const previousAnsweredCalls = previousCalls.filter(call => call.callStatus === 'answered').length
  const previousAnswerRate = previousCallCount > 0
    ? (previousAnsweredCalls / previousCallCount) * 100
    : 0
  const previousAvgDealSize = previousConversions > 0
    ? previousRevenue / previousConversions
    : 0

  // Calculate growth percentages
  const revenueGrowth = previousRevenue > 0
    ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
    : 0

  const callGrowth = previousCallCount > 0
    ? ((totalCalls - previousCallCount) / previousCallCount) * 100
    : 0

  const conversionRateChange = previousConversionRate > 0
    ? conversionRate - previousConversionRate
    : 0

  const answerRateChange = previousAnswerRate > 0
    ? answerRate - previousAnswerRate
    : 0

  const dealSizeGrowth = previousAvgDealSize > 0
    ? ((avgDealSize - previousAvgDealSize) / previousAvgDealSize) * 100
    : 0

  // Determine period label
  const period = dateRange
    ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
    : 'This Month'

  return {
    totalRevenue,
    revenueGrowth,
    avgDealSize,
    dealSizeGrowth,
    totalCalls,
    callGrowth,
    answeredCalls,
    answerRate,
    answerRateChange,
    totalConversions: conversions,
    conversionRate,
    conversionRateChange,
    activeAgents,
    topPerformer: topPerformerData,
    avgCallDuration,
    revenuePerCall,
    revenuePerAgent,
    period,
  }
}

// Get year-over-year comparison
export async function getYearOverYearMetrics(organizationId: string) {
  const now = new Date()
  const currentYearStart = startOfYear(now)
  const currentYearEnd = now
  const previousYearStart = subYears(currentYearStart, 1)
  const previousYearEnd = subYears(currentYearEnd, 1)

  const [currentYear, previousYear] = await Promise.all([
    getExecutiveMetrics(organizationId, {
      from: currentYearStart,
      to: currentYearEnd,
    }),
    getExecutiveMetrics(organizationId, {
      from: previousYearStart,
      to: previousYearEnd,
    }),
  ])

  return {
    current: currentYear,
    previous: previousYear,
    growth: {
      revenue: previousYear.totalRevenue > 0
        ? ((currentYear.totalRevenue - previousYear.totalRevenue) / previousYear.totalRevenue) * 100
        : 0,
      calls: previousYear.totalCalls > 0
        ? ((currentYear.totalCalls - previousYear.totalCalls) / previousYear.totalCalls) * 100
        : 0,
      conversions: previousYear.totalConversions > 0
        ? ((currentYear.totalConversions - previousYear.totalConversions) / previousYear.totalConversions) * 100
        : 0,
    },
  }
}

// Get monthly trend data for charts
export async function getMonthlyTrends(organizationId: string, months: number = 12) {
  const now = new Date()
  const trends = []

  for (let i = months - 1; i >= 0; i--) {
    const monthStart = startOfMonth(subMonths(now, i))
    const monthEnd = endOfMonth(subMonths(now, i))

    const calls = await prisma.call.findMany({
      where: {
        organizationId,
        date: { gte: monthStart, lte: monthEnd },
      },
    })

    const revenue = calls.reduce((sum, call) => sum + Number(call.csrValue || 0), 0)
    const conversions = calls.filter(call => call.csrConversion).length
    const conversionRate = calls.length > 0 ? (conversions / calls.length) * 100 : 0

    trends.push({
      month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      revenue,
      calls: calls.length,
      conversions,
      conversionRate,
    })
  }

  return trends
}
