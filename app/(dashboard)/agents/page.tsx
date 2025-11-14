import { requireOrgId } from '@/lib/auth'
import { KPICard } from '@/components/dashboard/kpi-card'
import { Users, TrendingUp, Award, DollarSign, Phone, Target } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAgentPerformance, getAgentLeaderboard, formatDuration } from '@/lib/queries/agent-metrics'
import { DashboardWrapper } from '@/components/dashboard/dashboard-wrapper'
import { prisma } from '@/lib/db'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

interface SearchParams {
  startDate?: string
  endDate?: string
}

export default async function AgentsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const orgId = await requireOrgId()

  // Await searchParams (Next.js 16 requirement)
  const params = await searchParams

  // Parse date range from URL or default to last 30 days
  const endDate = params.endDate ? new Date(params.endDate) : new Date()
  const startDate = params.startDate
    ? new Date(params.startDate)
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  // Set endDate to end of day to include all calls on the end date
  endDate.setHours(23, 59, 59, 999)
  // Set startDate to start of day to include all calls on the start date
  startDate.setHours(0, 0, 0, 0)

  const dateRange = { startDate, endDate }

  try {
    // Fetch organization from database
    const org = await prisma.organization.findUnique({
      where: { clerkOrgId: orgId }
    })

    if (!org) {
      return (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Agent Performance</h1>
            <p className="text-muted-foreground mt-1">
              No data found. Please upload your CTM data to get started.
            </p>
          </div>
        </div>
      )
    }

    // Fetch agent metrics
    const agentMetrics = await getAgentPerformance(org.id, { from: startDate, to: endDate })
    const topConversions = await getAgentLeaderboard(org.id, { startDate, endDate }, 'conversions')
    const topConversionRate = await getAgentLeaderboard(org.id, { startDate, endDate }, 'conversionRate')

    // Calculate overall stats
    const totalAgents = agentMetrics.length
    const totalCalls = agentMetrics.reduce((sum, a) => sum + a.calls, 0)
    const totalConversions = agentMetrics.reduce((sum, a) => sum + a.conversions, 0)
    const avgConversionRate = totalCalls > 0 ? (totalConversions / totalCalls) * 100 : 0
    const avgCallScore = agentMetrics.reduce((sum, a) => sum + a.avgCallScore, 0) / (totalAgents || 1)

    return (
      <DashboardWrapper initialDateRange={dateRange}>
        {/* Overview KPIs */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-muted-foreground uppercase tracking-wide">Team Overview</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <KPICard
              title="Active Agents"
              value={totalAgents.toString()}
              icon={<Users className="h-4 w-4" />}
            />
            <KPICard
              title="Total Calls"
              value={totalCalls.toLocaleString()}
              icon={<Phone className="h-4 w-4" />}
            />
            <KPICard
              title="Team Conv. Rate"
              value={`${avgConversionRate.toFixed(1)}%`}
              icon={<TrendingUp className="h-4 w-4" />}
            />
            <KPICard
              title="Avg Call Score"
              value={avgCallScore > 0 ? avgCallScore.toFixed(1) : 'N/A'}
              icon={<Award className="h-4 w-4" />}
            />
          </div>
        </div>

        {/* Leaderboards */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Top Conversions */}
          <Card className="shadow-md border-border/50">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl font-semibold">Top Conversions</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {topConversions.length === 0 ? (
                <div className="text-muted-foreground text-center py-8">
                  No agent data available
                </div>
              ) : (
                <div className="space-y-2">
                  {topConversions.slice(0, 5).map((agent, index) => (
                    <div key={agent.agentName} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors border border-border/30">
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                          index === 0 ? 'bg-primary/20 text-primary border-2 border-primary/30' :
                          index === 1 ? 'bg-primary/15 text-primary border border-primary/25' :
                          index === 2 ? 'bg-primary/10 text-primary border border-primary/20' :
                          'bg-muted text-muted-foreground border border-border'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{agent.agentName}</p>
                          <p className="text-xs text-muted-foreground">
                            {agent.conversionRate.toFixed(1)}% rate
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold number-display text-lg">{agent.conversions}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Best Conversion Rate */}
          <Card className="shadow-md border-border/50">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl font-semibold">Best Conv. Rate</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {topConversionRate.length === 0 ? (
                <div className="text-muted-foreground text-center py-8">
                  No agent data available
                </div>
              ) : (
                <div className="space-y-2">
                  {topConversionRate.slice(0, 5).map((agent, index) => (
                    <div key={agent.agentName} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors border border-border/30">
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                          index === 0 ? 'bg-primary/20 text-primary border-2 border-primary/30' :
                          index === 1 ? 'bg-primary/15 text-primary border border-primary/25' :
                          index === 2 ? 'bg-primary/10 text-primary border border-primary/20' :
                          'bg-muted text-muted-foreground border border-border'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{agent.agentName}</p>
                          <p className="text-xs text-muted-foreground">
                            {agent.totalCalls} calls
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold number-display text-lg">{agent.conversionRate.toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detailed Agent Performance Table */}
        <Card className="shadow-md border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold">Agent Performance Details</CardTitle>
          </CardHeader>
          <CardContent>
            {agentMetrics.length === 0 ? (
              <div className="text-muted-foreground text-center py-8">
                No agent data available for the selected date range.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-border/50">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/30">
                      <th className="text-left p-3 font-medium text-muted-foreground">Agent</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Calls</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Answer Rate</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Avg Duration</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Conversions</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Conv. Rate</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agentMetrics.map((agentData) => (
                      <tr key={agentData.agent} className="border-b border-border/30 hover:bg-muted/50 transition-colors">
                        <td className="p-3">
                          <div className="font-medium">{agentData.agent}</div>
                        </td>
                        <td className="p-3 text-right number-display">{agentData.calls.toLocaleString()}</td>
                        <td className="p-3 text-right">
                          <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                            agentData.answerRate >= 80 ? 'bg-primary/10 text-primary border border-primary/20' :
                            agentData.answerRate >= 60 ? 'bg-accent text-accent-foreground border border-border' :
                            'bg-muted text-muted-foreground border border-border'
                          }`}>
                            {agentData.answerRate.toFixed(1)}%
                          </span>
                        </td>
                        <td className="p-3 text-right number-display">{formatDuration(agentData.avgDuration)}</td>
                        <td className="p-3 text-right number-display">{agentData.conversions}</td>
                        <td className="p-3 text-right">
                          <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                            agentData.conversionRate >= 50 ? 'bg-primary/10 text-primary border border-primary/20' :
                            agentData.conversionRate >= 25 ? 'bg-accent text-accent-foreground border border-border' :
                            'bg-muted text-muted-foreground border border-border'
                          }`}>
                            {agentData.conversionRate.toFixed(1)}%
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {agentData.avgCallScore > 0 ? (
                            <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                              agentData.avgCallScore >= 8 ? 'bg-primary/10 text-primary border border-primary/20' :
                              agentData.avgCallScore >= 6 ? 'bg-accent text-accent-foreground border border-border' :
                              'bg-muted text-muted-foreground border border-border'
                            }`}>
                              {agentData.avgCallScore.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </DashboardWrapper>
    )
  } catch (error) {
    console.error('Agent performance error:', error)
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Agent Performance</h1>
          <p className="text-muted-foreground mt-1">
            Unable to load agent data. Please try again.
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
