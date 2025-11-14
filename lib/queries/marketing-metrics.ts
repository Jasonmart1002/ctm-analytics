import { prisma } from '@/lib/db'
import { DateRange } from '@/lib/types'
import { startOfMonth, endOfMonth, subMonths } from 'date-fns'

export interface MarketingMetrics {
  totalCampaigns: number
  activeCampaigns: number
  campaignConversionRate: number
  totalSources: number
  topSource: { name: string; calls: number; conversions: number; revenue: number } | null
  totalChannels: number
  topChannel: { name: string; calls: number; conversions: number } | null
  totalKeywords: number
  topKeyword: { keyword: string; calls: number; conversions: number } | null
  totalCalls: number
  totalConversions: number
  totalRevenue: number
  avgCallsPerCampaign: number
  period: string
}

export async function getMarketingMetrics(organizationId: string, dateRange?: DateRange): Promise<MarketingMetrics> {
  const now = new Date()
  const startDate = dateRange?.from || startOfMonth(now)
  const endDate = dateRange?.to || endOfMonth(now)

  const calls = await prisma.call.findMany({
    where: { organizationId, date: { gte: startDate, lte: endDate } },
  })

  const campaignData = calls.reduce((acc, call) => {
    const campaign = call.campaign || 'Unknown'
    if (!acc[campaign]) acc[campaign] = { calls: 0, conversions: 0, revenue: 0 }
    acc[campaign].calls++
    if (call.csrConversion) acc[campaign].conversions++
    acc[campaign].revenue += Number(call.csrValue || 0)
    return acc
  }, {} as Record<string, { calls: number; conversions: number; revenue: number }>)

  const activeCampaigns = Object.keys(campaignData).filter(c => c !== 'Unknown').length
  const avgCallsPerCampaign = activeCampaigns > 0 ? calls.length / activeCampaigns : 0

  const sourceData = calls.reduce((acc, call) => {
    const source = call.source || 'Unknown'
    if (!acc[source]) acc[source] = { calls: 0, conversions: 0, revenue: 0 }
    acc[source].calls++
    if (call.csrConversion) acc[source].conversions++
    acc[source].revenue += Number(call.csrValue || 0)
    return acc
  }, {} as Record<string, { calls: number; conversions: number; revenue: number }>)

  const topSourceEntry = Object.entries(sourceData).sort(([, a], [, b]) => b.calls - a.calls)[0]
  const topSource = topSourceEntry ? {
    name: topSourceEntry[0],
    calls: topSourceEntry[1].calls,
    conversions: topSourceEntry[1].conversions,
    revenue: topSourceEntry[1].revenue,
  } : null

  const channelData = calls.reduce((acc, call) => {
    const channel = call.medium || 'Unknown'
    if (!acc[channel]) acc[channel] = { calls: 0, conversions: 0 }
    acc[channel].calls++
    if (call.csrConversion) acc[channel].conversions++
    return acc
  }, {} as Record<string, { calls: number; conversions: number }>)

  const topChannelEntry = Object.entries(channelData).sort(([, a], [, b]) => b.calls - a.calls)[0]
  const topChannel = topChannelEntry ? {
    name: topChannelEntry[0],
    calls: topChannelEntry[1].calls,
    conversions: topChannelEntry[1].conversions
  } : null

  const keywordData = calls.reduce((acc, call) => {
    const keyword = call.keyword || call.searchQuery
    if (keyword) {
      if (!acc[keyword]) acc[keyword] = { calls: 0, conversions: 0 }
      acc[keyword].calls++
      if (call.csrConversion) acc[keyword].conversions++
    }
    return acc
  }, {} as Record<string, { calls: number; conversions: number }>)

  const topKeywordEntry = Object.entries(keywordData).sort(([, a], [, b]) => b.calls - a.calls)[0]
  const topKeyword = topKeywordEntry ? {
    keyword: topKeywordEntry[0],
    calls: topKeywordEntry[1].calls,
    conversions: topKeywordEntry[1].conversions
  } : null

  const totalConversions = calls.filter(call => call.csrConversion).length
  const totalRevenue = calls.reduce((sum, call) => sum + Number(call.csrValue || 0), 0)

  return {
    totalCampaigns: Object.keys(campaignData).length,
    activeCampaigns,
    campaignConversionRate: calls.length > 0 ? (totalConversions / calls.length) * 100 : 0,
    totalSources: Object.keys(sourceData).length,
    topSource,
    totalChannels: Object.keys(channelData).length,
    topChannel,
    totalKeywords: Object.keys(keywordData).length,
    topKeyword,
    totalCalls: calls.length,
    totalConversions,
    totalRevenue,
    avgCallsPerCampaign,
    period: 'This Month',
  }
}

