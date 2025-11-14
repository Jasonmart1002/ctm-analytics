import { prisma } from '@/lib/db'
import { DateRange } from '@/lib/types'
import { startOfMonth, endOfMonth, format } from 'date-fns'

export interface DataQualityMetrics {
  totalCalls: number
  overallScore: number
  completenessScore: number
  validationScore: number
  enrichmentScore: number
  period: string
}

export interface FieldCompleteness {
  field: string
  category: string
  total: number
  complete: number
  completeness: number
  priority: 'high' | 'medium' | 'low'
}

export interface DataValidationIssue {
  type: string
  count: number
  severity: 'critical' | 'warning' | 'info'
  description: string
}

export async function getDataQualityMetrics(organizationId: string, dateRange?: DateRange): Promise<DataQualityMetrics> {
  const now = new Date()
  const startDate = dateRange?.from || startOfMonth(now)
  const endDate = dateRange?.to || endOfMonth(now)

  const calls = await prisma.call.findMany({
    where: { organizationId, date: { gte: startDate, lte: endDate } },
  })

  const totalCalls = calls.length

  // Calculate completeness score (high-value fields)
  const criticalFields = [
    'customerNumber', 'callStatus', 'duration', 'trackingNumber', 
    'campaign', 'source', 'medium', 'csrName'
  ]
  
  let completenessTotal = 0
  criticalFields.forEach(field => {
    const complete = calls.filter(c => c[field as keyof typeof c] !== null && c[field as keyof typeof c] !== undefined && c[field as keyof typeof c] !== '').length
    completenessTotal += (complete / totalCalls) * 100
  })
  const completenessScore = totalCalls > 0 ? completenessTotal / criticalFields.length : 0

  // Calculate validation score (data quality indicators)
  const validCalls = calls.filter(c => 
    c.duration !== null && c.duration >= 0 &&
    c.callStatus !== null &&
    (c.date !== null || c.datetime !== null)
  ).length
  const validationScore = totalCalls > 0 ? (validCalls / totalCalls) * 100 : 0

  // Calculate enrichment score (optional but valuable fields)
  const enrichmentFields = ['city', 'state', 'csrCallScore', 'keyword', 'device', 'browser']
  let enrichmentTotal = 0
  enrichmentFields.forEach(field => {
    const complete = calls.filter(c => c[field as keyof typeof c] !== null && c[field as keyof typeof c] !== undefined && c[field as keyof typeof c] !== '').length
    enrichmentTotal += (complete / totalCalls) * 100
  })
  const enrichmentScore = totalCalls > 0 ? enrichmentTotal / enrichmentFields.length : 0

  // Overall score is weighted average
  const overallScore = (completenessScore * 0.5) + (validationScore * 0.3) + (enrichmentScore * 0.2)

  return {
    totalCalls,
    overallScore,
    completenessScore,
    validationScore,
    enrichmentScore,
    period: 'This Month',
  }
}

export async function getFieldCompleteness(organizationId: string, dateRange?: DateRange): Promise<FieldCompleteness[]> {
  const now = new Date()
  const startDate = dateRange?.from || startOfMonth(now)
  const endDate = dateRange?.to || endOfMonth(now)

  const calls = await prisma.call.findMany({
    where: { organizationId, date: { gte: startDate, lte: endDate } },
  })

  const totalCalls = calls.length

  const fields: Array<{ field: string; category: string; priority: 'high' | 'medium' | 'low' }> = [
    // Call Information - High Priority
    { field: 'customerNumber', category: 'Call Info', priority: 'high' },
    { field: 'callStatus', category: 'Call Info', priority: 'high' },
    { field: 'duration', category: 'Call Info', priority: 'high' },
    { field: 'talkTime', category: 'Call Info', priority: 'high' },
    { field: 'datetime', category: 'Call Info', priority: 'high' },
    
    // Tracking - High Priority
    { field: 'trackingNumber', category: 'Tracking', priority: 'high' },
    { field: 'trackingNumberLabel', category: 'Tracking', priority: 'medium' },
    
    // Marketing Attribution - High Priority
    { field: 'campaign', category: 'Marketing', priority: 'high' },
    { field: 'source', category: 'Marketing', priority: 'high' },
    { field: 'medium', category: 'Marketing', priority: 'high' },
    { field: 'keyword', category: 'Marketing', priority: 'medium' },
    
    // Agent/CSR - High Priority
    { field: 'csrName', category: 'Agent', priority: 'high' },
    { field: 'csrConversion', category: 'Agent', priority: 'high' },
    { field: 'csrValue', category: 'Agent', priority: 'high' },
    { field: 'csrCallScore', category: 'Agent', priority: 'medium' },
    
    // Location - Medium Priority
    { field: 'city', category: 'Location', priority: 'medium' },
    { field: 'state', category: 'Location', priority: 'medium' },
    { field: 'postalCode', category: 'Location', priority: 'low' },
    
    // Customer Info - Medium Priority
    { field: 'name', category: 'Customer', priority: 'medium' },
    { field: 'email', category: 'Customer', priority: 'medium' },
    { field: 'gender', category: 'Customer', priority: 'low' },
    
    // Technology - Medium Priority
    { field: 'device', category: 'Technology', priority: 'medium' },
    { field: 'browser', category: 'Technology', priority: 'medium' },
    { field: 'mobile', category: 'Technology', priority: 'medium' },
    
    // Advanced - Low Priority
    { field: 'transcription', category: 'Advanced', priority: 'low' },
    { field: 'summary', category: 'Advanced', priority: 'low' },
  ]

  return fields.map(({ field, category, priority }) => {
    const complete = calls.filter(c => {
      const value = c[field as keyof typeof c]
      return value !== null && value !== undefined && value !== ''
    }).length

    return {
      field,
      category,
      total: totalCalls,
      complete,
      completeness: totalCalls > 0 ? (complete / totalCalls) * 100 : 0,
      priority,
    }
  }).sort((a, b) => a.completeness - b.completeness) // Show lowest completeness first
}

