'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { GlobalFilterBar, FilterOptions } from './global-filter-bar'
import { DashboardTabs, TabContentWrapper } from './dashboard-tabs'
import { TooltipProvider } from '@/components/ui/tooltip'

interface DashboardContainerProps {
  filterOptions: FilterOptions
  initialDateRange: { startDate: Date; endDate: Date }
  overviewContent: React.ReactNode
  admissionsContent?: React.ReactNode
  marketingContent?: React.ReactNode
  executiveContent?: React.ReactNode
}

export function DashboardContainer({
  filterOptions,
  initialDateRange,
  overviewContent,
  admissionsContent,
  marketingContent,
  executiveContent,
}: DashboardContainerProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Parse date range from URL or use initial values
  const [dateRange, setDateRange] = React.useState<{
    startDate: Date
    endDate: Date
  }>(() => {
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    if (from && to) {
      const startDate = new Date(from)
      const endDate = new Date(to)
      return { startDate, endDate }
    }

    return initialDateRange
  })

  const handleDateRangeChange = (range: {
    startDate: Date
    endDate: Date
  }) => {
    setDateRange(range)

    // Update URL with new date range
    const params = new URLSearchParams(searchParams.toString())
    params.set('from', range.startDate.toISOString())
    params.set('to', range.endDate.toISOString())
    router.push(`?${params.toString()}`)
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-col h-full">
        {/* Global Filter Bar */}
        <GlobalFilterBar
          options={filterOptions}
          dateRange={dateRange}
          onDateRangeChange={handleDateRangeChange}
        />

        {/* Tabbed Content */}
        <DashboardTabs>
          <TabContentWrapper value="overview">
            <div className="overflow-y-auto">
              {overviewContent}
            </div>
          </TabContentWrapper>

          {admissionsContent && (
            <TabContentWrapper value="admissions">
              <div className="overflow-y-auto">
                {admissionsContent}
              </div>
            </TabContentWrapper>
          )}

          {marketingContent && (
            <TabContentWrapper value="marketing">
              <div className="overflow-y-auto">
                {marketingContent}
              </div>
            </TabContentWrapper>
          )}

          {executiveContent && (
            <TabContentWrapper value="executive">
              <div className="overflow-y-auto">
                {executiveContent}
              </div>
            </TabContentWrapper>
          )}
        </DashboardTabs>
      </div>
    </TooltipProvider>
  )
}