export async function getCampaignPerformance(organizationId: string, dateRange?: DateRange) {
  const now = new Date()
  const startDate = dateRange?.from || startOfMonth(now)
  const endDate = dateRange?.to || endOfMonth(now)

  const calls = await prisma.call.findMany({
    where: { organizationId, date: { gte: startDate, lte: endDate } },
  })

  const campaignData = calls.reduce((acc, call) => {
    const campaign = call.campaign || 'Unknown'
    if (!acc[campaign]) {
      acc[campaign] = { campaign, calls: 0, conversions: 0, totalValue: 0, conversionRate: 0 }
    }
    acc[campaign].calls++
    if (call.csrConversion) acc[campaign].conversions++
    acc[campaign].totalValue += Number(call.csrValue || 0)
    return acc
  }, {} as Record<string, { campaign: string; calls: number; conversions: number; totalValue: number; conversionRate: number }>)

  return Object.values(campaignData)
    .map(c => ({
      ...c,
      conversionRate: c.calls > 0 ? (c.conversions / c.calls) * 100 : 0,
      avgValue: c.conversions > 0 ? c.totalValue / c.conversions : 0
    }))
    .sort((a, b) => b.calls - a.calls)
    .slice(0, 10)
}

export async function getSourcePerformance(organizationId: string, dateRange?: DateRange) {
  const now = new Date()
  const startDate = dateRange?.from || startOfMonth(now)
  const endDate = dateRange?.to || endOfMonth(now)

  const calls = await prisma.call.findMany({
    where: { organizationId, date: { gte: startDate, lte: endDate } },
  })

  const sourceData = calls.reduce((acc, call) => {
    const source = call.source || 'Unknown'
    if (!acc[source]) acc[source] = { name: source, calls: 0, conversions: 0, revenue: 0 }
    acc[source].calls++
    if (call.csrConversion) acc[source].conversions++
    acc[source].revenue += Number(call.csrValue || 0)
    return acc
  }, {} as Record<string, { name: string; calls: number; conversions: number; revenue: number }>)

  return Object.values(sourceData).sort((a, b) => b.calls - a.calls).slice(0, 10)
}

export async function getTopKeywords(organizationId: string, dateRange?: DateRange) {
  const now = new Date()
  const startDate = dateRange?.from || startOfMonth(now)
  const endDate = dateRange?.to || endOfMonth(now)

  const calls = await prisma.call.findMany({
    where: { organizationId, date: { gte: startDate, lte: endDate } },
  })

  const keywordData = calls.reduce((acc, call) => {
    const keyword = call.keyword || call.searchQuery
    if (keyword) {
      if (!acc[keyword]) acc[keyword] = { keyword, calls: 0, conversions: 0 }
      acc[keyword].calls++
      if (call.csrConversion) acc[keyword].conversions++
    }
    return acc
  }, {} as Record<string, { keyword: string; calls: number; conversions: number }>)

  return Object.values(keywordData)
    .map(k => ({
      ...k,
      conversionRate: k.calls > 0 ? (k.conversions / k.calls) * 100 : 0
    }))
    .sort((a, b) => b.calls - a.calls)
    .slice(0, 10)
}

export async function getSourceMediumBreakdown(organizationId: string, dateRange?: DateRange) {
  const now = new Date()
  const startDate = dateRange?.from || startOfMonth(now)
  const endDate = dateRange?.to || endOfMonth(now)

  const calls = await prisma.call.findMany({
    where: { organizationId, date: { gte: startDate, lte: endDate } },
  })

  const sourceMediumData = calls.reduce((acc, call) => {
    const source = call.source || 'Unknown'
    const medium = call.medium || 'Unknown'
    const key = `${source}|${medium}`
    if (!acc[key]) {
      acc[key] = { source, medium, calls: 0, conversions: 0, totalValue: 0 }
    }
    acc[key].calls++
    if (call.csrConversion) acc[key].conversions++
    acc[key].totalValue += Number(call.csrValue || 0)
    return acc
  }, {} as Record<string, { source: string; medium: string; calls: number; conversions: number; totalValue: number }>)

  return Object.values(sourceMediumData)
    .sort((a, b) => b.calls - a.calls)
    .slice(0, 10)
}
