import { prisma } from '@/lib/db'
import { DateRange } from '@/lib/types'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, format } from 'date-fns'

export interface AgentMetrics {
  totalAgents: number
  totalCalls: number
  totalConversions: number
  avgConversionRate: number
  avgCallScore: number
  avgHandleTime: number
  topAgent: string
  period: string
}

export interface AgentPerformance {
  agent: string
  calls: number
  conversions: number
  conversionRate: number
  revenue: number
  avgCallScore: number
  avgDuration: number
  avgTalkTime: number
  avgRingTime: number
  answerRate: number
  rank: number
}

export async function getAgentMetrics(organizationId: string, dateRange?: DateRange): Promise<AgentMetrics> {
  const now = new Date()
  const startDate = dateRange?.from || startOfMonth(now)
  const endDate = dateRange?.to || endOfMonth(now)

  const calls = await prisma.call.findMany({
    where: {
      organizationId,
      date: { gte: startDate, lte: endDate },
      agent: { not: null }
    },
  })

  // Get unique agents
  const agents = new Set(
    calls
      .map(c => c.agent?.trim())
      .filter((agent): agent is string => Boolean(agent))
  )
  const totalAgents = agents.size

  const conversions = calls.filter(c => c.csrConversion).length
  const conversionRate = calls.length > 0 ? (conversions / calls.length) * 100 : 0

  const callScores = calls.filter(c => c.csrCallScore !== null && c.csrCallScore !== undefined)
  const avgCallScore = callScores.length > 0
    ? callScores.reduce((sum, c) => sum + (c.csrCallScore || 0), 0) / callScores.length
    : 0

  const avgHandleTime = calls.length > 0
    ? calls.reduce((sum, c) => sum + (c.duration || 0), 0) / calls.length
    : 0

  // Find top agent by conversions
  const agentStats = Array.from(agents).map(agent => {
    const agentCalls = calls.filter(c => (c.agent?.trim() || '') === agent)
    const agentConversions = agentCalls.filter(c => c.csrConversion).length
    return { agent, conversions: agentConversions }
  })
  const topAgent = agentStats.sort((a, b) => b.conversions - a.conversions)[0]?.agent || 'N/A'

  return {
    totalAgents,
    totalCalls: calls.length,
    totalConversions: conversions,
    avgConversionRate: conversionRate,
    avgCallScore,
    avgHandleTime,
    topAgent,
    period: 'This Month',
  }
}

export async function getAgentPerformance(organizationId: string, dateRange?: DateRange): Promise<AgentPerformance[]> {
  const now = new Date()
  const startDate = dateRange?.from || startOfMonth(now)
  const endDate = dateRange?.to || endOfMonth(now)

  const calls = await prisma.call.findMany({
    where: {
      organizationId,
      date: { gte: startDate, lte: endDate },
      agent: { not: null }
    },
  })

  // Group by agent
  const agentData = calls.reduce((acc, call) => {
    const agent = call.agent?.trim() || 'Unknown'
    if (!acc[agent]) {
      acc[agent] = {
        calls: 0,
        conversions: 0,
        revenue: 0,
        totalScore: 0,
        scoreCount: 0,
        totalDuration: 0,
        totalTalkTime: 0,
        totalRingTime: 0,
        answeredCalls: 0,
      }
    }
    acc[agent].calls++
    if (call.csrConversion) acc[agent].conversions++
    acc[agent].revenue += Number(call.csrValue || 0)
    if (call.csrCallScore !== null && call.csrCallScore !== undefined) {
      acc[agent].totalScore += call.csrCallScore
      acc[agent].scoreCount++
    }
    acc[agent].totalDuration += (call.duration || 0)
    acc[agent].totalTalkTime += (call.talkTime || 0)
    acc[agent].totalRingTime += (call.ringTime || 0)
    if (call.callStatus === 'answered') acc[agent].answeredCalls++
    return acc
  }, {} as Record<string, {
    calls: number
    conversions: number
    revenue: number
    totalScore: number
    scoreCount: number
    totalDuration: number
    totalTalkTime: number
    totalRingTime: number
    answeredCalls: number
  }>)

  const performance = Object.entries(agentData).map(([agent, data]) => ({
    agent,
    calls: data.calls,
    conversions: data.conversions,
    conversionRate: data.calls > 0 ? (data.conversions / data.calls) * 100 : 0,
    revenue: data.revenue,
    avgCallScore: data.scoreCount > 0 ? data.totalScore / data.scoreCount : 0,
    avgDuration: data.calls > 0 ? data.totalDuration / data.calls : 0,
    avgTalkTime: data.calls > 0 ? data.totalTalkTime / data.calls : 0,
    avgRingTime: data.calls > 0 ? data.totalRingTime / data.calls : 0,
    answerRate: data.calls > 0 ? (data.answeredCalls / data.calls) * 100 : 0,
    rank: 0,
  }))

  // Sort by conversions and assign ranks
  performance.sort((a, b) => b.conversions - a.conversions)
  performance.forEach((p, index) => {
    p.rank = index + 1
  })

  return performance
}

