'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DateRangePicker } from './date-range-picker'

interface DashboardWrapperProps {
  initialDateRange: { startDate: Date; endDate: Date }
  children: React.ReactNode
}

export function DashboardWrapper({ initialDateRange, children }: DashboardWrapperProps) {
  const router = useRouter()
  const [dateRange, setDateRange] = useState(initialDateRange)

  const handleDateRangeChange = (range: { startDate: Date; endDate: Date }) => {
    setDateRange(range)
    // Update URL with new date range
    const params = new URLSearchParams()
    params.set('startDate', range.startDate.toISOString())
    params.set('endDate', range.endDate.toISOString())
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Fixed Header */}
      <div className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                CTM Analytics Dashboard
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Comprehensive view of your call tracking metrics
              </p>
            </div>
            <DateRangePicker dateRange={dateRange} onDateRangeChange={handleDateRangeChange} />
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {children}
        </div>
      </div>
    </div>
  )
}
