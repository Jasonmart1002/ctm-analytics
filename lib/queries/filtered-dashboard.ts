import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'

export interface DashboardFilters {
  dateRange: {
    startDate: Date
    endDate: Date
  }
  brands?: string[]
  sources?: string[]
  campaigns?: string[]
  statuses?: string[]
  agents?: string[]
  states?: string[]
  cities?: string[]
  directions?: string[]
  minScore?: number
  maxScore?: number
}

/**
 * Build Prisma where clause from dashboard filters
 */
export function buildFilterWhereClause(
  organizationId: string,
  filters: DashboardFilters
): Prisma.CallWhereInput {
  const where: Prisma.CallWhereInput = {
    organizationId,
    date: {
      gte: filters.dateRange.startDate,
      lte: filters.dateRange.endDate,
    },
  }

  // Brand filter (receivingNumber)
  if (filters.brands && filters.brands.length > 0) {
    where.receivingNumber = { in: filters.brands }
  }

  // Source filter (trackingSource)
  if (filters.sources && filters.sources.length > 0) {
    where.trackingSource = { in: filters.sources }
  }

  // Campaign filter
  if (filters.campaigns && filters.campaigns.length > 0) {
    where.campaign = { in: filters.campaigns }
  }

  // Call Status filter
  if (filters.statuses && filters.statuses.length > 0) {
    where.callStatus = { in: filters.statuses }
  }

  // Agent filter (using agent field, not csrName)
  if (filters.agents && filters.agents.length > 0) {
    where.agent = { in: filters.agents }
  }

  // State filter
  if (filters.states && filters.states.length > 0) {
    where.state = { in: filters.states }
  }

  // City filter
  if (filters.cities && filters.cities.length > 0) {
    where.city = { in: filters.cities }
  }

  // Direction filter
  if (filters.directions && filters.directions.length > 0) {
    where.direction = { in: filters.directions }
  }

  // CSR Score range filter
  if (filters.minScore !== undefined || filters.maxScore !== undefined) {
    where.csrCallScore = {}
    if (filters.minScore !== undefined) {
      where.csrCallScore.gte = filters.minScore
    }
    if (filters.maxScore !== undefined) {
      where.csrCallScore.lte = filters.maxScore
    }
  }

  return where
}

/**
 * Fetch filter options based on available data in the organization
 */
export async function fetchFilterOptions(organizationId: string) {
  // Fetch all unique values for each filter dimension
  const [
    brandOptions,
    sourceOptions,
    campaignOptions,
    statusOptions,
    agentOptions,
    stateOptions,
    cityOptions,
    directionOptions,
  ] = await Promise.all([
    // Brands (receivingNumber)
    prisma.call
      .groupBy({
        by: ['receivingNumber'],
        where: {
          organizationId,
          receivingNumber: { not: null },
        },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 100,
      })
      .then((results) =>
        results.map((r) => ({
          label: r.receivingNumber || 'Unknown',
          value: r.receivingNumber || 'Unknown',
          count: r._count.id,
        }))
      ),

    // Sources (trackingSource)
    prisma.call
      .groupBy({
        by: ['trackingSource'],
        where: {
          organizationId,
          trackingSource: { not: null },
        },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 100,
      })
      .then((results) =>
        results.map((r) => ({
          label: r.trackingSource || 'Unknown',
          value: r.trackingSource || 'Unknown',
          count: r._count.id,
        }))
      ),

    // Campaigns
    prisma.call
      .groupBy({
        by: ['campaign'],
        where: {
          organizationId,
          campaign: { not: null },
        },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 100,
      })
      .then((results) =>
        results.map((r) => ({
          label: r.campaign || 'Unknown',
          value: r.campaign || 'Unknown',
          count: r._count.id,
        }))
      ),

    // Call Statuses
    prisma.call
      .groupBy({
        by: ['callStatus'],
        where: {
          organizationId,
          callStatus: { not: null },
        },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      })
      .then((results) =>
        results.map((r) => ({
          label: r.callStatus || 'Unknown',
          value: r.callStatus || 'Unknown',
          count: r._count.id,
        }))
      ),

    // Agents (using agent field, not csrName)
    prisma.call
      .groupBy({
        by: ['agent'],
        where: {
          organizationId,
          agent: { not: null },
        },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 100,
      })
      .then((results) =>
        results.map((r) => ({
          label: r.agent || 'Unknown',
          value: r.agent || 'Unknown',
          count: r._count.id,
        }))
      ),

    // States
    prisma.call
      .groupBy({
        by: ['state'],
        where: {
          organizationId,
          state: { not: null },
        },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 100,
      })
      .then((results) =>
        results.map((r) => ({
          label: r.state || 'Unknown',
          value: r.state || 'Unknown',
          count: r._count.id,
        }))
      ),

    // Cities
    prisma.call
      .groupBy({
        by: ['city'],
        where: {
          organizationId,
          city: { not: null },
        },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 100,
      })
      .then((results) =>
        results.map((r) => ({
          label: r.city || 'Unknown',
          value: r.city || 'Unknown',
          count: r._count.id,
        }))
      ),

    // Directions
    prisma.call
      .groupBy({
        by: ['direction'],
        where: {
          organizationId,
          direction: { not: null },
        },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      })
      .then((results) =>
        results.map((r) => ({
          label: r.direction || 'Unknown',
          value: r.direction || 'Unknown',
          count: r._count.id,
        }))
      ),
  ])

  return {
    brands: brandOptions,
    sources: sourceOptions,
    campaigns: campaignOptions,
    statuses: statusOptions,
    agents: agentOptions,
    states: stateOptions,
    cities: cityOptions,
    directions: directionOptions,
  }
}

/**
 * Fetch filtered calls for dashboard
 */
export async function fetchFilteredCalls(
  organizationId: string,
  filters: DashboardFilters
) {
  const where = buildFilterWhereClause(organizationId, filters)

  const calls = await prisma.call.findMany({
    where,
    orderBy: { datetime: 'desc' },
    take: 10000, // Limit for performance
  })

  return calls
}

/**
 * Fetch filtered calls with previous period for comparison
 */
export async function fetchFilteredCallsWithComparison(
  organizationId: string,
  filters: DashboardFilters
) {
  // Current period
  const currentWhere = buildFilterWhereClause(organizationId, filters)
  const currentCalls = await prisma.call.findMany({
    where: currentWhere,
    orderBy: { datetime: 'desc' },
  })

  // Calculate previous period (same length as current period)
  const periodLength =
    filters.dateRange.endDate.getTime() - filters.dateRange.startDate.getTime()
  const previousStartDate = new Date(
    filters.dateRange.startDate.getTime() - periodLength
  )
  const previousEndDate = new Date(
    filters.dateRange.endDate.getTime() - periodLength
  )

  // Previous period (only date range changes, other filters remain)
  const previousFilters = {
    ...filters,
    dateRange: {
      startDate: previousStartDate,
      endDate: previousEndDate,
    },
  }

  const previousWhere = buildFilterWhereClause(organizationId, previousFilters)
  const previousCalls = await prisma.call.findMany({
    where: previousWhere,
    select: {
      id: true,
      csrConversion: true,
      duration: true,
      callStatus: true,
    },
  })

  return {
    currentCalls,
    previousCalls,
  }
}
