'use client'

import * as React from 'react'
import { Decimal } from '@prisma/client/runtime/library'
import { format, parseISO } from 'date-fns'
import { KPICard } from '../kpi-card'
import { ComboChart } from '../combo-chart'
import { DonutChart } from '../donut-chart'
import { CallDrilldownDrawer } from '../call-drilldown-drawer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { InfoTooltip } from '@/components/ui/info-tooltip'
import { METRIC_TOOLTIPS, CHART_TOOLTIPS } from '@/lib/constants/tooltips'
import {
  Target,
  TrendingUp,
  DollarSign,
  Users,
  ArrowUpRight,
  ArrowDownRight,
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

interface Call {
  id: string
  callId: string
  datetime?: Date | null
  trackingSource?: string | null
  campaign?: string | null
  medium?: string | null
  keyword?: string | null
  csrConversion?: boolean | null
  csrValue?: Decimal | null
  callStatus?: string | null
}

interface MarketingMetrics {
  totalCalls: number
  totalConversions: number
  conversionRate: number
  totalValue: number
  avgValuePerCall: number
  trends: {
    callsTrend: number
    conversionsTrend: number
    valueTrend: number
  }
}

interface CampaignPerformance {
  campaign: string
  calls: number
  conversions: number
  conversionRate: number
  totalValue: number
  avgValue: number
}

interface SourcePerformance {
  source: string
  calls: number
  conversions: number
  conversionRate: number
  totalValue: number
  avgValue: number
}

interface MediumPerformance {
  medium: string
  calls: number
  conversions: number
  conversionRate: number
}

interface KeywordPerformance {
  keyword: string
  calls: number
  conversions: number
  conversionRate: number
  totalValue: number
}

interface CampaignTrendData {
  date: string
  calls: number
  conversions: number
  conversionRate: number
}

interface MarketingTabProps {
  calls: Call[]
  metrics: MarketingMetrics
  topCampaigns: CampaignPerformance[]
  topSources: SourcePerformance[]
  mediumBreakdown: MediumPerformance[]
  topKeywords: KeywordPerformance[]
  campaignTrends: CampaignTrendData[]
}

export function MarketingTab({
  calls,
  metrics,
  topCampaigns,
  topSources,
  mediumBreakdown,
  topKeywords,
  campaignTrends,
}: MarketingTabProps) {
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

  const formatTrend = (trend: number) => {
    const isPositive = trend >= 0
    return (
      <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? (
          <ArrowUpRight className="h-4 w-4" />
        ) : (
          <ArrowDownRight className="h-4 w-4" />
        )}
        <span>{Math.abs(trend).toFixed(1)}%</span>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Row 1: Marketing KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <KPICard
          title="Marketing Calls"
          value={metrics.totalCalls.toLocaleString()}
          trend={metrics.trends.callsTrend}
          icon={<Target className="h-4 w-4" />}
          description={`vs last period: ${metrics.trends.callsTrend > 0 ? '+' : ''}${metrics.trends.callsTrend.toFixed(1)}%`}
          tooltip="Total calls from all marketing sources in the selected date range"
        />
        <KPICard
          title="Conversions"
          value={metrics.totalConversions.toLocaleString()}
          trend={metrics.trends.conversionsTrend}
          icon={<Users className="h-4 w-4" />}
          description={`Conv. rate: ${metrics.conversionRate.toFixed(1)}%`}
          tooltip="Number of calls that resulted in successful conversions"
        />
        <KPICard
          title="Total Value Generated"
          value={formatCurrency(metrics.totalValue)}
          trend={metrics.trends.valueTrend}
          icon={<DollarSign className="h-4 w-4" />}
          description={`Avg per call: ${formatCurrency(metrics.avgValuePerCall)}`}
          tooltip="Total value generated from all marketing calls"
        />
        <KPICard
          title="Marketing Efficiency"
          value={`${metrics.conversionRate.toFixed(1)}%`}
          trend={metrics.trends.conversionsTrend - metrics.trends.callsTrend}
          icon={<TrendingUp className="h-4 w-4" />}
          description={`${formatCurrency(metrics.totalValue / metrics.totalCalls)} per call`}
          tooltip="Overall conversion rate and value per call from marketing efforts"
        />
      </div>

      {/* Row 2: Campaign Trends */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Campaign Performance Over Time</CardTitle>
            <InfoTooltip content="Track how your marketing campaigns are performing day by day" />
          </div>
        </CardHeader>
        <CardContent>
          <ComboChart
            data={campaignTrends}
            xAxisKey="date"
            bars={[
              { key: 'calls', name: 'Calls', color: '#3b82f6' },
              { key: 'conversions', name: 'Conversions', color: '#10b981' },
            ]}
            lines={[
              { key: 'conversionRate', name: 'Conversion Rate %', color: '#8b5cf6' },
            ]}
            height={300}
            xTickFormatter={formatDateLabel}
            tooltipLabelFormatter={formatDateLabel}
          />
        </CardContent>
      </Card>

      {/* Row 3: Campaign & Source Performance Tables */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Campaign Performance Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Top Campaigns</CardTitle>
              <InfoTooltip content="Performance metrics for your top marketing campaigns" />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead className="text-right">Calls</TableHead>
                  <TableHead className="text-right">Conv.</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topCampaigns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No campaign data available
                    </TableCell>
                  </TableRow>
                ) : (
                  topCampaigns.map((campaign) => (
                    <TableRow
                      key={campaign.campaign}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() =>
                        handleOpenDrawer(
                          calls.filter((c) => c.campaign === campaign.campaign),
                          `Calls from ${campaign.campaign}`
                        )
                      }
                    >
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {campaign.campaign || '(No campaign)'}
                      </TableCell>
                      <TableCell className="text-right">
                        {campaign.calls.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {campaign.conversions.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={campaign.conversionRate >= 50 ? 'default' : 'secondary'}
                        >
                          {campaign.conversionRate.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(campaign.totalValue)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Source Performance Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Top Sources</CardTitle>
              <InfoTooltip content="Performance breakdown by traffic source" />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead className="text-right">Calls</TableHead>
                  <TableHead className="text-right">Conv.</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topSources.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No source data available
                    </TableCell>
                  </TableRow>
                ) : (
                  topSources.map((source) => (
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
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {source.source || '(No source)'}
                      </TableCell>
                      <TableCell className="text-right">
                        {source.calls.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {source.conversions.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={source.conversionRate >= 50 ? 'default' : 'secondary'}
                        >
                          {source.conversionRate.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(source.totalValue)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Medium Breakdown & Top Keywords */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Medium Breakdown Donut Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Traffic by Medium</CardTitle>
              <InfoTooltip content="Distribution of calls by traffic medium (e.g., CPC, organic, referral)" />
            </div>
          </CardHeader>
          <CardContent>
            {mediumBreakdown.length === 0 ? (
              <div className="flex items-center justify-center h-[280px] text-muted-foreground">
                No medium data available
              </div>
            ) : (
              <DonutChart
                data={mediumBreakdown.map((m) => ({
                  name: m.medium || '(Not set)',
                  value: m.calls,
                }))}
                height={280}
              />
            )}
          </CardContent>
        </Card>

        {/* Top Keywords Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Top Keywords</CardTitle>
              <InfoTooltip content="Best performing search keywords driving calls" />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Keyword</TableHead>
                  <TableHead className="text-right">Calls</TableHead>
                  <TableHead className="text-right">Conv.</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topKeywords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No keyword data available
                    </TableCell>
                  </TableRow>
                ) : (
                  topKeywords.slice(0, 10).map((kw) => (
                    <TableRow
                      key={kw.keyword}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() =>
                        handleOpenDrawer(
                          calls.filter((c) => c.keyword === kw.keyword),
                          `Calls from keyword: ${kw.keyword}`
                        )
                      }
                    >
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {kw.keyword || '(No keyword)'}
                      </TableCell>
                      <TableCell className="text-right">
                        {kw.calls.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {kw.conversions.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={kw.conversionRate >= 50 ? 'default' : 'secondary'}
                        >
                          {kw.conversionRate.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(kw.totalValue)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
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
