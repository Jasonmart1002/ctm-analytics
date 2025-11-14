import { prisma } from '@/lib/db'
import { DateRange } from '@/lib/types'
import { startOfMonth, endOfMonth } from 'date-fns'

export interface CustomerMetrics {
  totalCustomers: number
  totalCalls: number
  avgCallsPerCustomer: number
  topState: { state: string; calls: number; customers: number } | null
  topCity: { city: string; calls: number } | null
  mobilePercentage: number
  conversionRate: number
  avgCallDuration: number
  period: string
}

export async function getCustomerMetrics(organizationId: string, dateRange?: DateRange): Promise<CustomerMetrics> {
  const now = new Date()
  const startDate = dateRange?.from || startOfMonth(now)
  const endDate = dateRange?.to || endOfMonth(now)

  const calls = await prisma.call.findMany({
    where: { organizationId, date: { gte: startDate, lte: endDate } },
  })

  // Count unique customers by phone number
  const uniqueCustomers = new Set(calls.filter(c => c.customerNumber).map(c => c.customerNumber!))
  const totalCustomers = uniqueCustomers.size

  // Geographic distribution
  const stateData = calls.reduce((acc, call) => {
    const state = call.state || 'Unknown'
    const customer = call.customerNumber
    if (!acc[state]) acc[state] = { calls: 0, customers: new Set() }
    acc[state].calls++
    if (customer) acc[state].customers.add(customer)
    return acc
  }, {} as Record<string, { calls: number; customers: Set<string> }>)

  const topStateEntry = Object.entries(stateData)
    .map(([state, data]) => ({ state, calls: data.calls, customers: data.customers.size }))
    .sort((a, b) => b.calls - a.calls)[0]
  const topState = topStateEntry || null

  const cityData = calls.reduce((acc, call) => {
    const city = call.city || 'Unknown'
    if (!acc[city]) acc[city] = 0
    acc[city]++
    return acc
  }, {} as Record<string, number>)

  const topCityEntry = Object.entries(cityData).sort(([, a], [, b]) => b - a)[0]
  const topCity = topCityEntry ? { city: topCityEntry[0], calls: topCityEntry[1] } : null

  // Device metrics
  const mobileCalls = calls.filter(c => c.mobile).length
  const mobilePercentage = calls.length > 0 ? (mobileCalls / calls.length) * 100 : 0

  // Conversion metrics
  const conversions = calls.filter(c => c.csrConversion).length
  const conversionRate = calls.length > 0 ? (conversions / calls.length) * 100 : 0

  // Call duration
  const totalDuration = calls.reduce((sum, call) => sum + (call.duration || 0), 0)
  const avgCallDuration = calls.length > 0 ? totalDuration / calls.length : 0

  const avgCallsPerCustomer = totalCustomers > 0 ? calls.length / totalCustomers : 0

  return {
    totalCustomers,
    totalCalls: calls.length,
    avgCallsPerCustomer,
    topState,
    topCity,
    mobilePercentage,
    conversionRate,
    avgCallDuration,
    period: 'This Month',
  }
}

export async function getGeographicDistribution(organizationId: string, dateRange?: DateRange) {
  const now = new Date()
  const startDate = dateRange?.from || startOfMonth(now)
  const endDate = dateRange?.to || endOfMonth(now)

  const calls = await prisma.call.findMany({
    where: { organizationId, date: { gte: startDate, lte: endDate } },
  })

  const stateData = calls.reduce((acc, call) => {
    const state = call.state || 'Unknown'
    if (!acc[state]) {
      acc[state] = { state, calls: 0, conversions: 0, revenue: 0 }
    }
    acc[state].calls++
    if (call.csrConversion) acc[state].conversions++
    acc[state].revenue += Number(call.csrValue || 0)
    return acc
  }, {} as Record<string, { state: string; calls: number; conversions: number; revenue: number }>)

  return Object.values(stateData)
    .map(s => ({
      ...s,
      conversionRate: s.calls > 0 ? (s.conversions / s.calls) * 100 : 0
    }))
    .sort((a, b) => b.calls - a.calls)
    .slice(0, 20)
}

export async function getDemographics(organizationId: string, dateRange?: DateRange) {
  const now = new Date()
  const startDate = dateRange?.from || startOfMonth(now)
  const endDate = dateRange?.to || endOfMonth(now)

  const calls = await prisma.call.findMany({
    where: { organizationId, date: { gte: startDate, lte: endDate } },
  })

  // Gender distribution
  const genderData = calls.reduce((acc, call) => {
    const gender = call.gender || 'Unknown'
    if (!acc[gender]) acc[gender] = { calls: 0, conversions: 0 }
    acc[gender].calls++
    if (call.csrConversion) acc[gender].conversions++
    return acc
  }, {} as Record<string, { calls: number; conversions: number }>)

  const genders = Object.entries(genderData).map(([gender, data]) => ({
    gender,
    calls: data.calls,
    conversions: data.conversions,
    conversionRate: data.calls > 0 ? (data.conversions / data.calls) * 100 : 0
  }))

  // Age distribution
  const ageData = calls.reduce((acc, call) => {
    const age = call.extendedLookupAge || 'Unknown'
    if (!acc[age]) acc[age] = { calls: 0, conversions: 0 }
    acc[age].calls++
    if (call.csrConversion) acc[age].conversions++
    return acc
  }, {} as Record<string, { calls: number; conversions: number }>)

  const ages = Object.entries(ageData).map(([age, data]) => ({
    age,
    calls: data.calls,
    conversions: data.conversions,
    conversionRate: data.calls > 0 ? (data.conversions / data.calls) * 100 : 0
  }))

  return { genders, ages }
}

