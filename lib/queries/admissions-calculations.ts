import { Decimal } from '@prisma/client/runtime/library'

interface Call {
  id: string
  callId: string
  datetime?: Date | null
  agent?: string | null
  csrName?: string | null
  csrCallScore?: number | null
  csrConversion?: boolean | null
  csrValue?: Decimal | null
  callStatus?: string | null
  duration?: number | null
  talkTime?: number | null
  state?: string | null
  city?: string | null
}

interface PreviousCall {
  csrConversion?: boolean | null
  csrCallScore?: number | null
}

interface AdmissionsMetrics {
  totalInquiries: number
  qualifiedLeads: number
  conversions: number
  qualificationRate: number
  conversionRate: number
  avgCallScore: number
  avgTalkTime: number
  totalValue: number
  trends: {
    inquiriesTrend: number
    qualifiedTrend: number
    conversionsTrend: number
  }
}

interface AgentPerformance {
  agent: string
  calls: number
  avgScore: number
  conversions: number
  conversionRate: number
  avgTalkTime: number
  totalValue: number
}

interface ScoreBreakdown {
  scoreRange: string
  calls: number
  conversions: number
  conversionRate: number
  percentage: number
}

interface ConversionFunnel {
  stage: string
  count: number
  percentage: number
}

interface HourlyPerformance {
  hour: string
  calls: number
  avgScore: number
  conversions: number
}

interface StatePerformance {
  state: string
  calls: number
  conversions: number
  conversionRate: number
}

/**
 * Calculate admissions overview metrics with trends
 */
export function calculateAdmissionsMetrics(
  currentCalls: Call[],
  previousCalls: PreviousCall[]
): AdmissionsMetrics {
  const totalInquiries = currentCalls.length

  // Qualified leads: CSR score >= 3.0
  const qualifiedLeads = currentCalls.filter(
    (c) => c.csrCallScore !== null && c.csrCallScore !== undefined && c.csrCallScore >= 3.0
  ).length

  const conversions = currentCalls.filter((c) => c.csrConversion).length

  const qualificationRate = totalInquiries > 0
    ? (qualifiedLeads / totalInquiries) * 100
    : 0

  const conversionRate = qualifiedLeads > 0
    ? (conversions / qualifiedLeads) * 100
    : 0

  // Average call score (only for calls with scores)
  const callsWithScores = currentCalls.filter((c) => c.csrCallScore !== null)
  const avgCallScore = callsWithScores.length > 0
    ? callsWithScores.reduce((sum, c) => sum + (c.csrCallScore || 0), 0) / callsWithScores.length
    : 0

  // Average talk time
  const callsWithTalkTime = currentCalls.filter((c) => c.talkTime !== null && c.talkTime !== undefined && c.talkTime > 0)
  const avgTalkTime = callsWithTalkTime.length > 0
    ? callsWithTalkTime.reduce((sum, c) => sum + (c.talkTime || 0), 0) / callsWithTalkTime.length
    : 0

  // Total value
  const totalValue = currentCalls.reduce(
    (sum, c) => sum + (c.csrValue ? Number(c.csrValue) : 0),
    0
  )

  // Calculate previous period metrics for trends
  const prevInquiries = previousCalls.length
  const prevQualified = previousCalls.filter(
    (c) => c.csrCallScore !== null && c.csrCallScore !== undefined && c.csrCallScore >= 3.0
  ).length
  const prevConversions = previousCalls.filter((c) => c.csrConversion).length

  const inquiriesTrend = prevInquiries > 0
    ? ((totalInquiries - prevInquiries) / prevInquiries) * 100
    : 0

  const qualifiedTrend = prevQualified > 0
    ? ((qualifiedLeads - prevQualified) / prevQualified) * 100
    : 0

  const conversionsTrend = prevConversions > 0
    ? ((conversions - prevConversions) / prevConversions) * 100
    : 0

  return {
    totalInquiries,
    qualifiedLeads,
    conversions,
    qualificationRate,
    conversionRate,
    avgCallScore,
    avgTalkTime,
    totalValue,
    trends: {
      inquiriesTrend,
      qualifiedTrend,
      conversionsTrend,
    },
  }
}

/**
 * Calculate agent performance metrics
 */
export function calculateAgentPerformance(
  calls: Call[],
  limit: number = 10
): AgentPerformance[] {
  const agentMap = new Map<string, {
    calls: number
    totalScore: number
    scoredCalls: number
    conversions: number
    totalTalkTime: number
    talkTimeCalls: number
    totalValue: number
  }>()

  calls.forEach((call) => {
    const agent = call.agent || call.csrName || '(No agent)'
    const existing = agentMap.get(agent) || {
      calls: 0,
      totalScore: 0,
      scoredCalls: 0,
      conversions: 0,
      totalTalkTime: 0,
      talkTimeCalls: 0,
      totalValue: 0,
    }

    agentMap.set(agent, {
      calls: existing.calls + 1,
      totalScore: existing.totalScore + (call.csrCallScore || 0),
      scoredCalls: existing.scoredCalls + (call.csrCallScore !== null ? 1 : 0),
      conversions: existing.conversions + (call.csrConversion ? 1 : 0),
      totalTalkTime: existing.totalTalkTime + (call.talkTime || 0),
      talkTimeCalls: existing.talkTimeCalls + (call.talkTime !== null && call.talkTime !== undefined && call.talkTime > 0 ? 1 : 0),
      totalValue: existing.totalValue + (call.csrValue ? Number(call.csrValue) : 0),
    })
  })

  const agents: AgentPerformance[] = Array.from(agentMap.entries()).map(
    ([agent, data]) => ({
      agent,
      calls: data.calls,
      avgScore: data.scoredCalls > 0 ? data.totalScore / data.scoredCalls : 0,
      conversions: data.conversions,
      conversionRate: data.calls > 0 ? (data.conversions / data.calls) * 100 : 0,
      avgTalkTime: data.talkTimeCalls > 0 ? data.totalTalkTime / data.talkTimeCalls : 0,
      totalValue: data.totalValue,
    })
  )

  // Sort by conversions (descending) and return top N
  return agents.sort((a, b) => b.conversions - a.conversions).slice(0, limit)
}

