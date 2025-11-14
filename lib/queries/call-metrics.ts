import { prisma } from '@/lib/db'
import { DateRange } from '@/lib/types'
import { startOfMonth, endOfMonth } from 'date-fns'

export interface CallMetrics {
  totalCalls: number
  answeredCalls: number
  missedCalls: number
  answerRate: number
  avgDuration: number
  avgTalkTime: number
  avgRingTime: number
  totalConversions: number
  conversionRate: number
  totalRevenue: number
  revenuePerCall: number
  period: string
}

export async function getCallMetrics(organizationId: string, dateRange?: DateRange): Promise<CallMetrics> {
  const now = new Date()
  const startDate = dateRange?.from || startOfMonth(now)
  const endDate = dateRange?.to || endOfMonth(now)

  const calls = await prisma.call.findMany({
    where: { organizationId, date: { gte: startDate, lte: endDate } },
  })

  const answeredCalls = calls.filter(c => c.callStatus === 'answered').length
  const missedCalls = calls.filter(c => c.callStatus !== 'answered').length
  const answerRate = calls.length > 0 ? (answeredCalls / calls.length) * 100 : 0

  const totalDuration = calls.reduce((sum, c) => sum + (c.duration || 0), 0)
  const totalTalkTime = calls.reduce((sum, c) => sum + (c.talkTime || 0), 0)
  const totalRingTime = calls.reduce((sum, c) => sum + (c.ringTime || 0), 0)

  const avgDuration = calls.length > 0 ? totalDuration / calls.length : 0
  const avgTalkTime = calls.length > 0 ? totalTalkTime / calls.length : 0
  const avgRingTime = calls.length > 0 ? totalRingTime / calls.length : 0

  const conversions = calls.filter(c => c.csrConversion).length
  const conversionRate = calls.length > 0 ? (conversions / calls.length) * 100 : 0

  const totalRevenue = calls.reduce((sum, c) => sum + Number(c.csrValue || 0), 0)
  const revenuePerCall = calls.length > 0 ? totalRevenue / calls.length : 0

  return {
    totalCalls: calls.length,
    answeredCalls,
    missedCalls,
    answerRate,
    avgDuration,
    avgTalkTime,
    avgRingTime,
    totalConversions: conversions,
    conversionRate,
    totalRevenue,
    revenuePerCall,
    period: 'This Month',
  }
}

export async function getCallStatusBreakdown(organizationId: string, dateRange?: DateRange) {
  const now = new Date()
  const startDate = dateRange?.from || startOfMonth(now)
  const endDate = dateRange?.to || endOfMonth(now)

  const calls = await prisma.call.findMany({
    where: { organizationId, date: { gte: startDate, lte: endDate } },
  })

  const statusData = calls.reduce((acc, call) => {
    const status = call.callStatus || 'Unknown'
    if (!acc[status]) {
      acc[status] = { status, calls: 0, conversions: 0, revenue: 0, avgDuration: 0, totalDuration: 0 }
    }
    acc[status].calls++
    if (call.csrConversion) acc[status].conversions++
    acc[status].revenue += Number(call.csrValue || 0)
    acc[status].totalDuration += (call.duration || 0)
    return acc
  }, {} as Record<string, { status: string; calls: number; conversions: number; revenue: number; avgDuration: number; totalDuration: number }>)

  return Object.values(statusData).map(s => ({
    status: s.status,
    calls: s.calls,
    conversions: s.conversions,
    conversionRate: s.calls > 0 ? (s.conversions / s.calls) * 100 : 0,
    revenue: s.revenue,
    avgDuration: s.calls > 0 ? s.totalDuration / s.calls : 0,
  })).sort((a, b) => b.calls - a.calls)
}