export async function getDeviceAnalytics(organizationId: string, dateRange?: DateRange) {
  const now = new Date()
  const startDate = dateRange?.from || startOfMonth(now)
  const endDate = dateRange?.to || endOfMonth(now)

  const calls = await prisma.call.findMany({
    where: { organizationId, date: { gte: startDate, lte: endDate } },
  })

  // Device type distribution
  const deviceData = calls.reduce((acc, call) => {
    const device = call.device || 'Unknown'
    if (!acc[device]) acc[device] = { calls: 0, conversions: 0 }
    acc[device].calls++
    if (call.csrConversion) acc[device].conversions++
    return acc
  }, {} as Record<string, { calls: number; conversions: number }>)

  const devices = Object.entries(deviceData).map(([device, data]) => ({
    device,
    calls: data.calls,
    conversions: data.conversions,
    conversionRate: data.calls > 0 ? (data.conversions / data.calls) * 100 : 0
  })).sort((a, b) => b.calls - a.calls)

  // Browser distribution
  const browserData = calls.reduce((acc, call) => {
    const browser = call.browser || 'Unknown'
    if (!acc[browser]) acc[browser] = { calls: 0, conversions: 0 }
    acc[browser].calls++
    if (call.csrConversion) acc[browser].conversions++
    return acc
  }, {} as Record<string, { calls: number; conversions: number }>)

  const browsers = Object.entries(browserData).map(([browser, data]) => ({
    browser,
    calls: data.calls,
    conversions: data.conversions,
    conversionRate: data.calls > 0 ? (data.conversions / data.calls) * 100 : 0
  })).sort((a, b) => b.calls - a.calls)

  // Mobile vs Desktop
  const mobileCalls = calls.filter(c => c.mobile).length
  const desktopCalls = calls.length - mobileCalls
  const mobileConversions = calls.filter(c => c.mobile && c.csrConversion).length
  const desktopConversions = calls.filter(c => !c.mobile && c.csrConversion).length

  const mobileVsDesktop = [
    {
      type: 'Mobile',
      calls: mobileCalls,
      conversions: mobileConversions,
      conversionRate: mobileCalls > 0 ? (mobileConversions / mobileCalls) * 100 : 0
    },
    {
      type: 'Desktop',
      calls: desktopCalls,
      conversions: desktopConversions,
      conversionRate: desktopCalls > 0 ? (desktopConversions / desktopCalls) * 100 : 0
    }
  ]

  return { devices, browsers, mobileVsDesktop }
}

export async function getCustomerValueSegments(organizationId: string, dateRange?: DateRange) {
  const now = new Date()
  const startDate = dateRange?.from || startOfMonth(now)
  const endDate = dateRange?.to || endOfMonth(now)

  const calls = await prisma.call.findMany({
    where: { organizationId, date: { gte: startDate, lte: endDate } },
  })

  // Segment customers by value
  const customerData = calls.reduce((acc, call) => {
    const customer = call.customerNumber || call.phone || 'Unknown'
    if (!acc[customer]) {
      acc[customer] = { calls: 0, conversions: 0, revenue: 0 }
    }
    acc[customer].calls++
    if (call.csrConversion) acc[customer].conversions++
    acc[customer].revenue += Number(call.csrValue || 0)
    return acc
  }, {} as Record<string, { calls: number; conversions: number; revenue: number }>)

  const customers = Object.entries(customerData).map(([customer, data]) => ({
    customer,
    ...data
  })).sort((a, b) => b.revenue - a.revenue)

  // Define value segments
  const segments = {
    vip: customers.filter(c => c.revenue >= 1000).length,
    high: customers.filter(c => c.revenue >= 500 && c.revenue < 1000).length,
    medium: customers.filter(c => c.revenue >= 100 && c.revenue < 500).length,
    low: customers.filter(c => c.revenue > 0 && c.revenue < 100).length,
    none: customers.filter(c => c.revenue === 0).length,
  }

  return {
    segments,
    topCustomers: customers.slice(0, 10)
  }
}

export async function getCallTimingPatterns(organizationId: string, dateRange?: DateRange) {
  const now = new Date()
  const startDate = dateRange?.from || startOfMonth(now)
  const endDate = dateRange?.to || endOfMonth(now)

  const calls = await prisma.call.findMany({
    where: { organizationId, date: { gte: startDate, lte: endDate } },
  })

  // Hour of day distribution
  const hourData = calls.reduce((acc, call) => {
    const hour = call.hourOfDay ?? -1
    if (hour >= 0) {
      if (!acc[hour]) acc[hour] = { calls: 0, conversions: 0 }
      acc[hour].calls++
      if (call.csrConversion) acc[hour].conversions++
    }
    return acc
  }, {} as Record<number, { calls: number; conversions: number }>)

  const hourlyDistribution = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    calls: hourData[hour]?.calls || 0,
    conversions: hourData[hour]?.conversions || 0,
    conversionRate: hourData[hour]?.calls > 0
      ? (hourData[hour].conversions / hourData[hour].calls) * 100
      : 0
  }))

  // Day of week distribution
  const dayData = calls.reduce((acc, call) => {
    const day = call.day || 'Unknown'
    if (!acc[day]) acc[day] = { calls: 0, conversions: 0 }
    acc[day].calls++
    if (call.csrConversion) acc[day].conversions++
    return acc
  }, {} as Record<string, { calls: number; conversions: number }>)

  const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const weeklyDistribution = dayOrder.map(day => ({
    day,
    calls: dayData[day]?.calls || 0,
    conversions: dayData[day]?.conversions || 0,
    conversionRate: dayData[day]?.calls > 0
      ? (dayData[day].conversions / dayData[day].calls) * 100
      : 0
  }))

  return { hourlyDistribution, weeklyDistribution }
}