/**
 * Calculate score distribution breakdown
 */
export function calculateScoreBreakdown(calls: Call[]): ScoreBreakdown[] {
  const ranges = [
    { label: '4.5 - 5.0 (Excellent)', min: 4.5, max: 5.0 },
    { label: '4.0 - 4.4 (Very Good)', min: 4.0, max: 4.4 },
    { label: '3.0 - 3.9 (Good)', min: 3.0, max: 3.9 },
    { label: '2.0 - 2.9 (Fair)', min: 2.0, max: 2.9 },
    { label: '0.0 - 1.9 (Poor)', min: 0.0, max: 1.9 },
  ]

  const callsWithScores = calls.filter((c) => c.csrCallScore !== null)
  const total = callsWithScores.length

  if (total === 0) return []

  const breakdown: ScoreBreakdown[] = ranges.map((range) => {
    const callsInRange = callsWithScores.filter(
      (c) => c.csrCallScore! >= range.min && c.csrCallScore! <= range.max
    )
    const conversions = callsInRange.filter((c) => c.csrConversion).length

    return {
      scoreRange: range.label,
      calls: callsInRange.length,
      conversions,
      conversionRate: callsInRange.length > 0
        ? (conversions / callsInRange.length) * 100
        : 0,
      percentage: (callsInRange.length / total) * 100,
    }
  })

  // Filter out ranges with no calls
  return breakdown.filter((b) => b.calls > 0)
}

/**
 * Calculate conversion funnel stages
 */
export function calculateConversionFunnel(calls: Call[]): ConversionFunnel[] {
  const totalInquiries = calls.length
  const qualifiedLeads = calls.filter(
    (c) => c.csrCallScore !== null && c.csrCallScore !== undefined && c.csrCallScore >= 3.0
  ).length
  const conversions = calls.filter((c) => c.csrConversion).length

  if (totalInquiries === 0) return []

  return [
    {
      stage: 'Total Inquiries',
      count: totalInquiries,
      percentage: 100,
    },
    {
      stage: 'Qualified Leads',
      count: qualifiedLeads,
      percentage: (qualifiedLeads / totalInquiries) * 100,
    },
    {
      stage: 'Admissions',
      count: conversions,
      percentage: (conversions / totalInquiries) * 100,
    },
  ]
}

/**
 * Calculate hourly performance metrics
 */
export function calculateHourlyPerformance(calls: Call[]): HourlyPerformance[] {
  const hourMap = new Map<number, {
    calls: number
    totalScore: number
    scoredCalls: number
    conversions: number
  }>()

  calls.forEach((call) => {
    if (!call.datetime) return

    const hour = call.datetime.getHours()
    const existing = hourMap.get(hour) || {
      calls: 0,
      totalScore: 0,
      scoredCalls: 0,
      conversions: 0,
    }

    hourMap.set(hour, {
      calls: existing.calls + 1,
      totalScore: existing.totalScore + (call.csrCallScore || 0),
      scoredCalls: existing.scoredCalls + (call.csrCallScore !== null ? 1 : 0),
      conversions: existing.conversions + (call.csrConversion ? 1 : 0),
    })
  })

  const hourly: HourlyPerformance[] = []

  // Generate all 24 hours (9 AM to 5 PM for typical business hours display)
  for (let hour = 9; hour <= 17; hour++) {
    const data = hourMap.get(hour) || { calls: 0, totalScore: 0, scoredCalls: 0, conversions: 0 }

    hourly.push({
      hour: `${hour % 12 || 12}${hour >= 12 ? 'PM' : 'AM'}`,
      calls: data.calls,
      avgScore: data.scoredCalls > 0 ? data.totalScore / data.scoredCalls : 0,
      conversions: data.conversions,
    })
  }

  return hourly
}

/**
 * Calculate top performing states
 */
export function calculateTopPerformingStates(
  calls: Call[],
  limit: number = 10
): StatePerformance[] {
  const stateMap = new Map<string, {
    calls: number
    conversions: number
  }>()

  calls.forEach((call) => {
    if (!call.state) return

    const state = call.state
    const existing = stateMap.get(state) || {
      calls: 0,
      conversions: 0,
    }

    stateMap.set(state, {
      calls: existing.calls + 1,
      conversions: existing.conversions + (call.csrConversion ? 1 : 0),
    })
  })

  const states: StatePerformance[] = Array.from(stateMap.entries()).map(
    ([state, data]) => ({
      state,
      calls: data.calls,
      conversions: data.conversions,
      conversionRate: data.calls > 0 ? (data.conversions / data.calls) * 100 : 0,
    })
  )

  // Sort by conversion rate (descending) and return top N
  return states
    .sort((a, b) => b.conversionRate - a.conversionRate)
    .slice(0, limit)
}