export async function getCallDirectionAnalysis(organizationId: string, dateRange?: DateRange) {
  const now = new Date()
  const startDate = dateRange?.from || startOfMonth(now)
  const endDate = dateRange?.to || endOfMonth(now)

  const calls = await prisma.call.findMany({
    where: { organizationId, date: { gte: startDate, lte: endDate } },
  })

  const directionData = calls.reduce((acc, call) => {
    const direction = call.direction || 'Unknown'
    if (!acc[direction]) {
      acc[direction] = { direction, calls: 0, conversions: 0, revenue: 0, avgDuration: 0, totalDuration: 0 }
    }
    acc[direction].calls++
    if (call.csrConversion) acc[direction].conversions++
    acc[direction].revenue += Number(call.csrValue || 0)
    acc[direction].totalDuration += (call.duration || 0)
    return acc
  }, {} as Record<string, { direction: string; calls: number; conversions: number; revenue: number; avgDuration: number; totalDuration: number }>)

  return Object.values(directionData).map(d => ({
    direction: d.direction,
    calls: d.calls,
    conversions: d.conversions,
    conversionRate: d.calls > 0 ? (d.conversions / d.calls) * 100 : 0,
    revenue: d.revenue,
    avgDuration: d.calls > 0 ? d.totalDuration / d.calls : 0,
  })).sort((a, b) => b.calls - a.calls)
}

export async function getCallDurationAnalysis(organizationId: string, dateRange?: DateRange) {
  const now = new Date()
  const startDate = dateRange?.from || startOfMonth(now)
  const endDate = dateRange?.to || endOfMonth(now)

  const calls = await prisma.call.findMany({
    where: { organizationId, date: { gte: startDate, lte: endDate } },
  })

  // Bucket calls by duration
  const buckets = [
    { label: '0-30s', min: 0, max: 30 },
    { label: '31-60s', min: 31, max: 60 },
    { label: '1-2 min', min: 61, max: 120 },
    { label: '2-5 min', min: 121, max: 300 },
    { label: '5-10 min', min: 301, max: 600 },
    { label: '10+ min', min: 601, max: Infinity },
  ]

  const durationBuckets = buckets.map(bucket => {
    const bucketCalls = calls.filter(c => {
      const duration = c.duration || 0
      return duration >= bucket.min && duration <= bucket.max
    })

    const conversions = bucketCalls.filter(c => c.csrConversion).length
    const revenue = bucketCalls.reduce((sum, c) => sum + Number(c.csrValue || 0), 0)

    return {
      label: bucket.label,
      calls: bucketCalls.length,
      conversions,
      conversionRate: bucketCalls.length > 0 ? (conversions / bucketCalls.length) * 100 : 0,
      revenue,
    }
  })

  return durationBuckets
}

export async function getTrackingNumberPerformance(organizationId: string, dateRange?: DateRange) {
  const now = new Date()
  const startDate = dateRange?.from || startOfMonth(now)
  const endDate = dateRange?.to || endOfMonth(now)

  const calls = await prisma.call.findMany({
    where: { organizationId, date: { gte: startDate, lte: endDate } },
  })

  const numberData = calls.reduce((acc, call) => {
    const number = call.trackingNumber || 'Unknown'
    const label = call.trackingNumberLabel || 'Unlabeled'
    const key = `${number}|${label}`

    if (!acc[key]) {
      acc[key] = { number, label, calls: 0, conversions: 0, revenue: 0 }
    }
    acc[key].calls++
    if (call.csrConversion) acc[key].conversions++
    acc[key].revenue += Number(call.csrValue || 0)
    return acc
  }, {} as Record<string, { number: string; label: string; calls: number; conversions: number; revenue: number }>)

  return Object.values(numberData)
    .map(n => ({
      ...n,
      conversionRate: n.calls > 0 ? (n.conversions / n.calls) * 100 : 0,
    }))
    .sort((a, b) => b.calls - a.calls)
    .slice(0, 20)
}

