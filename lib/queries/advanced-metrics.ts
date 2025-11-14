import { prisma } from '@/lib/db'
import { DateRange } from '@/lib/types'
import { startOfMonth, endOfMonth, subMonths, format, eachDayOfInterval, eachWeekOfInterval, startOfWeek } from 'date-fns'

export interface TrendData {
  period: string
  calls: number
  conversions: number
  revenue: number
  conversionRate: number
  avgCallDuration: number
}

export async function getMonthlyTrends(organizationId: string, months: number = 12): Promise<TrendData[]> {
  const trends: TrendData[] = []
  const now = new Date()

  for (let i = months - 1; i >= 0; i--) {
    const monthStart = startOfMonth(subMonths(now, i))
    const monthEnd = endOfMonth(subMonths(now, i))

    const calls = await prisma.call.findMany({
      where: {
        organizationId,
        date: { gte: monthStart, lte: monthEnd },
      },
    })

    const conversions = calls.filter(c => c.csrConversion).length
    const revenue = calls.reduce((sum, c) => sum + Number(c.csrValue || 0), 0)
    const totalDuration = calls.reduce((sum, c) => sum + (c.duration || 0), 0)

    trends.push({
      period: format(monthStart, 'MMM yyyy'),
      calls: calls.length,
      conversions,
      revenue,
      conversionRate: calls.length > 0 ? (conversions / calls.length) * 100 : 0,
      avgCallDuration: calls.length > 0 ? totalDuration / calls.length : 0,
    })
  }

  return trends
}

export async function getWeeklyTrends(organizationId: string, weeks: number = 12): Promise<TrendData[]> {
  const now = new Date()
  const startDate = subMonths(now, 3)

  const calls = await prisma.call.findMany({
    where: {
      organizationId,
      date: { gte: startDate, lte: now },
    },
  })

  // Group by week
  const weeklyData = calls.reduce((acc, call) => {
    if (call.date) {
      const weekStart = startOfWeek(call.date)
      const weekKey = format(weekStart, 'yyyy-MM-dd')

      if (!acc[weekKey]) {
        acc[weekKey] = { calls: [], weekStart }
      }
      acc[weekKey].calls.push(call)
    }
    return acc
  }, {} as Record<string, { calls: any[]; weekStart: Date }>)

  const trends = Object.entries(weeklyData)
    .map(([key, data]) => {
      const conversions = data.calls.filter(c => c.csrConversion).length
      const revenue = data.calls.reduce((sum, c) => sum + Number(c.csrValue || 0), 0)
      const totalDuration = data.calls.reduce((sum, c) => sum + (c.duration || 0), 0)

      return {
        period: format(data.weekStart, 'MMM dd'),
        calls: data.calls.length,
        conversions,
        revenue,
        conversionRate: data.calls.length > 0 ? (conversions / data.calls.length) * 100 : 0,
        avgCallDuration: data.calls.length > 0 ? totalDuration / data.calls.length : 0,
      }
    })
    .sort((a, b) => a.period.localeCompare(b.period))
    .slice(-weeks)

  return trends
}

export async function getForecast(organizationId: string) {
  // Get last 6 months of data
  const trends = await getMonthlyTrends(organizationId, 6)

  if (trends.length < 3) {
    return null // Not enough data for forecasting
  }

  // Simple linear regression for calls
  const n = trends.length
  const xSum = trends.reduce((sum, _, i) => sum + i, 0)
  const ySum = trends.reduce((sum, t) => sum + t.calls, 0)
  const xySum = trends.reduce((sum, t, i) => sum + i * t.calls, 0)
  const xxSum = trends.reduce((sum, _, i) => sum + i * i, 0)

  const slope = (n * xySum - xSum * ySum) / (n * xxSum - xSum * xSum)
  const intercept = (ySum - slope * xSum) / n

  // Forecast next 3 months
  const forecast: TrendData[] = []
  const avgConversionRate = trends.reduce((sum, t) => sum + t.conversionRate, 0) / trends.length
  const avgRevenue = trends.reduce((sum, t) => sum + t.revenue, 0) / trends.length
  const avgRevenuePerCall = avgRevenue / (trends.reduce((sum, t) => sum + t.calls, 0) / trends.length)

  for (let i = 1; i <= 3; i++) {
    const projectedCalls = Math.max(0, Math.round(slope * (n + i - 1) + intercept))
    const projectedConversions = Math.round(projectedCalls * (avgConversionRate / 100))
    const projectedRevenue = projectedCalls * avgRevenuePerCall

    forecast.push({
      period: format(subMonths(new Date(), -i), 'MMM yyyy'),
      calls: projectedCalls,
      conversions: projectedConversions,
      revenue: projectedRevenue,
      conversionRate: avgConversionRate,
      avgCallDuration: trends[trends.length - 1].avgCallDuration,
    })
  }

  return {
    historical: trends,
    forecast,
    trend: slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable',
    confidence: Math.min(95, 60 + (trends.length * 5)), // Simple confidence score
  }
}

