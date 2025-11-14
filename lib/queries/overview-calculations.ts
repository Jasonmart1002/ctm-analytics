interface Call {
  id: string
  callId: string
  datetime?: Date | null
  date?: Date | null
  trackingSource?: string | null
  campaign?: string | null
  medium?: string | null
  agent?: string | null
  csrName?: string | null
  callStatus?: string | null
  duration?: number | null
  talkTime?: number | null
  ringTime?: number | null
  csrCallScore?: number | null
  csrConversion?: boolean | null
  city?: string | null
  state?: string | null
  audioWav?: string | null
  audioMP3?: string | null
  name?: string | null
  phone?: string | null
  receivingNumber?: string | null
}

interface PreviousCall {
  id: string
  csrConversion?: boolean | null
  duration?: number | null
  callStatus?: string | null
}

export function calculateOverviewMetrics(
  currentCalls: Call[],
  previousCalls: PreviousCall[]
) {
  // Current period metrics
  const totalCalls = currentCalls.length
  const answeredCalls = currentCalls.filter((c) =>
    c.callStatus?.toLowerCase().includes('answered')
  ).length
  const missedCalls = totalCalls - answeredCalls
  const conversions = currentCalls.filter((c) => c.csrConversion).length
  const answerRate = totalCalls > 0 ? (answeredCalls / totalCalls) * 100 : 0
  const conversionRate =
    answeredCalls > 0 ? (conversions / answeredCalls) * 100 : 0

  // Previous period metrics
  const prevTotalCalls = previousCalls.length
  const prevAnsweredCalls = previousCalls.filter((c) =>
    c.callStatus?.toLowerCase().includes('answered')
  ).length
  const prevMissedCalls = prevTotalCalls - prevAnsweredCalls
  const prevConversions = previousCalls.filter((c) => c.csrConversion).length

  // Calculate trends
  const calculateTrend = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }

  return {
    totalCalls,
    answeredCalls,
    missedCalls,
    conversions,
    answerRate,
    conversionRate,
    trends: {
      callsTrend: calculateTrend(totalCalls, prevTotalCalls),
      answeredTrend: calculateTrend(answeredCalls, prevAnsweredCalls),
      missedTrend: calculateTrend(missedCalls, prevMissedCalls),
      conversionsTrend: calculateTrend(conversions, prevConversions),
    },
  }
}

