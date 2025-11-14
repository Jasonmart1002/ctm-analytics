'use client'

import * as React from 'react'
import { format, parseISO } from 'date-fns'
import { KPICard } from '../kpi-card'
import { ComboChart } from '../combo-chart'
import { DonutChart } from '../donut-chart'
import { CallDrilldownDrawer } from '../call-drilldown-drawer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { InfoTooltip } from '@/components/ui/info-tooltip'
import { METRIC_TOOLTIPS, CHART_TOOLTIPS } from '@/lib/constants/tooltips'
import {
  Phone,
  PhoneIncoming,
  PhoneMissed,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Call {
  id: string
  callId: string
  datetime?: Date | null
  trackingSource?: string | null
  campaign?: string | null
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

interface OverviewMetrics {
  totalCalls: number
  answeredCalls: number
  missedCalls: number
  conversions: number
  answerRate: number
  conversionRate: number
  trends: {
    callsTrend: number
    answeredTrend: number
    missedTrend: number
    conversionsTrend: number
  }
}

interface CallVolumeData {
  date: string
  totalCalls: number
  answeredCalls: number
  missedCalls: number
}

interface ConversionData {
  date: string
  conversions: number
  answerRate: number
}

interface StatusBreakdown {
  name: string
  value: number
}

interface ChannelMix {
  name: string
  value: number
}

interface ScoreDistribution {
  range: string
  calls: number
  conversionRate: number
}

interface StateData {
  state: string
  calls: number
  conversions: number
  conversionRate: number
}

interface SourcePerformance {
  source: string
  calls: number
  answerRate: number
  avgScore: number
  conversions: number
  conversionRate: number
}

interface OverviewTabProps {
  calls: Call[]
  metrics: OverviewMetrics
  callVolumeData: CallVolumeData[]
  conversionData: ConversionData[]
  statusBreakdown: StatusBreakdown[]
  channelMix: ChannelMix[]
  scoreDistribution: ScoreDistribution[]
  topStates: StateData[]
  topSources: SourcePerformance[]
}

export function OverviewTab({
  calls,
  metrics,
  callVolumeData,
  conversionData,
  statusBreakdown,
  channelMix,
  scoreDistribution,
  topStates,
  topSources,
}: OverviewTabProps) {
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [selectedCalls, setSelectedCalls] = React.useState<Call[]>([])
  const [drawerTitle, setDrawerTitle] = React.useState('')

  const formatDateLabel = React.useCallback((value: string | number) => {
    if (typeof value !== 'string') return String(value)
    try {
      return format(parseISO(value), 'MMM dd')
    } catch {
      return value
    }
  }, [])

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-muted-foreground" />
  }

  const handleOpenDrawer = (calls: Call[], title: string) => {
    setSelectedCalls(calls)
    setDrawerTitle(title)
    setDrawerOpen(true)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Row 1: KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <KPICard
          title="Total Calls"
          value={metrics.totalCalls.toLocaleString()}
          trend={metrics.trends.callsTrend}
          icon={<Phone className="h-4 w-4" />}
          description={`vs last period: ${metrics.trends.callsTrend > 0 ? '+' : ''}${metrics.trends.callsTrend.toFixed(1)}%`}
          tooltip={METRIC_TOOLTIPS.totalCalls}
        />
        <KPICard
          title="Answered Calls"
          value={metrics.answeredCalls.toLocaleString()}
          trend={metrics.trends.answeredTrend}
          icon={<PhoneIncoming className="h-4 w-4" />}
          description={`Answer rate: ${metrics.answerRate.toFixed(1)}%`}
          tooltip={METRIC_TOOLTIPS.answeredCalls}
        />
        <KPICard
          title="Missed / No Answer"
          value={metrics.missedCalls.toLocaleString()}
          trend={metrics.trends.missedTrend}
          icon={<PhoneMissed className="h-4 w-4" />}
          description={`${((metrics.missedCalls / metrics.totalCalls) * 100).toFixed(1)}% of total calls`}
          tooltip={METRIC_TOOLTIPS.missedCalls}
        />
        <KPICard
          title="Conversions (CSR)"
          value={metrics.conversions.toLocaleString()}
          trend={metrics.trends.conversionsTrend}
          icon={<CheckCircle className="h-4 w-4" />}
          description={`Conversion rate: ${metrics.conversionRate.toFixed(1)}%`}
          tooltip={METRIC_TOOLTIPS.conversions}
        />
      </div>

      {/* Row 2: Main Trends */}
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Calls Over Time</CardTitle>
              <InfoTooltip content={CHART_TOOLTIPS.callVolumeOverTime} />
            </div>
          </CardHeader>
          <CardContent>
            <ComboChart
              data={callVolumeData}
              xAxisKey="date"
              bars={[]}
              lines={[
                { key: 'totalCalls', name: 'Total Calls', color: '#3b82f6' },
                {
                  key: 'answeredCalls',
                  name: 'Answered',
                  color: '#10b981',
                },
                { key: 'missedCalls', name: 'Missed', color: '#ef4444' },
              ]}
              height={300}
              xTickFormatter={formatDateLabel}
              tooltipLabelFormatter={formatDateLabel}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Conversions & Answer Rate Over Time</CardTitle>
              <InfoTooltip content={CHART_TOOLTIPS.conversionsOverTime} />
            </div>
          </CardHeader>
          <CardContent>
            <ComboChart
              data={conversionData}
              xAxisKey="date"
              bars={[
                { key: 'conversions', name: 'Conversions', color: '#10b981' },
              ]}
              lines={[
                { key: 'answerRate', name: 'Answer Rate %', color: '#3b82f6' },
              ]}
              height={300}
              xTickFormatter={formatDateLabel}
              tooltipLabelFormatter={formatDateLabel}
            />
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Distribution & Quality */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Call Status Breakdown</CardTitle>
              <InfoTooltip content={CHART_TOOLTIPS.callStatusBreakdown} />
            </div>
          </CardHeader>
          <CardContent>
            <DonutChart data={statusBreakdown} height={280} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Channel Mix</CardTitle>
              <InfoTooltip content={CHART_TOOLTIPS.channelMix} />
            </div>
          </CardHeader>
          <CardContent>
            <DonutChart data={channelMix} height={280} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>CSR Score Distribution</CardTitle>
              <InfoTooltip content={CHART_TOOLTIPS.scoreDistribution} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scoreDistribution.map((bucket) => (
                <div key={bucket.range} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{bucket.range}</span>
                    <span className="text-muted-foreground">
                      {bucket.calls.toLocaleString()} calls
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{
                          width: `${bucket.conversionRate}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground min-w-[45px] text-right">
                      {bucket.conversionRate.toFixed(1)}% conv
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Geo & Top Sources */}
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Calls by State (Top 10)</CardTitle>
              <InfoTooltip content={CHART_TOOLTIPS.topStates} />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>State</TableHead>
                  <TableHead className="text-right">Calls</TableHead>
                  <TableHead className="text-right">Conversions</TableHead>
                  <TableHead className="text-right">Conv. Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topStates.map((state) => (
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
                      {state.conversionRate.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Top 10 Sources</CardTitle>
              <InfoTooltip content={CHART_TOOLTIPS.topSources} />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead className="text-right">Calls</TableHead>
                  <TableHead className="text-right">Ans. Rate</TableHead>
                  <TableHead className="text-right">Avg Score</TableHead>
                  <TableHead className="text-right">Conv.</TableHead>
                  <TableHead className="text-right">Conv. Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topSources.map((source) => (
                  <TableRow
                    key={source.source}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() =>
                      handleOpenDrawer(
                        calls.filter((c) => c.trackingSource === source.source),
                        `Calls from ${source.source}`
                      )
                    }
                  >
                    <TableCell className="font-medium max-w-[150px] truncate">
                      {source.source}
                    </TableCell>
                    <TableCell className="text-right">
                      {source.calls.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {source.answerRate.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-right">
                      {source.avgScore.toFixed(1)}
                    </TableCell>
                    <TableCell className="text-right">
                      {source.conversions.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {source.conversionRate.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

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