export async function getCohortAnalysis(organizationId: string) {
  const now = new Date()
  const sixMonthsAgo = subMonths(now, 6)

  const calls = await prisma.call.findMany({
    where: {
      organizationId,
      date: { gte: sixMonthsAgo, lte: now },
    },
  })

  // Group customers by first call month
  const customerCohorts = calls.reduce((acc, call) => {
    const customer = call.customerNumber || call.phone
    if (!customer || !call.date) return acc

    const monthKey = format(call.date, 'yyyy-MM')

    if (!acc[customer]) {
      acc[customer] = {
        firstCallMonth: monthKey,
        calls: [],
      }
    }

    // Update first call month if this call is earlier
    if (monthKey < acc[customer].firstCallMonth) {
      acc[customer].firstCallMonth = monthKey
    }

    acc[customer].calls.push(call)
    return acc
  }, {} as Record<string, { firstCallMonth: string; calls: any[] }>)

  // Calculate cohort metrics
  const cohortData: Record<string, {
    month: string
    newCustomers: number
    totalRevenue: number
    avgRevenue: number
    retentionMonth1: number
    retentionMonth2: number
    retentionMonth3: number
  }> = {}

  Object.values(customerCohorts).forEach(({ firstCallMonth, calls: customerCalls }) => {
    if (!cohortData[firstCallMonth]) {
      cohortData[firstCallMonth] = {
        month: firstCallMonth,
        newCustomers: 0,
        totalRevenue: 0,
        avgRevenue: 0,
        retentionMonth1: 0,
        retentionMonth2: 0,
        retentionMonth3: 0,
      }
    }

    cohortData[firstCallMonth].newCustomers++
    const revenue = customerCalls.reduce((sum, c) => sum + Number(c.csrValue || 0), 0)
    cohortData[firstCallMonth].totalRevenue += revenue
  })

  // Calculate averages
  Object.values(cohortData).forEach(cohort => {
    cohort.avgRevenue = cohort.newCustomers > 0 ? cohort.totalRevenue / cohort.newCustomers : 0
  })

  return Object.values(cohortData).sort((a, b) => a.month.localeCompare(b.month))
}