export async function getDataValidationIssues(organizationId: string, dateRange?: DateRange): Promise<DataValidationIssue[]> {
  const now = new Date()
  const startDate = dateRange?.from || startOfMonth(now)
  const endDate = dateRange?.to || endOfMonth(now)

  const calls = await prisma.call.findMany({
    where: { organizationId, date: { gte: startDate, lte: endDate } },
  })

  const issues: DataValidationIssue[] = []

  // Missing customer numbers
  const missingCustomer = calls.filter(c => !c.customerNumber || c.customerNumber === '').length
  if (missingCustomer > 0) {
    issues.push({
      type: 'Missing Customer Number',
      count: missingCustomer,
      severity: 'critical',
      description: 'Calls without customer phone numbers cannot be tracked or analyzed properly',
    })
  }

  // Missing call status
  const missingStatus = calls.filter(c => !c.callStatus || c.callStatus === '').length
  if (missingStatus > 0) {
    issues.push({
      type: 'Missing Call Status',
      count: missingStatus,
      severity: 'critical',
      description: 'Calls without status information affect answer rate and performance metrics',
    })
  }

  // Invalid durations
  const invalidDuration = calls.filter(c => c.duration === null || c.duration < 0).length
  if (invalidDuration > 0) {
    issues.push({
      type: 'Invalid Call Duration',
      count: invalidDuration,
      severity: 'warning',
      description: 'Calls with missing or negative duration affect time-based analytics',
    })
  }

  // Missing tracking numbers
  const missingTracking = calls.filter(c => !c.trackingNumber || c.trackingNumber === '').length
  if (missingTracking > 0) {
    issues.push({
      type: 'Missing Tracking Number',
      count: missingTracking,
      severity: 'critical',
      description: 'Calls without tracking numbers cannot be attributed to campaigns',
    })
  }

  // Missing marketing attribution
  const missingCampaign = calls.filter(c => !c.campaign || c.campaign === '').length
  if (missingCampaign > 0) {
    issues.push({
      type: 'Missing Campaign',
      count: missingCampaign,
      severity: 'warning',
      description: 'Calls without campaign attribution reduce marketing effectiveness insights',
    })
  }

  // Missing agent assignment
  const missingAgent = calls.filter(c => !c.csrName || c.csrName === '').length
  if (missingAgent > 0) {
    issues.push({
      type: 'Missing Agent Assignment',
      count: missingAgent,
      severity: 'warning',
      description: 'Calls without agent assignment cannot be used in performance analysis',
    })
  }

  // Missing conversion data
  const missingConversion = calls.filter(c => c.csrConversion === null || c.csrConversion === undefined).length
  if (missingConversion > 0) {
    issues.push({
      type: 'Missing Conversion Data',
      count: missingConversion,
      severity: 'warning',
      description: 'Calls without conversion tracking affect ROI calculations',
    })
  }

  // Missing geographic data
  const missingGeo = calls.filter(c => (!c.city || c.city === '') && (!c.state || c.state === '')).length
  if (missingGeo > 0) {
    issues.push({
      type: 'Missing Geographic Data',
      count: missingGeo,
      severity: 'info',
      description: 'Calls without location data reduce geographic analysis capabilities',
    })
  }

  return issues.sort((a, b) => {
    const severityOrder = { critical: 3, warning: 2, info: 1 }
    return severityOrder[b.severity] - severityOrder[a.severity]
  })
}

