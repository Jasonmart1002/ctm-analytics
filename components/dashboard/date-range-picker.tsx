'use client'

import * as React from 'react'
import { CalendarIcon } from 'lucide-react'
import { endOfDay, format, startOfDay, subDays } from 'date-fns'
import { DateRange } from 'react-day-picker'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'

interface DateRangePickerProps {
  dateRange: { startDate: Date; endDate: Date }
  onDateRangeChange: (range: { startDate: Date; endDate: Date }) => void
}

const PRESET_RANGES = [
  { label: 'Last 7 Days', days: 7 },
  { label: 'Last 14 Days', days: 14 },
  { label: 'Last 30 Days', days: 30 },
  { label: 'Last 90 Days', days: 90 },
]

export function DateRangePicker({
  dateRange,
  onDateRangeChange,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [range, setRange] = React.useState<DateRange>({
    from: dateRange.startDate,
    to: dateRange.endDate,
  })

  React.useEffect(() => {
    setRange({
      from: dateRange.startDate,
      to: dateRange.endDate,
    })
  }, [dateRange.startDate, dateRange.endDate])

  const handleSelect = (selectedRange?: DateRange) => {
    if (selectedRange) {
      setRange(selectedRange)
    }
  }

  const applyRange = (selected?: DateRange) => {
    if (!selected?.from || !selected?.to) return

    onDateRangeChange({
      startDate: startOfDay(selected.from),
      endDate: endOfDay(selected.to),
    })
    setIsOpen(false)
  }

  const handlePreset = (days: number) => {
    const end = endOfDay(new Date())
    const start = startOfDay(subDays(end, days - 1))
    applyRange({ from: start, to: end })
  }

  const handleCancel = () => {
    setRange({
      from: dateRange.startDate,
      to: dateRange.endDate,
    })
    setIsOpen(false)
  }

  const displayValue = `${format(dateRange.startDate, 'MMM dd, yyyy')} - ${format(dateRange.endDate, 'MMM dd, yyyy')}`

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'justify-start text-left font-normal min-w-[280px] shadow-sm hover:shadow-md border-border/50',
            !dateRange && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayValue}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 shadow-lg" align="start">
        <div className="flex flex-col gap-4 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Select Date Range</p>
              <p className="text-xs text-muted-foreground">
                Choose a custom range or quick preset
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              Close
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-[200px_minmax(300px,_1fr)]">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Quick Select
              </p>
              <div className="grid gap-2">
                {PRESET_RANGES.map((preset) => (
                  <Button
                    key={preset.label}
                    variant="outline"
                    size="sm"
                    className="justify-start"
                    onClick={() => handlePreset(preset.days)}
                  >
                    {preset.label}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start"
                  onClick={() => {
                    const now = new Date()
                    applyRange({
                      from: startOfDay(now),
                      to: endOfDay(now),
                    })
                  }}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start"
                  onClick={() => {
                    const start = startOfDay(new Date(dateRange.startDate))
                    const end = endOfDay(new Date(dateRange.endDate))
                    setRange({ from: start, to: end })
                  }}
                >
                  Reset Selection
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <Calendar
                mode="range"
                selected={range}
                onSelect={handleSelect}
                numberOfMonths={2}
                defaultMonth={range?.from}
              />
              <div className="text-xs text-muted-foreground">
                {range?.from && range?.to ? (
                  <>
                    {format(range.from, 'MMM dd, yyyy')} —{' '}
                    {format(range.to, 'MMM dd, yyyy')}
                  </>
                ) : (
                  'Select a start and end date'
                )}
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => applyRange(range)}
              disabled={!range?.from || !range?.to}
            >
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