export async function getAgentEfficiency(organizationId: string, dateRange?: DateRange) {
  const now = new Date()
  const startDate = dateRange?.from || startOfMonth(now)
  const endDate = dateRange?.to || endOfMonth(now)

  const calls = await prisma.call.findMany({
    where: {
      organizationId,
      date: { gte: startDate, lte: endDate },
      agent: { not: null }
    },
  })

  // Calculate efficiency metrics per agent
  const agentData = calls.reduce((acc, call) => {
    const agent = call.agent?.trim() || 'Unknown'
    if (!acc[agent]) {
      acc[agent] = {
        agent,
        calls: 0,
        avgDuration: 0,
        totalDuration: 0,
        conversions: 0,
        callsPerHour: 0,
        conversionPerHour: 0,
      }
    }
    acc[agent].calls++
    acc[agent].totalDuration += (call.duration || 0)
    if (call.csrConversion) acc[agent].conversions++
    return acc
  }, {} as Record<string, {
    agent: string
    calls: number
    avgDuration: number
    totalDuration: number
    conversions: number
    callsPerHour: number
    conversionPerHour: number
  }>)

  return Object.values(agentData).map(data => {
    const avgDuration = data.calls > 0 ? data.totalDuration / data.calls : 0
    const totalHours = data.totalDuration / 3600
    const callsPerHour = totalHours > 0 ? data.calls / totalHours : 0
    const conversionPerHour = totalHours > 0 ? data.conversions / totalHours : 0

    return {
      agent: data.agent,
      calls: data.calls,
      avgDuration,
      conversions: data.conversions,
      callsPerHour,
      conversionPerHour,
    }
  }).sort((a, b) => b.conversionPerHour - a.conversionPerHour)
}

export async function getAgentQualityMetrics(organizationId: string, dateRange?: DateRange) {
  const now = new Date()
  const startDate = dateRange?.from || startOfMonth(now)
  const endDate = dateRange?.to || endOfMonth(now)

  const calls = await prisma.call.findMany({
    where: {
      organizationId,
      date: { gte: startDate, lte: endDate },
      agent: { not: null }
    },
  })

  // Calculate quality metrics per agent
  const agentData = calls.reduce((acc, call) => {
    const agent = call.agent?.trim() || 'Unknown'
    if (!acc[agent]) {
      acc[agent] = {
        agent,
        totalCalls: 0,
        scoredCalls: 0,
        totalScore: 0,
        conversions: 0,
        highScoreCalls: 0, // score >= 80
        lowScoreCalls: 0, // score < 50
      }
    }
    acc[agent].totalCalls++
    if (call.csrConversion) acc[agent].conversions++

    if (call.csrCallScore !== null && call.csrCallScore !== undefined) {
      acc[agent].scoredCalls++
      acc[agent].totalScore += call.csrCallScore
      if (call.csrCallScore >= 80) acc[agent].highScoreCalls++
      if (call.csrCallScore < 50) acc[agent].lowScoreCalls++
    }
    return acc
  }, {} as Record<string, {
    agent: string
    totalCalls: number
    scoredCalls: number
    totalScore: number
    conversions: number
    highScoreCalls: number
    lowScoreCalls: number
  }>)

  return Object.values(agentData).map(data => ({
    agent: data.agent,
    calls: data.totalCalls,
    avgScore: data.scoredCalls > 0 ? data.totalScore / data.scoredCalls : 0,
    conversions: data.conversions,
    conversionRate: data.totalCalls > 0 ? (data.conversions / data.totalCalls) * 100 : 0,
    highScoreRate: data.scoredCalls > 0 ? (data.highScoreCalls / data.scoredCalls) * 100 : 0,
    lowScoreRate: data.scoredCalls > 0 ? (data.lowScoreCalls / data.scoredCalls) * 100 : 0,
  })).sort((a, b) => b.avgScore - a.avgScore)
}