export async function getCategoryCompleteness(organizationId: string, dateRange?: DateRange) {
  const now = new Date()
  const startDate = dateRange?.from || startOfMonth(now)
  const endDate = dateRange?.to || endOfMonth(now)

  const calls = await prisma.call.findMany({
    where: { organizationId, date: { gte: startDate, lte: endDate } },
  })

  const totalCalls = calls.length

  const categories = [
    {
      name: 'Call Information',
      fields: ['customerNumber', 'callStatus', 'duration', 'talkTime', 'ringTime', 'datetime'],
      icon: 'Phone',
    },
    {
      name: 'Marketing Attribution',
      fields: ['campaign', 'source', 'medium', 'keyword', 'trackingNumber'],
      icon: 'TrendingUp',
    },
    {
      name: 'Agent Performance',
      fields: ['csrName', 'csrConversion', 'csrValue', 'csrCallScore'],
      icon: 'Users',
    },
    {
      name: 'Customer Data',
      fields: ['name', 'email', 'city', 'state', 'gender'],
      icon: 'User',
    },
    {
      name: 'Technology',
      fields: ['device', 'browser', 'mobile'],
      icon: 'Smartphone',
    },
    {
      name: 'Advanced Features',
      fields: ['transcription', 'summary', 'keywordSpotting'],
      icon: 'Sparkles',
    },
  ]

  return categories.map(category => {
    let totalCompleteness = 0
    let validFields = 0

    category.fields.forEach(field => {
      const complete = calls.filter(c => {
        const value = c[field as keyof typeof c]
        return value !== null && value !== undefined && value !== ''
      }).length

      const completeness = totalCalls > 0 ? (complete / totalCalls) * 100 : 0
      totalCompleteness += completeness
      validFields++
    })

    const avgCompleteness = validFields > 0 ? totalCompleteness / validFields : 0

    return {
      category: category.name,
      icon: category.icon,
      completeness: avgCompleteness,
      fieldCount: category.fields.length,
    }
  }).sort((a, b) => b.completeness - a.completeness)
}

export async function getDataTrends(organizationId: string) {
  const now = new Date()
  const startDate = startOfMonth(now)
  const endDate = endOfMonth(now)

  const calls = await prisma.call.findMany({
    where: { organizationId, date: { gte: startDate, lte: endDate } },
    orderBy: { date: 'asc' },
  })

  // Group by date and calculate quality scores
  const dailyQuality = calls.reduce((acc, call) => {
    if (!call.date) return acc

    const dateStr = format(call.date, 'yyyy-MM-dd')
    if (!acc[dateStr]) {
      acc[dateStr] = {
        date: dateStr,
        total: 0,
        withCustomer: 0,
        withTracking: 0,
        withAgent: 0,
        withConversion: 0,
      }
    }

    acc[dateStr].total++
    if (call.customerNumber) acc[dateStr].withCustomer++
    if (call.trackingNumber) acc[dateStr].withTracking++
    if (call.csrName) acc[dateStr].withAgent++
    if (call.csrConversion !== null) acc[dateStr].withConversion++

    return acc
  }, {} as Record<string, {
    date: string
    total: number
    withCustomer: number
    withTracking: number
    withAgent: number
    withConversion: number
  }>)

  return Object.values(dailyQuality)
    .map(day => ({
      date: day.date,
      totalCalls: day.total,
      customerRate: day.total > 0 ? (day.withCustomer / day.total) * 100 : 0,
      trackingRate: day.total > 0 ? (day.withTracking / day.total) * 100 : 0,
      agentRate: day.total > 0 ? (day.withAgent / day.total) * 100 : 0,
      conversionRate: day.total > 0 ? (day.withConversion / day.total) * 100 : 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export async function getDataQualityBySource(organizationId: string, dateRange?: DateRange) {
  const now = new Date()
  const startDate = dateRange?.from || startOfMonth(now)
  const endDate = dateRange?.to || endOfMonth(now)

  const calls = await prisma.call.findMany({
    where: { organizationId, date: { gte: startDate, lte: endDate } },
  })

  // Group by source and calculate completeness
  const sourceData = calls.reduce((acc, call) => {
    const source = call.source || 'Unknown'
    if (!acc[source]) {
      acc[source] = {
        source,
        total: 0,
        withCustomer: 0,
        withAgent: 0,
        withConversion: 0,
        withLocation: 0,
      }
    }

    acc[source].total++
    if (call.customerNumber) acc[source].withCustomer++
    if (call.csrName) acc[source].withAgent++
    if (call.csrConversion !== null) acc[source].withConversion++
    if (call.city || call.state) acc[source].withLocation++

    return acc
  }, {} as Record<string, {
    source: string
    total: number
    withCustomer: number
    withAgent: number
    withConversion: number
    withLocation: number
  }>)

  return Object.values(sourceData)
    .map(s => ({
      source: s.source,
      calls: s.total,
      customerRate: s.total > 0 ? (s.withCustomer / s.total) * 100 : 0,
      agentRate: s.total > 0 ? (s.withAgent / s.total) * 100 : 0,
      conversionRate: s.total > 0 ? (s.withConversion / s.total) * 100 : 0,
      locationRate: s.total > 0 ? (s.withLocation / s.total) * 100 : 0,
      avgQuality: s.total > 0 ? 
        ((s.withCustomer + s.withAgent + s.withConversion + s.withLocation) / (s.total * 4)) * 100 : 0,
    }))
    .sort((a, b) => b.calls - a.calls)
    .slice(0, 10)
}