export async function getCallQualityMetrics(organizationId: string, dateRange?: DateRange) {
  const now = new Date()
  const startDate = dateRange?.from || startOfMonth(now)
  const endDate = dateRange?.to || endOfMonth(now)

  const calls = await prisma.call.findMany({
    where: { organizationId, date: { gte: startDate, lte: endDate } },
  })

  // Call quality score distribution
  const scoreData = calls.reduce((acc, call) => {
    const score = call.csrCallScore
    if (score !== null && score !== undefined) {
      const bucket = Math.floor(score / 10) * 10 // Round to nearest 10
      const label = `${bucket}-${bucket + 9}`
      if (!acc[label]) acc[label] = { label, calls: 0, conversions: 0 }
      acc[label].calls++
      if (call.csrConversion) acc[label].conversions++
    }
    return acc
  }, {} as Record<string, { label: string; calls: number; conversions: number }>)

  const qualityScores = Object.values(scoreData).map(s => ({
    ...s,
    conversionRate: s.calls > 0 ? (s.conversions / s.calls) * 100 : 0,
  })).sort((a, b) => {
    const aNum = parseInt(a.label.split('-')[0])
    const bNum = parseInt(b.label.split('-')[0])
    return bNum - aNum
  })

  // Blocked calls
  const blockedCalls = calls.filter(c => c.blocked).length
  const blockedRate = calls.length > 0 ? (blockedCalls / calls.length) * 100 : 0

  // First time vs repeat callers
  const callerFrequency = calls.reduce((acc, call) => {
    const number = call.customerNumber || call.phone
    if (number) {
      if (!acc[number]) acc[number] = { count: 0, conversions: 0 }
      acc[number].count++
      if (call.csrConversion) acc[number].conversions++
    }
    return acc
  }, {} as Record<string, { count: number; conversions: number }>)

  const firstTimeCalls = Object.values(callerFrequency).filter(c => c.count === 1).length
  const repeatCalls = calls.length - firstTimeCalls

  return {
    qualityScores,
    blockedCalls,
    blockedRate,
    firstTimeCalls,
    repeatCalls,
    repeatRate: calls.length > 0 ? (repeatCalls / calls.length) * 100 : 0,
  }
}

export async function getRecentCalls(organizationId: string, limit: number = 50, dateRange?: DateRange) {
  const where: any = { organizationId }

  // Add date filtering if dateRange is provided
  if (dateRange) {
    where.date = {
      gte: dateRange.from,
      lte: dateRange.to
    }
  }

  const calls = await prisma.call.findMany({
    where,
    orderBy: { datetime: 'desc' }, // Default sort: newest first
    take: limit,
  })

  return calls.map(call => ({
    id: call.id,
    callId: call.callId,
    datetime: call.datetime,
    date: call.date,
    customerNumber: call.customerNumber,
    name: call.name,
    phone: call.phone,
    email: call.email,
    gender: call.gender,
    duration: call.duration,
    talkTime: call.talkTime,
    ringTime: call.ringTime,
    callStatus: call.callStatus,
    direction: call.direction,
    campaign: call.campaign,
    source: call.source,
    medium: call.medium,
    keyword: call.keyword,
    csrName: call.csrName,
    agent: call.agent,
    csrConversion: call.csrConversion,
    csrValue: call.csrValue ? Number(call.csrValue) : null,
    csrCallScore: call.csrCallScore,
    trackingNumber: call.trackingNumber,
    trackingNumberLabel: call.trackingNumberLabel,
    city: call.city,
    state: call.state,
    postalCode: call.postalCode,
    country: call.country,
    device: call.device,
    browser: call.browser,
    mobile: call.mobile,
    receivingNumber: call.receivingNumber,
    audioWav: call.audioWav,
    audioMP3: call.audioMP3,
    transcription: call.transcription,
    transcriptionConfidence: call.transcriptionConfidence,
    summary: call.summary,
  }))
}

export async function getCallVolumeOverTime(organizationId: string, dateRange?: DateRange) {
  const now = new Date()
  const startDate = dateRange?.from || startOfMonth(now)
  const endDate = dateRange?.to || endOfMonth(now)

  const calls = await prisma.call.findMany({
    where: { organizationId, date: { gte: startDate, lte: endDate } },
  })

  // Group by date
  const dailyData = calls.reduce((acc, call) => {
    if (call.date) {
      const dateStr = call.date.toISOString().split('T')[0]
      if (!acc[dateStr]) {
        acc[dateStr] = { date: dateStr, calls: 0, conversions: 0, revenue: 0 }
      }
      acc[dateStr].calls++
      if (call.csrConversion) acc[dateStr].conversions++
      acc[dateStr].revenue += Number(call.csrValue || 0)
    }
    return acc
  }, {} as Record<string, { date: string; calls: number; conversions: number; revenue: number }>)

  return Object.values(dailyData)
    .map(d => ({
      ...d,
      conversionRate: d.calls > 0 ? (d.conversions / d.calls) * 100 : 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}