export async function getAttributionAnalysis(organizationId: string, dateRange?: DateRange) {
  const now = new Date()
  const startDate = dateRange?.from || startOfMonth(now)
  const endDate = dateRange?.to || endOfMonth(now)

  const calls = await prisma.call.findMany({
    where: {
      organizationId,
      date: { gte: startDate, lte: endDate },
    },
  })

  // Attribution by channel
  const channelAttribution = calls.reduce((acc, call) => {
    const channel = call.medium || 'Unknown'
    if (!acc[channel]) {
      acc[channel] = {
        channel,
        calls: 0,
        conversions: 0,
        revenue: 0,
        firstTouch: 0,
        lastTouch: 0,
      }
    }
    acc[channel].calls++
    if (call.csrConversion) acc[channel].conversions++
    acc[channel].revenue += Number(call.csrValue || 0)

    // Simple first/last touch attribution (in a real system, this would be more sophisticated)
    acc[channel].firstTouch += Number(call.csrValue || 0) * 0.5
    acc[channel].lastTouch += Number(call.csrValue || 0) * 0.5

    return acc
  }, {} as Record<string, {
    channel: string
    calls: number
    conversions: number
    revenue: number
    firstTouch: number
    lastTouch: number
  }>)

  return Object.values(channelAttribution)
    .map(c => ({
      ...c,
      conversionRate: c.calls > 0 ? (c.conversions / c.calls) * 100 : 0,
      costPerConversion: c.conversions > 0 ? c.revenue / c.conversions : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue)
}

export async function getPerformanceComparison(organizationId: string) {
  const now = new Date()

  // Current month vs last month
  const currentMonthStart = startOfMonth(now)
  const currentMonthEnd = endOfMonth(now)
  const lastMonthStart = startOfMonth(subMonths(now, 1))
  const lastMonthEnd = endOfMonth(subMonths(now, 1))

  const [currentMonth, lastMonth] = await Promise.all([
    prisma.call.findMany({
      where: {
        organizationId,
        date: { gte: currentMonthStart, lte: currentMonthEnd },
      },
    }),
    prisma.call.findMany({
      where: {
        organizationId,
        date: { gte: lastMonthStart, lte: lastMonthEnd },
      },
    }),
  ])

  const calculateMetrics = (calls: any[]) => {
    const conversions = calls.filter(c => c.csrConversion).length
    const revenue = calls.reduce((sum, c) => sum + Number(c.csrValue || 0), 0)
    const totalDuration = calls.reduce((sum, c) => sum + (c.duration || 0), 0)
    const answeredCalls = calls.filter(c => c.callStatus === 'answered').length

    return {
      calls: calls.length,
      conversions,
      revenue,
      conversionRate: calls.length > 0 ? (conversions / calls.length) * 100 : 0,
      avgDuration: calls.length > 0 ? totalDuration / calls.length : 0,
      answerRate: calls.length > 0 ? (answeredCalls / calls.length) * 100 : 0,
      revenuePerCall: calls.length > 0 ? revenue / calls.length : 0,
    }
  }

  const current = calculateMetrics(currentMonth)
  const previous = calculateMetrics(lastMonth)

  return {
    current: {
      ...current,
      period: format(currentMonthStart, 'MMMM yyyy'),
    },
    previous: {
      ...previous,
      period: format(lastMonthStart, 'MMMM yyyy'),
    },
    changes: {
      calls: previous.calls > 0 ? ((current.calls - previous.calls) / previous.calls) * 100 : 0,
      conversions: previous.conversions > 0 ? ((current.conversions - previous.conversions) / previous.conversions) * 100 : 0,
      revenue: previous.revenue > 0 ? ((current.revenue - previous.revenue) / previous.revenue) * 100 : 0,
      conversionRate: current.conversionRate - previous.conversionRate,
      answerRate: current.answerRate - previous.answerRate,
      avgDuration: previous.avgDuration > 0 ? ((current.avgDuration - previous.avgDuration) / previous.avgDuration) * 100 : 0,
    },
  }
}

export async function getCorrelationAnalysis(organizationId: string, dateRange?: DateRange) {
  const now = new Date()
  const startDate = dateRange?.from || subMonths(now, 3)
  const endDate = dateRange?.to || now

  const calls = await prisma.call.findMany({
    where: {
      organizationId,
      date: { gte: startDate, lte: endDate },
    },
  })

  // Analyze correlations between different factors and conversion
  const insights = []

  // Call duration vs conversion
  const shortCalls = calls.filter(c => (c.duration || 0) < 60)
  const mediumCalls = calls.filter(c => (c.duration || 0) >= 60 && (c.duration || 0) < 300)
  const longCalls = calls.filter(c => (c.duration || 0) >= 300)

  insights.push({
    factor: 'Call Duration',
    segments: [
      {
        name: 'Short (<1 min)',
        calls: shortCalls.length,
        conversionRate: shortCalls.length > 0 ? (shortCalls.filter(c => c.csrConversion).length / shortCalls.length) * 100 : 0,
      },
      {
        name: 'Medium (1-5 min)',
        calls: mediumCalls.length,
        conversionRate: mediumCalls.length > 0 ? (mediumCalls.filter(c => c.csrConversion).length / mediumCalls.length) * 100 : 0,
      },
      {
        name: 'Long (5+ min)',
        calls: longCalls.length,
        conversionRate: longCalls.length > 0 ? (longCalls.filter(c => c.csrConversion).length / longCalls.length) * 100 : 0,
      },
    ],
  })

  // Day of week vs conversion
  const dayOfWeekData = calls.reduce((acc, call) => {
    const day = call.day || 'Unknown'
    if (!acc[day]) acc[day] = { calls: 0, conversions: 0 }
    acc[day].calls++
    if (call.csrConversion) acc[day].conversions++
    return acc
  }, {} as Record<string, { calls: number; conversions: number }>)

  insights.push({
    factor: 'Day of Week',
    segments: Object.entries(dayOfWeekData).map(([day, data]) => ({
      name: day,
      calls: data.calls,
      conversionRate: data.calls > 0 ? (data.conversions / data.calls) * 100 : 0,
    })),
  })

  // Time of day vs conversion
  const timeData = calls.reduce((acc, call) => {
    const hour = call.hourOfDay ?? -1
    if (hour >= 0) {
      const period = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening'
      if (!acc[period]) acc[period] = { calls: 0, conversions: 0 }
      acc[period].calls++
      if (call.csrConversion) acc[period].conversions++
    }
    return acc
  }, {} as Record<string, { calls: number; conversions: number }>)

  insights.push({
    factor: 'Time of Day',
    segments: Object.entries(timeData).map(([period, data]) => ({
      name: period,
      calls: data.calls,
      conversionRate: data.calls > 0 ? (data.conversions / data.calls) * 100 : 0,
    })),
  })

  return insights
}

export async function getTopPerformers(organizationId: string, dateRange?: DateRange) {
  const now = new Date()
  const startDate = dateRange?.from || startOfMonth(now)
  const endDate = dateRange?.to || endOfMonth(now)

  const calls = await prisma.call.findMany({
    where: {
      organizationId,
      date: { gte: startDate, lte: endDate },
    },
  })

  // Top campaigns
  const campaignData = calls.reduce((acc, call) => {
    const campaign = call.campaign || 'Unknown'
    if (!acc[campaign]) {
      acc[campaign] = { name: campaign, calls: 0, conversions: 0, revenue: 0 }
    }
    acc[campaign].calls++
    if (call.csrConversion) acc[campaign].conversions++
    acc[campaign].revenue += Number(call.csrValue || 0)
    return acc
  }, {} as Record<string, { name: string; calls: number; conversions: number; revenue: number }>)

  const topCampaigns = Object.values(campaignData)
    .map(c => ({
      ...c,
      conversionRate: c.calls > 0 ? (c.conversions / c.calls) * 100 : 0,
      revenuePerCall: c.calls > 0 ? c.revenue / c.calls : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  // Top sources
  const sourceData = calls.reduce((acc, call) => {
    const source = call.source || 'Unknown'
    if (!acc[source]) {
      acc[source] = { name: source, calls: 0, conversions: 0, revenue: 0 }
    }
    acc[source].calls++
    if (call.csrConversion) acc[source].conversions++
    acc[source].revenue += Number(call.csrValue || 0)
    return acc
  }, {} as Record<string, { name: string; calls: number; conversions: number; revenue: number }>)

  const topSources = Object.values(sourceData)
    .map(s => ({
      ...s,
      conversionRate: s.calls > 0 ? (s.conversions / s.calls) * 100 : 0,
      revenuePerCall: s.calls > 0 ? s.revenue / s.calls : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  // Top agents
  const agentData = calls.reduce((acc, call) => {
    const agent = call.csrName || call.agent || 'Unknown'
    if (!acc[agent]) {
      acc[agent] = { name: agent, calls: 0, conversions: 0, revenue: 0 }
    }
    acc[agent].calls++
    if (call.csrConversion) acc[agent].conversions++
    acc[agent].revenue += Number(call.csrValue || 0)
    return acc
  }, {} as Record<string, { name: string; calls: number; conversions: number; revenue: number }>)

  const topAgents = Object.values(agentData)
    .map(a => ({
      ...a,
      conversionRate: a.calls > 0 ? (a.conversions / a.calls) * 100 : 0,
      revenuePerCall: a.calls > 0 ? a.revenue / a.calls : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  return {
    campaigns: topCampaigns,
    sources: topSources,
    agents: topAgents,
  }
}