export async function getAgentComparison(organizationId: string, dateRange?: DateRange) {
  const now = new Date()
  const startDate = dateRange?.from || startOfMonth(now)
  const endDate = dateRange?.to || endOfMonth(now)

  const calls = await prisma.call.findMany({
    where: {
      organizationId,
      date: { gte: startDate, lte: endDate },
      agent: { not: null }
    },
  })

  // Calculate comprehensive metrics for comparison
  const agentData = calls.reduce((acc, call) => {
    const agent = call.agent?.trim() || 'Unknown'
    if (!acc[agent]) {
      acc[agent] = {
        agent,
        calls: 0,
        conversions: 0,
        revenue: 0,
        totalDuration: 0,
        totalTalkTime: 0,
        totalScore: 0,
        scoreCount: 0,
        answeredCalls: 0,
      }
    }
    acc[agent].calls++
    if (call.csrConversion) acc[agent].conversions++
    acc[agent].revenue += Number(call.csrValue || 0)
    acc[agent].totalDuration += (call.duration || 0)
    acc[agent].totalTalkTime += (call.talkTime || 0)
    if (call.csrCallScore !== null && call.csrCallScore !== undefined) {
      acc[agent].totalScore += call.csrCallScore
      acc[agent].scoreCount++
    }
    if (call.callStatus === 'answered') acc[agent].answeredCalls++
    return acc
  }, {} as Record<string, {
    agent: string
    calls: number
    conversions: number
    revenue: number
    totalDuration: number
    totalTalkTime: number
    totalScore: number
    scoreCount: number
    answeredCalls: number
  }>)

  const comparison = Object.values(agentData).map(data => ({
    agent: data.agent,
    calls: data.calls,
    conversions: data.conversions,
    conversionRate: data.calls > 0 ? (data.conversions / data.calls) * 100 : 0,
    revenue: data.revenue,
    revenuePerCall: data.calls > 0 ? data.revenue / data.calls : 0,
    avgDuration: data.calls > 0 ? data.totalDuration / data.calls : 0,
    avgTalkTime: data.calls > 0 ? data.totalTalkTime / data.calls : 0,
    avgScore: data.scoreCount > 0 ? data.totalScore / data.scoreCount : 0,
    answerRate: data.calls > 0 ? (data.answeredCalls / data.calls) * 100 : 0,
  }))

  // Calculate averages across all agents
  const avgMetrics = {
    calls: comparison.reduce((sum, a) => sum + a.calls, 0) / comparison.length,
    conversionRate: comparison.reduce((sum, a) => sum + a.conversionRate, 0) / comparison.length,
    revenue: comparison.reduce((sum, a) => sum + a.revenue, 0) / comparison.length,
    avgDuration: comparison.reduce((sum, a) => sum + a.avgDuration, 0) / comparison.length,
    avgScore: comparison.reduce((sum, a) => sum + a.avgScore, 0) / comparison.length,
  }

  return { agentMetrics: comparison, teamAverage: avgMetrics }
}
