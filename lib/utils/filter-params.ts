import { DashboardFilters } from '../queries/filtered-dashboard'

/**
 * Parse dashboard filters from URL search params
 */
export function parseFiltersFromParams(
  searchParams: any,
  defaultDateRange: { startDate: Date; endDate: Date }
): DashboardFilters {
  const getArrayParam = (key: string): string[] | undefined => {
    const param = searchParams[key]
    if (!param) return undefined
    return param.split(',').filter(Boolean)
  }

  const getNumberParam = (
    key: string,
    defaultValue?: number
  ): number | undefined => {
    const param = searchParams[key]
    if (!param) return defaultValue
    const num = Number(param)
    return isNaN(num) ? defaultValue : num
  }

  // Parse date range
  const startDate = searchParams.from
    ? new Date(searchParams.from)
    : defaultDateRange.startDate
  const endDate = searchParams.to
    ? new Date(searchParams.to)
    : defaultDateRange.endDate

  // Set to start/end of day
  startDate.setHours(0, 0, 0, 0)
  endDate.setHours(23, 59, 59, 999)

  return {
    dateRange: { startDate, endDate },
    brands: getArrayParam('brands'),
    sources: getArrayParam('sources'),
    campaigns: getArrayParam('campaigns'),
    statuses: getArrayParam('statuses'),
    agents: getArrayParam('agents'),
    states: getArrayParam('states'),
    cities: getArrayParam('cities'),
    directions: getArrayParam('directions'),
    minScore: getNumberParam('minScore'),
    maxScore: getNumberParam('maxScore'),
  }
}

/**
 * Get active filter count from parsed filters
 */
export function getActiveFilterCount(filters: DashboardFilters): number {
  let count = 0

  if (filters.brands && filters.brands.length > 0) count++
  if (filters.sources && filters.sources.length > 0) count++
  if (filters.campaigns && filters.campaigns.length > 0) count++
  if (filters.statuses && filters.statuses.length > 0) count++
  if (filters.agents && filters.agents.length > 0) count++
  if (filters.states && filters.states.length > 0) count++
  if (filters.cities && filters.cities.length > 0) count++
  if (filters.directions && filters.directions.length > 0) count++
  if (
    filters.minScore !== undefined &&
    filters.minScore > 0 ||
    filters.maxScore !== undefined &&
    filters.maxScore < 5
  ) {
    count++
  }

  return count
}
