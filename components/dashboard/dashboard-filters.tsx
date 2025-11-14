'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { DateRangePicker } from './date-range-picker'
import { startOfMonth, endOfMonth } from 'date-fns'

export function DashboardFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get current date range from URL params or default to current month
  const now = new Date()
  const fromParam = searchParams.get('from')
  const toParam = searchParams.get('to')

  const dateRange = {
    startDate: fromParam ? new Date(fromParam) : startOfMonth(now),
    endDate: toParam ? new Date(toParam) : endOfMonth(now)
  }

  const handleDateRangeChange = (range: { startDate: Date; endDate: Date }) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('from', range.startDate.toISOString())
    params.set('to', range.endDate.toISOString())
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-4">
      <DateRangePicker
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
      />
    </div>
  )
}
