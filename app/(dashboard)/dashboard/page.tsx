import { requireOrgId } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { DashboardContainer } from '@/components/dashboard/dashboard-container'
import { OverviewTab } from '@/components/dashboard/tabs/overview-tab'
import { MarketingTab } from '@/components/dashboard/tabs/marketing-tab'
import { AdmissionsTab } from '@/components/dashboard/tabs/admissions-tab'
import { ExecutiveTab } from '@/components/dashboard/tabs/executive-tab'
import {
  fetchFilterOptions,
  fetchFilteredCallsWithComparison,
} from '@/lib/queries/filtered-dashboard'
import { parseFiltersFromParams } from '@/lib/utils/filter-params'
import {
  calculateOverviewMetrics,
  calculateCallVolumeOverTime,
  calculateConversionOverTime,
  calculateStatusBreakdown,
  calculateChannelMix,
  calculateScoreDistribution,
  calculateTopStates,
  calculateTopSources,
} from '@/lib/queries/overview-calculations'
import {
  calculateMarketingMetrics,
  calculateCampaignPerformance,
  calculateSourcePerformance,
  calculateMediumBreakdown,
  calculateKeywordPerformance,
  calculateCampaignTrends,
} from '@/lib/queries/marketing-calculations'
import {
  calculateAdmissionsMetrics,
  calculateAgentPerformance,
  calculateScoreBreakdown,
  calculateConversionFunnel,
  calculateHourlyPerformance,
  calculateTopPerformingStates,
} from '@/lib/queries/admissions-calculations'
import {
  calculateExecutiveMetrics,
  calculateRevenueBySource,
  calculateMonthlyTrends,
  calculatePerformanceSummary,
  calculateTopRevenueChannels,
} from '@/lib/queries/executive-calculations'
import { Card, CardContent } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

interface SearchParams {
  from?: string
  to?: string
  brands?: string
  sources?: string
  campaigns?: string
  statuses?: string
  agents?: string
  states?: string
  cities?: string
  directions?: string
  minScore?: string
  maxScore?: string
  tab?: string
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const orgId = await requireOrgId()

  // Await searchParams (Next.js 16 requirement)
  const params = await searchParams

  // Default date range: last 30 days
  const defaultEndDate = new Date()
  const defaultStartDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  try {
    // Fetch organization from database
    const org = await prisma.organization.findUnique({
      where: { clerkOrgId: orgId },
    })

    if (!org) {
      return (
        <div className="flex items-center justify-center h-full p-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold mb-2">Welcome to CTM Analytics</h1>
              <p className="text-muted-foreground">
                No data found. Please upload your CTM data to get started.
              </p>
            </CardContent>
          </Card>
        </div>
      )
    }

    // Parse filters from URL parameters
    const filters = parseFiltersFromParams(params, {
      startDate: defaultStartDate,
      endDate: defaultEndDate,
    })

    // Fetch filter options (for dropdowns)
    const filterOptions = await fetchFilterOptions(org.id)

    // Fetch filtered calls with comparison to previous period
    const { currentCalls, previousCalls } =
      await fetchFilteredCallsWithComparison(org.id, filters)

    // Calculate Overview tab metrics
    const overviewMetrics = calculateOverviewMetrics(currentCalls, previousCalls)
    const callVolumeData = calculateCallVolumeOverTime(currentCalls)
    const conversionData = calculateConversionOverTime(currentCalls)
    const statusBreakdown = calculateStatusBreakdown(currentCalls)
    const channelMix = calculateChannelMix(currentCalls)
    const scoreDistribution = calculateScoreDistribution(currentCalls)
    const topStates = calculateTopStates(currentCalls, 10)
    const topSources = calculateTopSources(currentCalls, 10)

    // Calculate Marketing tab metrics
    const marketingMetrics = calculateMarketingMetrics(currentCalls, previousCalls)
    const topCampaigns = calculateCampaignPerformance(currentCalls, 10)
    const topMarketingSources = calculateSourcePerformance(currentCalls, 10)
    const mediumBreakdown = calculateMediumBreakdown(currentCalls)
    const topKeywords = calculateKeywordPerformance(currentCalls, 20)
    const campaignTrends = calculateCampaignTrends(currentCalls)

    // Calculate Admissions tab metrics
    const admissionsMetrics = calculateAdmissionsMetrics(currentCalls, previousCalls)
    const agentPerformance = calculateAgentPerformance(currentCalls, 10)
    const scoreBreakdown = calculateScoreBreakdown(currentCalls)
    const conversionFunnel = calculateConversionFunnel(currentCalls)
    const hourlyPerformance = calculateHourlyPerformance(currentCalls)
    const topPerformingStates = calculateTopPerformingStates(currentCalls, 10)

    // Calculate Executive tab metrics
    const executiveMetrics = calculateExecutiveMetrics(currentCalls, previousCalls)
    const revenueBySource = calculateRevenueBySource(currentCalls, 10)
    const monthlyTrends = calculateMonthlyTrends(currentCalls)
    const performanceSummary = calculatePerformanceSummary(currentCalls, previousCalls)
    const topRevenueChannels = calculateTopRevenueChannels(currentCalls, 6)

    return (
      <DashboardContainer
        filterOptions={filterOptions}
        initialDateRange={filters.dateRange}
        overviewContent={
          <OverviewTab
            calls={currentCalls}
            metrics={overviewMetrics}
            callVolumeData={callVolumeData}
            conversionData={conversionData}
            statusBreakdown={statusBreakdown}
            channelMix={channelMix}
            scoreDistribution={scoreDistribution}
            topStates={topStates}
            topSources={topSources}
          />
        }
        marketingContent={
          <MarketingTab
            calls={currentCalls}
            metrics={marketingMetrics}
            topCampaigns={topCampaigns}
            topSources={topMarketingSources}
            mediumBreakdown={mediumBreakdown}
            topKeywords={topKeywords}
            campaignTrends={campaignTrends}
          />
        }
        admissionsContent={
          <AdmissionsTab
            calls={currentCalls}
            metrics={admissionsMetrics}
            agentPerformance={agentPerformance}
            scoreBreakdown={scoreBreakdown}
            conversionFunnel={conversionFunnel}
            hourlyPerformance={hourlyPerformance}
            topPerformingStates={topPerformingStates}
          />
        }
        executiveContent={
          <ExecutiveTab
            calls={currentCalls}
            metrics={executiveMetrics}
            revenueBySource={revenueBySource}
            monthlyTrends={monthlyTrends}
            performanceSummary={performanceSummary}
            topRevenueChannels={topRevenueChannels}
          />
        }
      />
    )
  } catch (error) {
    console.error('Dashboard error:', error)
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">CTM Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Unable to connect to database. The database may be starting up. Please refresh in a few seconds.
          </p>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">
              Error: {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }
}
