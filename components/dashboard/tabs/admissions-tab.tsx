'use client'

import * as React from 'react'
import { Decimal } from '@prisma/client/runtime/library'
import { KPICard } from '../kpi-card'
import { ComboChart } from '../combo-chart'
import { DonutChart } from '../donut-chart'
import { CallDrilldownDrawer } from '../call-drilldown-drawer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { InfoTooltip } from '@/components/ui/info-tooltip'
import {
  Users,
  CheckCircle,
  TrendingUp,
  Award,
  Clock,
  Phone,
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

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
  trackingSource?: string | null
  campaign?: string | null
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

interface AdmissionsTabProps {
  calls: Call[]
  metrics: AdmissionsMetrics
  agentPerformance: AgentPerformance[]
  scoreBreakdown: ScoreBreakdown[]
  conversionFunnel: ConversionFunnel[]
  hourlyPerformance: HourlyPerformance[]
  topPerformingStates: { state: string; calls: number; conversions: number; conversionRate: number }[]
}

export function AdmissionsTab({
  calls,
  metrics,
  agentPerformance,
  scoreBreakdown,
  conversionFunnel,
  hourlyPerformance,
  topPerformingStates,
}: AdmissionsTabProps) {
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [selectedCalls, setSelectedCalls] = React.useState<Call[]>([])
  const [drawerTitle, setDrawerTitle] = React.useState('')

  const handleOpenDrawer = (calls: Call[], title: string) => {
    setSelectedCalls(calls)
    setDrawerTitle(title)
    setDrawerOpen(true)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-green-600'
    if (score >= 3) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="p-6 space-y-6">
      {/* Row 1: Admissions KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <KPICard
          title="Total Inquiries"
          value={metrics.totalInquiries.toLocaleString()}
          trend={metrics.trends.inquiriesTrend}
          icon={<Phone className="h-4 w-4" />}
          description={`vs last period: ${metrics.trends.inquiriesTrend > 0 ? '+' : ''}${metrics.trends.inquiriesTrend.toFixed(1)}%`}
          tooltip="Total number of inquiry calls received in the selected date range"
        />
        <KPICard
          title="Qualified Leads"
          value={metrics.qualifiedLeads.toLocaleString()}
          trend={metrics.trends.qualifiedTrend}
          icon={<Users className="h-4 w-4" />}
          description={`${metrics.qualificationRate.toFixed(1)}% qualification rate`}
          tooltip="Calls with CSR score >= 3.0, indicating qualified leads"
        />
        <KPICard
          title="Admissions"
          value={metrics.conversions.toLocaleString()}
          trend={metrics.trends.conversionsTrend}
          icon={<CheckCircle className="h-4 w-4" />}
          description={`${metrics.conversionRate.toFixed(1)}% conversion rate`}
          tooltip="Successfully converted admissions from qualified leads"
        />
        <KPICard
          title="Avg Call Quality"
          value={metrics.avgCallScore.toFixed(2)}
          trend={0}
          icon={<Award className="h-4 w-4" />}
          description={`${formatDuration(Math.round(metrics.avgTalkTime))} avg talk time`}
          tooltip="Average CSR call score across all inquiries"
        />
      </div>

      {/* Row 2: Conversion Funnel & Hourly Performance */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Admissions Funnel</CardTitle>
              <InfoTooltip content="Visual representation of the conversion funnel from inquiry to admission" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {conversionFunnel.map((stage, index) => (
                <div key={stage.stage} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <span className="font-medium">{stage.stage}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{stage.count.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">{stage.percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                  <Progress value={stage.percentage} className="h-3" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Hourly Performance */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Performance by Hour</CardTitle>
              <InfoTooltip content="Call volume and quality metrics by hour of day" />
            </div>
          </CardHeader>
          <CardContent>
            <ComboChart
              data={hourlyPerformance}
              xAxisKey="hour"
              bars={[
                { key: 'calls', name: 'Calls', color: '#3b82f6' },
              ]}
              lines={[
                { key: 'avgScore', name: 'Avg Score', color: '#10b981' },
              ]}
              height={280}
            />
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Agent Performance & Score Distribution */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Agent Performance Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Agent Performance</CardTitle>
              <InfoTooltip content="Individual agent/CSR performance metrics for admissions" />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead className="text-right">Calls</TableHead>
                  <TableHead className="text-right">Avg Score</TableHead>
                  <TableHead className="text-right">Conv.</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agentPerformance.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No agent data available
                    </TableCell>
                  </TableRow>
                ) : (
                  agentPerformance.map((agent) => (
                    <TableRow
                      key={agent.agent}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() =>
                        handleOpenDrawer(
                          calls.filter((c) => c.agent === agent.agent || c.csrName === agent.agent),
                          `Calls handled by ${agent.agent}`
                        )
                      }
                    >
                      <TableCell className="font-medium max-w-[150px] truncate">
                        {agent.agent || '(No agent)'}
                      </TableCell>
                      <TableCell className="text-right">
                        {agent.calls.toLocaleString()}
                      </TableCell>
                      <TableCell className={`text-right font-medium ${getScoreColor(agent.avgScore)}`}>
                        {agent.avgScore.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        {agent.conversions.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={agent.conversionRate >= 50 ? 'default' : 'secondary'}
                        >
                          {agent.conversionRate.toFixed(1)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Score Distribution */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Call Quality Distribution</CardTitle>
              <InfoTooltip content="Distribution of calls by CSR score range and conversion performance" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scoreBreakdown.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No score data available
                </div>
              ) : (
                scoreBreakdown.map((bucket) => (
                  <div key={bucket.scoreRange} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{bucket.scoreRange}</span>
                        <span className="text-sm text-muted-foreground">
                          {bucket.calls.toLocaleString()} calls
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium">
                          {bucket.conversions} conv.
                        </span>
                        <span className="text-xs text-muted-foreground ml-2">
                          ({bucket.conversionRate.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Progress value={bucket.percentage} className="h-2 flex-1" />
                      <span className="text-xs text-muted-foreground min-w-[40px] text-right">
                        {bucket.percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Top States Performance */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Top States - Admissions Performance</CardTitle>
            <InfoTooltip content="States with highest admission conversion rates" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>State</TableHead>
                <TableHead className="text-right">Inquiries</TableHead>
                <TableHead className="text-right">Admissions</TableHead>
                <TableHead className="text-right">Conversion Rate</TableHead>
                <TableHead className="text-right">% of Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topPerformingStates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No state data available
                  </TableCell>
                </TableRow>
              ) : (
                topPerformingStates.map((state) => (
                  <TableRow
                    key={state.state}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() =>
                      handleOpenDrawer(
                        calls.filter((c) => c.state === state.state),
                        `Calls from ${state.state}`
                      )
                    }
                  >
                    <TableCell className="font-medium">{state.state}</TableCell>
                    <TableCell className="text-right">
                      {state.calls.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {state.conversions.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={state.conversionRate >= 50 ? 'default' : 'secondary'}>
                        {state.conversionRate.toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {((state.calls / metrics.totalInquiries) * 100).toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Call Drilldown Drawer */}
      <CallDrilldownDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        calls={selectedCalls}
        title={drawerTitle}
      />
    </div>
  )
}