export function calculateCallVolumeOverTime(calls: Call[]) {
  const dataByDate = new Map<
    string,
    {
      totalCalls: number
      answeredCalls: number
      missedCalls: number
    }
  >()

  calls.forEach((call) => {
    const dateValue = call.datetime || call.date
    if (!dateValue) return

    const isoDate = new Date(dateValue).toISOString().split('T')[0]

    const existing = dataByDate.get(isoDate) || {
      totalCalls: 0,
      answeredCalls: 0,
      missedCalls: 0,
    }

    existing.totalCalls++
    if (call.callStatus?.toLowerCase().includes('answered')) {
      existing.answeredCalls++
    } else {
      existing.missedCalls++
    }

    dataByDate.set(isoDate, existing)
  })

  return Array.from(dataByDate.entries())
    .map(([date, data]) => ({
      date,
      ...data,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export function calculateConversionOverTime(calls: Call[]) {
  const dataByDate = new Map<
    string,
    {
      conversions: number
      totalCalls: number
      answeredCalls: number
    }
  >()

  calls.forEach((call) => {
    const dateValue = call.datetime || call.date
    if (!dateValue) return

    const isoDate = new Date(dateValue).toISOString().split('T')[0]

    const existing = dataByDate.get(isoDate) || {
      conversions: 0,
      totalCalls: 0,
      answeredCalls: 0,
    }

    existing.totalCalls++
    if (call.callStatus?.toLowerCase().includes('answered')) {
      existing.answeredCalls++
    }
    if (call.csrConversion) {
      existing.conversions++
    }

    dataByDate.set(isoDate, existing)
  })

  return Array.from(dataByDate.entries())
    .map(([date, data]) => ({
      date,
      conversions: data.conversions,
      answerRate:
        data.totalCalls > 0
          ? (data.answeredCalls / data.totalCalls) * 100
          : 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export function calculateStatusBreakdown(calls: Call[]) {
  const statusMap = new Map<string, number>()

  calls.forEach((call) => {
    const status = call.callStatus || 'Unknown'
    statusMap.set(status, (statusMap.get(status) || 0) + 1)
  })

  return Array.from(statusMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}

export function calculateChannelMix(calls: Call[]) {
  const channelMap = new Map<string, number>()

  calls.forEach((call) => {
    // Group channels by medium or source
    let channel = 'Direct'

    const source = call.trackingSource?.toLowerCase() || ''
    const medium = call.medium?.toLowerCase() || ''

    if (medium.includes('cpc') || medium.includes('paid') || source.includes('google ads') || source.includes('bing ads')) {
      channel = 'Paid Search'
    } else if (medium.includes('organic')) {
      channel = 'Organic Search'
    } else if (source.includes('google business') || source.includes('gbp') || source.includes('maps')) {
      channel = 'GBP / Maps'
    } else if (medium.includes('referral')) {
      channel = 'Referral'
    } else if (source || call.trackingSource) {
      channel = call.trackingSource || 'Other'
    }

    channelMap.set(channel, (channelMap.get(channel) || 0) + 1)
  })

  // Return top 7 + Other
  const sorted = Array.from(channelMap.entries())
    .sort((a, b) => b[1] - a[1])

  if (sorted.length <= 7) {
    return sorted.map(([name, value]) => ({ name, value }))
  }

  const top7 = sorted.slice(0, 7)
  const others = sorted.slice(7).reduce((sum, [, value]) => sum + value, 0)

  return [
    ...top7.map(([name, value]) => ({ name, value })),
    { name: 'Other', value: others },
  ]
}

export function calculateScoreDistribution(calls: Call[]) {
  const buckets = [
    { range: '0', min: 0, max: 0, calls: 0, conversions: 0 },
    { range: '1-2', min: 1, max: 2, calls: 0, conversions: 0 },
    { range: '3-5', min: 3, max: 5, calls: 0, conversions: 0 },
  ]

  calls.forEach((call) => {
    const score = call.csrCallScore
    if (score === null || score === undefined) return

    const bucket = buckets.find((b) => score >= b.min && score <= b.max)
    if (bucket) {
      bucket.calls++
      if (call.csrConversion) {
        bucket.conversions++
      }
    }
  })

  return buckets.map((bucket) => ({
    range: bucket.range,
    calls: bucket.calls,
    conversionRate:
      bucket.calls > 0 ? (bucket.conversions / bucket.calls) * 100 : 0,
  }))
}

export function calculateTopStates(calls: Call[], limit: number = 10) {
  const stateMap = new Map<
    string,
    { calls: number; conversions: number }
  >()

  calls.forEach((call) => {
    const state = call.state || 'Unknown'
    const existing = stateMap.get(state) || { calls: 0, conversions: 0 }
    existing.calls++
    if (call.csrConversion) {
      existing.conversions++
    }
    stateMap.set(state, existing)
  })

  return Array.from(stateMap.entries())
    .map(([state, data]) => ({
      state,
      calls: data.calls,
      conversions: data.conversions,
      conversionRate:
        data.calls > 0 ? (data.conversions / data.calls) * 100 : 0,
    }))
    .sort((a, b) => b.calls - a.calls)
    .slice(0, limit)
}

export function calculateTopSources(calls: Call[], limit: number = 10) {
  const sourceMap = new Map<
    string,
    {
      calls: number
      answeredCalls: number
      totalScore: number
      scoreCount: number
      conversions: number
    }
  >()

  calls.forEach((call) => {
    const source = call.trackingSource || 'Unknown'
    const existing = sourceMap.get(source) || {
      calls: 0,
      answeredCalls: 0,
      totalScore: 0,
      scoreCount: 0,
      conversions: 0,
    }

    existing.calls++
    if (call.callStatus?.toLowerCase().includes('answered')) {
      existing.answeredCalls++
    }
    if (call.csrCallScore !== null && call.csrCallScore !== undefined) {
      existing.totalScore += call.csrCallScore
      existing.scoreCount++
    }
    if (call.csrConversion) {
      existing.conversions++
    }

    sourceMap.set(source, existing)
  })

  return Array.from(sourceMap.entries())
    .map(([source, data]) => ({
      source,
      calls: data.calls,
      answerRate:
        data.calls > 0 ? (data.answeredCalls / data.calls) * 100 : 0,
      avgScore:
        data.scoreCount > 0 ? data.totalScore / data.scoreCount : 0,
      conversions: data.conversions,
      conversionRate:
        data.answeredCalls > 0
          ? (data.conversions / data.answeredCalls) * 100
          : 0,
    }))
    .sort((a, b) => b.calls - a.calls)
    .slice(0, limit)
}
